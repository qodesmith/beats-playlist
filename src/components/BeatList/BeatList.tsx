import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback} from 'react'

import {highlightColorObj} from '../../constants'
import {
  handleClickToPlayAtom,
  metadataSelector,
  selectedArtistAtom,
  selectedBeatIdAtom,
} from '../../globalState'
import {Play} from '../Player/ControlIcons'
import {TripleDots} from '../TripleDots'
import {YouTubeLogo} from '../YouTubeLogo'

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
  const handleClickToPlay = useSetAtom(handleClickToPlayAtom)

  return (
    <div className="flex w-full flex-grow flex-col overflow-y-auto overflow-x-hidden pb-4">
      {metadata.map(
        (
          {
            id,
            title,
            channelName,
            dateAddedToPlaylist,
            durationInSeconds,
            channelUrl,
          },
          i
        ) => {
          const beatNum = i + 1
          const isCurrentBeat = selectedBeatId === id
          const containerCls = clsx(
            'group grid grid-cols-[auto_44px_1fr] gap-2 md:gap-4 md:grid-cols-[4ch_44px_1fr_10ch_5ch_30px] rounded py-2 md:p-2 scroll-mt-10',
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
          const clickToPlay = () => handleClickToPlay(id)
          const playContainerCls = clsx('absolute', !isCurrentBeat && 'hidden')

          return (
            <div key={id} id={id} className={containerCls}>
              {/* COUNTER / DOTS */}
              <div className={counterCls}>{beatNum}</div>
              <button className="px-2 md:hidden">
                <TripleDots />
              </button>

              {/* THUMBNAIL */}
              <div
                className="relative h-11 w-11 cursor-pointer place-self-center overflow-hidden rounded"
                onError={handleImageError}
                onClick={clickToPlay}
              >
                <div className={playContainerCls}>
                  <Play
                    circleFill="transparent"
                    triangleFill="white"
                    size={44}
                    triangleClass="drop-shadow-md"
                  />
                </div>
                <img src={`/thumbnails/${id}[small]`} className="h-11 w-11" />
              </div>

              {/* TITLE / ARTIST */}
              <div className="flex w-full flex-col items-start overflow-hidden">
                <div className={titleCls}>
                  <span className="cursor-pointer" onClick={clickToPlay}>
                    {title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a href={channelUrl ?? '#'} target="_blank">
                    <YouTubeLogo size={15} />
                  </a>
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
              </div>

              {/* DATE ADDED */}
              <div className="hidden items-center justify-end md:flex">
                {dateAdded}
              </div>

              {/* DURATION */}
              <div className="hidden items-center justify-start md:flex">
                {secondsToDuration(durationInSeconds)}
              </div>

              {/* DESKTOP DOTS MENU */}
              <button className="hidden h-[30px] place-items-center place-self-center md:group-hover:grid">
                <TripleDots type="horizontal" />
              </button>
            </div>
          )
        }
      )}
    </div>
  )
}
