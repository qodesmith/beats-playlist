import type {ComponentProps} from 'react'

// Inspired from https://www.material-tailwind.com/docs/html/input
export function Input({
  type,
  placeholder,
  ...inputProps
}: ComponentProps<'input'>) {
  return (
    <div className="relative box-border rounded border border-t-transparent transition-all has-[:focus]:!border-t-transparent has-[:placeholder-shown]:border-t-current">
      <input
        {...inputProps}
        className="peer bg-transparent p-2"
        placeholder=" "
        type={type}
      />
      <label className="pointer-events-none absolute top-0 flex h-full w-full select-none items-stretch gap-2 peer-placeholder-shown:[&>span:first-child]:top-0 peer-placeholder-shown:[&>span:first-child]:translate-y-0 peer-placeholder-shown:[&>span:first-child]:text-base peer-placeholder-shown:[&>span:first-child]:text-current peer-focus:[&>span:first-child]:-top-[1em] peer-focus:[&>span:first-child]:-translate-y-1/2 peer-focus:[&>span:first-child]:text-xs peer-focus:[&>span:first-child]:text-neutral-400">
        {placeholder && (
          <>
            <span className="relative -top-[1em] -translate-y-1/2 self-center overflow-x-hidden text-ellipsis whitespace-nowrap pl-2 text-xs text-neutral-400 transition-all">
              {placeholder}
            </span>
            <span className="before:content[' '] relative min-w-2 flex-grow after:absolute after:bottom-0 after:left-0 after:box-content after:h-full after:w-full after:rounded-br after:rounded-tr after:border-r after:border-t" />
          </>
        )}
      </label>
    </div>
  )
}
