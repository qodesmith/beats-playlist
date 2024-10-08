import {useAtomValue, useSetAtom} from 'jotai'

import {Next, Pause, Play, PlaybackSpeedIcon, Previous} from './ControlIcons'
import {RepeatButton} from './RepeatButton'
import {ShuffleButton} from './ShuffleButton'
import {VolumeButton} from './VolumeButton'
import {
  currentAudioStateAtom,
  handleNextClickAtom,
  handlePlayPauseAtom,
  handlePreviousClickAtom,
  isPreviousDisabledSelector,
  selectedBeatIdAtom,
} from '../../globalState'

export function Controls({baseSize}: {baseSize: number}) {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const fill = beatId ? 'white' : 'gray'
  const handlePrevious = useSetAtom(handlePreviousClickAtom)
  const handleNext = useSetAtom(handleNextClickAtom)
  const playState = useAtomValue(currentAudioStateAtom)
  const handlePlayPause = useSetAtom(handlePlayPauseAtom)
  const isPreviousDisabled = useAtomValue(isPreviousDisabledSelector)

  return (
    <div className="grid grid-cols-[repeat(7,1fr)] place-items-center justify-center pb-2 md:grid-cols-[repeat(7,32px)] md:gap-4">
      {/* VOLUME */}
      <VolumeButton baseSize={baseSize} fill={fill} />

      {/* SHUFFLE */}
      <ShuffleButton baseSize={baseSize} />

      {/* PREVIOUS */}
      <div className="size-full">
        <button
          className="grid size-full place-items-center"
          onClick={isPreviousDisabled ? undefined : handlePrevious}
        >
          <Previous
            size={baseSize * 3}
            fill={isPreviousDisabled ? 'gray' : fill}
          />
        </button>
      </div>

      {/* PLAY / PAUSE */}
      <button onClick={handlePlayPause}>
        {playState === 'playing' ? (
          <Pause size={baseSize * 4} circleFill={fill} />
        ) : (
          <Play size={baseSize * 4} circleFill={fill} />
        )}
      </button>

      {/* NEXT */}
      <div className="size-full">
        <button
          className="grid size-full place-items-center"
          onClick={handleNext}
        >
          <Next size={baseSize * 3} fill={fill} />
        </button>
      </div>

      {/* REPEAT */}
      <div className="size-full">
        <RepeatButton
          className="grid size-full place-items-center"
          size={baseSize * 2.5 * 0.9}
        />
      </div>

      <div className="size-full">
        <button className="grid size-full place-items-center" disabled>
          <PlaybackSpeedIcon size={baseSize * 2.5} fill="gray" />
        </button>
      </div>
    </div>
  )
}
