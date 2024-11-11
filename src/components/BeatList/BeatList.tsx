import clsx from 'clsx'
import {useAtomValue} from 'jotai'
import {memo} from 'react'

import {BeatListItem} from './BeatListItem'
import {rowContextMenuIdAtom, visualMetadataSelector} from '../../globalState'

export function BeatList() {
  const rowContextMenuId = useAtomValue(rowContextMenuIdAtom)

  return (
    <div
      className={clsx(
        'flex w-full flex-grow flex-col overflow-x-hidden px-2',
        rowContextMenuId ? 'overflow-y-hidden' : 'overflow-y-auto'
      )}
    >
      <BeatListItems />
    </div>
  )
}

/**
 * Prevent this list from re-rendering when its parent re-renders.
 */
const BeatListItems = memo(function BeatListItems() {
  const visualMetadata = useAtomValue(visualMetadataSelector)

  return (
    <>
      {visualMetadata.map((video, i) => {
        return <BeatListItem key={video.id} video={video} rowNum={i + 1} />
      })}
    </>
  )
})
