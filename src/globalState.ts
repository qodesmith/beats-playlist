import type {Video} from '@qodestack/dl-yt-playlist'

import {atom} from 'jotai'
import {atomFamily, atomWithStorage, loadable} from 'jotai/utils'

import {calculateRMS, secondsToPlainSentence} from './utils'

export const isAppInitializedAtom = atom<boolean>(false)

//////////////
// METADATA //
//////////////

export const metadataAtom = atom<Video[]>([])

export const metadataStatsSelector = atom<
  Promise<{
    totalBeats: number
    totalTime: string
  }>
>(async get => {
  const metadata = await get(metadataAtom)
  const totalBeats = metadata.length
  const totalSeconds = metadata.reduce<number>((acc, beat) => {
    return acc + beat.durationInSeconds
  }, 0)

  return {totalTime: secondsToPlainSentence(totalSeconds), totalBeats}
})

export const selectedBeatIdAtom = atom<string | undefined>(undefined)

////////////
// REPEAT //
////////////

const repeatStates = ['off', 'on', 'single'] as const

const repeatStateAtom = atomWithStorage<(typeof repeatStates)[number]>(
  'repeatState',
  'off'
)

export const repeatStateSelector = atom(get => get(repeatStateAtom))

export const cycleRepeatStateAtom = atom(null, (get, set) => {
  const currentRepeatState = get(repeatStateAtom)
  const idx = repeatStates.indexOf(currentRepeatState)
  const nextIdx = (idx + 1) % repeatStates.length

  set(repeatStateAtom, repeatStates[nextIdx])
})

////////////////////
// SIZE CONTAINER //
////////////////////

// We don't actually use the `_id` param. Jotai uses it under the hood to
// identity the various atoms in the family. It's for tracking purposes only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sizeContainerAtomFamily = atomFamily((_id: string) => {
  return atom({width: 0, height: 0})
})

////////////////
// AUDIO DATA //
////////////////

export const audioDataAtomFamily = atomFamily((id: string | undefined) => {
  return atom(async () => {
    if (id === undefined) return undefined

    const res = await fetch(`/beats/${id}`)
    const arrayBuffer = await res.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const rms = calculateRMS(audioBuffer)

    return {audioContext, audioBuffer, rms}
  })
})

export function getAudioDataLoadableAtomFamily(id: string | undefined) {
  return loadable(audioDataAtomFamily(id))
}
