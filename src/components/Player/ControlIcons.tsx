export function Play({
  size = 40,
  circleFill = 'white',
  triangleFill = 'black',
  onClick,
}: {
  size?: number
  circleFill?: string
  triangleFill?: string
  onClick?: () => void
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" onClick={onClick}>
      <g className="hover:cursor-pointer">
        <circle cx="25" cy="25" r="24" fill={circleFill} stroke="black" />
        <path d="M20 15 L20 35 L35 25 Z" fill={triangleFill} stroke="black" />
      </g>
    </svg>
  )
}

export function Pause({
  size = 40,
  circleFill = 'white',
  pauseFill = 'black',
  onClick,
}: {
  size?: number
  circleFill?: string
  pauseFill?: string
  onClick?: () => void
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" onClick={onClick}>
      <g className="hover:cursor-pointer">
        <circle cx="25" cy="25" r="24" fill={circleFill} stroke="black" />
        <rect x="16" y="15" width="6" height="20" fill={pauseFill} />
        <rect x="28" y="15" width="6" height="20" fill={pauseFill} />
      </g>
    </svg>
  )
}

export function Next({
  size = 30,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="hover:cursor-pointer"
    >
      <path
        d="M10 10 Q10 9 11 9 L28 23 Q30 24 28 25 L11 39 Q10 40 10 39 V10"
        fill={fill}
      />
      <rect x="33" y="10" width="7" height="30" rx="2" fill={fill} />
    </svg>
  )
}

export function Previous({
  size = 30,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="hover:cursor-pointer"
    >
      <path
        d="M40 10 Q40 9 39 9 L22 23 Q20 24 22 25 L39 39 Q40 40 40 39 V10"
        fill={fill}
      />
      <rect x="10" y="10" width="7" height="30" rx="2" fill={fill} />
    </svg>
  )
}

export function Repeat({
  size = 20,
  fill = 'white',
  one,
  onClick,
}: {
  size?: number
  fill?: string
  one?: boolean
  onClick: () => void
}) {
  if (one) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        className="hover:cursor-pointer"
        onClick={onClick}
      >
        <path
          fill={fill}
          d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5zM12.25 2.5h-.75V1h.75A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25z"
        />
        <path
          fill={fill}
          d="M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z"
        />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className="hover:cursor-pointer"
      onClick={onClick}
    >
      <path
        fill={fill}
        d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"
      />
    </svg>
  )
}
