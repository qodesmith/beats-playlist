import type {ComponentProps} from 'react'

import {useId} from 'react'

/**
 * This version doesn't work properly after using the Tailwind 3 => 4 migration
 * tool.
 */
export function Input({
  type,
  placeholder,
  ...inputProps
}: ComponentProps<'input'>) {
  const id = useId()

  return (
    <div className="relative box-border rounded-sm border border-t-transparent transition-all has-focus:border-t-transparent! has-placeholder-shown:border-t-current">
      <input
        id={id}
        {...inputProps}
        className="peer bg-transparent p-2"
        placeholder=" "
        type={type}
      />
      <label
        htmlFor={inputProps.id ?? id}
        className="[&>span:first-child]:peer-focus:-top-[1em] [&>span:first-child]:peer-focus:-translate-y-1/2 pointer-events-none absolute top-0 flex h-full w-full select-none items-stretch gap-2 [&>span:first-child]:peer-placeholder-shown:top-0 [&>span:first-child]:peer-placeholder-shown:translate-y-0 [&>span:first-child]:peer-placeholder-shown:text-base [&>span:first-child]:peer-placeholder-shown:text-neutral-400 [&>span:first-child]:peer-focus:text-current [&>span:first-child]:peer-focus:text-xs"
      >
        {placeholder && (
          <>
            <span className="-top-[1em] -translate-y-1/2 relative self-center overflow-x-hidden text-ellipsis whitespace-nowrap pl-2 text-xs transition-all">
              {placeholder}
            </span>
            <span className="before:content[' '] relative min-w-2 grow after:absolute after:bottom-0 after:left-0 after:box-content after:h-full after:w-full after:rounded-tr after:rounded-br after:border-t after:border-r" />
          </>
        )}
      </label>
    </div>
  )
}

// Inspired from https://www.material-tailwind.com/docs/html/input
function _OriginalInput({
  type,
  placeholder,
  ...inputProps
}: ComponentProps<'input'>) {
  const id = useId()

  return (
    <div className="has-[:focus]:!border-t-transparent relative box-border rounded border border-t-transparent transition-all has-[:placeholder-shown]:border-t-current">
      <input
        id={id}
        {...inputProps}
        className="peer bg-transparent p-2"
        placeholder=" "
        type={type}
      />
      <label
        htmlFor={inputProps.id ?? id}
        className="peer-focus:[&>span:first-child]:-top-[1em] peer-focus:[&>span:first-child]:-translate-y-1/2 pointer-events-none absolute top-0 flex h-full w-full select-none items-stretch gap-2 peer-placeholder-shown:[&>span:first-child]:top-0 peer-placeholder-shown:[&>span:first-child]:translate-y-0 peer-placeholder-shown:[&>span:first-child]:text-base peer-placeholder-shown:[&>span:first-child]:text-neutral-400 peer-focus:[&>span:first-child]:text-current peer-focus:[&>span:first-child]:text-xs"
      >
        {placeholder && (
          <>
            <span className="-top-[1em] -translate-y-1/2 relative self-center overflow-x-hidden text-ellipsis whitespace-nowrap pl-2 text-xs transition-all">
              {placeholder}
            </span>
            <span className="before:content[' '] relative min-w-2 flex-grow after:absolute after:bottom-0 after:left-0 after:box-content after:h-full after:w-full after:rounded-tr after:rounded-br after:border-t after:border-r" />
          </>
        )}
      </label>
    </div>
  )
}
