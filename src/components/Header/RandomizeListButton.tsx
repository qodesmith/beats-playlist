import {useAtomValue, useSetAtom} from 'jotai'
import {useEffect} from 'react'

import {HeaderButton} from './HeaderButton'
import {
  isUnknownMetadataAtom,
  metadataSelector,
  selectedBeatIdAtom,
  shuffleMetadataAtom,
} from '../../globalState'
import {store} from '../../store'
import {scrollElementIntoView} from '../../utils'

export function RandomizeListButton() {
  const metadata = useAtomValue(metadataSelector)
  const shuffleMetadata = useSetAtom(shuffleMetadataAtom)
  const isUnknownMetadata = useAtomValue(isUnknownMetadataAtom)

  // Whenever the metadata gets randomized, scroll to the current track.
  useEffect(() => {
    const selectedBeatId = store.get(selectedBeatIdAtom)
    scrollElementIntoView(selectedBeatId, {behavior: 'instant'})
  }, [metadata])

  return (
    <HeaderButton onClick={shuffleMetadata} disabled={isUnknownMetadata}>
      🎲
    </HeaderButton>
  )
}
