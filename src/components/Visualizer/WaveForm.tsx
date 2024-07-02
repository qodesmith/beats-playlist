import {useEffect, useMemo, useRef, useState} from 'react'
import {audioBufferToNumbers} from './audioBufferToNumbers'
import {debounce} from '@qodestack/utils'
import {VerticalPosition} from './VerticalPosition'

const BAR_WIDTH_SPACING = 0.5

export function WaveForm({
  audioBuffer,
  height,
  barWidth,
  type = 'bottomReflection',
  style = 'bars',
}: {
  audioBuffer: AudioBuffer
  height: number
  barWidth: number
  type: 'top' | 'center' | 'bottom' | 'bottomReflection'
  style: 'bars' | 'solid'
}) {
  /**
   * `width` is calculated by measuring the containing div in the DOM once it's
   * mounted and drives how many bars we have in the waveform.
   */
  const [width, setWidth] = useState<number>()
  const widthRef = useRef<HTMLDivElement | null>(null)

  /**
   * For the `bottomReflection` type, the bottom reflected waveform is sized
   * down using CSS and absolutely positioned at the bottom of the top
   * waveform. Positioning it absolutely removes it's "space" in the DOM,
   * allowing other content to re-adjust naturally. Had we not absolutely
   * positioned it, the original dimensions of the waveform would still be
   * retained, pushing other DOM elements away and presenting empty space.
   */
  const marginBottom = useMemo(() => {
    return type === 'bottomReflection' ? {marginBottom: height / 4} : undefined
  }, [height, type])

  /**
   * We convert the audio buffer into an array of numbers ranging from 0 - 1
   * which we represent as vertical bars in the UI. The number of bars is
   * generated is conditional on the width of the container div.
   */
  const waveformData = useMemo(() => {
    if (width === undefined) return []
    const barCount =
      style === 'bars'
        ? width / (barWidth + barWidth * BAR_WIDTH_SPACING)
        : width / barWidth
    return audioBufferToNumbers(audioBuffer, barCount)
  }, [audioBuffer, barWidth, style, width])
  const bars = useMemo(() => {
    return waveformData.map((num, i) => {
      // Values of 0 get a minimal visual representation.
      const barHeight = Math.max(height * num, barWidth)
      const x =
        style === 'bars'
          ? (barWidth + barWidth * BAR_WIDTH_SPACING) * i
          : barWidth * i
      const y = (() => {
        if (type === 'top') return undefined
        if (type === 'bottom' || type === 'bottomReflection') {
          return height - barHeight
        }
        return height / 2 - barHeight / 2
      })()

      return (
        <rect
          key={i}
          width={barWidth}
          height={barHeight}
          x={x}
          y={y}
          // rx={barWidth / 2}
          // ry={barWidth / 2}
        />
      )
    })
  }, [barWidth, height, style, type, waveformData])

  // Initial width effect
  useEffect(() => {
    const div = widthRef.current

    if (div) {
      setWidth(div.getBoundingClientRect().width)
    }
  }, [])

  // Resize effect
  useEffect(() => {
    const handleResize = debounce(() => {
      const div = widthRef.current

      if (div) {
        setWidth(div.getBoundingClientRect().width)
      }
    }, 100)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return bars.length === 0 ? (
    <div ref={widthRef} />
  ) : (
    <div className="relative" style={marginBottom} ref={widthRef}>
      <VerticalPosition />
      <svg width={width} height={height}>
        {bars}
      </svg>
      {type === 'bottomReflection' && (
        <svg
          className="absolute origin-top translate-y-1/4 -scale-y-[0.25] opacity-20"
          width={width}
          height={height}
        >
          {bars}
        </svg>
      )}
    </div>
  )
}
