export function WaveForm({
  waveformData,
  position = 'bottom',
}: {
  waveformData: number[]
  position?: 'top' | 'center' | 'bottom'
}) {
  const width = 1500
  const height = 300
  const barWidth = 10

  return (
    <svg width={width} height={height}>
      {waveformData.map((num, i) => {
        // Values of 0 get a minimal visual representation.
        const barHeight = Math.max(height * num, barWidth)
        const x = (barWidth + barWidth * 0.5) * i
        const y = (() => {
          if (position === 'top') return undefined
          if (position === 'bottom') return height - barHeight
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
      })}
    </svg>
  )
}
