import type {ReactNode} from 'react'

import clsx from 'clsx'
import {AnimatePresence, motion, useMotionValue} from 'framer-motion'
import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef} from 'react'

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

export function RowContextMenuContainer() {
  const rowContextMenuData = useAtomValue(rowContextMenuDataAtom)
  const motionTop = useMotionValue(0)
  const motionRight = useMotionValue(0)
  const motionDivId = `motion-div-${rowContextMenuClass}`
  const style = useMemo(
    () => ({top: motionTop, right: motionRight}),
    [motionRight, motionTop]
  )

  // Calculate the position of the menu.
  useLayoutEffect(() => {
    if (rowContextMenuData) {
      const {height, top, left} = rowContextMenuData
      const motionDiv = document.getElementById(motionDivId)!
      const menuHeight = motionDiv.getBoundingClientRect().height
      const hasSpaceBelow = menuHeight < window.innerHeight - top
      const newTop = hasSpaceBelow ? top : top + height - menuHeight

      motionTop.set(newTop)
      motionRight.set(window.innerWidth - left + 24)
    }
  }, [motionDivId, motionRight, motionTop, rowContextMenuData])

  return (
    <AnimatePresence mode="popLayout">
      {rowContextMenuData && (
        <motion.div
          id={motionDivId}
          className="fixed select-none rounded border border-neutral-800 bg-black py-1 text-sm"
          style={style}
        >
          <RowContextMenu beatId={rowContextMenuData.beatId} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RowContextMenu({beatId}: {beatId: string}) {
  const setRowContextMenuData = useSetAtom(rowContextMenuDataAtom)
  const menuRef = useRef<HTMLUListElement>(null)
  const menuId = `${rowContextMenuClass}-${beatId}`

  // Close menu when clicking outside of it.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current) {
        const target = e.target as Node
        const isMenuClick = menuRef.current.contains(target)
        const thisMenuButtonSelector = `${rowMenuButtonClass}-${beatId}`
        const thisMenuButton = document.getElementById(thisMenuButtonSelector)
        const isThisMenuButtonClick = !!thisMenuButton?.contains(target)

        if (!isMenuClick && !isThisMenuButtonClick) {
          setRowContextMenuData(undefined)
        }
      }
    }

    window.addEventListener('click', handler)

    return () => {
      window.removeEventListener('click', handler)
    }
  }, [beatId, setRowContextMenuData])

  return (
    <ul ref={menuRef} id={menuId}>
      <ListItem icon={<CopyIcon size={16} />}>Copy link</ListItem>
      <ListItem icon={<YouTubeLogo size={14} />}>YouTube video</ListItem>
      <ListItem icon={<YouTubeLogo size={14} />}>YouTube channel</ListItem>

      <li className="py-2">
        <hr className="border-neutral-800" />
        <div className="py-4 pl-11 font-bold">Coming soon</div>
        <hr className="border-neutral-800" />
      </li>

      <ListItem disabled icon={<ShareIcon size={14} />}>
        Share link
      </ListItem>
      <ListItem disabled>Add to playlist</ListItem>
      <ListItem disabled>Remove from playlist</ListItem>
      <ListItem disabled icon={<NotepadIcon size={14} />}>
        Open pad for lyrics
      </ListItem>
    </ul>
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
        'relative mx-1 rounded py-2 pl-10 pr-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        !isMobile && 'hover:bg-neutral-800'
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
