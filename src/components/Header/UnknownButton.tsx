import clsx from 'clsx'
import {useAtom} from 'jotai'
import {useCallback} from 'react'

import {HeaderButton} from './HeaderButton'
import {isUnknownMetadataAtom} from '../../globalState'

export function UnknownButton() {
  const [isUnknownMetadata, setIsUnknownMetadata] = useAtom(
    isUnknownMetadataAtom
  )
  const cls = clsx(isUnknownMetadata && 'text-lime-500')
  const toggleUnknown = useCallback(() => {
    setIsUnknownMetadata(v => !v)
  }, [setIsUnknownMetadata])

  return (
    <HeaderButton className={cls} onClick={toggleUnknown}>
      ?
    </HeaderButton>
  )
}