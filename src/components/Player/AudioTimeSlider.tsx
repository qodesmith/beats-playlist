import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtom, useAtomValue, useSetAtom} from 'jotai'
import {useCallback, useEffect, useId} from 'react'

import {
  audioThingAtom,
  durationInSecondsSelector,
  getAudioDataLoadableAtomFamily,
  isSliderDraggingAtom,
  metadataItemSelector,
  progressWidthAtom,
  selectedBeatIdAtom,
  setTimeProgressAtom,
  timeProgressSelector,
} from '../../globalState'
import {store} from '../../store'

export function AudioTimeSlider() {
  /**
   * Ensure the component remounts when a beat changes without consuming
   * components manually having to pass a key.
   */
  return <AudioTimeSliderBody key={useAtomValue(selectedBeatIdAtom)} />
}

function AudioTimeSliderBody() {
  const setTimeProgress = useSetAtom(setTimeProgressAtom)
  const setIsDragging = useSetAtom(isSliderDraggingAtom)
  const setProgressWidth = useSetAtom(progressWidthAtom)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault()
      const {width, left} = e.currentTarget.getBoundingClientRect()
      const offsetX = e.clientX - left
      const position = offsetX / width

      setIsDragging(true)
      setProgressWidth(`${position * 100}%`)
      setTimeProgress(position)
    },
    [setIsDragging, setProgressWidth, setTimeProgress]
  )
  const sliderContainerId = useId()

  return (
    <div className="m-auto grid w-full grid-cols-[5ch,1fr,5ch] gap-2 py-2 md:w-1/2">
      {/* Doesn't render anything, just sets up mouse handlers. */}
      <MouseHandlers sliderContainerId={sliderContainerId} />

      {/* The current time on the left of the slider. */}
      <FormattedTime />

      {/* The slider itself. */}
      <div
        id={sliderContainerId}
        className="group relative grid cursor-pointer place-items-center"
        onMouseDown={handleMouseDown}
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
  const {formattedTime} = useAtomValue(timeProgressSelector)

  return <div className="place-self-end">{formattedTime}</div>
}

function SliderProgress() {
  const [progressWidth, setProgressWidth] = useAtom(progressWidthAtom)
  const {rawTime} = useAtomValue(timeProgressSelector)
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioBufferRes = useAtomValue(getAudioDataLoadableAtomFamily(beatId))
  const durationInSeconds = (() => {
    if (audioBufferRes.state === 'hasData') {
      return Math.round(audioBufferRes.data?.audioBuffer.duration ?? 0)
    }
    return 0
  })()

  /**
   * Update the progress width during playback.
   */
  useEffect(() => {
    if (!store.get(isSliderDraggingAtom)) {
      const newWidth = `${(rawTime / durationInSeconds) * 100}%` as const
      setProgressWidth(newWidth)
    }
  }, [durationInSeconds, rawTime, setProgressWidth])

  return (
    <div
      className="absolute left-0 h-1 rounded bg-puerto-rico-400"
      style={{width: progressWidth}}
    />
  )
}

/**
 * A handful of mouse handlers to control the audio time slider. React
 * components don't need to return JSX. This component doesn't render anything,
 * rather, it's used simply to set up mouse handlers and remove them on unmount.
 */
function MouseHandlers({sliderContainerId}: {sliderContainerId: string}) {
  const setProgressWidth = useSetAtom(progressWidthAtom)
  const setTimeProgress = useSetAtom(setTimeProgressAtom)
  const setIsDragging = useSetAtom(isSliderDraggingAtom)

  /**
   * MOUSE MOVE
   * Track the mouse on the screen and determine if it is withing the horizontal
   * boundaries of the slider.
   */
  useEffect(() => {
    const handler = ({clientX}: MouseEvent) => {
      const sliderContainer = document.getElementById(sliderContainerId)
      if (!sliderContainer) return

      const {left, width} = sliderContainer.getBoundingClientRect()
      const isBeforeRange = clientX < left
      const isAfterRange = clientX > left + width
      const isInRange = !isBeforeRange && !isAfterRange
      const isSliderDragging = store.get(isSliderDraggingAtom)

      if (isSliderDragging) {
        if (isInRange) {
          const newPosition = (clientX - left) / width
          const newWidth = `${newPosition * 100}%` as const

          setProgressWidth(newWidth)
          setTimeProgress(newPosition)
        } else {
          setProgressWidth(isBeforeRange ? '0%' : '100%')
          setTimeProgress(isBeforeRange ? 0 : 1)
        }
      }
    }

    document.addEventListener('mousemove', handler)

    return () => {
      document.removeEventListener('mousemove', handler)
    }
  }, [setProgressWidth, setTimeProgress, sliderContainerId])

  /**
   * MOUSE UP
   * The mouseup handler should be on the document so we're free to grab the
   * slider, drag around the document, and mouseup wherever we want.
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const sliderContainer = document.getElementById(sliderContainerId)
      if (!sliderContainer) return

      if (store.get(isSliderDraggingAtom)) {
        const {durationInSeconds} = store.get(metadataItemSelector)!
        const {width, left} = sliderContainer.getBoundingClientRect()
        const offsetX = e.clientX - left
        const position = offsetX / width
        const newPosition = Math.min(Math.max(position, 0), durationInSeconds)

        setIsDragging(false)
        store.get(audioThingAtom)?.setPlayPosition(newPosition)
      }
    }

    document.addEventListener('mouseup', handler)

    return () => {
      document.removeEventListener('mouseup', handler)
    }
  }, [setIsDragging, sliderContainerId])

  return null
}

function Duration() {
  const durationInSeconds = useAtomValue(durationInSecondsSelector)

  return (
    <div>
      {durationInSeconds ? secondsToDuration(durationInSeconds) : '--:--'}
    </div>
  )
}

function Ball() {
  const isDragging = useAtomValue(isSliderDraggingAtom)
  const progressWidth = useAtomValue(progressWidthAtom)
  const ballCls = clsx(
    'absolute right-0 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 scale-100 rounded-full bg-puerto-rico-300 transition-transform duration-200 group-hover:scale-[3]',
    {
      'scale-[3]': isDragging,
    }
  )

  return <div className={ballCls} style={{left: progressWidth}} />
}
