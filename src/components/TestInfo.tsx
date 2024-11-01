import clsx from 'clsx'
import {useAtomValue} from 'jotai'

import {isSliderDraggingAtom} from '../globalState'

/**
 * This component doesn't get bundled with production. It's only used during
 * development to visualize odds and ends (whatever is needed).
 */
export function TestInfo() {
  const isSliderDragging = useAtomValue(isSliderDraggingAtom)

  return (
    <div
      className={clsx(
        'absolute left-0 top-0 z-50 w-full break-words bg-red-800/80'
      )}
    >
      {JSON.stringify({isSliderDragging, ...import.meta.env})}
    </div>
  )
}
