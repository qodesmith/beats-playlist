import {useAtomValue, useSetAtom} from 'jotai'

import {Repeat} from './ControlIcons'
import {cycleRepeatStateAtom, repeatStateSelector} from '../../globalState'

export function RepeatButton({
  fill,
  disabledFill = 'gray',
}: {
  fill?: string
  disabledFill?: string
}) {
  const repeatState = useAtomValue(repeatStateSelector)
  const cycleRepeat = useSetAtom(cycleRepeatStateAtom)

  return (
    <Repeat
      one={repeatState === 'single'}
      fill={repeatState === 'off' ? disabledFill : fill}
      onClick={cycleRepeat}
    />
  )
}
