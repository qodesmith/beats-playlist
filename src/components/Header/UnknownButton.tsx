import clsx from 'clsx'
import {useAtom} from 'jotai'
import {useCallback} from 'react'

import {isUnknownMetadataAtom} from '../../globalState'
import {HeaderButton} from './HeaderButton'

export function UnknownButton() {
  const [isUnknownMetadata, setIsUnknownMetadata] = useAtom(
    isUnknownMetadataAtom
  )
  const toggleUnknown = useCallback(() => {
    setIsUnknownMetadata(v => !v)
  }, [])

  return (
    <HeaderButton
      className={clsx(isUnknownMetadata && 'text-lime-500')}
      onClick={toggleUnknown}
    >
      ?
    </HeaderButton>
  )
}
