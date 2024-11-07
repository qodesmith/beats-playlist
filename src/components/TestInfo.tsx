import clsx from 'clsx'
import {useAtomValue} from 'jotai'

import {progressPercentAtom} from '../AudioThing'

/**
 * This component doesn't get bundled with production. It's only used during
 * development to visualize odds and ends (whatever is needed).
 */
export function TestInfo() {
  return (
    <div
      className={clsx(
        'absolute left-0 top-0 z-50 w-full break-words bg-red-800/80'
      )}
    >
      <Progress />
    </div>
  )
}

function Progress() {
  return Math.round(useAtomValue(progressPercentAtom))
}
