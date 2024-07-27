import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback} from 'react'

import {highlightColorObj} from '../../constants'
import {
  handleThumbnailClickAtom,
  metadataSelector,
  selectedArtistAtom,
  selectedBeatIdAtom,
} from '../../globalState'
import {TripleDots} from '../TripleDots'

export function BeatList() {
  const metadata = useAtomValue(metadataSelector)
  const setSelectedArtist = useSetAtom(selectedArtistAtom)
  const selectedBeatId = useAtomValue(selectedBeatIdAtom)
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLDivElement, Event>) => {
      const img = e.target as HTMLImageElement
      const parent = img.parentElement as HTMLDivElement
      img.style.display = 'none'
      parent.style.backgroundColor = 'gray'
    },
    []
  )
  const handleThumbnailClick = useSetAtom(handleThumbnailClickAtom)

  return (
    <div className="flex w-full flex-grow flex-col overflow-y-auto overflow-x-hidden pb-4">
      {metadata.map(
        (
          {id, title, channelName, dateAddedToPlaylist, durationInSeconds},
          i
        ) => {
          const beatNum = i + 1
          const isCurrentBeat = selectedBeatId === id
          const containerCls = clsx(
            'grid grid-cols-[auto_44px_1fr] gap-2 md:gap-4 md:grid-cols-[4ch_44px_1fr_10ch_5ch] rounded py-2 md:p-2 scroll-mt-10',
            {
              'md:hover:bg-neutral-800': !isCurrentBeat,
              'md:bg-neutral-700': isCurrentBeat,
            }
          )
          const counterCls = clsx('hidden md:flex items-center justify-end', {
            'opacity-50': !isCurrentBeat,
            [highlightColorObj.text]: isCurrentBeat,
          })
          const titleCls = clsx('w-full truncate', {
            [highlightColorObj.text]: isCurrentBeat,
          })
          const artistCls = clsx(
            highlightColorObj.textHover,
            'cursor-pointer p-0.5 pl-0 text-sm text-neutral-500 md:p-1 md:pl-0'
          )
          const dateAdded = new Date(dateAddedToPlaylist).toLocaleDateString()

          return (
            <div key={id} id={id} className={containerCls}>
              {/* COUNTER / DOTS */}
              <div className={counterCls}>{beatNum}</div>
              <button className="px-2 md:hidden">
                <TripleDots />
              </button>

              {/* THUMBNAIL */}
              <div
                className="h-11 w-11 cursor-pointer place-self-center overflow-hidden rounded"
                onError={handleImageError}
                onClick={() => handleThumbnailClick(id)}
              >
                <img src={`/thumbnails/${id}[small]`} className="h-11 w-11" />
              </div>

              {/* TITLE / ARTIST */}
              <div className="flex w-full flex-col items-start overflow-hidden">
                <div className={titleCls}>{title}</div>
                <div
                  className={artistCls}
                  onClick={() => {
                    setSelectedArtist(v => {
                      return v === undefined ? channelName : undefined
                    })
                  }}
                >
                  {channelName || <>&mdash;</>}
                </div>
              </div>

              {/* DATE ADDED */}
              <div className="hidden items-center justify-end md:flex">
                {dateAdded}
              </div>

              {/* DURATION */}
              <div className="hidden items-center justify-start md:flex">
                {secondsToDuration(durationInSeconds)}
              </div>
            </div>
          )
        }
      )}
    </div>
  )
}
