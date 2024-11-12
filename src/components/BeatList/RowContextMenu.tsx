import type {ReactNode} from 'react'

import clsx from 'clsx'
import {AnimatePresence, motion, useMotionValue} from 'framer-motion'
import {useAtom, useSetAtom} from 'jotai'
import {useCallback, useEffect, useLayoutEffect} from 'react'

import {rowContextMenuClass, rowMenuButtonClass} from '../../constants'
import {
  initialMetadata,
  rowContextMenuDataAtom,
  toastMessagesAtom,
} from '../../globalState'
import {useCompareTailwindBreakpoint} from '../../hooks/useCompareTailwindBreakpoint'
import {CloseButton} from '../CloseButton'
import {CopyIcon} from '../icons/CopyIcon'
import {NotepadIcon} from '../icons/NotepadIcon'
import {ShareIcon} from '../icons/ShareIcon'
import {YouTubeLogo} from '../YouTubeLogo'

const initial = {opacity: 0, scale: 0.8, zIndex: -1} as const
const animate = {opacity: 1, scale: 1, zIndex: 1} as const
const exit = {opacity: 0, scale: 0.8, transitionEnd: {zIndex: -1}} as const

export function RowContextMenu() {
  const isMobile = useCompareTailwindBreakpoint('<', 'md')
  const [rowContextMenuData, setRowContextMenuData] = useAtom(
    rowContextMenuDataAtom
  )
  const closeMenu = useCallback(() => {
    setRowContextMenuData(undefined)
  }, [setRowContextMenuData])
  const beat = rowContextMenuData?.id
    ? initialMetadata.obj[rowContextMenuData.id]
    : null
  const menuId = beat ? `context-menu-${beat.id}` : undefined
  const setToastMessages = useSetAtom(toastMessagesAtom)
  const style = {top: useMotionValue(0), right: useMotionValue(0)} as const
  const handleCopy = useCallback(() => {
    const {origin} = new URL(window.location.href)
    navigator.clipboard.writeText(`${origin}?beatId=${beat?.id}`).then(() => {
      setToastMessages(msgs => [
        ...msgs,
        {id: Math.random(), message: 'URL copied!'},
      ])
    })
  }, [beat?.id, setToastMessages])

  /**
   * Logic to hide the menu.
   * NOTE: Clicking menu items is already handled in the items themselves.
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element
      const menu = menuId ? document.getElementById(menuId) : null
      const shouldCloseMenu =
        !menu?.contains(target) && !target.closest(`.${rowMenuButtonClass}`)

      if (shouldCloseMenu) {
        closeMenu()
      }
    }

    window.addEventListener('click', handler)

    return () => window.removeEventListener('click', handler)
  }, [closeMenu, menuId])

  // Logic to position the menu (non-mobile).
  useLayoutEffect(() => {
    if (!rowContextMenuData || isMobile) return

    const {top, x} = rowContextMenuData
    const menu = document.querySelector(`.${rowContextMenuClass}`)
    const halfMenuHeight = (menu?.getBoundingClientRect().height ?? 0) / 2

    style.top.set(halfMenuHeight > top ? top : top - halfMenuHeight)
    style.right.set(window.innerWidth - x + 20)
  }, [isMobile, rowContextMenuData, style.right, style.top])

  return (
    <AnimatePresence mode="popLayout">
      {rowContextMenuData && (
        <motion.div
          key={rowContextMenuData.id}
          id={menuId}
          style={isMobile ? undefined : style}
          initial={initial}
          animate={animate}
          exit={exit}
          className={clsx(
            rowContextMenuClass,
            'fixed bottom-0 w-full select-none rounded border border-neutral-800 bg-black py-1 md:bottom-auto md:w-auto md:text-sm'
          )}
        >
          {isMobile && (
            <div className="flex justify-end pb-2 pt-1">
              <CloseButton onClick={closeMenu} />
            </div>
          )}
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
  const isMobile = useCompareTailwindBreakpoint('<', 'md')
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
        'relative mx-1 rounded pl-10 pr-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        isMobile ? 'py-2' : 'py-1 hover:bg-neutral-800'
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
