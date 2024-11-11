import {AnimatePresence, motion} from 'framer-motion'
import {useAtomValue} from 'jotai'

import {AudioLoader} from './AudioLoader'
import {BeatList} from './BeatList/BeatList'
import {RowContextMenu} from './BeatList/RowContextMenu'
import {Footer} from './Footer/Footer'
import {Header} from './Header/Header'
import {SearchDisplay} from './SearchDisplay'
import {
  initialMetadataLoadingProgressAtom,
  isAppInitializedAtom,
} from '../globalState'
import {TestInfo} from './TestInfo'
import {ToastContainer} from './Toast/Toast'

const duration = {duration: 0.5} as const
const opacity0 = {opacity: 0} as const
const opacity1 = {opacity: 1} as const

export function HomePage() {
  const isAppInitialized = useAtomValue(isAppInitializedAtom)
  const loadingProgress = useAtomValue(initialMetadataLoadingProgressAtom)

  return (
    <>
      <AnimatePresence mode="popLayout">
        {isAppInitialized ? (
          <motion.div
            key={1}
            id="home-page"
            className="flex h-full flex-col"
            initial={opacity0}
            animate={opacity1}
            transition={duration}
          >
            {__DEV__ && <TestInfo />}
            <Header />
            <SearchDisplay />
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
            transition={duration}
          >
            <AudioLoader size={100} />
            <div className="text-center">{loadingProgress}%</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup context menu for beats in the list. */}
      <RowContextMenu />

      {/* Toast messages. */}
      <ToastContainer />
    </>
  )
}
