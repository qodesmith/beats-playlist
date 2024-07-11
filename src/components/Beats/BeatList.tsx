import {useSetAtom} from 'jotai'
import {useCallback, useState} from 'react'

import {selectedBeatFileNameAtom} from './state'
import {useFetchMetadata} from '../../hooks/useFetchMetadata'

export function BeatList() {
  const {metadata} = useFetchMetadata()
  const setBeatFileName = useSetAtom(selectedBeatFileNameAtom)

  if (!metadata) return <div>Loading beats...</div>

  return (
    <ul>
      {metadata
        .filter(item => item.isUnavailable)
        .map(({id, title, audioFileExtension, channelName}) => {
          return (
            <li
              key={id}
              className="mb-4 flex items-center gap-2"
              onClick={() => {
                setBeatFileName(`${title} [${id}].${audioFileExtension}`)
              }}
            >
              <ThumbnailImage src={`/thumbnails/${id}[small]`} />
              <div className="flex flex-col">
                <div>{title}</div>
                <div className="text-sm opacity-50">
                  {channelName || <>&mdash;</>}
                </div>
              </div>
            </li>
          )
        })}
    </ul>
  )
}

function ThumbnailImage({src}: {src: string}) {
  const [showDefault, setShowDefault] = useState(false)
  const handleImgError = useCallback(() => {
    setShowDefault(true)
  }, [])

  return showDefault ? (
    <div className="h-[40px] w-[40px] rounded bg-gray-500" />
  ) : (
    <img
      src={src}
      className="h-[40px] w-[40px] rounded"
      onError={handleImgError}
    />
  )
}
