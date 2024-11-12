import clsx from 'clsx'

/**
 * This component doesn't get bundled with production. It's only used during
 * development to visualize odds and ends (whatever is needed).
 */
export function TestInfo() {
  return (
    <div
      className={clsx(
        'absolute left-0 top-0 z-50 w-full break-words bg-red-800/80'
      )}
    ></div>
  )
}
