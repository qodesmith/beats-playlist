import {useEffect, useMemo, useRef, useState} from 'react'
import {audioBufferToNumbers} from './audioBufferToNumbers'
import {VerticalPosition} from './VerticalPosition'
import {drawCanvasBars, resizeCanvas} from './canvasTools'
import {TailwindColor} from '../../tailwindColors'

export type WaveformStyle = 'center' | 'reflection'

export function WaveForm({
  audioBuffer,
  height,
  barWidth,
  style,
  tailwindColor,
}: {
  audioBuffer: AudioBuffer
  height: number
  barWidth: number
  style?: WaveformStyle
  tailwindColor?: TailwindColor
}) {
  const [width, setWidth] = useState<number>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasReflectionRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const waveformData = useMemo(() => {
    if (width === undefined) return []
    const barCount = width / barWidth
    return audioBufferToNumbers(audioBuffer, barCount)
  }, [audioBuffer, barWidth, width])
  const multiplier = style === 'reflection' ? 0.8 : 1

  drawCanvasBars({
    canvasRef,
    canvasHeight: height * multiplier,
    waveformData,
    barWidth,
    style,
    tailwindColor,
  })

  if (style === 'reflection') {
    drawCanvasBars({
      canvasRef: canvasReflectionRef,
      canvasHeight: height * (1 - multiplier),
      waveformData,
      barWidth,
      style,
      tailwindColor,
      isReflection: true,
    })
  }

  // Initial canvas settings effect
  useEffect(() => {
    const newWidth = resizeCanvas({
      containerRef,
      canvasRef,
      height: height * multiplier,
    })

    if (style === 'reflection') {
      resizeCanvas({
        containerRef,
        canvasRef: canvasReflectionRef,
        height: height * (1 - multiplier),
      })
    }

    setWidth(newWidth)
  }, [height, multiplier, style])

  // Screen resize effect
  useEffect(() => {
    const handleResize = () => {
      const newWidth = resizeCanvas({
        containerRef,
        canvasRef,
        height: height * multiplier,
      })
      if (style === 'reflection') {
        resizeCanvas({
          containerRef,
          canvasRef: canvasReflectionRef,
          height: height * (1 - multiplier),
        })
      }

      setWidth(newWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [height, multiplier, style])

  return (
    <div className="relative" ref={containerRef}>
      <VerticalPosition style={style} />
      <canvas ref={canvasRef} />
      {style === 'reflection' && <canvas ref={canvasReflectionRef} />}
    </div>
  )
}
