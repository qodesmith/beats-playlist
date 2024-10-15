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
  const cls = clsx(
    'flex h-10 w-10 items-center justify-center rounded border border-neutral-700 p-2 hover:bg-neutral-800 active:bg-neutral-700 disabled:bg-transparent disabled:opacity-50',
    className
  )

  return (
    <button id={id} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}
