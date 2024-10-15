import clsx from 'clsx'
import {useAtom} from 'jotai'
import {useRef, useState} from 'react'

import {HeaderButton} from './HeaderButton'
import {searchAtom} from '../../globalState'

export function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useAtom(searchAtom)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerCls = clsx('flex rounded', {
    'bg-transparent': !isOpen,
    'bg-neutral-900': isOpen,
  })
  const inputContainerCls = clsx(
    'rounded border border-neutral-700 transition-all duration-200 overflow-hidden flex items-center',
    {
      'ml-2 w-56': isOpen,
      'ml-0 w-0 border-0 ml-0': !isOpen,
    }
  )

  return (
    <div className={containerCls}>
      <HeaderButton
        onClick={() => {
          if (isOpen) {
            // Closing
            setSearch('')
            inputRef.current?.blur()
          } else {
            // Opening
            inputRef.current?.focus()
          }

          setIsOpen(v => !v)
        }}
      >
        🔎
      </HeaderButton>
      <div className={inputContainerCls}>
        <input
          ref={inputRef}
          type="text"
          className="m-2 flex-1 bg-transparent"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {!!search && (
          <button className="select-none p-2" onClick={() => setSearch('')}>
            &times;
          </button>
        )}
      </div>
    </div>
  )
}
