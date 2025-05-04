import type {Video} from '@qodestack/dl-yt-playlist'
import type {TailwindBreakpoint} from './constants'

import {shuffleArray} from '@qodestack/utils'
import {atom} from 'jotai'
import {atomFamily} from 'jotai/utils'

import {store} from './store'
import {secondsToPlainSentence} from './utils'

////////////////////////
// APP INITIALIZATION //
////////////////////////

/**
 * When the metadata is initially loaded in `initApp.ts`, both the regular and
 * shuffled versions of that list will be stored in this object.
 *
 * The shuffled list is used behind the scenes to drive randomized play, making
 * the `previous` and `next` buttons predictable. It has no effect on the visual
 * order of the beat list.
 */
export const initialMetadata: {
  readonly data: Video[]
  readonly shuffledData: Video[]
  readonly obj: Record<string, Video>
} = {data: [], shuffledData: [], obj: {}}

/**
 * This atom will resolve to true once the initial fetch calls in `initApp` have
 * resolved. This helps avoid a lot of atoms in the app from being async and
 * needing suspense to render properly. Once this atom turns true the app will
 * fade from the loading screen to the playlist.
 */
export const isAppInitializedAtom = atom(false)

/**
 * Progress percent is shown on the HomePage while the app is loading.
 */
export const initialMetadataLoadingProgressAtom = atom(0)

//////////////
// METADATA //
//////////////

/**
 * Set while the app is initializing. This will only be shown on the admin
 * account and technically should never have data. It's here as a visual insight
 * into any beats that have slipped through the cracks.
 */
export const unknownMetadataAtom = atom<Video[]>([])

/**
 * Toggled by a header button to show / hide the unknown metadata.
 */
export const isUnknownMetadataAtom = atom(false)

/**
 * Drives whether the source of truth for metadata is the original or shuffled
 * list.
 */
const _isVisuallyShuffledAtom = atom(false)

/**
 * A dependency that triggers a reshuffling of the beats list.
 */
const _visuallyShuffledMetadataTriggerAtom = atom(true)

/**
 * The way to consume the shuffled list of beats. A single dependency is what
 * triggers a reshuffle.
 */
const _visuallyShuffledMetadataSelector = atom(get => {
  get(_visuallyShuffledMetadataTriggerAtom)
  return shuffleArray(initialMetadata.data)
})

/**
 * This selector is a shuffled version of metadata that does not change and is
 * used to power the previous / next buttons when the shuffle button is on.
 */
export const shuffledMetadataNonVisualSelector = atom(() => {
  return initialMetadata.shuffledData
})

/**
 * Visual metadata, as in the list of beats that is shown on the screen. This
 * selector accounts for the selected artist and / or the search term.
 */
export const visualMetadataSelector = atom<Video[]>(get => {
  const search = get(searchAtom)
  const selectedArtist = get(selectedArtistAtom)
  const isVisuallyShuffled = get(_isVisuallyShuffledAtom)
  const isUnknownMetadata = get(isUnknownMetadataAtom)

  if (isUnknownMetadata) {
    return get(unknownMetadataAtom)
  }

  let metadata = isVisuallyShuffled
    ? get(_visuallyShuffledMetadataSelector)
    : initialMetadata.data

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

  return metadata
})

/**
 * Powers the header stats. Stats reflect the search term and selected artist.
 */
export const metadataStatsSelector = atom(get => {
  const metadata = get(visualMetadataSelector)
  const totalBeats = metadata.length
  const {totalSeconds, artistSet} = metadata.reduce<{
    totalSeconds: number
    artistSet: Set<string>
  }>(
    (acc, beat) => {
      acc.totalSeconds += beat.durationInSeconds
      acc.artistSet.add(beat.channelName)

      return acc
    },
    {totalSeconds: 0, artistSet: new Set<string>()}
  )

  return {
    totalTime: secondsToPlainSentence({
      totalSeconds,
      excluded: ['second'],
      // roundIfExcluded: true,
    }),
    totalBeats,
    artistCount: artistSet.size,
  }
})

/**
 * The current beat selected from the list.
 */
export const selectedBeatIdAtom = atom<string>()

/**
 * When clicking an artist's name in the beat list, this value will be set and
 * cause the list to be filtered by that artist.
 */
export const selectedArtistAtom = atom<string>()

//////////////
// CONTROLS //
//////////////

/**
 * The DOM element for the slider container. Used in event handlers.
 */
export const sliderContainerElementAtom = atom<HTMLElement | null>()

/**
 * If the slider is currently dragging or not. Used in event handlers.
 */
export const isSliderDraggingAtom = atom(false)

/**
 * Event handler for header shuffle button.
 */
export function triggerVisualMetadataShuffle() {
  store.set(
    _visuallyShuffledMetadataTriggerAtom,
    !store.get(_visuallyShuffledMetadataTriggerAtom)
  )
  store.set(_isVisuallyShuffledAtom, true)
}

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

///////////////////
// MENU / SEARCH //
///////////////////

/**
 * Header hamburger menu.
 */
export const isMenuOpenAtom = atom(false)

export const searchAtom = atom('')

export const isSearchOpenAtom = atom(false)

export const rowContextMenuDataAtom = atom<{
  beatId: string

  /**
   * These values belong to the triple-dot menu button. They are used to
   * calculate where to position the context menu.
   */
  height: number
  top: number
  bottom: number
  left: number
}>()

////////////////
// BREAKPOINT //
////////////////

export const tailwindBreakpointAtom = atom<TailwindBreakpoint | null>(null)

///////////
// TOAST //
///////////

export const toastMessagesAtom = atom<{id: number; message: string}[]>([])
