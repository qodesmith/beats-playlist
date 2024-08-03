import type {ComponentProps} from 'react'

import clsx from 'clsx'

import {TripleDots} from '../TripleDots'

export function RowMenuButton({
  className,
  type,
}: {
  className?: string
  type: ComponentProps<typeof TripleDots>['type']
}) {
  const cls = clsx(className)

  return (
    <button className={cls}>
      <TripleDots type={type} />
    </button>
  )
}
