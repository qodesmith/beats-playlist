import {Suspense} from 'react'

import {BeatList} from './Beats/BeatList'
import {Footer} from './Footer/Footer'
import {Header} from './Header'

export function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <Suspense fallback="Loading beats...">
        <BeatList />
      </Suspense>
      <Footer />
    </div>
  )
}
