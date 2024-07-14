import type {WaveformStyle} from './WaveformCanvas'
import type {TailwindColor} from '../../tailwindColors'

import {useAtomValue} from 'jotai'
import {useId} from 'react'

import {Cursor} from './Cursor'
import {SizeContainer} from './SizeContainer'
import {WaveformCanvas} from './WaveformCanvas'
import {audioBufferFamily} from '../Beats/state'

export function Visualizer({
  beatId,
  style,
  tailwindColor,
}: {
  beatId: string | undefined
  style?: WaveformStyle
  tailwindColor?: TailwindColor
}) {
  if (!beatId) return null

  return (
    <VisualizerBody
      beatId={beatId}
      style={style}
      tailwindColor={tailwindColor}
    />
  )
}

function VisualizerBody({
  beatId,
  style,
  tailwindColor,
}: {
  beatId: string
  style?: WaveformStyle
  tailwindColor?: TailwindColor
}) {
  const audioBuffer = useAtomValue(audioBufferFamily(beatId))
  const containerId = useId()
  const canvasId = useId()
  const canvasId2 = useId()
  const isReflection = style === 'reflection'
  const HEIGHT = 40
  const BAR_WIDTH = 1

  return (
    <SizeContainer id={containerId} canvasId={canvasId}>
      <WaveformCanvas
        // In dev, this will force the canvas to redraw when HMR happens
        key={import.meta.env.DEV ? Math.random() : undefined}
        canvasId={canvasId}
        containerId={containerId}
        height={isReflection ? HEIGHT * 0.8 : HEIGHT}
        audioBuffer={audioBuffer}
        tailwindColor={tailwindColor}
        barWidth={BAR_WIDTH}
        style={style}
        isReflection={false}
      />
      {isReflection && (
        <WaveformCanvas
          // In dev, this will force the canvas to redraw when HMR happens
          key={import.meta.env.DEV ? Math.random() : undefined}
          canvasId={canvasId2}
          containerId={containerId}
          height={HEIGHT * 0.2}
          audioBuffer={audioBuffer}
          tailwindColor={tailwindColor}
          barWidth={BAR_WIDTH}
          style={style}
          isReflection
        />
      )}

      {/* Keep this on the bottom so it's z-index is above the waveforms */}
      <Cursor cursorHeight={isReflection ? HEIGHT * 0.8 : HEIGHT} />
    </SizeContainer>
  )
}
