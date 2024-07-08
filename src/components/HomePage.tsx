import {useAtomValue} from 'jotai'

import {BeatList} from './Beats/BeatList'
import {selectedBeatFileNameAtom} from './Beats/state'
import {Visualizer} from './Visualizer/Visualizer'

export function HomePage() {
  const beatFileName = useAtomValue(selectedBeatFileNameAtom)

  return (
    <>
      <h1>Beats Playlist!</h1>
      <div className="h-96 overflow-y-auto">
        <BeatList />
      </div>
      {beatFileName && (
        <Visualizer
          fileName={beatFileName}
          tailwindColor="puerto-rico-400"
          style="reflection"
        />
      )}
    </>
  )
}
