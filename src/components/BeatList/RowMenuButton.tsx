import type {ComponentProps} from 'react'

import clsx from 'clsx'
import {useAtom} from 'jotai'
import {useCallback, useRef} from 'react'

import {rowMenuButtonClass} from '../../constants'
import {rowContextMenuDataAtom} from '../../globalState'
import {useCompareTailwindBreakpoint} from '../../hooks/useCompareTailwindBreakpoint'
import {TripleDots} from '../TripleDots'

export function RowMenuButton({
  type,
  isBelowMedium,
  beatId,
}: {
  type: ComponentProps<typeof TripleDots>['type']
  isBelowMedium: boolean
  beatId: string
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isMobile = useCompareTailwindBreakpoint('<', 'md')
  const [rowContextMenuData, setRowContextMenuData] = useAtom(
    rowContextMenuDataAtom
  )
  const isRowMenuOpen = rowContextMenuData?.id === beatId
  const handleClick = useCallback(() => {
    if (isMobile && rowContextMenuData) {
      setRowContextMenuData(undefined)
    } else if (buttonRef.current) {
      const {top, x} = buttonRef.current.getBoundingClientRect()
      setRowContextMenuData({id: beatId, top, x})
    }
  }, [beatId, isMobile, rowContextMenuData, setRowContextMenuData])

  return (
    <button
      ref={buttonRef}
      className={clsx(
        rowMenuButtonClass,
        'relative',
        isBelowMedium && 'px-2',
        !isBelowMedium && !isRowMenuOpen && 'hidden',
        !isBelowMedium &&
          'h-[30px] place-items-center place-self-center group-hover:block'
      )}
      onClick={handleClick}
    >
      <TripleDots type={type} />
    </button>
  )
}
