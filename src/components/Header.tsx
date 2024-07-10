import {useMetadataStats} from '../hooks/useFetchMetadata'

export function Header() {
  const {totalBeats, totalTime} = useMetadataStats()

  return (
    <header className="pb-4">
      <h1 className="text-5xl font-bold">Beats Playlist</h1>
      <p className="italic opacity-50">Dope beats from YouTube</p>
      <div className="flex gap-3 opacity-50">
        {totalBeats && <div>{totalBeats} beats</div>}
        {totalBeats && totalTime && <div>|</div>}
        {totalTime && <div>{totalTime}</div>}
      </div>
    </header>
  )
}
