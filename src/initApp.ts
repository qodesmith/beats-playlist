import type {Video} from '@qodestack/dl-yt-playlist'

import {wait} from '@qodestack/utils'

import {
  _initialMetadata,
  unknownMetadataAtom,
  audioDataAtomFamily,
  isAppInitializedAtom,
  selectedBeatIdAtom,
} from './globalState'
import {store} from './store'

export function initApp() {
  const oneSecondPromise = wait(1000)

  /**
   * Kick off a fetch request for all the beats metadata while the app is
   * mounting, then queue up the first beat.
   */
  const initAppPromise = fetch('/metadata')
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

      const url = new URL(window.location.href)
      const searchParamsBeatId = url.searchParams.get('beatId')
      const initialBeatId = searchParamsBeatId ?? metadata[0].id

      store.set(selectedBeatIdAtom, initialBeatId)

      return store.get(audioDataAtomFamily(initialBeatId))
    })

  /**
   * The UI doesn't need to be held up waiting for this response. In theory,
   * there shouldn't be anything returned from this endpoint since unavailable
   * beats should still be present in the `/metadata` response. Data returned
   * from this endpoint represent unaccounted for stragglers prior to all the
   * changes to the dl-yt-playlist library.
   */
  fetch('/unknown-metadata')
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

  const promises = [oneSecondPromise, initAppPromise]

  Promise.all(promises).then(() => {
    store.set(isAppInitializedAtom, true)
  })
}
