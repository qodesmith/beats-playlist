import {shuffleArray} from '@qodestack/utils'
import {useSetAtom} from 'jotai'
import {useCallback} from 'react'

import {metadataAtom} from '../globalState'

export function RandomizeListButton() {
  const setMetadata = useSetAtom(metadataAtom)
  const randomizeList = useCallback(() => {
    setMetadata(metadata => {
      const shuffledArray = shuffleArray(metadata)
      shuffledArray.forEach((item, i) => {
        item.index = i
      })

      return shuffledArray
    })
  }, [setMetadata])

  return <button onClick={randomizeList}>🎲</button>
}
