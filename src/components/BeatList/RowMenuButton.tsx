import type {ComponentProps} from 'react'

import clsx from 'clsx'
import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback} from 'react'

import {rowMenuButtonClass} from '../../constants'
import {rowContextMenuIdAtom} from '../../globalState'
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
  const rowContextMenuId = useAtomValue(rowContextMenuIdAtom)
  const isRowMenuOpen = rowContextMenuId === beatId
  const setRowContextMenuId = useSetAtom(rowContextMenuIdAtom)
  const handleClick = useCallback(() => {
    setRowContextMenuId(beatId)
  }, [beatId, setRowContextMenuId])

  return (
    <button
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
