import {useSetAtom} from 'jotai'
import {useCallback, useEffect} from 'react'

import {isMenuOpenAtom} from '../../globalState'
import {Hamburger} from './Hamburger'
import {HeaderButton} from './HeaderButton'

export function MenuButton({
  buttonId,
  menuId,
}: {
  buttonId: string
  menuId: string
}) {
  const setOpen = useSetAtom(isMenuOpenAtom)
  const toggleOpen = useCallback(() => setOpen(v => !v), [])

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const button = document.getElementById(buttonId)
      const menu = document.getElementById(menuId)
      const isButtonClick = button?.contains(e.target as Node)
      const isMenuClick = menu?.contains(e.target as Node)

      if (!(isButtonClick || isMenuClick)) {
        setOpen(false)
      }
    },
    [buttonId, menuId]
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
