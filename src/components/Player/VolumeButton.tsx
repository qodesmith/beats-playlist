import {useAtom} from 'jotai'
import {useCallback, useEffect, useState, useId, useRef} from 'react'

import {VolumeIcon} from './ControlIcons'
import {VerticalSlider} from './VerticalSlider'
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
      {isVolumeOpen && (
        <VerticalSlider
          id={sliderId}
          multiplier={volumeMultiplier}
          onChange={setVolumeMultiplier}
          onReset={handleResetVolume}
          fill={fill}
        />
      )}
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
