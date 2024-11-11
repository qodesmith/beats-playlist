/**
 * Things to show in this menu:
 * - Link to YouTube video
 * - Link to YouTube Channel
 * - Share / copy URL
 *
 * Eventually:
 * - Open textarea for lyrics
 * - Add to playlist (i.e. tagging)
 * - Remove from playlist
 */

import clsx from 'clsx'
import {useAtom} from 'jotai'
import {useEffect, useRef} from 'react'

import {rowMenuButtonClass} from '../../constants'
import {rowContextMenuIdAtom} from '../../globalState'

export function RowContextMenu() {
  const [rowContextMenuId, setRowContextMenuId] = useAtom(rowContextMenuIdAtom)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element
      const isMenuClick = ref.current?.contains(target)
      const isRowMenuButtonClick = target.closest(`.${rowMenuButtonClass}`)

      if (!isMenuClick && !isRowMenuButtonClick) {
        setRowContextMenuId(undefined)
      }
    }

    window.addEventListener('click', handler)

    return () => window.removeEventListener('click', handler)
  }, [setRowContextMenuId])

  return rowContextMenuId ? (
    <div
      ref={ref}
      className={clsx(
        'fixed top-0 rounded border bg-neutral-800 p-2',
        !rowContextMenuId && 'hidden'
      )}
    >
      ID: {rowContextMenuId}
      <ul>
        <li>Menu item 1</li>
        <li>Menu item 2</li>
        <li>Menu item 3</li>
        <li>Menu item 4</li>
        <li>Menu item 5</li>
      </ul>
    </div>
  ) : null
}
