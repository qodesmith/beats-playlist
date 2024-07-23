import {useAtomValue, useSetAtom} from 'jotai'

import {Repeat} from './ControlIcons'
import {cycleRepeatStateAtom, repeatStateSelector} from '../../globalState'

export function RepeatButton({
  fill,
  disabledFill = 'gray',
  forceDisabled = false,
}: {
  fill?: string
  disabledFill?: string
  forceDisabled?: boolean
}) {
  const repeatState = useAtomValue(repeatStateSelector)
  const cycleRepeat = useSetAtom(cycleRepeatStateAtom)

  return (
    <button
      onClick={forceDisabled ? undefined : cycleRepeat}
      className="absolute left-full top-0 ml-4 h-full p-1"
    >
      <Repeat
        one={repeatState === 'single'}
        fill={repeatState === 'off' || forceDisabled ? disabledFill : fill}
      />
    </button>
  )
}
