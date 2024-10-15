import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtomValue, useSetAtom} from 'jotai'

import {RowMenuButton} from './RowMenuButton'
import {highlightColorObj} from '../../constants'
import {
  handleClickToPlayAtom,
  metadataSelector,
  selectedArtistAtom,
  selectedBeatIdAtom,
} from '../../globalState'
import {Play} from '../Player/ControlIcons'
import {YouTubeLogo} from '../YouTubeLogo'

export function BeatList() {
  const metadata = useAtomValue(metadataSelector)
  const setSelectedArtist = useSetAtom(selectedArtistAtom)
  const selectedBeatId = useAtomValue(selectedBeatIdAtom)
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
          const dateAdded = new Date(dateAddedToPlaylist).toLocaleDateString()
          const clickToPlay = () => handleClickToPlay(id)

          return (
            <div
              key={id}
              id={id}
              className={clsx(
                'group grid scroll-mt-10 grid-cols-[auto_44px_1fr] items-center gap-2 rounded py-2 md:grid-cols-[4ch_44px_1fr_10ch_5ch_30px] md:gap-4 md:p-2',
                {
                  'md:hover:bg-neutral-800': !isCurrentBeat,
                  'md:bg-neutral-700': isCurrentBeat,
                }
              )}
            >
              {/* COUNTER / DOTS */}
              <div
                className={clsx('hidden items-center justify-end md:flex', {
                  'opacity-50': !isCurrentBeat,
                  [highlightColorObj.text]: isCurrentBeat,
                })}
              >
                {beatNum}
              </div>

              {/* MENU BUTTON - MOBILE */}
              <RowMenuButton className="px-2 md:hidden" type="vertical" />

              {/* THUMBNAIL */}
              <button
                className="h-11 w-11 rounded bg-neutral-500 bg-cover bg-center"
                style={{
                  backgroundImage: `url("/api/thumbnails/${id}[small]")`,
                }}
                onClick={clickToPlay}
              >
                <Play
                  circleFill="transparent"
                  triangleFill="white"
                  size={44}
                  triangleClass="drop-shadow-md"
                />
              </button>

              {/* TITLE / ARTIST */}
              <div className="flex w-full flex-col items-start overflow-hidden">
                <button
                  className={clsx('truncate', {
                    [highlightColorObj.text]: isCurrentBeat,
                  })}
                  onClick={clickToPlay}
                >
                  {title}
                </button>
                <div className="flex items-center gap-3">
                  <a href={channelUrl ?? '#'} target="_blank">
                    <YouTubeLogo size={15} />
                  </a>
                  <button
                    className={clsx(
                      highlightColorObj.textHover,
                      'p-0.5 pl-0 text-sm text-neutral-500 md:p-1 md:pl-0'
                    )}
                    onClick={() => {
                      setSelectedArtist(v => {
                        return v === undefined ? channelName : undefined
                      })
                    }}
                  >
                    {channelName || <>&mdash;</>}
                  </button>
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

              {/* MENU BUTTON - DESKTOP */}
              <RowMenuButton
                className="hidden h-[30px] place-items-center place-self-center md:group-hover:grid"
                type="horizontal"
              />
            </div>
          )
        }
      )}
    </div>
  )
}
