import {useAtomValue} from 'jotai'

import {BeatListItem} from './BeatListItem'
import {metadataSelector} from '../../globalState'

export function BeatList() {
  const metadata = useAtomValue(metadataSelector)

  return (
    <div className="flex w-full flex-grow flex-col overflow-y-auto overflow-x-hidden px-2">
      {metadata.map((video, i) => {
        return <BeatListItem key={video.id} video={video} rowNum={i + 1} />
      })}
    </div>
  )
}
