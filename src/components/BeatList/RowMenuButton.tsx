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
  const isRowMenuOpen = rowContextMenuData?.beatId === beatId
  const handleClick = useCallback(() => {
    if (isMobile && rowContextMenuData) {
      setRowContextMenuData(undefined)
    } else if (buttonRef.current) {
      const {height, top, bottom, left} =
        buttonRef.current.getBoundingClientRect()
      setRowContextMenuData({beatId, height, top, bottom, left})
    }
  }, [beatId, isMobile, rowContextMenuData])

  return (
    <button
      type="button"
      id={`${rowMenuButtonClass}-${beatId}`}
      ref={buttonRef}
      className={clsx(
        rowMenuButtonClass,
        'relative',
        isBelowMedium && 'px-2',
        !(isBelowMedium || isRowMenuOpen) && 'hidden',
        !isBelowMedium &&
          'h-[30px] place-items-center place-self-center group-hover:block'
      )}
      onClick={handleClick}
    >
      <TripleDots type={type} />
    </button>
  )
}
