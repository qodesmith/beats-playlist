import type {audioDataAtomFamily} from './globalState'
import type {ExtractAtomValue} from 'jotai'

import {TARGET_LUFS} from './constants'
import {
  audioThingAtom,
  currentAudioStateAtom,
  nextBeatAtom,
  repeatStateSelector,
} from './globalState'
import {store} from './store'

type AudioThingInput = NonNullable<
  Awaited<ExtractAtomValue<ReturnType<typeof audioDataAtomFamily>>>
>

export class AudioThing {
  #audioContext: AudioContext
  #audioBuffer: AudioBuffer
  #lufs: number | null
  #audioSource: AudioBufferSourceNode
  #gainNode: GainNode
  #startTime: number
  #pausedTime: number

  constructor(data: AudioThingInput) {
    const audioContext = new AudioContext()
    const {audioBuffer, lufs} = data

    this.#audioContext = audioContext
    this.#audioBuffer = audioBuffer
    this.#lufs = lufs
    this.#audioSource = this.createAudioSource()
    this.#gainNode = audioContext.createGain()
    this.#startTime = 0
    this.#pausedTime = 0

    this.connectAudioSource()
    store.set(audioThingAtom, this)

    if (store.get(currentAudioStateAtom) === 'playing') {
      this.#audioSource.start()
    }
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
        store.set(nextBeatAtom)
      } else if (repeatState === 'single') {
        this.setPlayPosition(0)
      } else {
        store.set(currentAudioStateAtom, 'stopped')
        this.setPlayPosition(0)
      }
    }
  }

  private connectAudioSource() {
    this.#audioSource
      .connect(this.#gainNode)
      .connect(this.#audioContext.destination)

    this.adjustGainToTargetLufs()
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
  private adjustGainToTargetLufs() {
    if (this.#lufs !== null) {
      const adjustmentValue = Math.pow(10, (TARGET_LUFS - this.#lufs) / 20)
      this.#gainNode.gain.value = adjustmentValue
    }
  }

  togglePlay() {
    const playState = store.get(currentAudioStateAtom)

    if (playState === 'playing') {
      store.set(currentAudioStateAtom, 'stopped')
      this.#pausedTime += this.#audioContext.currentTime - this.#startTime
      this.#audioSource.stop()
      this.#audioSource = this.createAudioSource()
      this.connectAudioSource()
    } else {
      store.set(currentAudioStateAtom, 'playing')
      this.#startTime = this.#audioContext.currentTime
      this.#audioSource.start(0, this.#pausedTime)
    }
  }

  setPlayPosition(position: number) {
    // Calculate the new start time in the buffer
    const newTime = this.#audioBuffer.duration * position
    const playState = store.get(currentAudioStateAtom)

    // Stop the current playback
    if (playState === 'playing') {
      this.#audioSource.stop()
    }
    this.#audioSource = this.createAudioSource()
    this.connectAudioSource()

    // Update the pausedTime to the new start time
    this.#pausedTime = newTime

    if (playState === 'playing') {
      // If playing, start the playback from the new time
      this.#startTime = this.#audioContext.currentTime
      this.#audioSource.start(0, this.#pausedTime)
    }
  }

  remove() {
    /**
     * Avoid calling the `close()` method twice. The useAudioThing hook will
     * call `.remove()` when unmounting. The next / previous buttons will call
     * `.remove()` as well - this avoids multiple audio contexts from playing
     * simultaneously when furiously clicking next / previous. Having this
     * conditional ensures the audio is closed before another plays - either by
     * the React unmount lifecycle (in useAudioThing) or imeratively by the
     * next / previous handlers. First call wins.
     */
    if (this.#audioContext.state !== 'closed') {
      void this.#audioContext.close()
    }
  }

  setRepeat(value: boolean) {
    this.#audioSource.loop = value
  }
}
