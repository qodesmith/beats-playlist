import type {Video} from '@qodestack/dl-yt-playlist'

import {wait} from '@qodestack/utils'

import {AudioThing} from './AudioThing'
import {
  _initialMetadata,
  audioDataAtomFamily,
  audioThingAtom,
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
      const firstBeatId = searchParamsBeatId ?? metadata[0].id

      store.set(selectedBeatIdAtom, firstBeatId)

      return store.get(audioDataAtomFamily(firstBeatId)).then(audioData => {
        if (audioData) {
          store.set(audioThingAtom, new AudioThing(audioData, firstBeatId))
        }
      })
    })

  Promise.all([oneSecondPromise, initAppPromise]).then(() => {
    store.set(isAppInitializedAtom, true)
  })
}
