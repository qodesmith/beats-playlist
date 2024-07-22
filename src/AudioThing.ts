import type {audioDataAtomFamily} from './globalState'
import type {ExtractAtomValue} from 'jotai'

import {audioThingAtom, currentAudioStateAtom} from './globalState'
import {store} from './store'
import {createAudioBufferSource} from './utils'

type AudioThingInput = NonNullable<
  Awaited<ExtractAtomValue<ReturnType<typeof audioDataAtomFamily>>>
>

export class AudioThing {
  #audioContext: AudioContext
  #audioBuffer: AudioBuffer
  #rms: number
  #audioSource: AudioBufferSourceNode
  #startTime: number
  #pausedTime: number

  constructor(data: AudioThingInput) {
    const audioContext = new AudioContext()
    const {audioBuffer, rms} = data

    this.#audioContext = audioContext
    this.#audioBuffer = audioBuffer
    this.#rms = rms
    this.#audioSource = createAudioBufferSource({audioContext, audioBuffer})
    this.#startTime = 0
    this.#pausedTime = 0

    store.set(audioThingAtom, this)

    // TODO - use the rms value to adjust song volume for consistency btwn songs
    console.log(this.#rms)
  }

  private createAudioSource() {
    this.#audioSource = createAudioBufferSource({
      audioContext: this.#audioContext,
      audioBuffer: this.#audioBuffer,
    })
  }

  togglePlay() {
    const playState = store.get(currentAudioStateAtom)

    if (playState === 'playing') {
      store.set(currentAudioStateAtom, 'stopped')
      this.#pausedTime += this.#audioContext.currentTime - this.#startTime
      this.#audioSource.stop()
      this.createAudioSource()
    } else {
      store.set(currentAudioStateAtom, 'playing')
      this.#startTime = this.#audioContext.currentTime
      this.#audioSource.start(0, this.#pausedTime)
    }
  }

  setPlayPosition(position: number) {
    // Calculate the new start time in the buffer
    const newTime = this.#audioBuffer.duration * position

    // Stop the current playback
    this.#audioSource.stop()
    this.createAudioSource()

    // Update the pausedTime to the new start time
    this.#pausedTime = newTime

    // Check if the audio is currently playing
    const playState = store.get(currentAudioStateAtom)

    if (playState === 'playing') {
      // If playing, start the playback from the new time
      this.#startTime = this.#audioContext.currentTime
      this.#audioSource.start(0, this.#pausedTime)
    }
  }

  remove() {
    this.#audioContext.close().then(() => {
      // TODO - don't set 'stopped' here - use this atom value to automatically
      // play the next song if loop is engaged. Maybe if loop isn't engaged then
      // set this atom here.
      store.set(currentAudioStateAtom, 'stopped')
      store.set(audioThingAtom, undefined)
    })
  }

  setRepeat(value: boolean) {
    this.#audioSource.loop = value
  }
}
