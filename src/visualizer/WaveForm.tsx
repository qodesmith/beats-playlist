import {useMemo} from 'react'

export function WaveForm({
  waveformData,
  width,
  height,
  barWidth,
  type = 'bottomReflection',
}: {
  waveformData: number[]
  width: number
  height: number
  barWidth: number
  type: 'top' | 'center' | 'bottom' | 'bottomReflection'
}) {
  const marginBottom = useMemo(() => {
    return type === 'bottomReflection' ? {marginBottom: height / 4} : undefined
  }, [height, type])

  const bars = useMemo(() => {
    return waveformData.map((num, i) => {
      // Values of 0 get a minimal visual representation.
      const barHeight = Math.max(height * num, barWidth)
      const x = (barWidth + barWidth * 0.5) * i
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
          rx={barWidth / 2}
          ry={barWidth / 2}
        />
      )
    })
  }, [barWidth, height, type, waveformData])

  if (type === 'bottomReflection') {
    return (
      <div className="relative" style={marginBottom}>
        <svg width={width} height={height}>
          {bars}
        </svg>
        <svg
          className="absolute origin-top translate-y-1/4 -scale-y-[0.25] opacity-20"
          width={width}
          height={height}
        >
          {bars}
        </svg>
      </div>
    )
  }

  return (
    <svg width={width} height={height}>
      {bars}
    </svg>
  )
}
