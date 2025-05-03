import clsx from 'clsx'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {ResetIcon} from './ControlIcons'

type Props = {
  id: string
  multiplier: number
  maxMultiplier: number
  onChange: (amount: number) => void
  onReset: () => void
  fill: string
}

export function VerticalSlider({
  id,
  multiplier,
  maxMultiplier,
  onChange,
  onReset,
  fill,
}: Props) {
  const [isDragging, originalSetIsDragging] = useState(false)

  /**
   * Most usage of the `isDragging` variable is inside event listeners. We can
   * avoid this triggering a useCallback dependency change by also storing it
   * in a ref which we can access directly.
   */
  const isDraggingRef = useRef<boolean>(isDragging)
  const setIsDragging = useCallback((value: boolean) => {
    isDraggingRef.current = value
    originalSetIsDragging(value)
  }, [])
  const valuePercent = `${(multiplier / maxMultiplier) * 100}%` as const
  const sliderBarRef = useRef<HTMLDivElement>(null)
  const indicatorBottomOffset = useMemo(() => {
    return {bottom: `calc(${(1 / maxMultiplier) * 100}% + 2px)`}
  }, [maxMultiplier])

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
    [setIsDragging]
  )

  const handleMouseDown = useCallback(
    (
      e:
        | React.MouseEvent<HTMLDivElement, MouseEvent>
        | React.TouchEvent<HTMLDivElement>
    ) => {
      const newVolume = calculateNewVolume({
        el: sliderBarRef.current!,
        event: e,
        maxMultiplier,
      })

      setIsDragging(true)
      onChange(newVolume)
    },
    [maxMultiplier, onChange, setIsDragging]
  )

  const handleMouseMove = useCallback(
    (
      e:
        | React.MouseEvent<HTMLDivElement, MouseEvent>
        | React.TouchEvent<HTMLDivElement>
    ) => {
      if (!isDraggingRef.current) return

      const newVolume = calculateNewVolume({
        el: sliderBarRef.current!,
        event: e,
        maxMultiplier,
      })

      onChange(newVolume)
    },
    [onChange, maxMultiplier]
  )

  const handleMouseUp = useCallback(() => setIsDragging(false), [setIsDragging])

  /**
   * Prevent scrolling / reloading when dragging.
   *
   * This is especially important on mobile devices. Without this, as you drag
   * the slider downwards, it will mimic the motion of trying to reload the
   * page, causing a refresh.
   */
  useEffect(() => {
    const preventScroll = (e: MouseEvent | TouchEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault()
      }
    }

    /**
     * `{passive: false}` explanation:
     *
     * This is explicitly set to allow the `preventDefault()` above. Many
     * browsers treat touch events as "passive" to improve scrolling behavior,
     * which prevents them from calling `preventDefault()`.
     */
    document.addEventListener('touchmove', preventScroll, {passive: false})

    return () => {
      document.removeEventListener('touchmove', preventScroll)
    }
  }, [])

  return (
    // TODO: fix this
    // biome-ignore lint/a11y/useKeyWithClickEvents: TODO
    // biome-ignore lint/nursery/noNoninteractiveElementInteractions: TODO
    <div
      id={id}
      className="-translate-x-1/2 absolute bottom-[calc(100%+.5rem)] left-1/2 grid cursor-default place-items-center gap-2 rounded border border-neutral-700 bg-neutral-900 pb-3"
      onClick={handleContainerClick}
    >
      {/* TOP CONTAINER */}
      <div className="flex flex-col items-center justify-center">
        {/* MULTIPLIER VALUE */}
        <div className="select-none text-neutral-500 text-xs">
          {multiplier.toFixed(2)}
        </div>

        {/* RESET BUTTON */}
        <button type="button" className="p-2" onClick={onReset}>
          <ResetIcon fill={fill} size={16} />
        </button>
      </div>

      {/* BOTTOM POINTER */}
      <div className="-translate-y-[calc(50%-.5px)] absolute top-full h-3 w-3 rotate-45 border-neutral-700 border-r border-b bg-neutral-900" />

      {/* SLIDER BAR */}
      {/* TODO: fix this */}
      {/** biome-ignore lint/nursery/noNoninteractiveElementInteractions: TODO */}
      {/** biome-ignore lint/nursery/noStaticElementInteractions: TODO */}
      <div
        className="group relative cursor-pointer px-4"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleMouseMove}
      >
        {/* 100% INDICATOR LINE */}
        <div
          className="-translate-x-1/2 absolute left-1/2 h-[1px] w-3/4 bg-neutral-700"
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
  return (
    <div
      className={clsx(
        'absolute bottom-0 h-1 w-1 rounded-full bg-puerto-rico-300 transition-transform duration-200 group-hover:scale-[3]',
        {'scale-[3]': isDragging}
      )}
      style={{bottom: value}}
    />
  )
}

function calculateNewVolume({
  el,
  event,
  maxMultiplier,
}: {
  el: HTMLDivElement
  event:
    | React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.TouchEvent<HTMLDivElement>
  maxMultiplier: number
}) {
  const {height, top} = el.getBoundingClientRect()
  const offsetY = (() => {
    if ('touches' in event) {
      return event.touches[0].clientY - top
    }

    return event.clientY - top
  })()

  const position = 1 - offsetY / height
  const newVolume = Math.min(Math.max(position, 0), 1) * maxMultiplier

  return newVolume
}
