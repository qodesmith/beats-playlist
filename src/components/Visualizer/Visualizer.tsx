import type {WaveformStyle} from './WaveformCanvas'
import type {TailwindColor} from '../../tailwindColors'

import {useId} from 'react'

import {Cursor} from './Cursor'
import {SizeContainer} from './SizeContainer'
import {WaveformCanvas} from './WaveformCanvas'
import {useFetchAudioBuffer} from '../../hooks/useFetchAudioBuffer'

export function Visualizer({
  fileName,
  style,
  tailwindColor,
}: {
  fileName: string
  style?: WaveformStyle
  tailwindColor?: TailwindColor
}) {
  const {audioBuffer} = useFetchAudioBuffer(fileName)
  const containerId = useId()
  const canvasId = useId()
  const canvasId2 = useId()
  const isReflection = style === 'reflection'
  const HEIGHT = 175
  const BAR_WIDTH = 1

  if (!audioBuffer) {
    return <div>Loading...</div>
  }

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
