import {secondsToDuration} from '@qodestack/utils'
import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback} from 'react'

import {metadataAtom, selectedBeatIdAtom} from './state'

export function BeatList() {
  const metadata = useAtomValue(metadataAtom)
  const setBeatId = useSetAtom(selectedBeatIdAtom)
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
      const img = e.target as HTMLImageElement
      img.style.display = 'none'
    },
    []
  )

  return (
    <>
      {metadata.map(
        ({id, title, channelName, dateAddedToPlaylist, durationInSeconds}) => {
          const dateAdded = new Date(dateAddedToPlaylist).toLocaleDateString()
          const loadWaveform = () => {
            setBeatId(id)
          }

          return (
            <div
              key={id}
              className="grid grid-cols-[40px_1fr_10ch_5ch]"
              onClick={loadWaveform}
            >
              {/* THUMBNAIL */}
              <div
                className="h-[40px] w-[40px] overflow-hidden rounded bg-gray-500"
                onError={handleImageError}
              >
                <img src={`/thumbnails/${id}[small]`} />
              </div>

              {/* TITLE / ARTIST */}
              <div className="flex flex-col">
                <div>{title}</div>
                <div className="text-sm opacity-50">
                  {channelName || <>&mdash;</>}
                </div>
              </div>

              {/* DATE ADDED */}
              <div>{dateAdded}</div>

              {/* DURATION */}
              <div>{secondsToDuration(durationInSeconds)}</div>
            </div>
          )
        }
      )}
    </>
  )
}
