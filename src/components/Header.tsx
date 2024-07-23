import {useAtomValue} from 'jotai'

import {RandomizeListButton} from './RandomizeListButton'
import {metadataStatsSelector} from '../globalState'

export function Header() {
  return (
    <header className="flex items-end gap-8 pb-4">
      <h1 className="text-5xl font-bold">Beats Playlist</h1>
      <div className="text-sm">
        <p className="italic opacity-50">Dope beats from YouTube</p>
        <HeaderMetadataStats />
      </div>
      <RandomizeListButton />
    </header>
  )
}

function HeaderMetadataStats() {
  const {totalBeats, totalTime} = useAtomValue(metadataStatsSelector)

  return (
    <div className="flex gap-3 opacity-50">
      <div>{totalBeats} beats</div>
      <div>|</div>
      <div>{totalTime}</div>
    </div>
  )
}
