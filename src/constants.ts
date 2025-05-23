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

/**
 * List of Tailwind breakpoints - https://tailwindcss.com/docs/responsive-design
 */
export const tailwindBreakpoints = ['sm', 'md', 'lg', 'xl', '2xl'] as const

export type TailwindBreakpoint = (typeof tailwindBreakpoints)[number]

/**
 * List of Tailwind breakpoints - https://tailwindcss.com/docs/responsive-design
 */
export const tailwindMediaQueries = [
  '(min-width: 640px)',
  '(min-width: 768px)',
  '(min-width: 1024px)',
  '(min-width: 1280px)',
  '(min-width: 1536px)',
] as const

export type TailwindMediaQuery = (typeof tailwindMediaQueries)[number]

/**
 * List of Tailwind breakpoints - https://tailwindcss.com/docs/responsive-design
 */
export const mediaQueryMap = {
  '(min-width: 640px)': 'sm',
  '(min-width: 768px)': 'md',
  '(min-width: 1024px)': 'lg',
  '(min-width: 1280px)': 'xl',
  '(min-width: 1536px)': '2xl',
} as const

export const contentLengthHeader = 'Original-Content-Length'

/**
 * Used to power creating AudioContext's and OfflineAudioContext's. This value
 * does not need to match the original audio, it just needs to be supported by
 * the playback device.
 */
export const sampleRate = 48_000

/**
 * An id applied to the slider container and used by various event listeners to
 * grab that element.
 */
export const sliderContainerId = 'slider-container'

/**
 * A `localStorage` key that stores the value of an `atomWithStorage`.
 */
export const isPlaybackShuffledKey = 'isPlaybackShuffled'

/**
 * The triple-dot button in each row.
 */
export const rowMenuButtonClass = 'row-menu-button'

/**
 * The context menu opened by the triple-dot button in each row.
 */
export const rowContextMenuClass = 'row-context-menu'

/**
 * The amount of seconds to ramp the audio up/down when muting/unmuting.
 */
export const muteTimeSeconds = 0.01 // 10ms
