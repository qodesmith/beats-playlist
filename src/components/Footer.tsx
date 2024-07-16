import {Next, Play, Previous, Repeat} from './Player/ControlIcons'
import {Waveform} from './Player/Waveform'

export function Footer() {
  return (
    <footer className="h-[130px]">
      <div className="h-[100px]">
        <Waveform />
      </div>
      <div className="flex items-center justify-center">
        <Previous />
        <Play />
        <Next />
        <Repeat />
      </div>
    </footer>
  )
}
