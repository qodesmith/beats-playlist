import {pluralize} from '@qodestack/utils'

import {metadataAtom, selectedBeatIdAtom} from './globalState'
import {store} from './store'

export function secondsToPlainSentence({
  totalSeconds,
  excludeSeconds,
}: {
  totalSeconds: number
  excludeSeconds?: boolean
}): string {
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

  if (!excludeSeconds && (seconds > 0 || parts.length === 0)) {
    parts.push(pluralize(seconds, 'second'))
  }

  return parts.join(', ')
}

export function calculateRMS(audioBuffer: AudioBuffer) {
  const data = audioBuffer.getChannelData(0)
  const bufferLength = data.length
  let sum = 0

  for (let i = 0; i < bufferLength; i++) {
    sum += data[i] * data[i]
  }

  return Math.sqrt(sum / bufferLength)
}

/**
 * Converts an audio buffer to an array of numbers ranging from 0 - 1. These
 * numbers will drive the visualization of audio waveforms.
 */
export function audioBufferToNumbers(
  audioBuffer: AudioBuffer,
  finalNumOfPoints: number = 100
) {
  const float32Array = audioBuffer.getChannelData(0)
  const length = float32Array.length
  const chunkSize = Math.ceil(length / finalNumOfPoints)
  const averages: number[] = []

  let tempTotal = 0
  let tempItemsCount = 0
  let maxAvg = 0

  for (let i = 0; i < length; i++) {
    const num = float32Array[i]
    tempTotal += Math.abs(num)
    tempItemsCount++

    if (tempItemsCount === chunkSize) {
      const avg = tempTotal / tempItemsCount
      averages.push(avg)
      tempItemsCount = 0
      tempTotal = 0

      if (maxAvg < avg) maxAvg = avg
    }
  }

  // Process last few numbers that didn't make a whole chunk.
  if (tempItemsCount) {
    const lastAvg = tempTotal / tempItemsCount
    averages.push(lastAvg)
    if (maxAvg < lastAvg) maxAvg = lastAvg
  }

  // Convert numbers to 0 - 1 values
  const finalNumbers = averages.map(num => num / maxAvg)

  return finalNumbers
}

/**
 * Imperatively get a random beatId from the data.
 */
export function getRandomBeatId() {
  const selectedId = store.get(selectedBeatIdAtom)
  const ids = store.get(metadataAtom).reduce<string[]>((acc, item) => {
    // Ensure we don't pick the currently selected id.
    if (selectedId !== item.id) {
      acc.push(item.id)
    }

    return acc
  }, [])
  const randomIndex = Math.floor(Math.random() * ids.length)

  const randomId = ids[randomIndex]
  return randomId
}

/**
 * Scroll a beat into view.
 */
export function scrollBeatIntoView(
  beatId: string | undefined,
  options?: ScrollIntoViewOptions
) {
  if (beatId) {
    document
      .getElementById(beatId)
      ?.scrollIntoView({behavior: 'smooth', block: 'center', ...options})
  }
}
