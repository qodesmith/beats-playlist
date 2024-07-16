import {useAtomValue} from 'jotai'
import {useId} from 'react'

import {highlightColorObj} from '../../constants'
import {usePrevious} from '../../hooks/usePrevious'
import {selectedBeatIdAtom} from '../Beats/state'
import {Spinner} from '../Spinner'
import {audioBufferAtomFamily} from '../Visualizer/state'
import {Visualizer} from '../Visualizer/Visualizer'

export function Waveform() {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioBufferRes = useAtomValue(audioBufferAtomFamily(beatId))
  const isLoading = audioBufferRes.state === 'loading'
  const hasData = audioBufferRes.state === 'hasData'
  const audioBuffer = hasData ? audioBufferRes.data?.audioBuffer : undefined
  const previousAudioBuffer = usePrevious(audioBuffer)
  const id = useId()

  return (
    <div className="relative h-full">
      <Visualizer
        audioBuffer={isLoading ? previousAudioBuffer : audioBuffer}
        style="reflection"
        tailwindColor={highlightColorObj.name}
        waveformHeight={100}
        cursorColor="bg-[#CC57FF]"
        isLoading={isLoading}
        id={id}
      />
      {isLoading && (
        <div className="absolute left-0 top-0 grid h-full w-full place-items-center">
          <Spinner size={48} />
        </div>
      )}
    </div>
  )
}
