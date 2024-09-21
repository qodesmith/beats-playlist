import {createStore} from 'jotai'

/**
 * TypeScript complains if we don't explicitly type the store. I don't
 * understand why type inference isn't enough here.
 */
type Store = ReturnType<typeof createStore>

export const store: Store = createStore()
