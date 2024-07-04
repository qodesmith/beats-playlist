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
