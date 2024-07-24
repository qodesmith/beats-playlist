import {useState} from 'react'

import {Hamburger} from './Hamburger'
import {HeaderButton} from './HeaderButton'

export function MenuButton() {
  const [open, setOpen] = useState(false)

  return (
    <HeaderButton onClick={() => setOpen(v => !v)}>
      <Hamburger size={16} isOpen={open} />
    </HeaderButton>
  )
}
