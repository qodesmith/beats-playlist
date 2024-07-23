import {useAtomValue, useSetAtom} from 'jotai'
import {Suspense} from 'react'

import {Next, Pause, Play, Previous} from './ControlIcons'
import {RepeatButton} from './RepeatButton'
import {ShuffleButton} from './ShuffleButton'
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
  const handlePrevious = useSetAtom(previousBeatAtom)
  const handleNext = useSetAtom(nextBeatAtom)
  const playState = useAtomValue(currentAudioStateAtom)

  return (
    <div className="grid grid-cols-[repeat(5,32px)] justify-center gap-4 pb-4">
      <ShuffleButton
        baseSize={baseSize}
        className="flex w-full items-center justify-center"
      />
      <button onClick={handlePrevious}>
        <Previous size={baseSize * 3} />
      </button>
      {playState === 'playing' ? (
        <Pause size={baseSize * 4} circleFill="gray" />
      ) : (
        <Play size={baseSize * 4} circleFill="gray" />
      )}
      <button onClick={handleNext}>
        <Next size={baseSize * 3} />
      </button>
      <RepeatButton size={baseSize * 2.5 * 0.9} />
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
    <div className="grid grid-cols-[repeat(5,32px)] justify-center gap-4 pb-4">
      <ShuffleButton
        baseSize={baseSize}
        className="flex w-full items-center justify-center"
      />
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
