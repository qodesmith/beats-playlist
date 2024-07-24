import {useAtomValue} from 'jotai'
import {useId} from 'react'

import {HeaderMenu} from './HeaderMenu'
import {MenuButton} from './MenuButton'
import {isMenuOpenAtom} from '../../globalState'

export function HeaderButtonAndMenu() {
  const isMenuOpen = useAtomValue(isMenuOpenAtom)
  const menuId = useId()
  const buttonId = useId()

  return (
    <div className="relative">
      <MenuButton menuId={menuId} buttonId={buttonId} />
      {isMenuOpen && <HeaderMenu id={menuId} />}
    </div>
  )
}
