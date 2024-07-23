import {useAtomValue, useSetAtom} from 'jotai'

import {Shuffle} from './ControlIcons'
import {shuffleStateSelector, toggleShuffleAtom} from '../../globalState'

export function ShuffleButton({
  baseSize = 8,
  fill = 'white',
  disabledFill = 'gray',
  forceDisabled,
  className,
}: {
  baseSize?: number
  disabledFill?: string
  forceDisabled?: string
  fill?: string
  className?: string
}) {
  const toggleState = useAtomValue(shuffleStateSelector)
  const toggleShuffle = useSetAtom(toggleShuffleAtom)

  return (
    <button className={className} onClick={toggleShuffle}>
      <Shuffle
        size={baseSize * 3 * 0.7}
        fill={!toggleState || forceDisabled ? disabledFill : fill}
      />
    </button>
  )
}
