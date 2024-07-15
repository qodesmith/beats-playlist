import {useAtomValue} from 'jotai'
import {Suspense} from 'react'

import {highlightColorObj} from '../../constants'
import {selectedBeatIdAtom} from '../Beats/state'
import {Visualizer} from '../Visualizer/Visualizer'

export function Footer() {
  const beatId = useAtomValue(selectedBeatIdAtom)

  if (!beatId) return null

  return (
    <footer>
      <Suspense fallback="Loading waveform...">
        <Visualizer
          beatId={beatId}
          style="center"
          tailwindColor={highlightColorObj.name}
        />
        <div>Play controls</div>
      </Suspense>
    </footer>
  )
}
