import React from 'react'
import ReactDOM from 'react-dom/client'
import './main.css'
import {Visualizer} from './visualizer/Visualizer'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <h1>Beats Playlist!</h1>
    <Visualizer audioFileUrl="/beats/beat.mp3" />
    <div>Hello world!</div>
  </React.StrictMode>
)
