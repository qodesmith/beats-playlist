import type {Video} from '@qodestack/dl-yt-playlist'

import {secondsToDuration, shuffleArray} from '@qodestack/utils'
import {atom} from 'jotai'
import {RESET} from 'jotai/utils'
import {atomFamily, atomWithReset, atomWithStorage, loadable} from 'jotai/utils'

import {AudioThing} from './AudioThing'
import {store} from './store'
import {
  getRandomBeatId,
  scrollBeatIntoView,
  secondsToPlainSentence,
} from './utils'

////////////////////////
// APP INITIALIZATION //
////////////////////////

/**
 * The only place outside this module that consumes this object is `initApp`.
 * This object will be frozen right after it is written to. A number of atoms
 * consume this data as well since they don't need a shuffled version for their
 * purposes.
 */
export const _initialMetadata: {readonly data: Video[]} = {data: []}

/**
 * This atom will resolve to true once the initial fetch calls in `initApp` have
 * resolved. This helps avoid a lot of atoms in the app from being async and
 * needing suspense to render properly.
 */
export const isAppInitializedAtom = atom<boolean>(false)

export const initialMetadataLoadingProgressAtom = atom<number>(0)

//////////////
// METADATA //
//////////////

export const unknownMetadataAtom = atom<Video[]>([])

export const isUnknownMetadataAtom = atom<boolean>(false)

/**
 * The single source of truth for metadata. It will handle returning the
 * original unsorted array or the shuffled array.
 */
export const metadataSelector = atom<Video[]>(get => {
  const currentItem = get(metadataItemSelector)
  const selectedArtist = get(selectedArtistAtom)
  const search = get(searchAtom)
  const isUnknownMetadata = get(isUnknownMetadataAtom)

  if (isUnknownMetadata) {
    return get(unknownMetadataAtom)
  }

  let metadata = get(_isMetadataShuffledAtom)
    ? get(_shuffledMetadataSelector)
    : _initialMetadata.data

  // Searching
  if (search.trim()) {
    const lowerCaseSearch = search.toLowerCase()
    metadata = metadata.filter(
      v =>
        v.title.toLowerCase().includes(lowerCaseSearch) ||
        v.channelName.toLowerCase().includes(lowerCaseSearch)
    )
  }

  // Selected artist
  if (selectedArtist) {
    metadata = metadata.filter(v => v.channelName === selectedArtist)
  }

  if (currentItem && !metadata.includes(currentItem)) {
    metadata = [currentItem].concat(metadata)
  }

  return metadata
})

const _isMetadataShuffledAtom = atom(false)

/**
 * Solely used to re-trigger shuffling the metadata.
 */
const _shuffledMetadataCounterAtom = atom(0)

/**
 * A shuffled version of the metadata array.
 */
const _shuffledMetadataSelector = atom(get => {
  /**
   * We use this dependency to trigger re-shuffles of the metadata. If the
   * dependency value doesn't change, this atom will return a stable, shuffled
   * array if consumers re-render.
   */
  get(_shuffledMetadataCounterAtom)
  return shuffleArray(_initialMetadata.data)
})

/**
 * A write-only atom that returns a function to trigger shuffling the metadata.
 *
 * ```jsx
 * const handleShuffleMetadata = useAtomValue(shuffleMetadataAtom)
 * <button onClick={handleShuffleMetadata}>Shuffle metadata</button>
 * ```
 */
export const shuffleMetadataAtom = atom(null, (get, set) => {
  const num = get(_shuffledMetadataCounterAtom)
  set(_isMetadataShuffledAtom, true)
  set(_shuffledMetadataCounterAtom, num + 1)
})

/**
 * Metadata for the currently selected beat.
 */
export const metadataItemSelector = atom(get => {
  const beatId = get(selectedBeatIdAtom)
  return _initialMetadata.data.find(v => v.id === beatId)
})

export const metadataStatsSelector = atom(get => {
  const metadata = get(metadataSelector)
  const totalBeats = metadata.length
  const totalSeconds = metadata.reduce<number>((acc, beat) => {
    return acc + beat.durationInSeconds
  }, 0)
  const {artistCount} = get(artistStatsSelector)

  return {
    totalTime: secondsToPlainSentence({
      totalSeconds,
      excluded: ['second'],
      // roundIfExcluded: true,
    }),
    totalBeats,
    artistCount,
  }
})

export const artistStatsSelector = atom(get => {
  const metadata = get(metadataSelector)
  const artistsDataObj = metadata.reduce<Record<string, number>>(
    (acc, {channelName}) => {
      if (!acc[channelName]) {
        acc[channelName] = 0
      }

      acc[channelName]++

      return acc
    },
    {}
  )
  const artistData = Object.entries(artistsDataObj)
    .map(([name, count]) => ({name, count}))
    .sort((a, b) => b.count - a.count)
  const artistCount = artistData.length

  return {artistCount, artistData}
})

export const selectedBeatIdAtom = atom<string>()

export const selectedArtistAtom = atom<string>()

export const durationInSecondsSelector = atom(get => {
  const beatId = get(selectedBeatIdAtom)
  const audioBufferRes = get(getAudioDataLoadableAtomFamily(beatId))
  const metadataItem = get(metadataItemSelector)

  if (audioBufferRes.state === 'hasData') {
    return audioBufferRes.data?.audioBuffer.duration
  }

  if (audioBufferRes.state === 'hasError') {
    return metadataItem?.durationInSeconds ?? 0
  }

  return 0
})

export const searchAtom = atom('')

//////////////
// CONTROLS //
//////////////

/**
 * A subscription that tracks play history for the previous button.
 */
store.sub(selectedBeatIdAtom, () => {
  const isPreviousTriggered = store.get(_isPreviousTriggeredAtom)
  const id = store.get(selectedBeatIdAtom)
  const selectedArtist = store.get(selectedArtistAtom)

  if (id && !isPreviousTriggered) {
    store.set(_beatHistoryAtom, [
      ...store.get(_beatHistoryAtom),
      {id, selectedArtist},
    ])
  }
})

/**
 * History used by the previous button.
 */
const _beatHistoryAtom = atom<
  {id: string; selectedArtist: string | undefined}[]
>([])

export const isPreviousDisabledSelector = atom(
  get => get(_beatHistoryAtom).length <= 1
)

/**
 * Helper function for controls to play a new beat:
 * - Triggers fetching a beat via `audioDataAtomFamily`
 * - Creates a `new AudioThing()` and stores it in state
 * - Set the current audio state to 'stopped'
 * - Toggle play on the new audioThing
 */
export async function genNewAudioThingAndPlay(
  id: string,
  resetIsPrev?: boolean
): Promise<void> {
  store.get(audioThingAtom)?.remove() // Ensure the old one is stopped.
  store.set(selectedBeatIdAtom, id)

  if (resetIsPrev) {
    store.set(_isPreviousTriggeredAtom, false)
  }

  void store.get(audioDataAtomFamily(id)).then(audioData => {
    /**
     * Avoid race conditions.
     * Theoretically, a previous slower request might resolve after a 2nd
     * request has completed. We wouldn't want that old request to then replace
     * the audio. `selectedBeatIdAtom` will always be up to date.
     */
    if (id !== store.get(selectedBeatIdAtom)) return

    const newAudioThing = new AudioThing(audioData, id)

    store.set(audioThingAtom, newAudioThing)
    store.set(currentAudioStateAtom, 'stopped')
    newAudioThing.togglePlay()
  })
}

export const handlePlayPauseAtom = atom(null, get => {
  const audioThing = get(audioThingAtom)

  if (audioThing) {
    audioThing.togglePlay()
  } else {
    // This should never be undefined here. The app initializes with a beat id.
    const selectedBeatId = get(selectedBeatIdAtom)!
    void genNewAudioThingAndPlay(selectedBeatId)
  }
})

export const handleClickToPlayAtom = atom(null, (get, _set, id: string) => {
  const selectedBeatId = get(selectedBeatIdAtom)

  /**
   * No beat selected - play a new beat.
   * Given the architecture, I don't think this will ever be the case.
   */
  if (!selectedBeatId) {
    scrollBeatIntoView(id, {behavior: 'smooth', block: 'nearest'})
    return void genNewAudioThingAndPlay(id)
  }

  /**
   * Clicking the same beat.
   */
  if (id === selectedBeatId) return

  /**
   * Clicking a new beat (i.e. an old one is already playing or paused).
   */
  const audioThing = get(audioThingAtom)
  audioThing?.remove()
  scrollBeatIntoView(id, {behavior: 'smooth', block: 'nearest'})
  void genNewAudioThingAndPlay(id)
})

const _handlePreviousOrNextClickAtom = atom(
  null,
  (get, set, type: 'previous' | 'next') => {
    const audioThing = get(audioThingAtom)
    audioThing?.remove()

    const selectedBeatId = get(selectedBeatIdAtom)
    if (!selectedBeatId) return // This should never be the case.

    const metadata = get(metadataSelector)
    const isPrevious = type === 'previous'
    const newIndex = (() => {
      const currentIndex = metadata.findIndex(v => v.id === selectedBeatId)

      /**
       * Use the first beat if we can't find the current one. This can happen
       * if we're playing a beat by artist A, then select artist B which filters
       * the playlist, no longer include artist A (but it's still playing).
       */
      if (currentIndex === -1) return 0

      const lastIndex = metadata.length - 1
      const nextIndex = currentIndex + 1

      return nextIndex === lastIndex ? 0 : nextIndex
    })()

    const previousId = (() => {
      if (isPrevious) {
        const beatHistory = get(_beatHistoryAtom)

        // -2 because the last entry is the current one.
        const previousItemId = beatHistory.at(-2)?.id
        const otherItems = beatHistory.slice(0, -1)

        set(_beatHistoryAtom, otherItems)

        return previousItemId
      }
    })()

    const isShuffleOn = get(shuffleStateSelector)
    const newBeatId =
      previousId ?? (isShuffleOn ? getRandomBeatId() : metadata[newIndex].id)
    scrollBeatIntoView(newBeatId, {behavior: 'smooth', block: 'nearest'})
    return void genNewAudioThingAndPlay(newBeatId, isPrevious)
  }
)

const _isPreviousTriggeredAtom = atom<boolean>(false)

export const handlePreviousClickAtom = atom(null, (get, set) => {
  const isPreviousDisabled = get(isPreviousDisabledSelector)
  if (isPreviousDisabled) return

  set(_isPreviousTriggeredAtom, true)
  set(_handlePreviousOrNextClickAtom, 'previous')
})

export const handleNextClickAtom = atom(null, (_get, set) => {
  set(_handlePreviousOrNextClickAtom, 'next')
})

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

export const isSliderDraggingAtom = atom<boolean>(false)

export const progressWidthAtom = atom<string>('0%')

/**
 * This atom powers the time progress indicator in the footer. It is updated by
 * the AudioThing class.
 *
 * - `rawTime` - the number of seconds elapsed
 * - `formattedTime` - a string in the format of `<minutes>:<seconds>`;
 *     e.x. `3:26`
 */
const timeProgressAtom = atomWithReset<{
  rawTime: number
  formattedTime: string
}>({rawTime: 0, formattedTime: '0:00'})

export const timeProgressSelector = atom(get => get(timeProgressAtom))

/**
 * Takes a number between 0 - 1 and updates the time progress data.
 */
export const setTimeProgressAtom = atom(
  null,
  (get, set, position: number | typeof RESET) => {
    if (position === RESET) return set(timeProgressAtom, RESET)

    const duration = get(metadataItemSelector)?.durationInSeconds ?? 0
    const rawTime = +(position * duration).toFixed(1)
    const formattedTime = secondsToDuration(rawTime)

    set(timeProgressAtom, {rawTime, formattedTime})
  }
)

/**
 * Returns a value of 0 - 1 as a percentage of the audio progress. This
 * completely relies on timeProgressAtom being updated as the music plays, which
 * happens in the AudioTimeSlider component.
 */
export const progressWidthSelector = atom(get => {
  const {rawTime} = get(timeProgressAtom)
  const duration = get(metadataItemSelector)?.durationInSeconds ?? 0
  return rawTime / duration
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
  return atom(async _get_DO_NOT_USE___AVOID_JOTAI_RERENDERS => {
    if (id === undefined) return undefined

    const res = await fetch(`/beats/${id}`)
    const arrayBuffer = await res.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    /**
     * !!! WARNING !!!
     * Do NOT use the `get` function from this atom selector!!!!
     *
     * TL;DR
     * `get(...)` declares dependencies from this atom in the atomFamily
     * and will cause it to "re-render", or in our case re-fetch, whenever the
     * dependency changes. Use the store directly instead to get data.
     *
     * The problem with using `get(metadataItemSelector)`:
     *
     * - Select beat 1 - request beat 1
     * - Select beat 2 - request beat 1, request beat 2
     * - Select beat 3 - request beat 1, request beat 2, request beat 3
     * #NightMare
     *
     * We still need the data from `metadataItemSelector`, but we don't need
     * Jotai to re-render for us. `store.get` to the rescue.
     */
    const lufs = store.get(metadataItemSelector)?.lufs ?? null

    /**
     * Because audioContexts are not garbage collected by default when they go
     * out of scope, we explicitly close the context to allow the garbage
     * collector to clean it up. It has served its purpose.
     */
    audioContext.close()

    /**
     * Why don't we also return `audioContext` from this atom? Since data in
     * this atom is cached, we would be re-using the audioContext any time we
     * played the same beat again. This will throw errors in the console.
     * Instead, we let consumers create their own audioContext if need be. The
     * audioContext in this atom is solely used to decode the arrayBuffer into
     * an audioBuffer and it's then discarded.
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
