import {HeaderButtonGroup} from './HeaderButtonGroup'
import {HeaderMetadataStats} from './HeaderMetadataStats'

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
