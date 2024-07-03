import {WaveForm} from './WaveForm'
import {useFetchAudioBuffer} from '../../hooks/useFetchAudioBuffer'

export function Visualizer({fileName}: {fileName: string}) {
  const {audioBuffer} = useFetchAudioBuffer(fileName)

  if (!audioBuffer) {
    return <div>Loading...</div>
  }

  return (
    <WaveForm
      // In dev, this will force the canvas to redraw when HMR happens
      key={import.meta.env.DEV ? Math.random() : undefined}
      audioBuffer={audioBuffer}
      height={175}
      barWidth={1}
      style="reflection"
      tailwindColor="puerto-rico-400"
    />
  )
}
