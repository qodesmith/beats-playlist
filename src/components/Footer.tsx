import {Next, Previous, Repeat} from './Player/ControlIcons'
import {PlayPause} from './Player/PlayPause'
import {Waveform} from './Player/Waveform'

export function Footer() {
  return (
    <footer className="h-[130px]">
      <div className="h-[100px]">
        <Waveform />
      </div>
      <div className="flex items-center justify-center gap-4">
        <Previous size={24} />
        <PlayPause size={32} />
        <Next size={24} />
        {/* <Repeat size={16} /> */}
      </div>
    </footer>
  )
}
