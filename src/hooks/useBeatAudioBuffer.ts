import {useQuery} from '@tanstack/react-query'

import {setAudioBufferFetched} from '../components/Beats/state'

export function useBeatAudioBuffer(id: string | undefined) {
  return useQuery({
    queryKey: ['useBeatAudioBuffer', id],
    queryFn: async () => {
      return fetch(`/beats/${id}`)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => new AudioContext().decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          setAudioBufferFetched()
          const rms = calculateRMS(audioBuffer)
          return {audioBuffer, rms}
        })
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 1 day
    enabled: id !== undefined,
  })
}

function calculateRMS(audioBuffer: AudioBuffer) {
  const data = audioBuffer.getChannelData(0)
  let sum = 0

  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i]
  }

  return Math.sqrt(sum / data.length)
}
