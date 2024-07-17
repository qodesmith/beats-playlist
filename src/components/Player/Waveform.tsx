import {useAtomValue} from 'jotai'
import {useId} from 'react'

import {highlightColorObj} from '../../constants'
import {usePrevious} from '../../hooks/usePrevious'
import {selectedBeatIdAtom} from '../Beats/state'
import {Spinner} from '../Spinner'
import {SizeContainer} from '../Visualizer/SizeContainer'
import {audioDataAtomFamily, sizeContainerAtomFamily} from '../Visualizer/state'
import {Visualizer} from '../Visualizer/Visualizer'

export function Waveform() {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioBufferRes = useAtomValue(audioDataAtomFamily(beatId))
  const isLoading = audioBufferRes.state === 'loading'
  const hasData = audioBufferRes.state === 'hasData'
  const audioBuffer = hasData ? audioBufferRes.data?.audioBuffer : undefined
  const previousAudioBuffer = usePrevious(audioBuffer)
  const sizeContainerId = useId()
  const {width, height} = useAtomValue(sizeContainerAtomFamily(sizeContainerId))

  return (
    <SizeContainer
      sizeContainerId={sizeContainerId}
      className="relative h-full w-full overflow-hidden"
    >
      <Visualizer
        audioBuffer={isLoading ? previousAudioBuffer : audioBuffer}
        style="reflection"
        tailwindColor={highlightColorObj.name}
        waveformWidth={width}
        waveformHeight={height}
        cursorColor="bg-[#CC57FF]"
        isLoading={isLoading}
      />
      {isLoading && (
        <div className="absolute left-0 top-0 grid h-full w-full place-items-center">
          <Spinner size={48} />
        </div>
      )}
    </SizeContainer>
  )
}
