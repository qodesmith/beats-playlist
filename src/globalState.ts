import type {AudioThing} from './AudioThing'
import type {Video} from '@qodestack/dl-yt-playlist'

import {atom} from 'jotai'
import {atomFamily, atomWithStorage, loadable} from 'jotai/utils'

import {getRandomBeatId, secondsToPlainSentence} from './utils'

////////////////////////
// APP INITIALIZATION //
////////////////////////

export const isAppInitializedAtom = atom<boolean>(false)

//////////////
// METADATA //
//////////////

type VideoWithIndex = Video & {index: number}

export const metadataAtom = atom<VideoWithIndex[]>([])

export const metadataObjAtom = atom<Record<string, VideoWithIndex>>(get => {
  const metadata = get(metadataAtom)

  return metadata.reduce<Record<string, VideoWithIndex>>((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})
})

export const metadataStatsSelector = atom<{
  totalBeats: number
  totalTime: string
}>(get => {
  const metadata = get(metadataAtom)
  const totalBeats = metadata.length
  const totalSeconds = metadata.reduce<number>((acc, beat) => {
    return acc + beat.durationInSeconds
  }, 0)

  return {totalTime: secondsToPlainSentence(totalSeconds), totalBeats}
})

export const selectedBeatIdAtom = atom<string>()

export const selectedBeatIndexAtom = atom<number | undefined>(get => {
  const metadataObj = get(metadataObjAtom)
  const beatId = get(selectedBeatIdAtom)

  if (beatId) {
    return metadataObj[beatId].index
  }
})

const previousOrNextBeatAtom = atom(
  null,
  (get, set, type: 'previous' | 'next') => {
    const value = type === 'next' ? 1 : -1
    const currentBeatIndex = get(selectedBeatIndexAtom)

    if (currentBeatIndex !== undefined) {
      const nextBeatIndex = currentBeatIndex + value
      const metadata = get(metadataAtom)
      const backToTop = nextBeatIndex === metadata.length
      const toLastBeat = nextBeatIndex < 0
      const isShuffling = get(shuffleStateSelector)
      const newBeatId = isShuffling
        ? getRandomBeatId()
        : metadata.at(toLastBeat ? -1 : backToTop ? 0 : nextBeatIndex)!.id
      const audioThing = get(audioThingAtom)

      // Ensure the previous audio is stopped before we continue to the new one.
      audioThing?.remove()

      // Use the power of the DOM to scroll smoothly to our beat!
      document
        .getElementById(newBeatId)
        ?.scrollIntoView({behavior: 'smooth', block: 'center'})

      set(selectedBeatIdAtom, newBeatId)
    }
  }
)

export const previousBeatAtom = atom(null, (_get, set) => {
  set(previousOrNextBeatAtom, 'previous')
})

// TODO - rename to `setNextBeatAtom` and others
export const nextBeatAtom = atom(null, (_get, set) => {
  set(previousOrNextBeatAtom, 'next')
})

//////////////
// CONTROLS //
//////////////

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
  const nextState = repeatStates[nextIdx]
  const audioThing = get(audioThingAtom)

  set(repeatStateAtom, nextState)
  audioThing?.setRepeat(nextState === 'single')
})

const shuffleStateAtom = atomWithStorage<boolean>('shuffleState', false)

export const shuffleStateSelector = atom(get => get(shuffleStateAtom))

export const toggleShuffleAtom = atom(null, (get, set) => {
  const currentShuffleState = get(shuffleStateAtom)
  set(shuffleStateAtom, !currentShuffleState)
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
  return atom(async get => {
    if (id === undefined) return undefined

    const res = await fetch(`/beats/${id}`)
    const arrayBuffer = await res.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const {lufs} = get(metadataObjAtom)[id]

    /**
     * Why don't we also return `audioContext` from this atom? Since it's
     * cached, we would be re-using the audioContext any time we played the same
     * beat again. This will throw errors in the console. Instead, we let
     * consumers create their own audioContext if need be.
     */
    return {audioBuffer, lufs}
  })
})

export function getAudioDataLoadableAtomFamily(id: string | undefined) {
  return loadable(audioDataAtomFamily(id))
}

export const currentAudioStateAtom = atom<'stopped' | 'playing'>('stopped')

export const audioThingAtom = atom<AudioThing>()
