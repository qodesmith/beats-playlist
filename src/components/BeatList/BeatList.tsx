import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtom, useAtomValue, useSetAtom} from 'jotai'
import {useCallback} from 'react'

import {highlightColorObj} from '../../constants'
import {
  currentAudioStateAtom,
  metadataAtom,
  selectedBeatIdAtom,
} from '../../globalState'
import {scrollBeatIntoView} from '../../utils'
import {TripleDots} from '../TripleDots'

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
  const setAudioState = useSetAtom(currentAudioStateAtom)
  const setPlaying = useCallback(() => {
    setAudioState('playing')
  }, [setAudioState])

  return (
    <div className="flex w-full flex-grow flex-col overflow-y-auto overflow-x-hidden pb-4">
      {metadata.map(
        (
          {id, title, channelName, dateAddedToPlaylist, durationInSeconds},
          i
        ) => {
          const isCurrentBeat = beatId === id
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
            [highlightColorObj.text]: beatId === id,
          })
          const dateAdded = new Date(dateAddedToPlaylist).toLocaleDateString()
          const playBeat = () => {
            setPlaying()
            setBeatId(id)
            scrollBeatIntoView(id, {behavior: 'smooth', block: 'nearest'})
          }

          return (
            <div key={id} id={id} className={containerCls}>
              {/* COUNTER / DOTS */}
              <div className={counterCls}>{i + 1}</div>
              <button className="px-2 md:hidden">
                <TripleDots />
              </button>

              {/* THUMBNAIL */}
              <div
                className="h-11 w-11 cursor-pointer place-self-center overflow-hidden rounded"
                onError={handleImageError}
                onClick={playBeat}
              >
                <img src={`/thumbnails/${id}[small]`} className="h-11 w-11" />
              </div>

              {/* TITLE / ARTIST */}
              <div className="flex w-full flex-col items-start overflow-hidden">
                <div className={titleCls}>{title}</div>
                <div className="cursor-pointer p-0.5 pl-0 text-sm opacity-50 md:p-1 md:pl-0">
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
