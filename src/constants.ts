export const highlightColorObj = {
  name: 'puerto-rico-400',
  text: 'text-puerto-rico-400',
  bg: 'bg-puerto-rico-400',
} as const

/**
 * Spotify normalizes audio to a default reference level of -14 LUFS for
 * individual tracks. Additionally, Spotify offers user-selectable levels of
 * -19 LUFS and -11 LUFS, allowing listeners to customize their experience based
 * on their preferences.
 *
 * YouTube: -14
 * Appl Music: -16
 * Music mastering suggested limit: -10
 */
export const TARGET_LUFS = -14
