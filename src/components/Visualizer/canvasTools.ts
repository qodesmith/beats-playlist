import {tailwindColors} from '../../tailwindColors'
import type {TailwindColor} from '../../tailwindColors'
import type {WaveformStyle} from './WaveForm'

export function resizeCanvas({
  containerRef,
  canvasRef,
  height,
}: {
  containerRef: React.RefObject<HTMLDivElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  height: number
}) {
  const container = containerRef.current
  const canvas = canvasRef.current

  // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
  if (container && canvas) {
    const {width} = container.getBoundingClientRect()
    const dpi = window.devicePixelRatio

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = width * dpi
    canvas.height = height * dpi

    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.scale(dpi, dpi)
      ctx.imageSmoothingEnabled = false
    }

    return width
  }
}

export function drawCanvasBars({
  canvasRef,
  canvasHeight,
  waveformData,
  barWidth,
  style,
  tailwindColor,
  isReflection,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>
  canvasHeight: number
  waveformData: number[]
  barWidth: number
  style: WaveformStyle | undefined
  tailwindColor: TailwindColor | undefined
  isReflection?: boolean
}) {
  const ctx = canvasRef.current?.getContext('2d')
  if (!ctx) return

  const waveformDataLength = waveformData.length
  const color = tailwindColor
    ? tailwindColors[tailwindColor]
    : window.getComputedStyle(document.body).color
  ctx.fillStyle = color
  if (isReflection) ctx.filter = 'opacity(.2)'

  for (let i = 0; i < waveformDataLength; i++) {
    const height = waveformData[i]
    const x = barWidth * i
    const barHeight = height * canvasHeight
    const y = isReflection
      ? 0
      : (canvasHeight - barHeight) / (style === 'center' ? 2 : 1)

    ctx.fillRect(x, y, barWidth, barHeight)
  }
}
