import clsx from 'clsx'
import {useAtom, useAtomValue} from 'jotai'
import {useCallback} from 'react'

import {CloseButton} from './CloseButton'
import {highlightColorObj} from '../constants'
import {metadataItemSelector, selectedArtistAtom} from '../globalState'

export function NowPlaying() {
  const [selectedArtist, setSelectedArtist] = useAtom(selectedArtistAtom)
  const {channelName, title} = useAtomValue(metadataItemSelector) ?? {}
  const isSelectedArtist = selectedArtist === channelName
  const clearArtist = useCallback(() => {
    setSelectedArtist(undefined)
  }, [setSelectedArtist])

  return (
    <div className="flex items-center gap-2 pb-2">
      <div>🎵</div>
      {channelName && title && (
        <>
          <div
            className={clsx('flex items-center self-start rounded font-bold', {
              [highlightColorObj.bg]: isSelectedArtist,
              [highlightColorObj.text]: !isSelectedArtist,
              'pr-2 text-black': isSelectedArtist,
            })}
          >
            {isSelectedArtist && (
              <CloseButton
                size={23}
                className="cursor-pointer px-2"
                onClick={clearArtist}
                fill="black"
              />
            )}
            <div>{channelName}</div>
          </div>
          <div>&mdash;</div>
          <div>{title}</div>
        </>
      )}
    </div>
  )
}
