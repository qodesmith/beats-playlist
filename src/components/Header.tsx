import {useAtomValue} from 'jotai'

import {RandomizeListButton} from './RandomizeListButton'
import {metadataStatsSelector} from '../globalState'

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
      <div className="flex justify-start md:mr-2 md:w-[5ch]">
        <RandomizeListButton className="rounded border border-neutral-700 p-2 hover:bg-neutral-800 active:bg-neutral-700" />
      </div>
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
