// src/components/Toast.tsx

import {useAtomValue, useSetAtom} from 'jotai'
import {AnimatePresence, motion} from 'motion/react'
import {useCallback, useEffect, useRef} from 'react'

import {isAppInitializedAtom, toastMessagesAtom} from '../../globalState'
import {CloseButton} from '../CloseButton'

const initial = {scale: 0.8, opacity: 0} as const
const animate = {scale: 1, opacity: 1} as const

export function ToastContainer() {
  const toastMessages = useAtomValue(toastMessagesAtom)
  const isAppInitialized = useAtomValue(isAppInitializedAtom)

  if (!isAppInitialized) return null

  return (
    <section className="fixed top-4 flex w-full select-none flex-col items-center gap-2">
      <AnimatePresence mode="popLayout">
        {toastMessages.map(({id, message}) => {
          return (
            <motion.div
              key={id}
              layout
              initial={initial}
              animate={animate}
              exit={initial}
            >
              <Toast id={id} message={message} />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </section>
  )
}

function Toast({
  id,
  message,
  duration = 3000,
}: {
  id: number
  message: string
  duration?: number // duration in milliseconds
}) {
  const setToastMessages = useSetAtom(toastMessagesAtom)
  const isRemovedRef = useRef(false)
  const handleClose = useCallback(() => {
    if (!isRemovedRef.current) {
      isRemovedRef.current = true
      setToastMessages(msgs => msgs.filter(m => m.id !== id))
    }
  }, [id, setToastMessages])

  useEffect(() => {
    const timeout = setTimeout(handleClose, duration)
    return () => clearTimeout(timeout)
  }, [duration, handleClose])

  return (
    <div className="flex w-60 items-start rounded border border-black bg-puerto-rico-400/80 p-2 text-black">
      <div className="grow text-center">{message}</div>
      <CloseButton size={20} fill="black" onClick={handleClose} />
    </div>
  )
}
