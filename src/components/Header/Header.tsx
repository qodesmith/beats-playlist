import {useAtomValue} from 'jotai'

import {HeaderButtonGroup} from './HeaderButtonGroup'
import {metadataStatsSelector} from '../../globalState'

export function Header() {
  return (
    <header className="flex items-start justify-between md:items-center">
      <div className="flex flex-col pb-4 md:flex-row md:items-end md:gap-8">
        <h1 className="text-3xl font-bold md:text-5xl">Beats Playlist</h1>
        <div className="text-sm">
          <p className="italic opacity-50">Dope beats from YouTube</p>
          <HeaderMetadataStats />
        </div>
      </div>
      <HeaderButtonGroup />
    </header>
  )
}

function HeaderMetadataStats() {
  const {totalBeats, totalTime, artistCount} = useAtomValue(
    metadataStatsSelector
  )

  return (
    <div className="flex gap-3 opacity-50">
      <div className="text-nowrap">{totalBeats} beats</div>
      <div>|</div>
      <div className="text-nowrap">{artistCount} artists</div>
      <div>|</div>
      <div className="text-nowrap">{totalTime}</div>
    </div>
  )
}
