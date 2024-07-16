import {Next, Play, Previous, Repeat} from './Player/ControlIcons'
import {Waveform} from './Player/Waveform'

export function Footer() {
  return (
    <footer className="grid h-[100px] flex-shrink-0 grid-cols-[200px_1fr]">
      <div className="flex h-full items-center justify-center">
        <Previous />
        <Play />
        <Next />
        <Repeat />
      </div>
      <Waveform />
    </footer>
  )
}
