import {useAtomValue} from 'jotai'

import {Shuffle} from './ControlIcons'
import {isPlaybackShuffledAtom, togglePlaybackShuffle} from '../../AudioThing'

export function ShuffleButton({
  baseSize = 8,
  fill = 'white',
  disabledFill = 'gray',
}: {
  baseSize?: number
  disabledFill?: string
  fill?: string
}) {
  const isPlaybackShuffled = useAtomValue(isPlaybackShuffledAtom)

  return (
    <button
      className="grid size-full place-items-center"
      onClick={togglePlaybackShuffle}
    >
      <Shuffle
        size={baseSize * 3 * 0.7}
        fill={!isPlaybackShuffled ? disabledFill : fill}
      />
    </button>
  )
}
