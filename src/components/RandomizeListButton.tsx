import {shuffleArray} from '@qodestack/utils'
import {useAtom} from 'jotai'
import {useCallback, useEffect} from 'react'

import {metadataAtom, selectedBeatIdAtom} from '../globalState'
import {store} from '../store'
import {scrollBeatIntoView} from '../utils'

export function RandomizeListButton({className}: {className?: string}) {
  const [metadata, setMetadata] = useAtom(metadataAtom)
  const randomizeList = useCallback(() => {
    setMetadata(metadata => shuffleArray(metadata))
  }, [setMetadata])

  useEffect(() => {
    const selectedBeatId = store.get(selectedBeatIdAtom)
    scrollBeatIntoView(selectedBeatId)
  }, [metadata])

  return (
    <button onClick={randomizeList} className={className}>
      🎲
    </button>
  )
}
