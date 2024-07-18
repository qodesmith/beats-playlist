import {atom} from 'jotai'
import {atomWithStorage} from 'jotai/utils'

const repeatStates = ['off', 'on', 'single'] as const

const repeatStateAtom = atomWithStorage<(typeof repeatStates)[number]>(
  'repeatState',
  'off'
)

export const repeatStateSelector = atom(get => get(repeatStateAtom))

export const cycleRepeatStateAtom = atom(null, (get, set) => {
  const currentRepeatState = get(repeatStateAtom)
  const idx = repeatStates.indexOf(currentRepeatState)
  const nextIdx = (idx + 1) % repeatStates.length

  set(repeatStateAtom, repeatStates[nextIdx])
})
