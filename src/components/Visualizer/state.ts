import {atom} from 'jotai'
import {atomFamily, loadable} from 'jotai/utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const widthAtomFamily = atomFamily((_id: string) =>
  atom<number | undefined>(undefined)
)

export const audioBufferAtomFamily = atomFamily((id: string | undefined) => {
  const audioBufferAtom = atom(async () => {
    if (id === undefined) return undefined

    return fetch(`/beats/${id}`)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => new AudioContext().decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const rms = calculateRMS(audioBuffer)
        return {audioBuffer, rms}
      })
  })

  return loadable(audioBufferAtom)
})

function calculateRMS(audioBuffer: AudioBuffer) {
  const data = audioBuffer.getChannelData(0)
  let sum = 0

  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i]
  }

  return Math.sqrt(sum / data.length)
}
