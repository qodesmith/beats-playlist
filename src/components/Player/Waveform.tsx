import {useAtomValue} from 'jotai'
import {useId} from 'react'

import {
  audioBufferUnwrappedAtomFamily,
  audioFetchingProgressAtomFamily,
} from '../../AudioThing'
import {highlightColorObj} from '../../constants'
import {selectedBeatIdAtom, sizeContainerAtomFamily} from '../../globalState'
import {usePrevious} from '../../hooks/usePrevious'
import {AudioLoader} from '../AudioLoader'
import {SizeContainer} from '../Visualizer/SizeContainer'
import {Visualizer} from '../Visualizer/Visualizer'

export function Waveform() {
  const sizeContainerId = useId()
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioBuffer = useAtomValue(audioBufferUnwrappedAtomFamily(beatId ?? ''))

  return (
    <WaveformContent
      sizeContainerId={sizeContainerId}
      isLoading={!audioBuffer}
      audioBuffer={audioBuffer}
      beatId={beatId}
    />
  )
}

function WaveformContent({
  sizeContainerId,
  audioBuffer,
  isLoading,
  beatId,
}: {
  sizeContainerId: string
  audioBuffer?: AudioBuffer | undefined
  isLoading: boolean
  beatId: string | undefined
}) {
  const {width, height} = useAtomValue(sizeContainerAtomFamily(sizeContainerId))
  const previousAudioBuffer = usePrevious(audioBuffer)

  return (
    <SizeContainer
      sizeContainerId={sizeContainerId}
      className="relative h-full w-full overflow-hidden"
    >
      <Visualizer
        audioBuffer={audioBuffer ?? previousAudioBuffer}
        style="reflection"
        tailwindColor={highlightColorObj.name}
        waveformWidth={width}
        waveformHeight={height}
        cursorColor="bg-[#CC57FF]"
        isLoading={isLoading}
      />
      {isLoading && beatId && <WaveformLoadingProgress beatId={beatId} />}
    </SizeContainer>
  )
}

function WaveformLoadingProgress({beatId}: {beatId: string}) {
  const progress = useAtomValue(audioFetchingProgressAtomFamily(beatId))

  return (
    <div className="absolute top-0 left-0 grid h-full w-full place-content-center">
      <AudioLoader size={44} />
      <div className="text-center">{progress}%</div>
    </div>
  )
}
