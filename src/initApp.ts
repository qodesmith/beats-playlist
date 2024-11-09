import type {TailwindBreakpoint, TailwindMediaQuery} from './constants'
import type {Video} from '@qodestack/dl-yt-playlist'

import {fetchWithProgress, wait} from '@qodestack/utils'

import {
  audioBufferAtomFamily,
  audioBufferUnwrappedAtomFamily,
  audioFetchingProgressAtomFamily,
  handleMoveSlider,
  handleStopSlider,
} from './AudioThing'
import {
  MAX_BEATS_LOADED,
  mediaQueryMap,
  shuffleStateKey,
  tailwindBreakpoints,
  tailwindMediaQueries,
} from './constants'
import {
  _initialMetadata,
  unknownMetadataAtom,
  isAppInitializedAtom,
  selectedBeatIdAtom,
  initialMetadataLoadingProgressAtom,
  tailwindBreakpointAtom,
  initialMetadataObj,
  shuffledMetadataSelector,
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
      _initialMetadata.data = metadata

      for (const video of metadata) {
        // @ts-expect-error This is the only place we write the data.
        initialMetadataObj[video.id] = video
      }

      /**
       * If we don't have a beat id in the search params, we kick of fetching
       * the 1st beat in the metadata once it's loaded. Don't return the
       * `store.get(...)` promise so as not to hold up rendering the UI.
       */
      if (!searchParamsBeatId) {
        /**
         * Why not just use `shuffleStateSelector` here?
         * https://github.com/pmndrs/jotai/blob/5802fc0c21b581e4c3dba49accede6706275c238/src/vanilla/utils/atomWithStorage.ts#L237
         *
         * Since this value is being read outside of the React render cycle,
         * the underlying atom may not initialize with reading `localStorage`
         * for the value. React's mount lifecyle is what triggers Jotai to get
         * the value from `localStorage`.
         */
        const isShuffled = JSON.parse(
          localStorage.getItem(shuffleStateKey) ?? 'false'
        )
        let initialBeatId = metadata[0].id

        if (isShuffled) {
          initialBeatId = store.get(shuffledMetadataSelector)[0].id
        }

        store.set(selectedBeatIdAtom, initialBeatId)
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
  const loadedBeatIds = new Set<string>()
  const beatIdAtomFamilies = [
    audioBufferAtomFamily,
    audioFetchingProgressAtomFamily,
    audioBufferUnwrappedAtomFamily,
  ]

  // When the beat id changes, load an audioBuffer for it.
  store.sub(selectedBeatIdAtom, () => {
    const beatId = store.get(selectedBeatIdAtom)!

    loadedBeatIds.add(beatId)
    store.get(audioBufferAtomFamily(beatId))

    /**
     * Jotai atom families store data in a Map under the hood, which presents a
     * potential memory leak. We remove the first items stored once we reach the
     * limit. First in, last out.
     */
    if (loadedBeatIds.size > MAX_BEATS_LOADED) {
      const firstId = loadedBeatIds.values().next().value!

      loadedBeatIds.delete(firstId)
      beatIdAtomFamilies.forEach(family => family.remove(firstId))
    }
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
