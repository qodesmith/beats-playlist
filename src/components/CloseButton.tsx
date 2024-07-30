import type {ComponentProps} from 'react'

export function CloseButton({
  size = 30,
  fill = 'white',
  onClick,
  className,
}: {size?: number; fill?: string} & ComponentProps<'button'>) {
  return (
    <button onClick={onClick} className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill={fill}
        className="group p-1"
      >
        <rect
          y="13"
          width="30"
          height="4"
          rx="2"
          className="origin-center rotate-45 stroke-black stroke-0 transition-all duration-200 md:group-hover:stroke-2"
        />
        <rect
          y="13"
          width="30"
          height="4"
          rx="2"
          className="origin-center -rotate-45 stroke-black stroke-0 transition-all duration-200 md:group-hover:stroke-2"
        />
      </svg>
    </button>
  )
}
