export const highlightColorObj = {
  name: 'puerto-rico-400',
  text: 'text-puerto-rico-400',
  textHover: 'hover:text-puerto-rico-400',
  bg: 'bg-puerto-rico-400',
} as const

/**
 * Spotify normalizes audio to a default reference level of -14 LUFS for
 * individual tracks. Additionally, Spotify offers user-selectable levels of
 * -19 LUFS and -11 LUFS, allowing listeners to customize their experience based
 * on their preferences.
 *
 * YouTube: -14
 * Apple Music: -16
 * Music mastering suggested limit: -10
 */
export const TARGET_LUFS = -14

export const MAX_VOLUME_MULTIPLIER = 1.5

// List of Tailwind breakpoints - https://tailwindcss.com/docs/responsive-design
export const tailwindBreakpoints = ['sm', 'md', 'lg', 'xl', '2xl'] as const

export type TailwindBreakpoint = (typeof tailwindBreakpoints)[number]

export const tailwindMediaQueries = [
  '(min-width: 640px)',
  '(min-width: 768px)',
  '(min-width: 1024px)',
  '(min-width: 1280px)',
  '(min-width: 1536px)',
] as const

export type TailwindMediaQuery = (typeof tailwindMediaQueries)[number]

export const mediaQueryMap = {
  '(min-width: 640px)': 'sm',
  '(min-width: 768px)': 'md',
  '(min-width: 1024px)': 'lg',
  '(min-width: 1280px)': 'xl',
  '(min-width: 1536px)': '2xl',
} as const
