import type {TailwindBreakpoint, TailwindMediaQuery} from './constants'
import type {Video} from '@qodestack/dl-yt-playlist'

import {fetchWithProgress, wait} from '@qodestack/utils'

import {
  mediaQueryMap,
  tailwindBreakpoints,
  tailwindMediaQueries,
} from './constants'
import {
  _initialMetadata,
  unknownMetadataAtom,
  audioDataAtomFamily,
  isAppInitializedAtom,
  selectedBeatIdAtom,
  initialMetadataLoadingProgressAtom,
  tailwindBreakpointAtom,
} from './globalState'
import {store} from './store'

export function initApp() {
  watchMediaQueries()

  const url = new URL(window.location.href)
  const searchParamsBeatId = url.searchParams.get('beatId')

  // Kick off fetching the initial beat early if we have the id in query params.
  if (searchParamsBeatId) {
    store.set(selectedBeatIdAtom, searchParamsBeatId)
    store.get(audioDataAtomFamily(searchParamsBeatId))
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

  const oneSecondPromise = wait(1000)

  /**
   * Kick off a fetch request for all the beats metadata while the app is
   * mounting, then queue up the first beat.
   */
  const initAppPromise = fetchWithProgress({
    url: '/api/metadata',
    contentLengthHeader: 'Original-Content-Length',
    onProgress: percent => {
      store.set(initialMetadataLoadingProgressAtom, percent)
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
      Object.freeze(_initialMetadata)
      Object.freeze(_initialMetadata.data)

      /**
       * If we don't have a beat if in the search params, we kick of fetching
       * the 1st beat in the metadata once it's loaded. Don't return the
       * `store.get(...)` promise so as not to hold up rendering the UI.
       */
      if (!searchParamsBeatId) {
        const initialBeatId = metadata[0].id

        store.set(selectedBeatIdAtom, initialBeatId)
        store.get(audioDataAtomFamily(initialBeatId))
      }
    })

  const promises = [oneSecondPromise, initAppPromise]

  // TODO - handle error (show broken image icon)
  Promise.all(promises).then(() => {
    store.set(isAppInitializedAtom, true)
  })
}

function watchMediaQueries() {
  // Calculate the initial Tailwind breakpoint for the current screen size.
  const width = window.innerWidth
  const initialBreakPoint: TailwindBreakpoint | null =
    width >= 1536
      ? '2xl'
      : width >= 1280
        ? 'xl'
        : width >= 1024
          ? 'lg'
          : width >= 768
            ? 'md'
            : width >= 640
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
