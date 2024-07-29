import {useAtomValue} from 'jotai'

import {progressWidthSelector} from '../../globalState'

export function ProgressOverlay() {
  const progress = useAtomValue(progressWidthSelector)
  const width = (1 - progress) * 100

  return (
    <div
      className="absolute right-0 top-0 h-full w-full backdrop-saturate-0"
      style={{width: `${width}%`}}
    />
  )
}
