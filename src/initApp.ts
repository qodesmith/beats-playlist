import type {TailwindBreakpoint, TailwindMediaQuery} from './constants'
import type {Video} from '@qodestack/dl-yt-playlist'

import {fetchWithProgress, shuffleArray, wait} from '@qodestack/utils'

import {
  audioBufferAtomFamily,
  audioBufferIdsLoaded,
  audioBufferUnwrappedAtomFamily,
  audioFetchingProgressAtomFamily,
  handleMoveSlider,
  handleStopSlider,
} from './AudioThing'
import {
  mediaQueryMap,
  tailwindBreakpoints,
  tailwindMediaQueries,
} from './constants'
import {
  initialMetadata,
  unknownMetadataAtom,
  isAppInitializedAtom,
  selectedBeatIdAtom,
  initialMetadataLoadingProgressAtom,
  tailwindBreakpointAtom,
} from './globalState'
import {store} from './store'

export function initApp() {
  watchMediaQueries()
  initStoreSubscriptions()
  initGlobalEventListeners()

  const url = new URL(window.location.href)
  const searchParamsBeatId = url.searchParams.get('beatId')

  // Kick off fetching the initial beat early if we have the id in query params.
  if (searchParamsBeatId) {
    store.set(selectedBeatIdAtom, searchParamsBeatId)
  }

  /**
   * The UI doesn't need to be held up waiting for this response. In theory,
   * there shouldn't be any data returned from this endpoint since unavailable
   * beats should still be present in the `/api/metadata` response. Data
   * returned from this endpoint represent unaccounted for stragglers prior to
   * all the changes to the dl-yt-playlist library.
   */
  fetch('/api/unknown-metadata')
    .then(res => res.json())
    .then(
      ({
        unknownMetadata,
        // failures, // These can be seen in the network request if need be.
      }: {
        unknownMetadata: Video[]
        failures: string[]
      }) => {
        store.set(unknownMetadataAtom, unknownMetadata)
      }
    )

  const initialWaitPromise = wait(500)

  /**
   * Kick off a fetch request for all the beats metadata while the app is
   * mounting, then queue up the first beat.
   */
  const initAppPromise = fetchWithProgress({
    url: '/api/metadata',
    contentLengthHeader: 'Original-Content-Length',
    onProgress: percent => {
      store.set(initialMetadataLoadingProgressAtom, Math.round(percent))
    },
  })
    .then(res => res.json())
    .then(({metadata}: {metadata: Video[]}) => {
      /**
       * This is a plain JavaScript object. Instead of setting the data in an
       * atom, we store it in an object and use it as the source of truth for a
       * selector. All consumers will read from the selector to get the data,
       * mitigating against changing the original array.
       */
      // @ts-expect-error - this is the only place that mutates this object.
      initialMetadata.data = metadata
      // @ts-expect-error - this is the only place that mutates this object.
      initialMetadata.shuffledData = shuffleArray(metadata)

      // Store an object version of the data for quick access via an id.
      metadata.forEach(video => {
        initialMetadata.obj[video.id] = video
      })

      /**
       * If we don't have a beat id in the search params, we kick of fetching
       * the 1st beat in the metadata once it's loaded. Don't return the
       * `store.get(...)` promise so as not to hold up rendering the UI.
       */
      if (!searchParamsBeatId) {
        store.set(selectedBeatIdAtom, metadata[0].id)
      }
    })

  const promises = [initialWaitPromise, initAppPromise]

  // TODO - handle error (show broken image icon)
  Promise.all(promises).then(() => {
    store.set(isAppInitializedAtom, true)
  })
}

function watchMediaQueries() {
  // Calculate the initial Tailwind breakpoint for the current screen size.
  const initialWidth = window.innerWidth
  const initialBreakPoint: TailwindBreakpoint | null =
    initialWidth >= 1536
      ? '2xl'
      : initialWidth >= 1280
        ? 'xl'
        : initialWidth >= 1024
          ? 'lg'
          : initialWidth >= 768
            ? 'md'
            : initialWidth >= 640
              ? 'sm'
              : null

  store.set(tailwindBreakpointAtom, initialBreakPoint)

  /**
   * Instead of using a `resize` event, which will fire many many times, we use
   * media query events to detect when a breakpoint has been changed.
   */
  tailwindMediaQueries.forEach(mq => {
    window.matchMedia(mq).addEventListener('change', e => {
      const media = e.media as TailwindMediaQuery
      const {matches} = e
      const affectedBp = mediaQueryMap[media]

      // Screen getting larger.
      if (matches) return store.set(tailwindBreakpointAtom, affectedBp)

      // Screen getting smaller.
      const affectedBpIndex = tailwindBreakpoints.indexOf(affectedBp)
      const currentBp = store.get(tailwindBreakpointAtom)
      const currentBpIndex = currentBp
        ? tailwindBreakpoints.indexOf(currentBp)
        : -1

      if (affectedBpIndex <= currentBpIndex) {
        const newBreakpoint = tailwindBreakpoints[affectedBpIndex - 1]

        store.set(
          tailwindBreakpointAtom,
          newBreakpoint === undefined ? null : newBreakpoint
        )
      }
    })
  })
}

function initStoreSubscriptions() {
  const beatIdAtomFamilies = [
    audioBufferAtomFamily,
    audioBufferUnwrappedAtomFamily,
    audioFetchingProgressAtomFamily,

    // Removing these atoms happens after the fetch in audioBufferAtomFamily.
    // audioBufferAbortControllerAtomFamily,
  ]

  /**
   * Watch the list of loaded audio buffers and remove atoms from various
   * families once we cross a threshold. First in, last out. This is because
   * atom families store atoms in a Map under the hood which will increase in
   * size infinitely. We have to manage removing them manually.
   *
   * Assuming an average size of 8mb per beat...
   * Desktop - 1GB = 125 beats
   * Mobile - 500MB = 62 beats
   */
  store.sub(audioBufferIdsLoaded, () => {
    const idsLoaded = store.get(audioBufferIdsLoaded)
    const isMobile = store.get(tailwindBreakpointAtom) === null
    const maxCount = isMobile ? 62 : 125
    const id = idsLoaded[0]

    if (idsLoaded.length <= maxCount) return

    store.set(audioBufferIdsLoaded, idsLoaded.slice(1))
    beatIdAtomFamilies.forEach(family => family.remove(id))
  })
}

function initGlobalEventListeners() {
  // Slider event listeners.
  document.addEventListener('mousemove', handleMoveSlider)
  document.addEventListener('touchmove', handleMoveSlider)
  document.addEventListener('mouseup', handleStopSlider)
  document.addEventListener('touchend', handleStopSlider)

  // TODO - move all document listeners here
}
