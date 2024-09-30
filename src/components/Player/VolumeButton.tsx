import {AnimatePresence, motion} from 'framer-motion'
import {useAtom} from 'jotai'
import {useCallback, useEffect, useState, useId, useRef} from 'react'

import {VolumeIcon} from './ControlIcons'
import {VerticalSlider} from './VerticalSlider'
import {MAX_VOLUME_MULTIPLIER} from '../../constants'
import {volumeMultiplierAtom} from '../../globalState'

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

const motion1Initial = {opacity: 0}
const motion1Animate = {opacity: 1}
const motion2Initial = {opacity: 1}
const motion2Animate = {opacity: 0, zIndex: -1}
const motionTransition = {duration: 0.25}

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
      {isOpen ? (
        <motion.div
          key={1}
          className="relative"
          initial={motion1Initial}
          animate={motion1Animate}
          transition={motionTransition}
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
      ) : (
        <motion.div
          key={2}
          className="relative"
          initial={motion2Initial}
          animate={motion2Animate}
          transition={motionTransition}
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
