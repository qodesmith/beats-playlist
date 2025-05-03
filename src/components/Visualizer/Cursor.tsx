import clsx from 'clsx'
import {useCallback, useRef, useState} from 'react'

const cursorWidthClasses = {
  1: 'w-px',
  2: 'w-[2px]',
  3: 'w-[3px]',
  4: 'w-[4px]',
  5: 'w-[5px]',
}

export function Cursor({
  cursorHeight,
  cursorColor,
  cursorWidth = 1,
}: {
  cursorHeight: number
  cursorColor: string
  cursorWidth?: 1 | 2 | 3 | 4 | 5
}) {
  const [shouldShow, setShouldShow] = useState<boolean>(false)
  const [left, setLeft] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const domRect = containerRef.current?.getBoundingClientRect()
      const offsetLeft = domRect?.left ?? 0
      const maxValue = (domRect?.width ?? Infinity) - cursorWidth
      const calculatedValue = e.clientX - offsetLeft
      const newValue = calculatedValue < 0 ? 0 : calculatedValue

      setLeft(Math.min(newValue, maxValue))
    },
    [cursorWidth]
  )
  const handleMouseEnter = useCallback(() => {
    setShouldShow(true)
  }, [])
  const handleMouseLeave = useCallback(() => {
    setShouldShow(false)
  }, [])

  return (
    // TODO: fix this
    // biome-ignore lint/nursery/noNoninteractiveElementInteractions: TODO
    // biome-ignore lint/nursery/noStaticElementInteractions: TODO
    <div
      id="cursor-container"
      className="absolute top-0 size-full opacity-75"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {shouldShow && (
        <div
          id="cursor"
          className={clsx(
            'absolute h-full',
            cursorWidthClasses[cursorWidth],
            cursorColor
          )}
          style={{left, height: cursorHeight ?? '100%'}}
        />
      )}
    </div>
  )
}
