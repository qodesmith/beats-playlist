import {ComponentProps} from 'react'

export function CloseButton({
  size = 30,
  fill = 'white',
  onClick,
  className,
}: {size?: number; fill?: string} & ComponentProps<'button'>) {
  return (
    <button onClick={onClick} className={className}>
      <svg width={size} height={size} viewBox="0 0 30 30" fill={fill}>
        <rect
          y="13"
          width="30"
          height="4"
          rx="2"
          className="origin-center rotate-45"
        />
        <rect
          y="13"
          width="30"
          height="4"
          rx="2"
          className="origin-center -rotate-45"
        />
      </svg>
    </button>
  )
}
