import React from 'react'
import ReactDOM from 'react-dom/client'
import './main.css'
import {Visualizer} from './components/Visualizer/Visualizer'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from './appFoundation'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <h1>Beats Playlist!</h1>
      <Visualizer fileName="beat.mp3" />
      <div>Hello world!</div>
    </QueryClientProvider>
  </React.StrictMode>
)
