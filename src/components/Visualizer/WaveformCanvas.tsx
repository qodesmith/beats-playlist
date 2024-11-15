import type {TailwindColor} from '../../tailwindColors'

import {useAtomValue} from 'jotai'
import {useMemo, useEffect} from 'react'

import {progressPercentAtom} from '../../AudioThing'
import {tailwindColors} from '../../tailwindColors'
import {audioBufferToNumbers} from '../../utils'

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
  width,
  height,
  audioBuffer,
  tailwindColor,
  barWidth,
  style,
  isReflection,
  isLoading,
}: {
  /**
   * And `id` that will be added to the underlying `<canvas />` element.
   */
  canvasId: string

  /**
   * Width of the canvas.
   */
  width: number

  /**
   * Height of the canvas.
   */
  height: number

  /**
   * The underlying audio data used to draw the waveform on the canvas.
   */
  audioBuffer?: AudioBuffer

  /**
   * An optional `TailwindColor` to color the waveform.
   */
  tailwindColor?: TailwindColor

  /**
   * How wide each waveform bar on the canvas will be.
   */
  barWidth: number

  /**
   * Different visualization styles for the waveform
   */
  style?: WaveformStyle

  /**
   * Is this canvas an additional "reflection" below another canvas.
   */
  isReflection?: boolean

  /**
   * Is the `audioBuffer` still loading or not.
   */
  isLoading: boolean
}) {
  const progressWidth = useAtomValue(progressPercentAtom)
  const waveformData = useMemo(() => {
    const barCount = width / barWidth

    return !audioBuffer
      ? Array.from<number>({length: barCount}).fill(0)
      : audioBufferToNumbers(audioBuffer, barCount)
  }, [audioBuffer, barWidth, width])

  // Effect to draw the canvas.
  useEffect(() => {
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
    const bodyColor = window.getComputedStyle(document.body).color
    const color = tailwindColor ? tailwindColors[tailwindColor] : bodyColor

    /**
     * NOTE - the DOM shows terrible performance when setting the opacity filter
     * diretly on the canvas context. Instead, we set CSS opacity on the canvas
     * element itself.
     */
    // if (isReflection) ctx.filter = 'opacity(.2)'

    const progressWidthCutoff = waveformDataLength * (progressWidth / 100)

    for (let i = 0; i < waveformDataLength; i++) {
      const loadedColor = i <= progressWidthCutoff ? color : 'gray'
      ctx.fillStyle = isLoading || !audioBuffer ? 'gray' : loadedColor

      const waveformHeight = waveformData[i] // 0 - 1
      const barHeight = audioBuffer
        ? waveformHeight * canvas.height
        : canvas.height - (canvas.height - 1)
      const x = barWidth * i
      const y = isReflection
        ? 0
        : (canvas.height - barHeight) / (style === 'center' ? 2 : 1)

      ctx.fillRect(x, y, barWidth, barHeight)
    }
  }, [
    audioBuffer,
    barWidth,
    canvasId,
    height,
    isLoading,
    isReflection,
    progressWidth,
    style,
    tailwindColor,
    waveformData,
    width,
  ])

  const opacity = (() => {
    if (!audioBuffer) return 0.5
    if (isReflection) return isLoading ? 0.1 : 0.2
    if (isLoading) return 0.5
    return 1
  })()

  return <canvas id={canvasId} style={{opacity}} />
}
