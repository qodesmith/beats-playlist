import {useAtomValue} from 'jotai'

import {BeatListItem} from './BeatListItem'
import {visualMetadataSelector} from '../../globalState'

export function BeatList() {
  const visualMetadata = useAtomValue(visualMetadataSelector)

  return (
    <div className="flex w-full flex-grow flex-col overflow-y-auto overflow-x-hidden px-2">
      {visualMetadata.map((video, i) => {
        return <BeatListItem key={video.id} video={video} rowNum={i + 1} />
      })}
    </div>
  )
}
