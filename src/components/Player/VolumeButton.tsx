import {useAtom} from 'jotai'
import {AnimatePresence, motion} from 'motion/react'
import {useCallback, useEffect, useState, useId, useRef} from 'react'

import {VolumeIcon} from './ControlIcons'
import {VerticalSlider} from './VerticalSlider'
import {volumeMultiplierAtom} from '../../AudioThing'
import {MAX_VOLUME_MULTIPLIER} from '../../constants'

export function VolumeButton({
  baseSize,
  fill,
}: {
  baseSize: number
  fill: string
}) {
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)
  const toggleVolume = useCallback(() => setIsVolumeOpen(v => !v), [])
  const sliderId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [volumeMultiplier, setVolumeMultiplier] = useAtom(volumeMultiplierAtom)
  const handleResetVolume = useCallback(
    () => setVolumeMultiplier(1),
    [setVolumeMultiplier]
  )

  // Close volume when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const sliderContainer = document.getElementById(sliderId)

      if (
        target &&
        !sliderContainer?.contains(target) &&
        target !== buttonRef.current &&
        !buttonRef.current?.contains(target)
      ) {
        setIsVolumeOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [sliderId])

  return (
    <div className="relative size-full">
      <AnimateVericalSlider
        isOpen={isVolumeOpen}
        sliderId={sliderId}
        multiplier={volumeMultiplier}
        maxMultiplier={MAX_VOLUME_MULTIPLIER}
        onChange={setVolumeMultiplier}
        onReset={handleResetVolume}
        fill={fill}
      />
      <button
        onClick={toggleVolume}
        ref={buttonRef}
        className="grid size-full place-items-center"
      >
        <VolumeIcon size={baseSize * 2.1} fill={fill} />
      </button>
    </div>
  )
}

const opacity0 = {opacity: 0} as const
const opacity1 = {opacity: 1} as const
const duration = {duration: 0.25} as const

function AnimateVericalSlider({
  isOpen,
  sliderId,
  multiplier,
  maxMultiplier,
  onChange,
  onReset,
  fill,
}: {
  isOpen: boolean
  sliderId: string
  multiplier: number
  maxMultiplier: number
  onChange: (multiplier: number) => void
  onReset: () => void
  fill: string
}) {
  return (
    <AnimatePresence mode="popLayout">
      {isOpen && (
        <motion.div
          initial={opacity0}
          animate={opacity1}
          exit={opacity0}
          transition={duration}
        >
          <VerticalSlider
            id={sliderId}
            multiplier={multiplier}
            maxMultiplier={maxMultiplier}
            onChange={onChange}
            onReset={onReset}
            fill={fill}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
