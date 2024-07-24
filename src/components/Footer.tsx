import {Controls} from './Player/Controls'
import {Waveform} from './Player/Waveform'

/**
 * Instead of using JavaScript to detect breakpoints, we wrap the controls in
 * a container div which then hides conditionally based on the breakpoint.
 */
export function Footer() {
  return (
    <footer>
      <div className="h-[100px]">
        <Waveform />
      </div>

      {/* CONTROLS - only one will show at a time */}
      <div className="hidden md:block">
        <Controls baseSize={8} />
      </div>
      <div className="md:hidden">
        <Controls baseSize={12} />
      </div>
    </footer>
  )
}
