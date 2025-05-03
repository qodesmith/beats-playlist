// import {HeaderButtonAndMenu} from './HeaderButtonAndMenu'
// import {HeaderButtonAndMenu} from './HeaderButtonAndMenu'
import {useAtomValue} from 'jotai'

import {unknownMetadataAtom} from '../../globalState'
import {RandomizeListButton} from './RandomizeListButton'
import {UnknownButton} from './UnknownButton'

export function HeaderButtonGroup() {
  const unknownMetadata = useAtomValue(unknownMetadataAtom)

  return (
    <div className="absolute right-2 z-10 flex h-10 select-none gap-2 md:relative">
      {unknownMetadata.length > 0 && <UnknownButton />}
      <RandomizeListButton />
      {/* <HeaderButtonAndMenu /> */}
    </div>
  )
}
