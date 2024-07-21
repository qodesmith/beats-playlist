import type {Video} from '@qodestack/dl-yt-playlist'

import {wait} from '@qodestack/utils'

import {isAppInitializedAtom, metadataAtom} from './globalState'
import {store} from './store'

export function initApp() {
  const oneSecondPromise = wait(1000)

  /**
   * Kick off a fetch request for all the beats metadata while the app is
   * mounting.
   */
  const metadataPromise = fetch('/metadata')
    .then(res => res.json())
    .then(({metadata}: {metadata: Video[]}) => {
      store.set(
        metadataAtom,

        /**
         * Adding the `index` property to the videos will power the previous
         * and next play functionality.
         */
        metadata.map((v, index) => ({...v, index}))
      )
    })

  Promise.all([oneSecondPromise, metadataPromise]).then(() => {
    store.set(isAppInitializedAtom, true)
  })
}