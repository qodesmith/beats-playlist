import type {Video} from '@qodestack/dl-yt-playlist'

import {secondsToDuration} from '@qodestack/utils'
import clsx from 'clsx'
import {useAtom, useAtomValue, useSetAtom} from 'jotai'
import {useCallback, useMemo, useRef, useState} from 'react'

import {handlePlayPause, isPlayingAtom} from '../../AudioThing'
import {highlightColorObj} from '../../constants'
import {selectedArtistAtom, selectedBeatIdAtom} from '../../globalState'
import {useCompareTailwindBreakpoint} from '../../hooks/useCompareTailwindBreakpoint'
import {getRandomRgb} from '../../utils'
import {Play} from '../Player/ControlIcons'
import {RowMenuButton} from './RowMenuButton'

type Props = {
  video: Video
  rowNum: number
}

export function BeatListItem({video, rowNum}: Props) {
  const {id, title, channelName, dateAddedToPlaylist, durationInSeconds} = video
  const [shouldScrollTitle, setShouldScrollTitle] = useState(false)
  const scrollRef = useRef<{difference: number; percent: number} | undefined>(
    undefined
  )
  const [selectedBeatId, setSelectedBeatId] = useAtom(selectedBeatIdAtom)
  const isSelected = selectedBeatId === id
  const dateAdded = new Date(dateAddedToPlaylist).toLocaleDateString()
  const setSelectedArtist = useSetAtom(selectedArtistAtom)
  const isPlaying = useAtomValue(isPlayingAtom)
  const handleClickToPlay = useCallback(() => {
    /**
     * Clicking the thumbnail or title should only trigger the initial playback.
     * Clicking them again should have no effect.
     */
    if (!(isPlaying && isSelected)) {
      setSelectedBeatId(id)
      handlePlayPause()
    }
  }, [id, isPlaying, isSelected])
  const handleTouchStart = useCallback(() => {
    setShouldScrollTitle(true)
  }, [])
  const handleTouchEnd = useCallback(() => {
    setShouldScrollTitle(false)
  }, [])
  const isBelowMedium = useCompareTailwindBreakpoint('<', 'md')
  const thumbnailStyle = useMemo(() => {
    const rgb1 = getRandomRgb()
    const rgb2 = getRandomRgb()

    return {
      backgroundImage: `url("/api/thumbnails/${id}[small]"), linear-gradient(to bottom right, ${rgb1}, ${rgb2})`,
    }
  }, [id])

  return (
    <div
      id={id}
      className={clsx(
        'group grid scroll-mt-10 grid-cols-[auto_44px_1fr] items-center gap-2 rounded-sm py-2 md:grid-cols-[4ch_44px_1fr_10ch_5ch_30px] md:gap-4 md:p-2',
        {
          'md:hover:bg-neutral-800': !isSelected,
          'md:bg-neutral-700': isSelected,
        }
      )}
    >
      {/* ROW NUMBER / DOTS */}
      {!isBelowMedium && (
        <div
          className={clsx('flex select-none items-center justify-end', {
            'opacity-50': !isSelected,
            [highlightColorObj.text]: isSelected,
          })}
        >
          {rowNum}
        </div>
      )}

      {/* MENU BUTTON - MOBILE */}
      {isBelowMedium && (
        <RowMenuButton
          type="vertical"
          isBelowMedium={isBelowMedium}
          beatId={id}
        />
      )}

      {/* THUMBNAIL */}
      <button
        type="button"
        className="h-11 w-11 rounded-sm bg-center bg-cover"
        style={thumbnailStyle}
        onClick={handleClickToPlay}
      >
        {isSelected && (
          <Play
            circleFill="transparent"
            triangleFill="white"
            size={44}
            triangleClass="drop-shadow-md"
          />
        )}
      </button>

      {/* TITLE / ARTIST */}
      <div className="flex w-full select-none flex-col items-start overflow-hidden">
        <button
          type="button"
          className={clsx('text-nowrap transition-transform ease-linear', {
            [highlightColorObj.text]: isSelected,
          })}
          style={
            shouldScrollTitle && scrollRef.current
              ? {
                  transform: `translateX(-${scrollRef.current.difference}px)`,
                  transitionDuration: `${250 * scrollRef.current.percent}ms`,
                }
              : undefined
          }
          ref={button => {
            if (button) {
              // '521px' => 521
              const buttonWidth = +getComputedStyle(button).width.slice(0, -2)
              const parentWidth = +getComputedStyle(
                button.parentElement!
              ).width.slice(0, -2)

              if (buttonWidth > parentWidth) {
                const difference = buttonWidth - parentWidth
                const percent = ((parentWidth / 100) * difference) / 100 // 0 - 1

                scrollRef.current = {difference, percent}
              }
            }
          }}
          onClick={handleClickToPlay}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {title}
        </button>
        <button
          type="button"
          className={clsx(
            highlightColorObj.textHover,
            'p-0.5 pl-0 text-neutral-500 text-sm md:p-1 md:pl-0'
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
          type="horizontal"
          isBelowMedium={isBelowMedium}
          beatId={id}
        />
      )}
    </div>
  )
}
