import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'

import './main.css'

import {queryClient} from './appFoundation'
import {HomePage} from './components/HomePage'

document.documentElement.classList.add('h-full')
document.body.classList.add(
  // Style the app in dark mode.
  'dark:bg-neutral-900',
  'dark:text-white',

  // Other styles.
  'font-extralight',
  'p-4',
  'h-full',
  'overflow-hidden'
)
const root = document.getElementById('root')!
root.classList.add('h-full')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>
  </React.StrictMode>
)
