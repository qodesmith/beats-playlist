import {useAtomValue, useSetAtom} from 'jotai'

import {Next, Pause, Play, Previous} from './ControlIcons'
import {RepeatButton} from './RepeatButton'
import {ShuffleButton} from './ShuffleButton'
import {
  currentAudioStateAtom,
  handleNextClickAtom,
  handlePlayPauseAtom,
  handlePreviousClickAtom,
  selectedBeatIdAtom,
} from '../../globalState'

export function Controls({baseSize}: {baseSize: number}) {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const fill = beatId ? 'white' : 'gray'
  const handlePrevious = useSetAtom(handlePreviousClickAtom)
  const handleNext = useSetAtom(handleNextClickAtom)
  const playState = useAtomValue(currentAudioStateAtom)
  const handlePlayPause = useSetAtom(handlePlayPauseAtom)

  return (
    <div className="grid grid-cols-[repeat(5,1fr)] place-items-center justify-center gap-4 pb-4 md:grid-cols-[repeat(5,32px)]">
      {/* SHUFFLE */}
      <ShuffleButton
        baseSize={baseSize}
        className="flex w-full items-center justify-center"
      />

      {/* PREVIOUS */}
      <button onClick={handlePrevious}>
        <Previous size={baseSize * 3} fill={fill} />
      </button>

      {/* PLAY / PAUSE */}
      <button onClick={handlePlayPause}>
        {playState === 'playing' ? (
          <Pause size={baseSize * 4} circleFill={fill} />
        ) : (
          <Play size={baseSize * 4} circleFill={fill} />
        )}
      </button>

      {/* NEXT */}
      <button onClick={handleNext}>
        <Next size={baseSize * 3} fill={fill} />
      </button>
      <RepeatButton size={baseSize * 2.5 * 0.9} />
    </div>
  )
}
