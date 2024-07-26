import {useAtomValue, useSetAtom} from 'jotai'
import {useEffect} from 'react'

import {HeaderButton} from './HeaderButton'
import {
  metadataSelector,
  selectedBeatIdAtom,
  shuffleMetadataAtom,
} from '../../globalState'
import {store} from '../../store'
import {scrollBeatIntoView} from '../../utils'

export function RandomizeListButton() {
  const metadata = useAtomValue(metadataSelector)
  const shuffleMetadata = useSetAtom(shuffleMetadataAtom)

  // Whenever the metadata gets randomized, scroll to the current track.
  useEffect(() => {
    const selectedBeatId = store.get(selectedBeatIdAtom)
    scrollBeatIntoView(selectedBeatId, {behavior: 'instant'})
  }, [metadata])

  return <HeaderButton onClick={shuffleMetadata}>🎲</HeaderButton>
}
