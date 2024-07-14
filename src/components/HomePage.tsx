import {useAtomValue} from 'jotai'
import {Suspense} from 'react'

import {BeatList} from './Beats/BeatList'
import {selectedBeatIdAtom} from './Beats/state'
import {Header} from './Header'
import {Visualizer} from './Visualizer/Visualizer'
import {highlightColorObj} from '../constants'

export function HomePage() {
  const beatId = useAtomValue(selectedBeatIdAtom)

  return (
    <div className="flex h-full flex-col">
      <Header />
      <Suspense fallback="Loading beats...">
        <BeatList />
      </Suspense>
      <Suspense fallback="Loading waveform...">
        <Visualizer
          beatId={beatId}
          tailwindColor={highlightColorObj.name}
          style="center"
        />
      </Suspense>
    </div>
  )
}
