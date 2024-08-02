// import {HeaderButtonAndMenu} from './HeaderButtonAndMenu'
import {RandomizeListButton} from './RandomizeListButton'
import {Search} from './Search'

export function HeaderButtonGroup() {
  return (
    <div className="absolute right-2 flex h-10 gap-2 md:relative">
      <Search />
      <RandomizeListButton />
      {/* <HeaderButtonAndMenu /> */}
    </div>
  )
}
