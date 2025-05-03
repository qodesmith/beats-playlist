import clsx from 'clsx'
import {useAtomValue} from 'jotai'

import {isMenuOpenAtom} from '../../globalState'

export function Hamburger({
  size = 30,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  const isOpen = useAtomValue(isMenuOpenAtom)
  const baseCls = 'origin-center transition-all duration-200'
  const outerBase = 'w-0 translate-x-1/2 opacity-0'

  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill={fill}>
      <title>hamburger</title>
      <rect
        width="30"
        height="4"
        rx="2"
        className={clsx(baseCls, {
          [outerBase]: isOpen,
          'translate-y-[13px]': isOpen,
        })}
      />
      <rect
        y="13"
        width="30"
        height="4"
        rx="2"
        className={clsx(baseCls, {
          'rotate-45': isOpen,
        })}
      />
      <rect
        y="13"
        width="30"
        height="4"
        rx="2"
        className={clsx(baseCls, {'-rotate-45': isOpen})}
      />
      <rect
        y="26"
        width="30"
        height="4"
        rx="2"
        className={clsx(baseCls, {
          [outerBase]: isOpen,
          'translate-y-[-13px]': isOpen,
        })}
      />
    </svg>
  )
}
