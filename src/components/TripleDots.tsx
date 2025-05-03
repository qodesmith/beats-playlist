export function TripleDots({
  size = 8,
  fill = 'white',
  type,
}: {
  size?: number
  fill?: string
  type: 'vertical' | 'horizontal'
}) {
  const isVertical = type === 'vertical'
  const viewBox = `0 0 ${isVertical ? '8 24' : '24 8'}`
  const tripleSize = size * 3

  return (
    <svg
      width={isVertical ? size : tripleSize}
      height={isVertical ? tripleSize : size}
      viewBox={viewBox}
    >
      <title>triple dots</title>
      <circle fill={fill} cx="4" cy="4" r="2" />
      {isVertical ? (
        <>
          <circle fill={fill} cx="4" cy="12" r="2" />
          <circle fill={fill} cx="4" cy="20" r="2" />
        </>
      ) : (
        <>
          <circle fill={fill} cx="12" cy="4" r="2" />
          <circle fill={fill} cx="20" cy="4" r="2" />
        </>
      )}
    </svg>
  )
}
