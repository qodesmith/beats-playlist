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
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>
  canvasHeight: number
  waveformData: number[]
  barWidth: number
  style: WaveformStyle | undefined
}) {
  const ctx = canvasRef.current?.getContext('2d')
  if (!ctx) return

  const multiplier = style === 'reflection' ? 0.8 : 1
  const [r, g, b] = [0, 0, 0]
  ctx.fillStyle = `rgba(${r},${g},${b},1)`

  waveformData.forEach((height, i) => {
    const x = barWidth * i
    const barHeight = height * canvasHeight * multiplier
    const y =
      (canvasHeight - barHeight - (canvasHeight - canvasHeight * multiplier)) /
      (style === 'center' ? 2 : 1)

    ctx.fillRect(x, y, barWidth, barHeight)
  })

  if (style === 'reflection') {
    ctx.fillStyle = `rgba(${r},${g},${b},.2)`

    waveformData.forEach((height, i) => {
      const x = barWidth * i
      const barHeight = height * canvasHeight * (1 - multiplier)
      const y = canvasHeight * 0.8

      ctx.fillRect(x, y, barWidth, barHeight)
    })
  }
}
