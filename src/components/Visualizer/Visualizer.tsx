import type {WaveformStyle} from './WaveformCanvas'
import type {TailwindColor} from '../../tailwindColors'

import {useId} from 'react'

import {Cursor} from './Cursor'
import {WaveformCanvas} from './WaveformCanvas'

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
  const BAR_WIDTH = 1

  /**
   * When there's no audioBuffer we want to show a straight line. 0.5 ensures
   * we're positioning the line at half the waveform height.
   */
  const MULTIPLIER = audioBuffer ? 0.7 : 0.5

  return (
    <div className="relative">
      <WaveformCanvas
        canvasId={canvasId}
        width={waveformWidth}
        height={isReflection ? waveformHeight * MULTIPLIER : waveformHeight}
        audioBuffer={audioBuffer}
        tailwindColor={tailwindColor}
        barWidth={BAR_WIDTH}
        style={style}
        isReflection={false}
        isLoading={!!isLoading}
      />
      {isReflection && (
        <WaveformCanvas
          canvasId={canvasReflectionId}
          width={waveformWidth}
          height={waveformHeight * (1 - MULTIPLIER)}
          audioBuffer={audioBuffer}
          tailwindColor={tailwindColor}
          barWidth={BAR_WIDTH}
          style={style}
          isReflection
          isLoading={!!isLoading}
        />
      )}

      {/* Keep this on the bottom so it's z-index is above the waveforms */}
      {!isLoading && audioBuffer && (
        <Cursor
          cursorHeight={
            isReflection ? waveformHeight * MULTIPLIER : waveformHeight
          }
          cursorColor={cursorColor}
          cursorWidth={2}
        />
      )}
    </div>
  )
}
