import {atom} from 'jotai'
import {atomFamily} from 'jotai/utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const widthAtomFamily = atomFamily((_id: string) =>
  atom<number | undefined>(undefined)
)
