import {useAtomValue} from 'jotai'
import {useEffect} from 'react'

import {HeaderButton} from './HeaderButton'
import {
  isUnknownMetadataAtom,
  selectedBeatIdAtom,
  triggerVisualMetadataShuffle,
  visualMetadataSelector,
} from '../../globalState'
import {store} from '../../store'
import {scrollElementIntoView} from '../../utils'

export function RandomizeListButton() {
  const metadata = useAtomValue(visualMetadataSelector)
  const isUnknownMetadata = useAtomValue(isUnknownMetadataAtom)

  // Whenever the metadata gets randomized, scroll to the current track.
  useEffect(() => {
    const selectedBeatId = store.get(selectedBeatIdAtom)
    scrollElementIntoView(selectedBeatId, {behavior: 'instant'})
  }, [metadata])

  return (
    <HeaderButton
      onClick={triggerVisualMetadataShuffle}
      disabled={isUnknownMetadata}
    >
      🎲
    </HeaderButton>
  )
}
