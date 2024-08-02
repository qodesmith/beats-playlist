import {useAtomValue} from 'jotai'

import {metadataStatsSelector, selectedArtistAtom} from '../../globalState'

export function HeaderMetadataStats() {
  const hasSelectedArtist = !!useAtomValue(selectedArtistAtom)
  const {totalBeats, totalTime, artistCount} = useAtomValue(
    metadataStatsSelector
  )

  return (
    <div className="flex gap-3 opacity-50">
      <div className="text-nowrap">{totalBeats} beats</div>
      {!hasSelectedArtist && (
        <>
          <div>|</div>
          <div className="text-nowrap">{artistCount} artists</div>
        </>
      )}
      {!!totalTime && (
        <>
          <div>|</div>
          <div className="text-nowrap">{totalTime}</div>
        </>
      )}
    </div>
  )
}
