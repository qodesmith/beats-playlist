import {useCallback, useRef, useState} from 'react'
import {WaveformStyle} from './WaveForm'

const CURSOR_WIDTH = 2

export function VerticalPosition({style}: {style: WaveformStyle | undefined}) {
  const [left, setLeft] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorHeight = style === 'reflection' ? 'h-4/5' : 'h-full'
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const offsetLeft = containerRef.current?.getBoundingClientRect().left ?? 0
      const maxValue =
        (containerRef.current?.getBoundingClientRect().width ?? Infinity) -
        CURSOR_WIDTH
      const calculatedValue = e.clientX - offsetLeft
      const newValue = calculatedValue < 0 ? 0 : calculatedValue

      setLeft(Math.min(newValue, maxValue))
    },
    []
  )

  return (
    <div
      className="absolute size-full opacity-75"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <div
        className={`absolute ${cursorHeight} w-0.5 bg-red-600`}
        style={{left}}
      />
    </div>
  )
}
