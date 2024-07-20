import {useAtomValue} from 'jotai'

import {AudioLoader} from './AudioLoader'
import {BeatList} from './BeatList'
import {Footer} from './Footer'
import {Header} from './Header'
import {isAppInitializedAtom} from '../globalState'

export function HomePage() {
  const isAppInitialized = useAtomValue(isAppInitializedAtom)

  return (
    <div className="flex h-full flex-col">
      {isAppInitialized ? (
        <>
          <Header />
          <BeatList />
          <Footer />
        </>
      ) : (
        <div className="grid h-full w-full place-content-center">
          <AudioLoader size={100} />
        </div>
      )}
    </div>
  )
}
