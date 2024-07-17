import {atom} from 'jotai'
import {atomFamily, loadable} from 'jotai/utils'

// We don't actually use the `_id` param. Jotai uses it under the hood to
// identity the various atoms in the family. It's for tracking purposes only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sizeContainerAtomFamily = atomFamily((_id: string) => {
  return atom({width: 0, height: 0})
})

export const audioDataAtomFamily = atomFamily((id: string | undefined) => {
  const audioDataAtom = atom(async () => {
    if (id === undefined) return undefined

    const res = await fetch(`/beats/${id}`)
    const arrayBuffer = await res.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const rms = calculateRMS(audioBuffer)

    return {audioContext, audioBuffer, rms}
  })

  return loadable(audioDataAtom)
})

function calculateRMS(audioBuffer: AudioBuffer) {
  const data = audioBuffer.getChannelData(0)
  let sum = 0

  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i]
  }

  return Math.sqrt(sum / data.length)
}
