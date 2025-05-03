import {useAtomValue} from 'jotai'
import {useEffect, useState} from 'react'

import {isSearchOpenAtom} from '../globalState'
import {scrollElementIntoView} from '../utils'
import {useCompareTailwindBreakpoint} from './useCompareTailwindBreakpoint'

export function useScrollToFooterForMobileSearch(footerId: string) {
  const isSearchOpen = useAtomValue(isSearchOpenAtom)
  const isMobile = useCompareTailwindBreakpoint('<', 'sm')
  const [initialVisualHeight] = useState(
    () => window.visualViewport?.height ?? 0
  )
  const [visualHeight, setVisualHeight] = useState(
    () => window.visualViewport?.height ?? 0
  )

  // Keep track of the visual height, used to know when to scroll to the footer.
  useEffect(() => {
    if (isMobile) {
      const handler = () => {
        setVisualHeight(window.visualViewport?.height ?? 0)
      }

      window.visualViewport?.addEventListener('resize', handler)

      return () => {
        window.visualViewport?.removeEventListener('resize', handler)
      }
    }
  }, [isMobile])

  // Scroll-to-footer logic.
  useEffect(() => {
    if (isMobile) {
      const shouldScrollToFooter =
        isSearchOpen && visualHeight < initialVisualHeight

      if (shouldScrollToFooter) {
        scrollElementIntoView(footerId)
      }
    }
  }, [footerId, initialVisualHeight, isMobile, isSearchOpen, visualHeight])
}
