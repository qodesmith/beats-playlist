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
  const isMobile = useCompareTailwindBreakpoint('<', 'md')
  const motionTop = useMotionValue(0)
  const motionRight = useMotionValue(0)
  const motionDivId = `motion-div-${rowContextMenuClass}`
  const style = useMemo(
    () => ({top: motionTop, right: motionRight}),
    [motionRight, motionTop]
  )

  // Calculate the position of the menu.
  useLayoutEffect(() => {
    if (rowContextMenuData && !isMobile) {
      const {height, top, left} = rowContextMenuData
      const motionDiv = document.getElementById(motionDivId)!
      const menuHeight = motionDiv.getBoundingClientRect().height
      const hasSpaceBelow = menuHeight < window.innerHeight - top
      const newTop = hasSpaceBelow ? top : top + height - menuHeight

      motionTop.set(newTop)
      motionRight.set(window.innerWidth - left + 24)
    }
  }, [isMobile, motionDivId, motionRight, motionTop, rowContextMenuData])

  return (
    <AnimatePresence mode="popLayout">
      {rowContextMenuData && (
        <motion.div
          /**
           * Since Framer Motion handles duplicate components in the DOM during
           * transition, to get simultaneous fade out / fade in transitions, we
           * need to provide a key. If no key is provided, the component will
           * transition in, but swap immediately (i.e. no transition) to the
           * second component rendered on the screen.
           */
          key={rowContextMenuData.beatId}
          id={motionDivId}
          className={clsx(
            'fixed select-none rounded border border-neutral-800 bg-black py-1 text-sm',
            isMobile && 'bottom-0 w-full'
          )}
          style={isMobile ? undefined : style}
          initial={initial}
          animate={animate}
          exit={exit}
        >
          <RowContextMenu beatId={rowContextMenuData.beatId} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RowContextMenu({beatId}: {beatId: string}) {
  const setRowContextMenuData = useSetAtom(rowContextMenuDataAtom)
  const setToastMessages = useSetAtom(toastMessagesAtom)
  const isMobile = useCompareTailwindBreakpoint('<', 'md')
  const menuRef = useRef<HTMLUListElement>(null)
  const menuId = `${rowContextMenuClass}-${beatId}`
  const {channelUrl} = initialMetadata.obj[beatId]

  // Close menu handler.
  const closeMenu = useCallback(() => {
    setRowContextMenuData(undefined)
  }, [setRowContextMenuData])

  // Copy URL handler.
  const handleCopy = useCallback(() => {
    const url = `${window.location.origin}?beatId=${beatId}`

    navigator.clipboard.writeText(url).then(() => {
      const newMessage = {id: Math.random(), message: 'URL copied!'}
      setToastMessages(messages => [...messages, newMessage])
    })
  }, [beatId, setToastMessages])

  // Close menu when clicking outside of it.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current) {
        const target = e.target as Element
        const isMenuClick = menuRef.current.contains(target)
        const isMenuButtonClick = !!target.closest(`.${rowMenuButtonClass}`)

        if (!isMenuClick && !isMenuButtonClick) {
          closeMenu()
        }
      }
    }

    window.addEventListener('click', handler)

    return () => {
      window.removeEventListener('click', handler)
    }
  }, [beatId, closeMenu])

  return (
    <ul ref={menuRef} id={menuId}>
      {isMobile && (
        <li className="text-right">
          <CloseButton onClick={closeMenu} />
        </li>
      )}
      <ListItem icon={<CopyIcon size={16} />} onClick={handleCopy}>
        Copy link
      </ListItem>
      <ListItem
        icon={<YouTubeLogo size={14} />}
        href={`https://youtube.com/watch?v=${beatId}`}
      >
        YouTube video
      </ListItem>
      <ListItem
        icon={<YouTubeLogo size={14} />}
        href={channelUrl}
        disabled={!channelUrl}
      >
        YouTube channel
      </ListItem>

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
  href,
}: {
  children: ReactNode
  disabled?: boolean
  icon?: ReactNode
  onClick?: () => void
  href?: string | null | undefined
}) {
  const setRowContextMenuData = useSetAtom(rowContextMenuDataAtom)
  const isMobile = useCompareTailwindBreakpoint('<', 'md')
  const closeMenuOnClick = useCallback(() => {
    if (!disabled) {
      setRowContextMenuData(undefined)
      onClick?.()
    }
  }, [disabled, onClick, setRowContextMenuData])

  const content = (
    <>
      {icon && (
        // Padding increases the click surface area. This is clickable because
        // it's rendered inside an element with a click event handler.
        <div className="absolute left-1 top-1/2 -translate-y-1/2 p-2">
          {icon}
        </div>
      )}
      {children}
    </>
  )

  return (
    <li
      className={clsx(
        'relative mx-1 rounded pl-10 pr-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        !isMobile && 'hover:bg-neutral-800'
      )}
    >
      <div
        onClick={!href ? closeMenuOnClick : undefined}
        className={clsx(
          isMobile ? 'inline-block' : 'block',
          disabled && 'opacity-30',
          !href && 'py-2'
        )}
      >
        {href ? (
          <a
            className={clsx('py-2', isMobile ? 'inline-block' : 'block')}
            href={href}
            target="_blank"
            onClick={closeMenuOnClick}
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </li>
  )
}
