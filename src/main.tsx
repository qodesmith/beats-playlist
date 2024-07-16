import {QueryClientProvider} from '@tanstack/react-query'
import {Provider as JotaiProvider} from 'jotai'
import React from 'react'
import ReactDOM from 'react-dom/client'

import {queryClient, store} from './appFoundation'
import {HomePage} from './components/HomePage'

import './main.css'

document.documentElement.classList.add('h-full')
document.body.classList.add(
  // Style the app as dark mode.
  'bg-neutral-900',
  'text-white',

  // Other styles.
  'p-4',
  'bg-gradient-to-b',
  'from-neutral-900',
  'to-black',
  'h-full',
  'overflow-hidden'
)
const root = document.getElementById('root')!
root.classList.add('h-full')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    </JotaiProvider>
  </React.StrictMode>
)
