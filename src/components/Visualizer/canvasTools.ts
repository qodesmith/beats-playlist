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
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>
  canvasHeight: number
  waveformData: number[]
  barWidth: number
}) {
  const ctx = canvasRef.current?.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = 'blue'

  waveformData.forEach((height, i) => {
    const x = barWidth * i
    const barHeight = height * canvasHeight
    const y = canvasHeight - barHeight

    ctx.fillRect(x, y, barWidth, barHeight)
  })
}
