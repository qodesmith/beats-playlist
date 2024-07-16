import {useCallback, useRef, useState} from 'react'

const CURSOR_WIDTH = 1

export function Cursor({
  cursorHeight,
  cursorColor,
}: {
  cursorHeight: number
  cursorColor: string
}) {
  const [shouldShow, setShouldShow] = useState<boolean>(false)
  const [left, setLeft] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const domRect = containerRef.current?.getBoundingClientRect()
      const offsetLeft = domRect?.left ?? 0
      const maxValue = (domRect?.width ?? Infinity) - CURSOR_WIDTH
      const calculatedValue = e.clientX - offsetLeft
      const newValue = calculatedValue < 0 ? 0 : calculatedValue

      setLeft(Math.min(newValue, maxValue))
    },
    []
  )
  const handleMouseEnter = useCallback(() => {
    setShouldShow(true)
  }, [])
  const handleMouseLeave = useCallback(() => {
    setShouldShow(false)
  }, [])

  return (
    <div
      className="absolute top-0 size-full opacity-75"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {shouldShow && (
        <div
          className={`absolute h-full w-px ${cursorColor}`}
          style={{left, height: cursorHeight ?? '100%'}}
        />
      )}
    </div>
  )
}
