import type {Video} from '@qodestack/dl-yt-playlist'

import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback, useState} from 'react'

import {RowMenuButton} from './RowMenuButton'
import {highlightColorObj} from '../../constants'
import {
  handleClickToPlayAtom,
  selectedArtistAtom,
  selectedBeatIdAtom,
} from '../../globalState'
import {useCompareTailwindBreakpoint} from '../../hooks/useCompareTailwindBreakpoint'
import {store} from '../../store'
import {Play} from '../Player/ControlIcons'
import {YouTubeLogo} from '../YouTubeLogo'

type Props = {
  video: Video
  rowNum: number
}

export function BeatListItem({video, rowNum}: Props) {
  const {
    id,
    title,
    channelName,
    dateAddedToPlaylist,
    durationInSeconds,
    channelUrl,
  } = video
  const [shouldScrollTitle, setShouldScrollTitle] = useState(false)
  const selectedBeatId = useAtomValue(selectedBeatIdAtom)
  const isSelected = selectedBeatId === id
  const dateAdded = new Date(dateAddedToPlaylist).toLocaleDateString()
  const setSelectedArtist = useSetAtom(selectedArtistAtom)
  const handleClickToPlay = useCallback(() => {
    store.set(handleClickToPlayAtom, id)
  }, [id])
  const handleTouchStart = useCallback(() => {
    setShouldScrollTitle(true)
  }, [])
  const handleTouchEnd = useCallback(() => {
    setShouldScrollTitle(false)
  }, [])
  const isBelowMedium = useCompareTailwindBreakpoint('<', 'md')

  return (
    <div
      id={id}
      className={clsx(
        'group grid scroll-mt-10 grid-cols-[auto_44px_1fr] items-center gap-2 rounded py-2 md:grid-cols-[4ch_44px_1fr_10ch_5ch_30px] md:gap-4 md:p-2',
        {
          'md:hover:bg-neutral-800': !isSelected,
          'md:bg-neutral-700': isSelected,
        }
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ROW NUMBER / DOTS */}
      {!isBelowMedium && (
        <div
          className={clsx('flex items-center justify-end', {
            'opacity-50': !isSelected,
            [highlightColorObj.text]: isSelected,
          })}
        >
          {rowNum}
        </div>
      )}

      {/* MENU BUTTON - MOBILE */}
      {isBelowMedium && <RowMenuButton className="px-2" type="vertical" />}

      {/* THUMBNAIL */}
      <button
        className="h-11 w-11 rounded bg-neutral-500 bg-cover bg-center"
        style={{
          backgroundImage: `url("/api/thumbnails/${id}[small]")`,
        }}
        onClick={handleClickToPlay}
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
            [highlightColorObj.text]: isSelected,
          })}
          onClick={handleClickToPlay}
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
      {!isBelowMedium && (
        <div className="flex items-center justify-end">{dateAdded}</div>
      )}

      {/* DURATION */}
      {!isBelowMedium && (
        <div className="flex items-center justify-start">
          {secondsToDuration(durationInSeconds)}
        </div>
      )}

      {/* MENU BUTTON - DESKTOP */}
      {!isBelowMedium && (
        <RowMenuButton
          className="h-[30px] place-items-center place-self-center group-hover:grid"
          type="horizontal"
        />
      )}
    </div>
  )
}
