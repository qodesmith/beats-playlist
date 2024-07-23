import {useAtomValue, useSetAtom} from 'jotai'
import {Suspense} from 'react'

import {Next, Pause, Play, Previous, Shuffle} from './ControlIcons'
import {RepeatButton} from './RepeatButton'
import {
  currentAudioStateAtom,
  nextBeatAtom,
  previousBeatAtom,
  selectedBeatIdAtom,
} from '../../globalState'
import {useAudioThing} from '../../hooks/useAudioThing'

export function Controls({
  baseSize,
}: {
  /**
   * This value determines the size of the icons. Each icon's size will be a
   * multiple of this value so they will proportionally stay the same.
   */
  baseSize: number
}) {
  return (
    <Suspense fallback={<DisabledControls baseSize={baseSize} />}>
      <ControlsBody baseSize={baseSize} />
    </Suspense>
  )
}

function DisabledControls({baseSize}: {baseSize: number}) {
  const fill = 'gray'
  const handlePrevious = useSetAtom(previousBeatAtom)
  const handleNext = useSetAtom(nextBeatAtom)
  const playState = useAtomValue(currentAudioStateAtom)

  return (
    <div className="flex items-center justify-center gap-4">
      <button onClick={handlePrevious}>
        <Previous size={baseSize * 3} fill={fill} />
      </button>
      {playState === 'playing' ? (
        <Pause size={baseSize * 4} circleFill={fill} />
      ) : (
        <Play size={baseSize * 4} circleFill={fill} />
      )}
      <button onClick={handleNext}>
        <Next size={baseSize * 3} fill={fill} />
      </button>
      <RepeatButton forceDisabled />
    </div>
  )
}

function ControlsBody({baseSize}: {baseSize: number}) {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const fill = beatId ? 'white' : 'gray'
  const [audio, playState] = useAudioThing()
  const handlePrevious = useSetAtom(previousBeatAtom)
  const handleNext = useSetAtom(nextBeatAtom)

  return (
    // <div className="flex items-center justify-center gap-4 pb-4">
    <div className="grid grid-cols-[repeat(5,32px)] justify-center gap-4 pb-4">
      <button className="flex w-full items-center justify-center">
        <Shuffle size={baseSize * 3 * 0.7} />
      </button>
      <button onClick={handlePrevious}>
        <Previous size={baseSize * 3} fill={fill} />
      </button>
      <button onClick={() => audio?.togglePlay()}>
        {playState === 'playing' ? (
          <Pause size={baseSize * 4} circleFill={fill} />
        ) : (
          <Play size={baseSize * 4} circleFill={fill} />
        )}
      </button>

      <button onClick={handleNext}>
        <Next size={baseSize * 3} fill={fill} />
      </button>
      <RepeatButton size={baseSize * 2.5 * 0.9} />
    </div>
  )
}
