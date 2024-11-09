import {pluralize} from '@qodestack/utils'

export function secondsToPlainSentence({
  totalSeconds,
  excluded = [],
  roundIfExcluded = false,
}: {
  totalSeconds: number
  excluded?: ('hour' | 'minute' | 'second')[]
  roundIfExcluded?: boolean
}): string {
  if (totalSeconds < 0) {
    throw new Error('Input must be a non-negative number')
  }

  let hours = Math.floor(totalSeconds / 3600)
  let minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []
  const hoursExcluded = excluded.includes('hour')
  const minutesExcluded = excluded.includes('minute')
  const secondsExcluded = excluded.includes('second')

  if (hours > 0 && !hoursExcluded) {
    if (roundIfExcluded && minutesExcluded && minutes >= 30) hours++
    parts.push(pluralize(hours, 'hour'))
  }

  if (minutes > 0 && !minutesExcluded) {
    if (roundIfExcluded && secondsExcluded && seconds >= 30) minutes++
    parts.push(pluralize(minutes, 'minute'))
  }

  if ((seconds > 0 || parts.length === 0) && !secondsExcluded) {
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
 * Scroll an element into view.
 */
export function scrollElementIntoView(
  beatId: string | undefined,
  options?: ScrollIntoViewOptions | boolean
) {
  if (beatId) {
    document
      .getElementById(beatId)
      ?.scrollIntoView(
        typeof options === 'boolean'
          ? options
          : {behavior: 'smooth', block: 'center', ...options}
      )
  }
}
