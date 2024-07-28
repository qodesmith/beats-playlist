// import {HeaderButtonAndMenu} from './HeaderButtonAndMenu'
import {RandomizeListButton} from './RandomizeListButton'

export function HeaderButtonGroup() {
  return (
    <div className="absolute right-2 flex h-10 gap-2 md:relative">
      <RandomizeListButton />
      {/* <HeaderButtonAndMenu /> */}
    </div>
  )
}
