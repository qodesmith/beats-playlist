import {$} from 'bun'
import path from 'node:path'

export async function genWaveformNumbers(
  mp3Path: string
): Promise<{numbers: number[]; maxNum: number; minNum: number}> {
  /**
   * -f s16le
   *   Sets the output format to signed 16-bit little-endian PCM. This format
   *   represents each audio sample as a 16-bit integer. Little-endian specifies
   *   the byte order.
   *
   * -ac 1
   *   Sets the number of audio channels to 1 (mono). This simplifies the data;
   *   if you have stereo audio and want to represent both channels, you might
   *   omit this or use -ac 2.
   *
   * -ar 44100
   *   Sets the audio sampling rate to 44100 Hz. This is a common sampling rate
   *   for audio. You can adjust this if needed.
   *
   * -
   *   This special output file specifier tells FFmpeg to write the output to
   *   standard output (stdout).
   */
  const {stdout} =
    await $`ffmpeg -i "${mp3Path}" -f s16le -ac 1 -ar 44100 -`.quiet()
  const numbers = Array.from(stdout)
  const maxNum = numbers.reduce((acc, num) => Math.max(acc, num), 0)
  const minNum = numbers.reduce((acc, num) => Math.min(acc, num), maxNum)

  // TODO - look at how audioBufferToNumbers handle batching (use peak values)
  return {numbers, maxNum, minNum}
}

const mp3Path = path.resolve(
  import.meta.dir,
  '../../public/beats/audio/2-test.mp3'
)
const data = await genWaveformNumbers(mp3Path)
console.log(data)
