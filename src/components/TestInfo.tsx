import clsx from 'clsx'

/**
 * This component doesn't get bundled with production. It's only used during
 * development to visualize odds and ends (whatever is needed).
 */
export function TestInfo() {
  return (
    <div
      className={clsx(
        'absolute top-0 left-0 z-50 w-full break-words bg-red-800/80'
      )}
    />
  )
}
