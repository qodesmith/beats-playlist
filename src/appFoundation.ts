import {QueryClient} from '@tanstack/react-query'
import {createStore} from 'jotai'

import {metadataAtom} from './components/Beats/state'

export const store = createStore()

// Trigger fetching the metadata while React is loading the app.
store.get(metadataAtom)

export const queryClient = new QueryClient()
