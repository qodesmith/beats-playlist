import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtomValue} from 'jotai'
import {useEffect} from 'react'

import {
  durationAtomSelector,
  handleStartSlider,
  progressPercentAtom,
  timeProgressSelector,
} from '../../AudioThing'
import {sliderContainerId} from '../../constants'
import {
  isSliderDraggingAtom,
  sliderContainerElementAtom,
} from '../../globalState'
import {usePrevious} from '../../hooks/usePrevious'
import {store} from '../../store'

export function AudioTimeSlider() {
  useEffect(() => {
    store.set(
      sliderContainerElementAtom,
      document.getElementById(sliderContainerId)
    )
  }, [])

  return (
    <div className="m-auto grid w-full grid-cols-[5ch,1fr,5ch] gap-2 py-2 md:w-1/2">
      {/* The current time on the left of the slider. */}
      <FormattedTime />

      {/* The slider itself. */}
      <div
        id={sliderContainerId}
        className="group relative grid cursor-pointer place-items-center"
        onMouseDown={handleStartSlider}
        onTouchStart={handleStartSlider}
      >
        {/* SLIDER BG */}
        <div className="h-1 w-full rounded bg-neutral-500" />

        {/* SLIDER PROGRESS */}
        <SliderProgress />

        {/* BALL */}
        <Ball />
      </div>

      {/* The duration of the audio on the right of the slider. */}
      <Duration />
    </div>
  )
}

/**
 * The current time of the audio on the left of the slider. Since this updates
 * frequently, it's brokwn out into a separate component to avoid the consumer
 * having to re-render.
 */
function FormattedTime() {
  const currentTime = useAtomValue(timeProgressSelector)
  return <div className="select-none place-self-end">{currentTime}</div>
}

function SliderProgress() {
  const progressPercent = useAtomValue(progressPercentAtom)

  return (
    <div
      className="absolute left-0 h-1 rounded bg-puerto-rico-400"
      style={{width: `${progressPercent}%`}}
    />
  )
}

function Duration() {
  const durationInSeconds = useAtomValue(durationAtomSelector)
  const previousDurationInSeconds = usePrevious(durationInSeconds)
  const seconds = durationInSeconds || previousDurationInSeconds

  return (
    <div className="select-none">
      {seconds ? secondsToDuration(seconds) : '--:--'}
    </div>
  )
}

function Ball() {
  const isDragging = useAtomValue(isSliderDraggingAtom)
  const progressPercent = useAtomValue(progressPercentAtom)

  return (
    <div
      className={clsx(
        'absolute right-0 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 scale-100 rounded-full bg-puerto-rico-300 transition-transform duration-200 group-hover:scale-[3]',
        {
          'scale-[3]': isDragging,
        }
      )}
      style={{left: `${progressPercent}%`}}
    />
  )
}
