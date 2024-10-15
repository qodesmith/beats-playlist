import type {ComponentProps} from 'react'

import clsx from 'clsx'

import {TripleDots} from '../TripleDots'

const MAX_MENU_HEIGHT = 300

export function RowMenuButton({
  className,
  type,
}: {
  className?: string
  type: ComponentProps<typeof TripleDots>['type']
}) {
  return (
    <button
      className={clsx(className)}
      onClick={e => {
        const {top} = e.currentTarget.getBoundingClientRect()

        if (top < MAX_MENU_HEIGHT + MAX_MENU_HEIGHT * 0.05) {
          // Show menu on the bottom of the button.
        }
      }}
    >
      <TripleDots type={type} />
    </button>
  )
}
