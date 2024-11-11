import type {ReactNode} from 'react'

import clsx from 'clsx'
import {useAtom, useSetAtom} from 'jotai'
import {useCallback, useEffect, useRef} from 'react'

import {rowMenuButtonClass} from '../../constants'
import {
  initialMetadata,
  rowContextMenuIdAtom,
  toastMessagesAtom,
} from '../../globalState'
import {CopyIcon} from '../icons/CopyIcon'
import {NotepadIcon} from '../icons/NotepadIcon'
import {ShareIcon} from '../icons/ShareIcon'
import {YouTubeLogo} from '../YouTubeLogo'

export function RowContextMenu() {
  const [rowContextMenuId, setRowContextMenuId] = useAtom(rowContextMenuIdAtom)
  const ref = useRef<HTMLDivElement>(null)
  const beat = rowContextMenuId ? initialMetadata.obj[rowContextMenuId] : null
  const setToastMessages = useSetAtom(toastMessagesAtom)
  const handleCopy = useCallback(() => {
    const {origin} = new URL(window.location.href)
    navigator.clipboard.writeText(`${origin}?beatId=${beat?.id}`).then(() => {
      setRowContextMenuId(undefined)
      setToastMessages(msgs => [
        ...msgs,
        {id: Date.now(), message: 'URL copied!'},
      ])
    })
  }, [beat?.id, setRowContextMenuId, setToastMessages])

  // Logic to hide the menu.
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

  // Logic to position the menu.
  useEffect(() => {
    if (!rowContextMenuId) return

    const menuButtonSelector = `#${rowContextMenuId} .${rowMenuButtonClass}`
    const menuButton = document.querySelector(menuButtonSelector) as Element
    // const rect = menuButton.getBoundingClientRect()
  }, [rowContextMenuId])

  return (
    <div
      ref={ref}
      className={clsx(
        'fixed top-0 select-none rounded border border-neutral-800 bg-black py-1 text-sm',
        rowContextMenuId ? 'opacity-1' : '-z-50 opacity-0'
      )}
    >
      <ul>
        <ListItem icon={<CopyIcon size={14} />} onClick={handleCopy}>
          Copy link
        </ListItem>
        <a href={`https://youtube.com/watch?v=${beat?.id}`} target="_blank">
          <ListItem icon={<YouTubeLogo size={12} />}>YouTube video</ListItem>
        </a>
        <a href={beat?.channelUrl ?? undefined} target="_blank">
          <ListItem
            icon={<YouTubeLogo size={12} />}
            disabled={!beat?.channelUrl}
          >
            YouTube channel
          </ListItem>
        </a>

        <SectionTitle>Coming soon</SectionTitle>

        <ListItem disabled icon={<ShareIcon size={14} />}>
          Share link
        </ListItem>
        <ListItem disabled icon="">
          Add to playlist
        </ListItem>
        <ListItem disabled>Remove from playlist</ListItem>
        <ListItem disabled icon={<NotepadIcon size={14} />}>
          Open pad for lyrics
        </ListItem>
      </ul>
    </div>
  )
}

function ListItem({
  children,
  disabled,
  icon,
  onClick,
}: {
  children: ReactNode
  disabled?: boolean
  icon?: ReactNode
  onClick?: () => void
}) {
  return (
    <li
      className={clsx(
        'relative mx-1 rounded py-1 pl-10 pr-2 hover:bg-neutral-800',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className={clsx(disabled && 'opacity-30')}>
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
        )}
        {children}
      </div>
    </li>
  )
}

function SectionTitle({children}: {children: ReactNode}) {
  return (
    <>
      <div className="mt-1 border-t border-neutral-800" />
      <div className="py-3 font-bold">{children}</div>
      <div className="mb-1 border-t border-neutral-800" />
    </>
  )
}
