import type {ComponentProps, ReactNode} from 'react'

import clsx from 'clsx'

export function HeaderButton({
  children,
  onClick,
  id,
  disabled,
  className,
}: {
  children: ReactNode
} & ComponentProps<'button'>) {
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-700 p-2 hover:bg-neutral-800 active:bg-neutral-700 disabled:bg-transparent disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  )
}
