import {useAtomValue, useSetAtom} from 'jotai'

import {Repeat} from './ControlIcons'
import {cycleRepeatStateAtom, repeatStateSelector} from '../../globalState'

export function RepeatButton({
  className,
  fill,
  size,
  disabledFill = 'gray',
  forceDisabled = false,
}: {
  className?: string
  fill?: string
  size?: number
  disabledFill?: string
  forceDisabled?: boolean
}) {
  const repeatState = useAtomValue(repeatStateSelector)
  const cycleRepeat = useSetAtom(cycleRepeatStateAtom)

  return (
    <button
      className={className}
      onClick={forceDisabled ? undefined : cycleRepeat}
    >
      <Repeat
        one={repeatState === 'single'}
        fill={repeatState === 'off' || forceDisabled ? disabledFill : fill}
        size={size}
      />
    </button>
  )
}
