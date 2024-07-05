import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'

import './main.css'

import {queryClient} from './appFoundation'
import {Visualizer} from './components/Visualizer/Visualizer'

// Style the app in dark mode.
document.body.classList.add('dark:bg-slate-800', 'dark:text-white')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <h1>Beats Playlist!</h1>
      <Visualizer
        fileName="beat.mp3"
        tailwindColor="puerto-rico-400"
        style="reflection"
      />
    </QueryClientProvider>
  </React.StrictMode>
)
