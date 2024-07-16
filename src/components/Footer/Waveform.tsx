import {useAtomValue} from 'jotai'

import {highlightColorObj} from '../../constants'
import {useBeatAudioBuffer} from '../../hooks/useBeatAudioBuffer'
import {usePrevious} from '../../hooks/usePrevious'
import {selectedBeatIdAtom} from '../Beats/state'
import {Spinner} from '../Spinner'
import {Visualizer} from '../Visualizer/Visualizer'

export function Waveform() {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const {fetchStatus, data: {audioBuffer} = {}} = useBeatAudioBuffer(beatId)
  const previousAudioBuffer = usePrevious(audioBuffer)
  const isLoading = fetchStatus === 'fetching'

  return (
    <div className="relative h-full">
      <Visualizer
        audioBuffer={isLoading ? previousAudioBuffer : audioBuffer}
        style="reflection"
        tailwindColor={highlightColorObj.name}
        waveformHeight={100}
        cursorColor="bg-[#CC57FF]"
        isLoading={isLoading}
      />
      {isLoading && (
        <div className="absolute left-0 top-0 grid h-full w-full place-items-center">
          <Spinner size={48} />
        </div>
      )}
    </div>
  )
}
