import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'

import './main.css'

import {queryClient} from './appFoundation'
import {HomePage} from './components/HomePage'

// Style the app in dark mode.
document.body.classList.add('dark:bg-slate-800', 'dark:text-white')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>
  </React.StrictMode>
)
