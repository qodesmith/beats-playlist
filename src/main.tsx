import React from 'react'
import ReactDOM from 'react-dom/client'
import './main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <h1 className="text-3xl font-bold underline">H1 - Beats Playlist!</h1>
    <h2>H2 - Beats Playlist!</h2>
    <h3>H3 - Beats Playlist!</h3>
    <button className="bg-sky-700 px-4 py-2 text-white hover:bg-sky-800 sm:px-8 sm:py-3">
      Button
    </button>
  </React.StrictMode>
)
