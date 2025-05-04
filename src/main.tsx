import {Provider as JotaiProvider} from 'jotai'
import React from 'react'
import ReactDOM from 'react-dom/client'

import {HomePage} from './components/HomePage'
import {initApp} from './initApp'
import {store} from './store'

import './main.css'

document.documentElement.classList.add('h-full')
document.body.classList.add(
  // Style the app as dark mode.
  'bg-neutral-900',
  'text-white',

  // Other styles.
  'bg-linear-to-b',
  'from-neutral-900',
  'to-black',
  'h-full',
  'max-w-(--breakpoint-2xl)',
  '2xl:mx-auto'
)
const root = document.getElementById('root')!
root.classList.add('h-full')

initApp()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <JotaiProvider store={store}>
      <HomePage />
    </JotaiProvider>
  </React.StrictMode>
)
