import type {Video} from '@qodestack/dl-yt-playlist'

import {wait} from '@qodestack/utils'

import {
  _initialMetadata,
  audioDataAtomFamily,
  isAppInitializedAtom,
  selectedBeatIdAtom,
} from './globalState'
import {store} from './store'

export function initApp() {
  const oneSecondPromise = wait(1000)

  /**
   * Kick off a fetch request for all the beats metadata while the app is
   * mounting. Also queue up the first beat.
   */
  const dataPromise = fetch('/metadata')
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

      const firstBeatId = metadata[0].id
      store.set(selectedBeatIdAtom, firstBeatId)

      return store.get(audioDataAtomFamily(firstBeatId))
    })

  Promise.all([oneSecondPromise, dataPromise]).then(() => {
    store.set(isAppInitializedAtom, true)
  })
}
