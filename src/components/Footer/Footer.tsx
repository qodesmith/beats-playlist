import clsx from 'clsx'
import {useAtomValue} from 'jotai'
import {useId, useRef} from 'react'

import {FooterSearch} from './FooterSearch'
import {isSearchOpenAtom} from '../../globalState'
import {useCompareTailwindBreakpoint} from '../../hooks/useCompareTailwindBreakpoint'
import {AudioTimeSlider} from '../Player/AudioTimeSlider'
import {Controls} from '../Player/Controls'
import {Waveform} from '../Player/Waveform'

export function Footer() {
  const isSearchOpen = useAtomValue(isSearchOpenAtom)
  const isScreenMediumOrAbove = useCompareTailwindBreakpoint('>=', 'md')
  const baseSize = isScreenMediumOrAbove ? 8 : 12
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const footerId = useId()

  return (
    <footer id={footerId}>
      {/* WAVEFORM & SEARCH (overlayed) */}
      <div
        ref={searchContainerRef}
        className="relative h-[60px] overflow-hidden px-2 md:h-[100px]"
      >
        <Waveform />
        <div
          className={clsx(
            'absolute left-0 top-0 grid size-full place-items-center overflow-hidden bg-black/90 p-2 md:transition-transform md:duration-500',
            isSearchOpen ? 'translate-y-0' : '-translate-y-full'
          )}
        >
          <FooterSearch footerId={footerId} />
        </div>
      </div>

      {/* TIME SLIDER */}
      <AudioTimeSlider />

      {/* CONTROLS */}
      <Controls baseSize={baseSize} />
    </footer>
  )
}
