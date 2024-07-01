import {useEffect, useState} from 'react'
import {audioBufferToNumbers} from './audioBufferToNumbers'
import {WaveForm} from './WaveForm'

export function Visualizer({audioFileUrl}: {audioFileUrl: string}) {
  const [audioNumbers, setAudioNumbers] = useState<number[]>()

  useEffect(() => {
    fetch(audioFileUrl)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => new AudioContext().decodeAudioData(arrayBuffer))
      .then(audioBuffer =>
        setAudioNumbers(audioBufferToNumbers(audioBuffer, 300))
      )
  }, [audioFileUrl])

  if (!audioNumbers) {
    return <div>Loading...</div>
  }

  return (
    <WaveForm
      waveformData={audioNumbers}
      width={1500}
      height={75}
      barWidth={3}
      type="bottomReflection"
    />
  )
}
