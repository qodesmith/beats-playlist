import {BeatList} from './Beats/BeatList'
import {Footer} from './Footer/Footer'
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
