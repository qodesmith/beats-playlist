import type {AudioThing} from './AudioThing'
import type {Video} from '@qodestack/dl-yt-playlist'

import {atom} from 'jotai'
import {atomFamily, atomWithStorage, loadable} from 'jotai/utils'

import {
  getRandomBeatId,
  scrollBeatIntoView,
  secondsToPlainSentence,
} from './utils'

////////////////////////
// APP INITIALIZATION //
////////////////////////

export const isAppInitializedAtom = atom<boolean>(false)

//////////////
// METADATA //
//////////////

type VideoWithIndex = Video & {index: number}

export const metadataAtom = atom<VideoWithIndex[]>([])

const metadataItemSelector = atom(get => {
  const beatId = get(selectedBeatIdAtom)
  return get(metadataAtom).find(v => v.id === beatId)
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

const previousOrNextBeatAtom = atom(
  null,
  (get, set, type: 'previous' | 'next') => {
    const value = type === 'next' ? 1 : -1
    const metadata = get(metadataAtom)
    const selectedBeatId = get(selectedBeatIdAtom)
    const currentBeatIndex = selectedBeatId
      ? metadata.findIndex(v => v.id === selectedBeatId)
      : undefined

    if (currentBeatIndex !== undefined && currentBeatIndex !== -1) {
      const nextBeatIndex = currentBeatIndex + value
      const backToTop = nextBeatIndex === metadata.length
      const toLastBeat = nextBeatIndex < 0
      const isShuffling = get(shuffleStateSelector)
      const newBeatId = isShuffling
        ? getRandomBeatId()
        : metadata.at(toLastBeat ? -1 : backToTop ? 0 : nextBeatIndex)?.id
      const audioThing = get(audioThingAtom)
      const randomBeatIndex = get(metadataAtom).findIndex(
        v => v.id === newBeatId
      )
      const indexDifference = Math.abs(
        (isShuffling ? randomBeatIndex : nextBeatIndex) - currentBeatIndex
      )

      // Ensure the previous audio is stopped before we continue to the new one.
      audioThing?.remove()

      // Use the power of the DOM to scroll smoothly to our beat!
      scrollBeatIntoView(
        newBeatId,
        indexDifference < 10 ? undefined : {behavior: 'instant'}
      )

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

/**
 * Jotai uses the `_id` param under the hood to identify the various atoms in
 * the family. It's for tracking purposes only so we don't consume it.
 */
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
    const {lufs} = get(metadataItemSelector)!

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

//////////
// MENU //
//////////

export const isMenuOpenAtom = atom<boolean>(false)
