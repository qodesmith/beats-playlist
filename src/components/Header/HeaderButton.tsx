import type {ReactNode} from 'react'

export function HeaderButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded border border-neutral-700 p-2 hover:bg-neutral-800 active:bg-neutral-700"
    >
      {children}
    </button>
  )
}
