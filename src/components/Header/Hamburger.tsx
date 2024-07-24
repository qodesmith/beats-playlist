import clsx from 'clsx'

export function Hamburger({
  isOpen,
  size = 30,
  fill = 'white',
}: {
  isOpen: boolean
  size?: number
  fill?: string
}) {
  const baseCls = 'transition-all duration-200 origin-center'
  const outerBase = 'translate-x-1/2 w-0 opacity-0'
  const topCls = clsx(baseCls, {
    [outerBase]: isOpen,
    'translate-y-[13px]': isOpen,
  })
  const middleCls = clsx(baseCls, {'rotate-45': isOpen})
  const middleCls2 = clsx(baseCls, {'-rotate-45': isOpen})
  const bottomCls = clsx(baseCls, {
    [outerBase]: isOpen,
    'translate-y-[-13px]': isOpen,
  })

  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill={fill}>
      <rect width="30" height="4" rx="2" className={topCls} />
      <rect y="13" width="30" height="4" rx="2" className={middleCls} />
      <rect y="13" width="30" height="4" rx="2" className={middleCls2} />
      <rect y="26" width="30" height="4" rx="2" className={bottomCls} />
    </svg>
  )
}
