import type {TailwindColor} from '../../tailwindColors'
import type {WaveformStyle} from './WaveformCanvas'

import {useId} from 'react'

import {handleWaveformClick} from '../../AudioThing'
import {Cursor} from './Cursor'
import {WaveformCanvas} from './WaveformCanvas'

// TODO - implement an oscilloscope with the Web Audio API - https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
export function Visualizer({
  audioBuffer,
  style,
  tailwindColor,
  waveformWidth,
  waveformHeight,
  cursorColor,
  isLoading,
}: {
  /**
   * An `AudioBuffer` that will be passed to the `WaveformCanvas` component.
   * This is the audio data to be visualized.
   */
  audioBuffer?: AudioBuffer

  /**
   * Different visualization styles for the waveform.
   */
  style?: WaveformStyle

  /**
   * An optional `TailwindColor` to color the waveform.
   */
  tailwindColor?: TailwindColor

  /**
   * Width of the waveform.
   */
  waveformWidth: number

  /**
   * Height of the waveform.
   */
  waveformHeight: number

  /**
   * Color of the vertical cursor that appears when mousing around the waveform.
   */
  cursorColor: string

  /**
   * Is the `audioBuffer` still loading or not.
   */
  isLoading?: boolean
}) {
  const id = useId()
  const canvasId = `${id}-waveform-canvas`
  const canvasReflectionId = `${id}-waveform-reflection-canvas`
  const isReflection = style === 'reflection'
  const barWidth = 1

  /**
   * When there's no audioBuffer we want to show a straight line. 0.5 ensures
   * we're positioning the line at half the waveform height.
   */
  const multiplier = audioBuffer ? 0.7 : 0.5

  return (
    // TODO: fix this
    // biome-ignore lint/a11y/useKeyWithClickEvents: TODO
    // biome-ignore lint/nursery/noNoninteractiveElementInteractions: TODO
    <div className="relative" onClick={handleWaveformClick}>
      <WaveformCanvas
        canvasId={canvasId}
        width={waveformWidth}
        height={isReflection ? waveformHeight * multiplier : waveformHeight}
        audioBuffer={audioBuffer}
        tailwindColor={tailwindColor}
        barWidth={barWidth}
        style={style}
        isReflection={false}
        isLoading={!!isLoading}
      />
      {isReflection && (
        <WaveformCanvas
          canvasId={canvasReflectionId}
          width={waveformWidth}
          height={waveformHeight * (1 - multiplier)}
          audioBuffer={audioBuffer}
          tailwindColor={tailwindColor}
          barWidth={barWidth}
          style={style}
          isReflection
          isLoading={!!isLoading}
        />
      )}

      {/* Keep this on the bottom so it's z-index is above the waveforms */}
      {!isLoading && audioBuffer && (
        <Cursor
          cursorHeight={
            isReflection ? waveformHeight * multiplier : waveformHeight
          }
          cursorColor={cursorColor}
          cursorWidth={2}
        />
      )}
    </div>
  )
}
