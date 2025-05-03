import {useAtomValue} from 'jotai'

import {audioThingAtom, repeatStateSelector} from '../../AudioThing'
import {Repeat} from './ControlIcons'

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
      type="button"
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
