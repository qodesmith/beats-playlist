import {AnimatePresence, motion} from 'framer-motion'
import {useAtomValue} from 'jotai'

import {AudioLoader} from './AudioLoader'
import {BeatList} from './BeatList'
import {Footer} from './Footer'
import {Header} from './Header'
import {isAppInitializedAtom} from '../globalState'

const duration = 0.5
const opacity0 = {opacity: 0}
const opacity1 = {opacity: 1}

export function HomePage() {
  const isAppInitialized = useAtomValue(isAppInitializedAtom)

  return (
    <AnimatePresence mode="popLayout">
      {isAppInitialized ? (
        <motion.div
          key={1}
          id="home-page"
          className="flex h-full flex-col"
          initial={opacity0}
          animate={opacity1}
          transition={{duration}}
        >
          <Header />
          <BeatList />
          <Footer />
        </motion.div>
      ) : (
        <motion.div
          key={2}
          className="grid h-full w-full place-content-center"
          initial={opacity1}
          animate={opacity1}
          exit={opacity0}
          transition={{duration}}
        >
          <AudioLoader size={100} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
