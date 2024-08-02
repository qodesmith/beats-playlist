import {useAtomValue} from 'jotai'

import {metadataStatsSelector, selectedArtistAtom} from '../../globalState'

export function HeaderMetadataStats() {
  const {totalBeats, totalTime, artistCount} = useAtomValue(
    metadataStatsSelector
  )
  const hasSelectedArtist = !!useAtomValue(selectedArtistAtom)
  console.log({totalTime})

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
