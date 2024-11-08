import {useAtom, useSetAtom} from 'jotai'
import {useCallback, useEffect, useRef} from 'react'

import {isSearchOpenAtom, searchAtom} from '../../globalState'
import {useScrollToFooterForMobileSearch} from '../../hooks/useScrollToFooterForMobileSearch'

export function FooterSearch({footerId}: {footerId: string}) {
  const setSearchValue = useSetAtom(searchAtom)
  const [isSearchOpen, setIsSearchOpen] = useAtom(isSearchOpenAtom)
  const inputRef = useRef<HTMLInputElement>(null)
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsSearchOpen(false)
      setSearchValue(inputRef.current?.value ?? '')
    },
    [setIsSearchOpen, setSearchValue]
  )

  useScrollToFooterForMobileSearch(footerId)

  // Focus, blur, and reset the vanilla input field.
  useEffect(() => {
    const input = inputRef.current

    if (input) {
      if (isSearchOpen) {
        input.focus()
      } else {
        input.blur()
        input.value = ''
      }
    }
  }, [footerId, isSearchOpen, setSearchValue])

  return (
    <form
      className="flex items-center gap-2 sm:flex-col"
      onSubmit={handleSubmit}
    >
      <input
        ref={inputRef}
        name="search"
        type="text"
        className="border-b bg-transparent text-center sm:text-xl"
        placeholder="Enter a search term"
      />
      <button
        type="submit"
        className="hidden rounded border px-2 py-1 sm:block"
      >
        Search
      </button>
    </form>
  )
}
