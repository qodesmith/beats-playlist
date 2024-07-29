import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtom, useAtomValue, useSetAtom} from 'jotai'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {
  audioThingAtom,
  isSliderDraggingAtom,
  metadataItemSelector,
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
  const {rawTime, formattedTime} = useAtomValue(timeProgressSelector)
  const setTimeProgress = useSetAtom(setTimeProgressAtom)
  const {durationInSeconds = 0} = useAtomValue(metadataItemSelector) ?? {}
  const duration = useMemo(
    () => secondsToDuration(durationInSeconds),
    [durationInSeconds]
  )
  const [isDragging, setIsDragging] = useAtom(isSliderDraggingAtom)
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
    [setIsDragging, setTimeProgress]
  )
  const [progressWidth, setProgressWidth] = useState<string>('0%')
  const sliderContainerRef = useRef<HTMLDivElement>(null)
  const ballCls = clsx(
    'absolute right-0 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 scale-100 rounded-full bg-puerto-rico-300 transition-transform duration-200 group-hover:scale-[3]',
    {
      'scale-[3]': isDragging,
    }
  )

  /**
   * MOUSE MOVE
   * Track the mouse on the screen and determine if it is withing the horizontal
   * boundaries of the slider.
   */
  useEffect(() => {
    const handler = ({clientX}: MouseEvent) => {
      if (!sliderContainerRef.current) return

      const {left, width} = sliderContainerRef.current.getBoundingClientRect()
      const isBeforeRange = clientX < left
      const isAfterRange = clientX > left + width
      const isInRange = !isBeforeRange && !isAfterRange
      const isSliderDragging = store.get(isSliderDraggingAtom)

      if (isSliderDragging) {
        if (isInRange) {
          const newPosition = (clientX - left) / width
          const newWidth = `${newPosition * 100}%`

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
  }, [durationInSeconds, setTimeProgress])

  /**
   * MOUSE UP
   * The mouseup handler should be on the document so we're free to grab the
   * slider, drag around the document, and mouseup wherever we want.
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!sliderContainerRef.current) return

      if (store.get(isSliderDraggingAtom)) {
        const {durationInSeconds} = store.get(metadataItemSelector)!
        const {width, left} = sliderContainerRef.current.getBoundingClientRect()
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
  }, [setIsDragging])

  /**
   * Update the progress width during playback.
   */
  useEffect(() => {
    if (!store.get(isSliderDraggingAtom)) {
      const newWidth = `${(rawTime / durationInSeconds) * 100}%`
      setProgressWidth(newWidth)
    }
  }, [durationInSeconds, rawTime])

  return (
    <div className="m-auto grid w-full grid-cols-[5ch,1fr,5ch] gap-2 py-2 md:w-1/2">
      <div className="place-self-end">{formattedTime}</div>
      <div
        className="group relative grid cursor-pointer place-items-center"
        ref={sliderContainerRef}
        onMouseDown={handleMouseDown}
      >
        {/* SLIDER BG */}
        <div className="h-1 w-full rounded bg-neutral-500" />

        {/* SLIDER PROGRESS */}
        <div
          className="absolute left-0 h-1 rounded bg-puerto-rico-400"
          style={{width: progressWidth}}
        />

        {/* BALL */}
        <div className={ballCls} style={{left: progressWidth}} />
      </div>
      <div>{duration}</div>
    </div>
  )
}
