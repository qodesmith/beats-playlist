// import {HeaderButtonAndMenu} from './HeaderButtonAndMenu'
import {useAtomValue} from 'jotai'

import {HeaderButtonAndMenu} from './HeaderButtonAndMenu'
import {RandomizeListButton} from './RandomizeListButton'
import {Search} from './Search'
import {UnknownButton} from './UnknownButton'
import {unknownMetadataAtom} from '../../globalState'

export function HeaderButtonGroup() {
  const unknownMetadata = useAtomValue(unknownMetadataAtom)

  return (
    <div className="absolute right-2 flex h-10 gap-2 md:relative">
      <Search />
      {unknownMetadata.length > 0 && <UnknownButton />}
      <RandomizeListButton />
      <HeaderButtonAndMenu />
    </div>
  )
}
