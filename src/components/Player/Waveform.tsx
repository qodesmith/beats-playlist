import {useAtomValue} from 'jotai'
import {useId} from 'react'

import {highlightColorObj} from '../../constants'
import {
  audioDataLoadingProgressAtomFamily,
  getAudioDataLoadableAtomFamily,
  selectedBeatIdAtom,
  sizeContainerAtomFamily,
} from '../../globalState'
import {usePrevious} from '../../hooks/usePrevious'
import {AudioLoader} from '../AudioLoader'
import {SizeContainer} from '../Visualizer/SizeContainer'
import {Visualizer} from '../Visualizer/Visualizer'

export function Waveform() {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioBufferRes = useAtomValue(getAudioDataLoadableAtomFamily(beatId))
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
      {isLoading && <WaveformLoaderWithProgress />}
    </SizeContainer>
  )
}

function WaveformLoaderWithProgress() {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const progress = useAtomValue(audioDataLoadingProgressAtomFamily(beatId))

  return (
    <div className="absolute left-0 top-0 grid h-full w-full place-content-center">
      <AudioLoader size={44} />
      <div className="text-center">{progress}%</div>
    </div>
  )
}
