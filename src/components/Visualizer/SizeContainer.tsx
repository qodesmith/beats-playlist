import {ReactNode, useEffect, useRef} from 'react'
import {useSetAtom} from 'jotai'
import {widthAtomFamily} from './state'

/**
 * This component
 */
export function SizeContainer({
  id,
  canvasId,
  children,
}: {
  id: string
  canvasId: string
  children: ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const setWidth = useSetAtom(widthAtomFamily(canvasId))

  // Intial width effect - do NOT use useLayoutEffect!!!
  useEffect(() => {
    const container = containerRef.current

    if (container) {
      const {width} = container.getBoundingClientRect()
      setWidth(width)
    }
  }, [setWidth])

  // Resize effect
  useEffect(() => {
    const handleResize = () => {
      const {width} = containerRef.current?.getBoundingClientRect() ?? {}
      setWidth(width)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setWidth])

  return (
    <div id={id} className="relative" ref={containerRef}>
      {children}
    </div>
  )
}
