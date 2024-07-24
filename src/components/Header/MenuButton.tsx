import {useSetAtom} from 'jotai'
import {useCallback, useEffect} from 'react'

import {Hamburger} from './Hamburger'
import {HeaderButton} from './HeaderButton'
import {isMenuOpenAtom} from '../../globalState'

export function MenuButton({
  buttonId,
  menuId,
}: {
  buttonId: string
  menuId: string
}) {
  const setOpen = useSetAtom(isMenuOpenAtom)
  const toggleOpen = useCallback(() => setOpen(v => !v), [setOpen])

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const button = document.getElementById(buttonId)
      const menu = document.getElementById(menuId)
      const isButtonClick = button && button.contains(e.target as Node)
      const isMenuClick = menu && menu.contains(e.target as Node)

      if (!isButtonClick && !isMenuClick) {
        setOpen(false)
      }
    },
    [buttonId, menuId, setOpen]
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <HeaderButton onClick={toggleOpen} id={buttonId}>
      <Hamburger size={20} />
    </HeaderButton>
  )
}
