import {useAtomValue} from 'jotai'

import {Repeat} from './ControlIcons'
import {audioThingAtom, repeatStateSelector} from '../../AudioThing'

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
  const audioThing = useAtomValue(audioThingAtom)

  return (
    <button
      className={className}
      onClick={forceDisabled ? undefined : audioThing?.cycleRepeat}
    >
      <Repeat
        one={repeatState === 'single'}
        fill={repeatState === 'off' || forceDisabled ? disabledFill : fill}
        size={size}
      />
    </button>
  )
}
