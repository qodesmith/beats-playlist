import {useAtomValue} from 'jotai'

import {BeatList} from './Beats/BeatList'
import {selectedBeatFileNameAtom} from './Beats/state'
import {Header} from './Header'
import {Visualizer} from './Visualizer/Visualizer'

export function HomePage() {
  const beatFileName = useAtomValue(selectedBeatFileNameAtom)

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex-grow overflow-y-auto">
        <BeatList />
      </div>
      {beatFileName && (
        <Visualizer
          fileName={beatFileName}
          tailwindColor="puerto-rico-400"
          style="center"
        />
      )}
    </div>
  )
}
