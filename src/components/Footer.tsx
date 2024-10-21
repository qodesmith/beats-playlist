import {AudioTimeSlider} from './Player/AudioTimeSlider'
import {Controls} from './Player/Controls'
import {Waveform} from './Player/Waveform'
import {useCompareTailwindBreakpoint} from '../hooks/useCompareTailwindBreakpoint'

export function Footer() {
  const baseSize = useCompareTailwindBreakpoint('>=', 'md') ? 8 : 12

  return (
    <footer>
      <div className="h-[60px] px-2 md:h-[100px]">
        <Waveform />
      </div>

      <AudioTimeSlider />

      <Controls baseSize={baseSize} />
    </footer>
  )
}
