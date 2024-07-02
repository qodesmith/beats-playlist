import {WaveForm} from './WaveForm'
import {useFetchAudioBuffer} from '../../hooks/useFetchAudioBuffer'

export function Visualizer({fileName}: {fileName: string}) {
  const {audioBuffer} = useFetchAudioBuffer(fileName)

  if (!audioBuffer) {
    return <div>Loading...</div>
  }

  return (
    <WaveForm
      audioBuffer={audioBuffer}
      height={175}
      barWidth={10}
      type="bottomReflection"
      style="solid"
    />
  )
}
