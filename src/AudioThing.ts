import type {audioDataAtomFamily} from './globalState'
import type {ExtractAtomValue} from 'jotai'

import {RESET} from 'jotai/utils'

import {TARGET_LUFS} from './constants'
import {
  currentAudioStateAtom,
  handleNextClickAtom,
  isSliderDraggingAtom,
  repeatStateSelector,
  setTimeProgressAtom,
} from './globalState'
import {volumeMultiplierAtom} from './globalState'
import {store} from './store'

type AudioThingInput = NonNullable<
  Awaited<ExtractAtomValue<ReturnType<typeof audioDataAtomFamily>>>
>

export class AudioThing {
  // @ts-expect-error - the id is for dev purposes only
  #id: string
  #audioContext: AudioContext
  #audioBuffer: AudioBuffer
  #lufs: number | null
  #audioSource: AudioBufferSourceNode
  #gainNode: GainNode
  #startTime: number
  #pausedTime: number
  #interval: ReturnType<typeof setInterval> | null

  constructor(data: AudioThingInput | undefined, id: string) {
    if (!data) throw new Error(`No audio data found for id: ${id}`)

    const audioContext = new AudioContext()
    const {audioBuffer, lufs} = data

    this.#id = id
    this.#audioContext = audioContext
    this.#audioBuffer = audioBuffer
    this.#lufs = lufs
    this.#audioSource = this.createAudioSource()
    this.#gainNode = audioContext.createGain()
    this.#startTime = 0
    this.#pausedTime = 0
    this.#interval = null

    this.connectAudio()
    store.set(setTimeProgressAtom, RESET)
  }

  private createAudioSource() {
    const audioSource = this.#audioContext.createBufferSource()
    audioSource.buffer = this.#audioBuffer
    audioSource.onended = () => this.onEnded()

    return audioSource
  }

  private onEnded() {
    const {duration} = this.#audioBuffer
    const {currentTime} = this.#audioContext
    const actualEndTime = currentTime - this.#startTime + this.#pausedTime
    const songHasEnded = actualEndTime >= duration
    const repeatState = store.get(repeatStateSelector)

    if (songHasEnded) {
      if (repeatState === 'on') {
        store.set(handleNextClickAtom)
      } else if (repeatState === 'single') {
        this.setPlayPosition(0)
      } else {
        store.set(currentAudioStateAtom, 'stopped')
        this.setPlayPosition(0)
      }
    }
  }

  private connectAudio() {
    const volumeMultiplier = store.get(volumeMultiplierAtom)

    this.adjustGain(volumeMultiplier)
    this.#audioSource
      .connect(this.#gainNode)
      .connect(this.#audioContext.destination)
  }

  /**
   * Formula:
   *   `gain = 10^((targetLUFS - currentLUFS) / 20)`
   *
   * The formula converts the difference in loudness levels to a linear gain
   * factor. Here's a step-by-step explanation:
   *
   * Difference in LUFS:
   * - `targetLUFS - currentLUFS`: This calculates the difference between the
   *   target loudness level and the current loudness level of the audio signal.
   *   If the target loudness is higher than the current loudness, the result
   *   will be positive, indicating that the gain needs to be increased. If the
   *   target loudness is lower, the result will be negative, indicating that
   *   the gain needs to be decreased.
   *
   * Conversion to decibels:
   * - The difference in LUFS is essentially a difference in decibels (dB). In
   *   audio engineering, a change of 1 LUFS is equivalent to a change of 1 dB.
   *
   * Conversion to linear scale:
   * - Audio gain is typically applied in a linear scale, but LUFS (and dB) is a
   *   logarithmic measure. To convert from a logarithmic scale (dB) to a linear
   *   scale, we use the formula "10 to the power of (db / 20)"
   * - Here, dB is the difference in LUFS we calculated earlier. Dividing by 20
   *   is necessary because the decibel scale is logarithmic with a base of 10,
   *   and for amplitude ratios, the conversion factor is 20 (not 10, which is
   *   used for power ratios).
   */
  adjustGain(volumeMultiplier: number) {
    if (this.#lufs !== null) {
      const adjustmentValue = Math.pow(10, (TARGET_LUFS - this.#lufs) / 20)
      this.#gainNode.gain.value = adjustmentValue * volumeMultiplier
    } else {
      this.#gainNode.gain.value = volumeMultiplier
    }
  }

  togglePlay() {
    const playState = store.get(currentAudioStateAtom)

    if (playState === 'playing') {
      store.set(currentAudioStateAtom, 'stopped')
      this.stopCalculatingProgress()
      this.#pausedTime += this.#audioContext.currentTime - this.#startTime
      this.#audioSource.stop()
      this.#audioSource = this.createAudioSource()
      this.connectAudio()
    } else {
      store.set(currentAudioStateAtom, 'playing')
      this.startCalculatingProgress()
      this.#startTime = this.#audioContext.currentTime
      this.#audioSource.start(0, this.#pausedTime)
    }
  }

  /**
   * Takes a number from 0 - 1.
   */
  setPlayPosition(position: number) {
    // Calculate the new start time in the buffer
    const newTime = this.#audioBuffer.duration * position
    const playState = store.get(currentAudioStateAtom)

    // Stop the current playback
    if (playState === 'playing') {
      this.#audioSource.stop()
    }
    this.#audioSource = this.createAudioSource()
    this.connectAudio()

    // Update the pausedTime to the new start time
    this.#pausedTime = newTime

    if (playState === 'playing') {
      // If playing, start the playback from the new time
      this.#startTime = this.#audioContext.currentTime
      this.#audioSource.start(0, this.#pausedTime)
    }
  }

  async remove() {
    if (this.#audioContext.state !== 'closed') {
      this.stopCalculatingProgress()
      this.#audioSource.disconnect()
      this.#gainNode.disconnect()
      await this.#audioContext.close()
      store.set(setTimeProgressAtom, RESET)
    }
  }

  setRepeat(value: boolean) {
    this.#audioSource.loop = value
  }

  private calculateTimeProgress(): void {
    const isSliderDragging = store.get(isSliderDraggingAtom)
    if (isSliderDragging) return

    const playState = store.get(currentAudioStateAtom)
    const time =
      playState === 'playing'
        ? this.#audioContext.currentTime - this.#startTime + this.#pausedTime
        : this.#pausedTime
    const position = time / this.#audioBuffer.duration

    store.set(setTimeProgressAtom, position)
  }

  private startCalculatingProgress(): void {
    /**
     * We don't pass `this.calculatTimeProgress` directly as the setInterval
     * callback because it will throw the following error:
     *
     * "Cannot read private member #audioContext from an object whose class did
     * not declare it"
     */
    this.#interval = setInterval(() => {
      this.calculateTimeProgress()
    }, 100)
  }

  private stopCalculatingProgress(): void {
    if (this.#interval) {
      clearInterval(this.#interval)
      this.#interval = null
    }
  }
}
