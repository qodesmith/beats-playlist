import type {TailwindBreakpoint} from './constants'
import type {Video} from '@qodestack/dl-yt-playlist'

import {shuffleArray} from '@qodestack/utils'
import {atom} from 'jotai'
import {atomFamily, atomWithStorage} from 'jotai/utils'

import {store} from './store'
import {
  getRandomBeatId,
  scrollElementIntoView,
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
export const initialMetadataObj: {readonly [key: string]: Video} = {}

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
  return beatId ? initialMetadataObj[beatId] : undefined
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

const _handlePreviousOrNextClickAtom = atom(
  null,
  async (get, set, type: 'previous' | 'next') => {
    const audioThing = get(audioThingAtom)
    await audioThing?.remove()

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
    scrollElementIntoView(newBeatId, {behavior: 'smooth', block: 'nearest'})
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

const shuffleStateAtom = atomWithStorage<boolean>('shuffleState', false)

export const shuffleStateSelector = atom(get => get(shuffleStateAtom))

export const toggleShuffleAtom = atom(null, (get, set) => {
  const currentShuffleState = get(shuffleStateAtom)
  set(shuffleStateAtom, !currentShuffleState)
})

export const sliderContainerElementAtom = atom<HTMLElement | null>(null)

export const isSliderDraggingAtom = atom<boolean>(false)

/**
 * Value of 0 - 1
 */
export const sliderDraggingPositionAtom = atom(0)

export const progressWidthAtom = atom<`${number}%`>('0%')

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

export const currentAudioStateAtom = atom<'stopped' | 'playing'>('stopped')

///////////////////
// MENU / SEARCH //
///////////////////

export const isMenuOpenAtom = atom<boolean>(false)

export const searchAtom = atom('')

export const isSearchOpenAtom = atom<boolean>(false)

////////////////
// BREAKPOINT //
////////////////

export const tailwindBreakpointAtom = atom<TailwindBreakpoint | null>(null)
