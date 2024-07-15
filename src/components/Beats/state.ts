import type {Video} from '@qodestack/dl-yt-playlist'
import type {Atom} from 'jotai'

import {pluralize} from '@qodestack/utils'
import {atom} from 'jotai'
import {atomFamily} from 'jotai/utils'

export const metadataAtom = atom<Promise<Video[]>>(() => {
  return fetch('/metadata')
    .then(res => res.json())
    .then((metadata: Video[]) => {
      return metadata.filter(({audioFileExtension}) => !!audioFileExtension)
    })
})

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

function secondsToPlainSentence(totalSeconds: number): string {
  if (totalSeconds < 0) {
    throw new Error('Input must be a non-negative number')
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []

  if (hours > 0) {
    parts.push(pluralize(hours, 'hour'))
  }

  if (minutes > 0) {
    parts.push(pluralize(minutes, 'minute'))
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(pluralize(seconds, 'second'))
  }

  return parts.join(', ')
}

export const selectedBeatIdAtom = atom<string | undefined>(undefined)

const audioBufferBeatIds = new Set<string>()

export const audioBufferFamily = atomFamily<
  string,
  Atom<Promise<{audioBuffer: AudioBuffer; rms: number}>>
>((beatId: string) => {
  audioBufferBeatIds.add(beatId)

  return atom(() => {
    return fetch(`/beats/${beatId}`)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => new AudioContext().decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const rms = calculateRMS(audioBuffer)
        return {audioBuffer, rms}
      })
  })
})

function calculateRMS(audioBuffer: AudioBuffer) {
  const data = audioBuffer.getChannelData(0)
  let sum = 0

  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i]
  }

  return Math.sqrt(sum / data.length)
}

export function clearAudioBufferFamily() {
  audioBufferBeatIds.forEach(beatId => {
    audioBufferFamily.remove(beatId)
  })

  audioBufferBeatIds.clear()
}
