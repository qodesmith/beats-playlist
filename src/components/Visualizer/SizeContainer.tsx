import type {ReactNode} from 'react'

import {useSetAtom} from 'jotai'
import {useEffect, useRef} from 'react'

import {sizeContainerAtomFamily} from '../../globalState'

/**
 * This component simply renders its children in a div and calculates the width
 * and height of the div. It sets those dimensions in state for anything else
 * to consume.
 */
export function SizeContainer({
  children,
  sizeContainerId,
  className,
}: {
  /**
   * Optional children to render inside the container
   */
  children?: ReactNode

  /**
   * `sizeContainerId` serves 2 purposes:
   *
   * - The `id` for the DOM node that `SizeContainer` uses
   * - The `id` for the Jotai atom family to retrieve the container dimensions
   */
  sizeContainerId: string

  /**
   * Optional `className` to add to the container
   */
  className?: string
}) {
  const sizeContainerRef = useRef<HTMLDivElement>(null)
  const setContainerDimensions = useSetAtom(
    sizeContainerAtomFamily(sizeContainerId)
  )

  // Initial size effect.
  useEffect(() => {
    const el = sizeContainerRef.current

    if (el) {
      const {width, height} = el.getBoundingClientRect()
      setContainerDimensions({width, height})
    }
  }, [setContainerDimensions])

  // Resize effect.
  useEffect(() => {
    function handleResize() {
      const el = sizeContainerRef.current

      if (el) {
        const {width, height} = el.getBoundingClientRect()
        setContainerDimensions({width, height})
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setContainerDimensions])

  return (
    <div id={sizeContainerId} ref={sizeContainerRef} className={className}>
      {children}
    </div>
  )
}
