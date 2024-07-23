export function DotsVertical({
  size = 8,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg width={size} height={size * 3} viewBox="0 0 8 24">
      <circle fill={fill} cx="4" cy="4" r="2" />
      <circle fill={fill} cx="4" cy="12" r="2" />
      <circle fill={fill} cx="4" cy="20" r="2" />
    </svg>
  )
}
