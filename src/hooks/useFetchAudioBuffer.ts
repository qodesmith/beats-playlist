import {useQuery} from '@tanstack/react-query'

export function useFetchAudioBuffer(fileName: string) {
  const {data: audioBuffer, ...rest} = useQuery({
    queryKey: ['beats', fileName],
    queryFn: async () => {
      return fetch(`/beats/${fileName}`)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => new AudioContext().decodeAudioData(arrayBuffer))
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 1 day
  })

  return {audioBuffer, ...rest}
}
