import clsx from 'clsx'
import {useAtomValue} from 'jotai'
import {memo} from 'react'

import {BeatListItem} from './BeatListItem'
import {rowContextMenuDataAtom, visualMetadataSelector} from '../../globalState'

export function BeatList() {
  const isMenuOpen = !!useAtomValue(rowContextMenuDataAtom)

  return (
    <div
      className={clsx(
        'flex w-full flex-grow flex-col overflow-x-hidden px-2',
        isMenuOpen ? 'overflow-y-hidden' : 'overflow-y-auto'
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
