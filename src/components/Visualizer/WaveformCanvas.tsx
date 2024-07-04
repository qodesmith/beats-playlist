import {useAtom} from 'jotai'
import {widthAtomFamily} from './state'
import {useEffect, useMemo} from 'react'
import type {TailwindColor} from '../../tailwindColors'
import {tailwindColors} from '../../tailwindColors'
import {audioBufferToNumbers} from './audioBufferToNumbers'

/**
 * Two things we want to do with a canvas element:
 * 1. Set its initial dimensions based its container size - useEffect
 * 2. Recalculate its dimensions when the screen resizes - useLayoutEffect
 *
 * UDPATE - `width` determines the canvas dimensions:
 * 1. Set the initial width value - useEffect
 * 2. Recalculate width when the screen resizes - useLayoutEffect?
 * 3. Update canvas dimensions whenever width changes - useEffect?
 */

export type WaveformStyle = 'center' | 'reflection'

export function WaveformCanvas({
  canvasId,
  containerId,
  height,
  audioBuffer,
  tailwindColor,
  barWidth,
  style,
  isReflection,
}: {
  canvasId: string
  containerId: string
  height: number
  audioBuffer: AudioBuffer
  tailwindColor?: TailwindColor
  barWidth: number
  style?: WaveformStyle
  isReflection?: boolean
}) {
  const [width, setWidth] = useAtom(widthAtomFamily(canvasId))
  const waveformData = useMemo(() => {
    if (width !== undefined) {
      const barCount = width / barWidth
      return audioBufferToNumbers(audioBuffer, barCount)
    }
  }, [audioBuffer, barWidth, width])

  // Set the initial width
  useEffect(() => {
    setWidthToCanvasContainersWidth(containerId, setWidth)
  }, [containerId, setWidth])

  // Recalculate width when the screen resizes
  useEffect(() => {
    const handleResize = () => {
      setWidthToCanvasContainersWidth(containerId, setWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [containerId, setWidth])

  useEffect(() => {
    if (width === undefined || waveformData === undefined) return

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas) {
      throw new Error(
        'Canvas not found when trying to update dimensions in response to resize event'
      )
    }

    const dpi = window.devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = width * dpi
    canvas.height = height * dpi

    // TODO - add a dpi "listener"
    /*
      const updatePixelRatio = () => {
        const mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
        const media = matchMedia(mqString);
        media.addEventListener("change", updatePixelRatio);

        // Handle the DPI change here
        console.log(`New devicePixelRatio: ${window.devicePixelRatio}`);
      };

      updatePixelRatio();
    */

    const ctx = canvas.getContext('2d')!
    ctx.scale(dpi, 1) // TODO - ?! This should be ctx.scale(dpi, dpi)
    ctx.imageSmoothingEnabled = false

    const waveformDataLength = waveformData.length
    const color = tailwindColor
      ? tailwindColors[tailwindColor]
      : window.getComputedStyle(document.body).color
    ctx.fillStyle = color

    /**
     * NOTE - the DOM shows terrible performance when setting the opacity filter
     * diretly on the canvas context. Instead, we set CSS opacity on the canvas
     * element itself.
     */
    // if (isReflection) ctx.filter = 'opacity(.2)'

    for (let i = 0; i < waveformDataLength; i++) {
      const waveformHeight = waveformData[i] // 0 - 1
      const barHeight = waveformHeight * canvas.height
      const x = barWidth * i
      const y = isReflection
        ? 0
        : (canvas.height - barHeight) / (style === 'center' ? 2 : 1)

      ctx.fillRect(x, y, barWidth, barHeight)
    }
  }, [
    barWidth,
    canvasId,
    height,
    isReflection,
    style,
    tailwindColor,
    waveformData,
    width,
  ])

  return width !== undefined ? (
    <canvas id={canvasId} style={{opacity: isReflection ? 0.2 : 1}} />
  ) : null
}

function setWidthToCanvasContainersWidth(
  containerId: string,
  setWidth: (value: number) => void
) {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(
      'Canvas container not found when trying to set initial width'
    )
  }

  const containerWidth = container.getBoundingClientRect().width
  setWidth(containerWidth)
}
