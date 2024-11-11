import type {ReactNode} from 'react'

import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import {useAtom, useSetAtom} from 'jotai'
import {useCallback, useEffect} from 'react'

import {rowContextMenuClass, rowMenuButtonClass} from '../../constants'
import {
  initialMetadata,
  rowContextMenuDataAtom,
  toastMessagesAtom,
} from '../../globalState'
import {CopyIcon} from '../icons/CopyIcon'
import {NotepadIcon} from '../icons/NotepadIcon'
import {ShareIcon} from '../icons/ShareIcon'
import {YouTubeLogo} from '../YouTubeLogo'

const initial = {opacity: 0, scale: 0.8, zIndex: -1} as const
const animate = {opacity: 1, scale: 1, zIndex: 1} as const
const exit = {opacity: 0, scale: 0.8, transitionEnd: {zIndex: -1}} as const

export function RowContextMenu() {
  const [rowContextMenuData, setRowContextMenuData] = useAtom(
    rowContextMenuDataAtom
  )
  const beat = rowContextMenuData?.id
    ? initialMetadata.obj[rowContextMenuData.id]
    : null
  const setToastMessages = useSetAtom(toastMessagesAtom)
  const style = (() => {
    if (!rowContextMenuData) return

    const {x, top} = rowContextMenuData
    const menu = document.querySelector(`.${rowContextMenuClass}`)
    const halfMenuHeight = (menu?.getBoundingClientRect().height ?? 0) / 2

    return {
      right: window.innerWidth - x + 20,
      top: halfMenuHeight > top ? top : top - halfMenuHeight,
    }
  })()
  const handleCopy = useCallback(() => {
    const {origin} = new URL(window.location.href)
    navigator.clipboard.writeText(`${origin}?beatId=${beat?.id}`).then(() => {
      setToastMessages(msgs => [
        ...msgs,
        {id: Math.random(), message: 'URL copied!'},
      ])
    })
  }, [beat?.id, setToastMessages])

  // Logic to hide the menu.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element
      const contextMenu = document.querySelector(`.${rowContextMenuClass}`)
      const isMenuClick = !!contextMenu?.contains(target)
      const isRowMenuButtonClick = !!target.closest(`.${rowMenuButtonClass}`)

      if (!isMenuClick && !isRowMenuButtonClick) {
        setRowContextMenuData(undefined)
      }
    }

    window.addEventListener('click', handler)

    return () => window.removeEventListener('click', handler)
  }, [setRowContextMenuData])

  return (
    <AnimatePresence mode="popLayout">
      {rowContextMenuData && (
        <motion.div
          key={rowContextMenuData.id}
          style={style}
          initial={initial}
          animate={animate}
          exit={exit}
          className={clsx(
            rowContextMenuClass,
            'fixed select-none rounded border border-neutral-800 bg-black py-1 text-sm'
          )}
        >
          <ul>
            <ListItem icon={<CopyIcon size={14} />} onClick={handleCopy}>
              Copy link
            </ListItem>
            <a href={`https://youtube.com/watch?v=${beat?.id}`} target="_blank">
              <ListItem icon={<YouTubeLogo size={12} />}>
                YouTube video
              </ListItem>
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
        </motion.div>
      )}
    </AnimatePresence>
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
  const setRowContextMenuData = useSetAtom(rowContextMenuDataAtom)
  const closeMenuOnClick = useCallback(() => {
    if (!disabled) {
      setRowContextMenuData(undefined)
      onClick?.()
    }
  }, [disabled, onClick, setRowContextMenuData])

  return (
    <li
      onClick={closeMenuOnClick}
      className={clsx(
        'relative mx-1 rounded py-1 pl-10 pr-2 hover:bg-neutral-800',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
    >
      <div className={disabled ? 'opacity-30' : undefined}>
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
      <div className="py-3 pl-4 font-bold">{children}</div>
      <div className="mb-1 border-t border-neutral-800" />
    </>
  )
}
