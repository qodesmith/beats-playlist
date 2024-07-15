import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtom, useAtomValue} from 'jotai'
import {useCallback} from 'react'

import {metadataAtom, selectedBeatIdAtom} from './state'
import {highlightColorObj} from '../../constants'

export function BeatList() {
  const metadata = useAtomValue(metadataAtom)
  const [beatId, setBeatId] = useAtom(selectedBeatIdAtom)
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
      const img = e.target as HTMLImageElement
      const parent = img.parentElement as HTMLDivElement
      img.style.display = 'none'
      parent.style.backgroundColor = 'gray'
    },
    []
  )

  return (
    <div className="flex flex-grow flex-col overflow-y-auto pb-4">
      {metadata.map(
        (
          {id, title, channelName, dateAddedToPlaylist, durationInSeconds},
          i
        ) => {
          const isCurrentBeat = beatId === id
          const counterCls = clsx('flex items-center justify-end', {
            'opacity-50': !isCurrentBeat,
            [highlightColorObj.text]: isCurrentBeat,
          })
          const titleCls = clsx(beatId === id && highlightColorObj.text)
          const containerCls = clsx(
            'grid grid-cols-[4ch_40px_1fr_10ch_5ch] gap-4 rounded p-2',
            {
              'hover:bg-neutral-800': !isCurrentBeat,
              'bg-neutral-700': isCurrentBeat,
            }
          )
          const dateAdded = new Date(dateAddedToPlaylist).toLocaleDateString()
          const loadWaveform = () => {
            setBeatId(id)
          }

          return (
            <div key={id} className={containerCls} onClick={loadWaveform}>
              {/* COUNTER */}
              <div className={counterCls}>{i + 1}</div>

              {/* THUMBNAIL */}
              <div
                className="flex w-[40px] items-center justify-center overflow-hidden rounded"
                onError={handleImageError}
              >
                <img src={`/thumbnails/${id}[small]`} className="rounded" />
              </div>

              {/* TITLE / ARTIST */}
              <div className="flex flex-col">
                <div className={titleCls}>{title}</div>
                <div className={`text-sm opacity-50`}>
                  {channelName || <>&mdash;</>}
                </div>
              </div>

              {/* DATE ADDED */}
              <div className="flex items-center justify-end">{dateAdded}</div>

              {/* DURATION */}
              <div className="flex items-center justify-start">
                {secondsToDuration(durationInSeconds)}
              </div>
            </div>
          )
        }
      )}
    </div>
  )
}
