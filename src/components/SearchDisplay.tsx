import {useAtom} from 'jotai'
import {useCallback} from 'react'

import {searchAtom, selectedArtistAtom} from '../globalState'
import {Chip} from './Chip'

export function SearchDisplay() {
  const [searchValue, setSearchValue] = useAtom(searchAtom)
  const clearSearchValue = useCallback(() => {
    setSearchValue('')
  }, [])
  const [selectedArtist, setSelectedArtist] = useAtom(selectedArtistAtom)
  const clearSelectedArtist = useCallback(() => {
    setSelectedArtist(undefined)
  }, [])

  return (
    <div className="flex h-8 flex-shrink-0 items-center gap-2 px-2 font-bold text-sm uppercase">
      {selectedArtist && (
        <Chip text={selectedArtist} onClose={clearSelectedArtist} />
      )}
      {searchValue && <Chip text={searchValue} onClose={clearSearchValue} />}
    </div>
  )
}
