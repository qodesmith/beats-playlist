import {useAtomValue, useSetAtom} from 'jotai'

import {Shuffle} from './ControlIcons'
import {shuffleStateSelector, toggleShuffleAtom} from '../../globalState'

export function ShuffleButton({
  baseSize = 8,
  fill = 'white',
  disabledFill = 'gray',
}: {
  baseSize?: number
  disabledFill?: string
  fill?: string
}) {
  const toggleState = useAtomValue(shuffleStateSelector)
  const toggleShuffle = useSetAtom(toggleShuffleAtom)

  return (
    <button
      className="grid size-full place-items-center"
      onClick={toggleShuffle}
    >
      <Shuffle
        size={baseSize * 3 * 0.7}
        fill={!toggleState ? disabledFill : fill}
      />
    </button>
  )
}
