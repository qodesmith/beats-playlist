import {Controls} from './Player/Controls'
import {Waveform} from './Player/Waveform'

export function Footer() {
  return (
    <footer className="h-[130px]">
      <div className="h-[100px]">
        <Waveform />
      </div>
      <Controls baseSize={8} />
    </footer>
  )
}
