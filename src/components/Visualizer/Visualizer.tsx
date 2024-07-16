import type {WaveformStyle} from './WaveformCanvas'
import type {TailwindColor} from '../../tailwindColors'

import {Cursor} from './Cursor'
import {SizeContainer} from './SizeContainer'
import {WaveformCanvas} from './WaveformCanvas'

export function Visualizer({
  audioBuffer,
  style,
  tailwindColor,
  waveformHeight,
  cursorColor,
  isLoading,
}: {
  audioBuffer?: AudioBuffer
  style?: WaveformStyle
  tailwindColor?: TailwindColor
  waveformHeight: number
  cursorColor: string
  isLoading?: boolean
}) {
  const containerId = 'container'
  const canvasId = 'waveform-canvas'
  const isReflection = style === 'reflection'
  const BAR_WIDTH = 1

  /**
   * When there's no audioBuffer we want to show a straight line. 0.5 ensures
   * we're positioning the line at half the waveform height.
   */
  const MULTIPLIER = audioBuffer ? 0.7 : 0.5

  return (
    <SizeContainer id={containerId} canvasId={canvasId}>
      <WaveformCanvas
        canvasId={canvasId}
        containerId={containerId}
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
          canvasId={`${canvasId}-reflection`}
          containerId={containerId}
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
        />
      )}
    </SizeContainer>
  )
}
