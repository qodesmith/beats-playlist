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
            'grid grid-cols-[4ch_44px_1fr] gap-4 md:grid-cols-[4ch_44px_1fr_10ch_5ch] rounded md:p-2 scroll-mt-10',
            {
              'hover:bg-neutral-800': !isCurrentBeat,
              'bg-neutral-700': isCurrentBeat,
            }
          )
          const dateAdded = new Date(dateAddedToPlaylist).toLocaleDateString()
          const playBeat = () => {
            setPlaying()
            setBeatId(id)
          }

          return (
            <div key={id} id={id} className={containerCls}>
              {/* COUNTER */}
              <div className={counterCls}>{i + 1}</div>

              {/* THUMBNAIL */}
              <div
                className="h-11 w-11 cursor-pointer place-self-center overflow-hidden rounded"
                onError={handleImageError}
                onClick={playBeat}
              >
                <img src={`/thumbnails/${id}[small]`} className="h-11 w-11" />
              </div>

              {/* TITLE / ARTIST */}
              <div className="flex flex-col items-start">
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
