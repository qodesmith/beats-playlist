import {chunkArray} from '@qodestack/utils'

/**
 * Converts an audio buffer to an array of numbers ranging from 0 - 1. These
 * numbers will drive the visualization of audio waveforms.
 */
export function audioBufferToNumbers(
  audioBuffer: AudioBuffer,
  finalNumOfPoints: number = 100
) {
  const float32Array = audioBuffer.getChannelData(0)

  // Flip all the negative values positive - range here is 0 - 1
  const channelData = float32Array.map(Math.abs)

  // Split the data into chunks.
  const chunkSize = Math.ceil(channelData.length / finalNumOfPoints)
  const chunks = chunkArray(channelData, chunkSize)

  // Reduce each chunk to an average
  const arrayOfAverages = chunks.map(arr => {
    const total = arr.reduce((acc, num) => acc + num, 0)
    return total / arr.length
  })
  const maxNum = Math.max(...arrayOfAverages)

  // Return an array of numbers, each ranging from 0 - 1
  const finalNumbers = arrayOfAverages.map(num => num / maxNum)
  return finalNumbers
}
