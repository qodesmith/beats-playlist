import {shuffleArray} from '@qodestack/utils'
import {useAtom} from 'jotai'
import {useCallback, useEffect} from 'react'

import {HeaderButton} from './HeaderButton'
import {metadataAtom, selectedBeatIdAtom} from '../../globalState'
import {store} from '../../store'
import {scrollBeatIntoView} from '../../utils'

export function RandomizeListButton() {
  const [metadata, setMetadata] = useAtom(metadataAtom)
  const randomizeList = useCallback(() => {
    setMetadata(metadata => shuffleArray(metadata))
  }, [setMetadata])

  // Whenever the metadata gets randomized, scroll to the current track.
  useEffect(() => {
    const selectedBeatId = store.get(selectedBeatIdAtom)
    scrollBeatIntoView(selectedBeatId, {behavior: 'instant'})
  }, [metadata])

  return <HeaderButton onClick={randomizeList}>🎲</HeaderButton>
}
