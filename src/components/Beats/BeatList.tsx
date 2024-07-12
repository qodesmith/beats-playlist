import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback, useState} from 'react'

import {metadataAtom, selectedBeatFileNameAtom} from './state'

export function BeatList() {
  const metadata = useAtomValue(metadataAtom)
  const setBeatFileName = useSetAtom(selectedBeatFileNameAtom)

  return (
    <ul>
      {metadata.map(({id, title, audioFileExtension, channelName}) => {
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
