import clsx from 'clsx'
import {useCallback, useMemo, useRef, useState} from 'react'

import {ResetIcon} from './ControlIcons'
import {MAX_VOLUME_MULTIPLIER} from '../../constants'

type Props = {
  id: string
  multiplier: number
  onChange: (amount: number) => void
  onReset: () => void
  fill: string
}

export function VerticalSlider({
  id,
  multiplier,
  onChange,
  onReset,
  fill,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const valuePercent = `${(multiplier / MAX_VOLUME_MULTIPLIER) * 100}%` as const
  const sliderBarRef = useRef<HTMLDivElement>(null)
  const indicatorBottomOffset = useMemo(() => {
    return {bottom: `calc(${(1 / MAX_VOLUME_MULTIPLIER) * 100}% + 2px)`}
  }, [])

  /**
   * Since this component is rendered inside a button, we need to prevent the
   * click event from propagating to that button, thereby closing the volume
   * slider.
   */
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation()
      setIsDragging(false)
    },
    []
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const newVolume = calculateNewVolume(sliderBarRef.current!, e)

      setIsDragging(true)
      onChange(newVolume)
    },
    [onChange]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!isDragging) return

      const newVolume = calculateNewVolume(sliderBarRef.current!, e)
      onChange(newVolume)
    },
    [onChange, isDragging]
  )

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  return (
    <div
      id={id}
      className="absolute bottom-[calc(100%+.5rem)] left-1/2 grid -translate-x-1/2 cursor-default place-items-center gap-2 rounded border border-neutral-700 bg-neutral-900 pb-3"
      onClick={handleContainerClick}
    >
      {/* TOP CONTAINER */}
      <div className="flex flex-col items-center justify-center">
        {/* MULTIPLIER VALUE */}
        <div className="text-xs text-neutral-500">{multiplier.toFixed(2)}</div>

        {/* RESET BUTTON */}
        <button className="p-2" onClick={onReset}>
          <ResetIcon fill={fill} size={16} />
        </button>
      </div>

      {/* BOTTOM POINTER */}
      <div className="absolute top-full h-3 w-3 -translate-y-[calc(50%-.5px)] rotate-45 border-b border-r border-neutral-700 bg-neutral-900" />

      {/* SLIDER BAR */}
      <div
        className="group relative cursor-pointer px-4"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* 100% INDICATOR LINE */}
        <div
          className="absolute left-1/2 h-[1px] w-3/4 -translate-x-1/2 bg-neutral-700"
          style={indicatorBottomOffset}
        />

        <div
          className="relative h-36 w-1 rounded bg-neutral-500"
          ref={sliderBarRef}
        >
          {/* CURRENT VOLUME BAR */}
          <div
            className="absolute bottom-0 left-0 w-full rounded bg-puerto-rico-400"
            // Add .25rem (width of the bar) so no gap forms between the bar and the ball.
            style={{height: `calc(${valuePercent} + .25rem)`}}
          />

          {/* BALL */}
          <VerticalSliderBall value={valuePercent} isDragging={isDragging} />
        </div>
      </div>
    </div>
  )
}

function VerticalSliderBall({
  value,
  isDragging,
}: {
  value: `${number}%`
  isDragging: boolean
}) {
  const ballCls = clsx(
    'absolute bottom-0 h-1 w-1 rounded-full bg-puerto-rico-300 transition-transform duration-200 group-hover:scale-[3]',
    {'scale-[3]': isDragging}
  )

  return <div className={ballCls} style={{bottom: value}} />
}

function calculateNewVolume(
  el: HTMLDivElement,
  e: React.MouseEvent<HTMLDivElement, MouseEvent>
) {
  const {height, top} = el.getBoundingClientRect()
  const offsetY = e.clientY - top
  const position = 1 - offsetY / height
  const newVolume = Math.min(Math.max(position, 0), 1) * MAX_VOLUME_MULTIPLIER

  return newVolume
}
