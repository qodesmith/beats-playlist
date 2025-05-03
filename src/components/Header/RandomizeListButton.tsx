import {useAtomValue} from 'jotai'
import {useEffect} from 'react'

import {
  isUnknownMetadataAtom,
  selectedBeatIdAtom,
  triggerVisualMetadataShuffle,
  visualMetadataSelector,
} from '../../globalState'
import {store} from '../../store'
import {scrollElementIntoView} from '../../utils'
import {HeaderButton} from './HeaderButton'

export function RandomizeListButton() {
  const metadata = useAtomValue(visualMetadataSelector)
  const isUnknownMetadata = useAtomValue(isUnknownMetadataAtom)

  // Whenever the metadata gets randomized, scroll to the current track.
  // biome-ignore lint/correctness/useExhaustiveDependencies: metadata should cause a recalc
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
