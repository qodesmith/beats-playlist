import {atom} from 'jotai'
import {atomFamily, loadable} from 'jotai/utils'

// We don't actually use the `_id` param. Jotai uses it under the hood to
// identity the various atoms in the family. It's for tracking purposes only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sizeContainerAtomFamily = atomFamily((_id: string) => {
  return atom({width: 0, height: 0})
})

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
