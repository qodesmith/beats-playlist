import {useAtomValue} from 'jotai'

import {isPlaybackShuffledAtom, togglePlaybackShuffle} from '../../AudioThing'
import {Shuffle} from './ControlIcons'

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
      type="button"
      className="grid size-full place-items-center"
      onClick={togglePlaybackShuffle}
    >
      <Shuffle
        size={baseSize * 3 * 0.7}
        fill={isPlaybackShuffled ? fill : disabledFill}
      />
    </button>
  )
}
