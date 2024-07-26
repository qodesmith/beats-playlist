import {useAtom, useAtomValue} from 'jotai'
import {metadataItemSelector, selectedArtistAtom} from '../globalState'
import {highlightColorObj} from '../constants'
import clsx from 'clsx'
import {CloseButton} from './CloseButton'
import {useCallback} from 'react'

export function NowPlaying() {
  const [selectedArtist, setSelectedArtist] = useAtom(selectedArtistAtom)
  const {channelName, title} = useAtomValue(metadataItemSelector) ?? {}
  const isSelectedArtist = selectedArtist === channelName
  const nameCls = clsx('font-bold rounded flex', {
    [highlightColorObj.bg]: isSelectedArtist,
    [highlightColorObj.text]: !isSelectedArtist,
    'text-black pr-2': isSelectedArtist,
  })
  const clearArtist = useCallback(() => {
    setSelectedArtist(undefined)
  }, [])

  return (
    <div className="flex gap-2 pb-2">
      <div>🎵</div>
      {channelName && title && (
        <>
          <div className={nameCls}>
            {isSelectedArtist && (
              <CloseButton
                size={14}
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
