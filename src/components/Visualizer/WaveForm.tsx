import {useEffect, useMemo, useRef, useState} from 'react'
import {audioBufferToNumbers} from './audioBufferToNumbers'
import {VerticalPosition} from './VerticalPosition'
import {drawCanvasBars, resizeCanvas} from './canvasTools'

export function WaveForm({
  audioBuffer,
  height,
  barWidth,
}: {
  audioBuffer: AudioBuffer
  height: number
  barWidth: number
}) {
  const [width, setWidth] = useState<number>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const waveformData = useMemo(() => {
    if (width === undefined) return []
    const barCount = width / barWidth
    return audioBufferToNumbers(audioBuffer, barCount)
  }, [audioBuffer, barWidth, width])

  drawCanvasBars({canvasRef, canvasHeight: height, waveformData, barWidth})

  // Initial canvas settings effect
  useEffect(() => {
    const newWidth = resizeCanvas({containerRef, canvasRef, height})
    setWidth(newWidth)
  }, [height])

  // Screen resize effect
  useEffect(() => {
    const handleResize = () => {
      const newWidth = resizeCanvas({containerRef, canvasRef, height})
      setWidth(newWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [height])

  return (
    <div className="relative" ref={containerRef}>
      <VerticalPosition />
      <canvas ref={canvasRef} />
    </div>
  )
}
