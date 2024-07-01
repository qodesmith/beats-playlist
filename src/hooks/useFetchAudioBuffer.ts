import {useQuery} from '@tanstack/react-query'

export function useFetchAudioBuffer(fileName: string) {
  const {data: audioBuffer, ...rest} = useQuery({
    queryKey: ['beats', fileName],
    queryFn: async () => {
      return fetch(`/beats/${fileName}`)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => new AudioContext().decodeAudioData(arrayBuffer))
    },
  })

  return {audioBuffer, ...rest}
}
