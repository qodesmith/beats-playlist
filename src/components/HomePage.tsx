import {BeatList} from './BeatList'
import {Footer} from './Footer'
import {Header} from './Header'

export function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <BeatList />
      <Footer />
    </div>
  )
}
