import {useAtomValue} from 'jotai'

import {metadataSelector} from '../globalState'

// TODO - implement an actual search
/**
 * Using html to do the heavy lifting of showing suggestions as values are
 * typed into the input.
 */
export function Search() {
  const metadata = useAtomValue(metadataSelector)

  return (
    <div>
      <input type="text" list="metadata" />
      <datalist id="metadata">
        {metadata.map(v => {
          return <option key={v.id}>{v.title}</option>
        })}
      </datalist>
    </div>
  )
}
