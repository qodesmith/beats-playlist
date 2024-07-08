import {useSetAtom} from 'jotai'

import {selectedBeatFileNameAtom} from './state'
import {useFetchMetadata} from '../../hooks/useFetchMetadata'

export function BeatList() {
  const {metadata} = useFetchMetadata()
  const setBeatFileName = useSetAtom(selectedBeatFileNameAtom)

  if (!metadata) return <div>Loading beats...</div>

  return (
    <ul>
      {metadata.map(({id, title, audioFileExtension}) => {
        return (
          <li
            key={id}
            onClick={() => {
              setBeatFileName(`${title} [${id}].${audioFileExtension}`)
            }}
          >
            {title}
          </li>
        )
      })}
    </ul>
  )
}
