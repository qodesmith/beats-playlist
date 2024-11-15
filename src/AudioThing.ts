import {fetchWithProgress, secondsToDuration} from '@qodestack/utils'
import {atom} from 'jotai'
import {atomFamily, atomWithStorage, unwrap} from 'jotai/utils'

import {
  sampleRate,
  contentLengthHeader,
  TARGET_LUFS,
  isPlaybackShuffledKey,
} from './constants'
import {
  initialMetadata,
  isSliderDraggingAtom,
  selectedBeatIdAtom,
  shuffledMetadataNonVisualSelector,
  sliderContainerElementAtom,
  visualMetadataSelector,
} from './globalState'
import {store} from './store'
import {scrollElementIntoView} from './utils'

class AudioThing {
  id: string
  startTime: number
  lufs: number | null
  audioBuffer: AudioBuffer
  audioContext: AudioContext
  audioBufferSourceNode: AudioBufferSourceNode
  gainNode: GainNode

  static async init(id: string, position?: number) {
    const audioBuffer = await store.get(audioBufferAtomFamily(id))
    const audioThing = new AudioThing(id, audioBuffer, position)

    /**
     * A new AudioThing may have been initialized while we were still trying to
     * initialize this one. Guard against that and clean up.
     */
    if (store.get(selectedBeatIdAtom) === id) {
      store.set(audioThingAtom, audioThing)
    } else {
      audioThing.cleanUp()
    }

    return audioThing
  }

  constructor(
    id: string,
    audioBuffer: AudioBuffer,
    position?: number /* 0 - 1 */
  ) {
    this.id = id
    this.audioBuffer = audioBuffer
    this.lufs = initialMetadata.obj[id].lufs

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext
     *
     * The beginning of our Web Audio API journey. AudioContext's need to be
     * created based on user interaction, such as a button click, otherwise the
     * browser will log warnings.
     */
    this.audioContext = new AudioContext()

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/GainNode
     *
     * A volume knob.
     */
    this.gainNode = this.audioContext.createGain()

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
     *
     * This represents the 1st domino in the chain - the audio source. At this
     * point, it is not associated with any data. The data (audioBuffer) will be
     * added to the source below.
     */
    this.audioBufferSourceNode = this.audioContext.createBufferSource()

    /**
     * Listen for when the audio is finished playing and decide what to do. We
     * create a one-time listener because if this event fires, we can no longer
     * reuse the AudioContext. A new one needs to be created.
     */
    this.audioBufferSourceNode.addEventListener(
      'ended',
      this.audioEndedHandler,
      {once: true}
    )

    // Attach the raw data to our audio source so it can be played.
    this.audioBufferSourceNode.buffer = this.audioBuffer
    this.startTime = (position ?? 0) * this.audioBuffer.duration

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loop
     *
     * Looping for a single beat.
     */
    this.audioBufferSourceNode.loop =
      store.get(repeatStateSelector) === 'single'

    // Wire up the audio source, gain, and output.
    this.audioBufferSourceNode
      .connect(this.gainNode)
      .connect(this.audioContext.destination)

    /**
     * Adjust our gain before playback. There is a global `lufs` target to help
     * normalize volume across songs, as well as a volume slider in the controls.
     */
    this.adjustGain()

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
     *
     * Begin playback:
     * - Arg 0 - when you want to start playback (i.e. 0 === now)
     * - Arg 1 - offset
     *
     * NOTE: the `start()` method can only ever be called once per lifetime of the
     * `AudioBufferSourceNode`.
     */
    this.audioBufferSourceNode.start(0, this.startTime)
    store.set(isPlayingAtom, true)
    this.startPolling()
  }

  audioEndedHandler = async () => {
    await this.cleanUp()
    const repeatState = store.get(repeatStateSelector)

    /**
     * We don't need to cover `single` here because we already use the built-in
     * loop functionality of the Web Audio API to handle that. When looping, the
     * `ended` event does not fire.
     */
    if (repeatState === 'on') {
      handleNextClick()
    } else if (repeatState === 'off') {
      store.set(isPlayingAtom, false)

      /**
       * Since progress is polled via requestAnimationFrame, there may be a
       * single frame left to go by the time the beat ends that doesn't get
       * executed. This could leave us with something like 99.93% progress and
       * being 1 second shy of the full time. Therefore, We update progress
       * accordingly.
       */
      store.set(progressPercentAtom, 100)
    }
  }

  cleanUp = async () => {
    this.audioBufferSourceNode.removeEventListener(
      'ended',
      this.audioEndedHandler
    )

    this.gainNode.disconnect()

    if (this.audioContext.state !== 'closed') {
      // You can only call `close()` on an AudioContext once.
      await this.audioContext.close()
    }
  }

  getProgressPercent = () => {
    const {duration} = this.audioBuffer
    const time = (this.audioContext.currentTime + this.startTime) % duration

    return Number(((time / duration) * 100).toFixed(2))
  }

  adjustGain = () => {
    const {lufs, gainNode} = this
    const volumeMultiplier = store.get(volumeMultiplierAtom)

    if (lufs != null) {
      const adjustmentValue = Math.pow(10, (TARGET_LUFS - lufs) / 20)
      gainNode.gain.value = adjustmentValue * volumeMultiplier
    } else {
      gainNode.gain.value = volumeMultiplier
    }
  }

  togglePlayPause = async () => {
    if (this.audioContext.state === 'suspended') {
      // Play.
      store.set(isPlayingAtom, true)
      await this.audioContext.resume()
      this.startPolling()
    } else if (this.audioContext.state === 'running') {
      // Pause.
      store.set(isPlayingAtom, false)
      await this.audioContext.suspend()
    } else if (this.audioContext.state === 'closed') {
      // Restart from the beginning.
      await this.cleanUp()
      await AudioThing.init(this.id)
    }
  }

  cycleRepeat = () => {
    const currentRepeatState = store.get(repeatStateSelector)
    const idx = repeatStates.indexOf(currentRepeatState)
    const nextIdx = (idx + 1) % repeatStates.length
    const nextState = repeatStates[nextIdx]

    store.set(_repeatStateAtom, nextState)
    this.audioBufferSourceNode.loop = nextState === 'single'
  }

  /**
   * 0 - 1 value
   */
  setPosition = async (position: number) => {
    await this.cleanUp()
    await AudioThing.init(this.id, position)
    store.set(isPlayingAtom, true)
  }

  getShouldContinuePolling = () => {
    const isPlaying = store.get(isPlayingAtom)
    const isRunning = this.audioContext.state === 'running'
    const selectedBeatId = store.get(selectedBeatIdAtom)
    const isSelectedBeat = this.id === selectedBeatId
    const isSliderDragging = store.get(isSliderDraggingAtom)

    return isPlaying && isRunning && isSelectedBeat && !isSliderDragging
  }

  startPolling = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this

    function poll() {
      requestAnimationFrame(() => {
        if (_this.getShouldContinuePolling()) {
          store.set(progressPercentAtom, _this.getProgressPercent())
          poll()
        }
      })
    }

    poll()
  }
}

///////////////////////
// CONTROL FUNCTIONS //
///////////////////////

export const isPlaybackShuffledAtom = atomWithStorage<boolean>(
  isPlaybackShuffledKey,
  false
)

export function togglePlaybackShuffle() {
  store.set(isPlaybackShuffledAtom, !store.get(isPlaybackShuffledAtom))
}

export async function handlePlayPause() {
  const id = store.get(selectedBeatIdAtom)
  const audioThing = store.get(audioThingAtom)

  if (!id) {
    throw new Error('No beat has been selected yet')
  }

  // 1st time playing or switching to a new song.
  if (!audioThing || audioThing.id !== id) {
    await audioThing?.cleanUp()
    return await AudioThing.init(id)
  }

  await audioThing.togglePlayPause()
}

export async function handleWaveformClick(
  e: React.MouseEvent<HTMLDivElement, MouseEvent>
) {
  const id = store.get(selectedBeatIdAtom)

  if (!id) {
    throw new Error('No beat has been selected yet')
  }

  let audioThing = store.get(audioThingAtom)
  const {width, left} = e.currentTarget.getBoundingClientRect()
  const offsetX = e.clientX - left
  const position = offsetX / width // 0 - 1

  if (!audioThing) {
    audioThing = await AudioThing.init(id, position)
  } else {
    await audioThing.setPosition(position)
  }
}

export function handlePreviousClick() {
  loadPreviousOrNext('previous')
}

export function handleNextClick() {
  loadPreviousOrNext('next')
}

function loadPreviousOrNext(type: 'previous' | 'next') {
  const isPlaybackShuffled = store.get(isPlaybackShuffledAtom)
  const metadata = store.get(
    isPlaybackShuffled
      ? shuffledMetadataNonVisualSelector
      : visualMetadataSelector
  )
  const beatCount = metadata.length
  const selectedBeatId = store.get(selectedBeatIdAtom)
  const beatIndex = metadata.findIndex(item => item.id === selectedBeatId)

  if (beatIndex === -1 || !selectedBeatId) {
    throw new Error(`No beat found for "${type}"`)
  }

  const abortController = store.get(
    audioBufferAbortControllerAtomFamily(selectedBeatId)
  )
  const loadingProgress = store.get(
    audioFetchingProgressAtomFamily(selectedBeatId)
  )

  /**
   * If a beat is loading and hasn't reached 65% yet, and we switch to a new
   * beat, we abandon that fetch call to save bandwidth.
   */
  if (loadingProgress < 65) {
    abortController.abort()
    audioBufferAtomFamily.remove(selectedBeatId)
    audioBufferUnwrappedAtomFamily.remove(selectedBeatId)
    audioFetchingProgressAtomFamily.remove(selectedBeatId)
    // `audioBufferAbortControllerAtomFamily` is removed elsewhere.
  }

  const newIndex = beatIndex + (type === 'next' ? 1 : -1)
  const finalIndex = newIndex === -1 ? beatCount - 1 : newIndex % beatCount
  const newBeatId = metadata[finalIndex].id
  const audioThing = store.get(audioThingAtom)

  audioThing?.cleanUp()
  store.set(selectedBeatIdAtom, newBeatId)
  scrollElementIntoView(newBeatId, {behavior: 'smooth', block: 'nearest'})
  AudioThing.init(newBeatId)
}

export function handleStartSlider(
  e:
    | React.MouseEvent<HTMLDivElement, MouseEvent>
    | React.TouchEvent<HTMLDivElement>
) {
  const {width, left} = e.currentTarget.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const offsetX = clientX - left
  const progress = offsetX / width // 0 - 1

  store.set(isSliderDraggingAtom, true)
  store.set(progressPercentAtom, progress * 100)
}

/**
 * MOUSE MOVE, TOUCH MOVE
 * Track the mouse on the screen and determine if it is withing the horizontal
 * boundaries of the slider.
 */
export function handleMoveSlider(e: MouseEvent | TouchEvent) {
  const sliderContainer = store.get(sliderContainerElementAtom)
  if (!sliderContainer) return

  const {left, width} = sliderContainer.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const isBeforeRange = clientX < left
  const isAfterRange = clientX > left + width
  const isInRange = !isBeforeRange && !isAfterRange
  const isSliderDragging = store.get(isSliderDraggingAtom)

  if (isSliderDragging) {
    let progress = 0

    if (isInRange) {
      progress = (clientX - left) / width // 0 - 1
    } else {
      progress = isBeforeRange ? 0 : 1
    }

    store.set(progressPercentAtom, progress * 100)
  }
}

/**
 * MOUSE UP, TOUCH END
 * The mouseup handler should be on the document so we're free to grab the
 * slider, drag around the document, and mouseup wherever we want.
 */
export async function handleStopSlider(e: MouseEvent | TouchEvent) {
  const sliderContainer = store.get(sliderContainerElementAtom)
  if (!sliderContainer) return

  if (store.get(isSliderDraggingAtom)) {
    const audioThing = store.get(audioThingAtom)
    const duration = audioThing?.audioBuffer.duration ?? 0
    const {width, left} = sliderContainer.getBoundingClientRect()
    const clientX =
      'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const offsetX = clientX - left
    const position = offsetX / width
    const newPosition = Math.min(Math.max(position, 0), duration)

    store.set(isSliderDraggingAtom, false)
    await audioThing?.setPosition(newPosition)
  }
}

///////////
// STATE //
///////////

export const audioThingAtom = atom<AudioThing>()

/**
 * Used to cancel a fetch request.
 */
export const audioBufferAbortControllerAtomFamily = atomFamily(
  (_id: string) => {
    return atom(new AbortController())
  }
)

/**
 * The source of truth for which beats have fully loaded.
 */
export const audioBufferIdsLoaded = atom<string[]>([])

/**
 * Fetches the audio and converts it to an audioBuffer. Uses `fetchWithProgress`
 * under the hood and sets a progress atom that can be consumed.
 */
export const audioBufferAtomFamily = atomFamily((id: string) => {
  /**
   * !!! WARNING !!!
   * Do NOT use the `get` function from this atom selector!!!!
   *
   * TL;DR
   * `get(...)` declares dependencies from this atom in the atomFamily and will
   * cause it to "re-render", or in our case re-fetch, whenever the dependency
   * changes. Use the store directly instead to get data.
   *
   * The problem with using `get(...)`:
   *
   * - Select beat 1 - request beat 1
   * - Select beat 2 - request beat 1, request beat 2
   * - Select beat 3 - request beat 1, request beat 2, request beat 3
   * #NightMare
   *
   * Any data needed inside this atomFamily can be retrieved with `store.get` to
   * avoid Jotai re-renders.
   */
  return atom(async _get_DO_NOT_USE___AVOID_JOTAI_RERENDERS => {
    const abortController = store.get(audioBufferAbortControllerAtomFamily(id))
    const res = await fetchWithProgress({
      url: `/api/beats/${id}`,
      contentLengthHeader,
      onProgress: percent => {
        store.set(audioFetchingProgressAtomFamily(id), Math.round(percent))
      },
      options: {signal: abortController.signal},
    })
      .catch(() => {
        // TODO - handle non AbortErrors
        // if ((e as Error).name === 'AbortError') {
        //   console.warn('audioBufferAtomFamily - error fetching:', e)
        // }
        return null
      })
      .then(res => {
        /**
         * Track the ids that have been loaded so that we can remove atoms from
         * various families once they reach a certain limit to manage memory.
         */
        store.set(audioBufferIdsLoaded, [
          ...store.get(audioBufferIdsLoaded),
          id,
        ])

        return res
      })

    /**
     * By the time we get here, we've either cancelled the fetch call or it has
     * completed. Either way, get rid of the AbortController.
     */
    audioBufferAbortControllerAtomFamily.remove(id)

    if (res === null) {
      return new AudioBuffer({numberOfChannels: 1, length: 1, sampleRate})
    }

    const arrayBuffer = await res.arrayBuffer()

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
     *
     * AudioContext's are supposed to be generated based on user interaction,
     * such as a button press. Since we only want to get a decoded AudioBuffer,
     * we can avoid browser warnings by using an OfflineAudioContext which does
     * not require a user interaction to use.
     *
     * The sampleRate just needs to be something the device supports. This does
     * not have to match the original audio sample rate.
     */
    const offlineAudioContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: arrayBuffer.byteLength,
      sampleRate,
    })

    const audioBuffer = await offlineAudioContext.decodeAudioData(arrayBuffer)
    return audioBuffer
  })
})

/**
 * https://jotai.org/docs/utilities/async#unwrap
 * https://jotai.org/docs/utilities/async#loadable
 *
 * Used to simplify the waveform visualization logic by avoiding Suspense. I've
 * chosen `unwrap` over `loadable` to further simplify the logic. With `unwrap`,
 * the value is `undefined` until it isn't. With `loadable`, an object is
 * returned with explicit `state`, `data`, and `error` properties.
 *
 * For our use case, a value not being present is good enough. While a new value
 * is loading, we want the old stale value to remain. This achieves that.
 *
 */
export const audioBufferUnwrappedAtomFamily = atomFamily((id: string) => {
  return unwrap(audioBufferAtomFamily(id))
})

/**
 * Holds the fetch (loading) progress for an individual beat.
 */
export const audioFetchingProgressAtomFamily = atomFamily((_id: string) =>
  atom(0)
)

const repeatStates = ['off', 'on', 'single'] as const

const _repeatStateAtom = atomWithStorage<(typeof repeatStates)[number]>(
  'repeatState', // localStorage key
  'off' // Initial localStorage value (if none set)
)

export const repeatStateSelector = atom(get => get(_repeatStateAtom))

export const isPlayingAtom = atom(false)

const _volumeMultiplierAtom = atom(1)

export const volumeMultiplierAtom = atom(
  get => get(_volumeMultiplierAtom),
  (get, set, value: number) => {
    set(_volumeMultiplierAtom, value)
    get(audioThingAtom)?.adjustGain()
  }
)

/** 1 - 100 */
export const progressPercentAtom = atom(0)

/**
 * This selector powers the time progress in the footer, an updated time to the
 * left of the slider - a string in the format of `<minutes>:<seconds>`.
 */
export const timeProgressSelector = atom(get => {
  const duration = get(audioThingAtom)?.audioBuffer.duration ?? 0
  const progressPercent = get(progressPercentAtom)

  return secondsToDuration(duration * (progressPercent / 100))
})

/**
 * This selector returns the duration of the audio. The unwrapped atomFamily
 * would technically be enough here, but as you change beats it would have a
 * momentary default value of 0 while the beat is loading. By bringing in
 * adioThingAtom, we solve that gap since the previous audioThingAtom sticks
 * around until the new beat is loaded. We show stale data until the new data
 * has arrived. This is the same way the waveform works.
 */
export const durationAtomSelector = atom(get => {
  const selectedBeatId = get(selectedBeatIdAtom)

  return (
    get(audioBufferUnwrappedAtomFamily(selectedBeatId ?? ''))?.duration ?? 0
  )
})
