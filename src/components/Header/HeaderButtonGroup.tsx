import {HeaderButtonAndMenu} from './HeaderButtonAndMenu'
import {RandomizeListButton} from './RandomizeListButton'

export function HeaderButtonGroup() {
  return (
    <div className="flex h-10 gap-2">
      <RandomizeListButton />
      <HeaderButtonAndMenu />
    </div>
  )
}
