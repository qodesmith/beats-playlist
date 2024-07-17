import {useAtomValue} from 'jotai'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {Next, Pause, Play, Previous, Repeat} from './ControlIcons'
import {selectedBeatIdAtom} from '../Beats/state'
import {audioDataAtomFamily} from '../Visualizer/state'

export function Controls({baseSize}: {baseSize: number}) {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioDataRes = useAtomValue(audioDataAtomFamily(beatId))
  const hasData = audioDataRes.state === 'hasData'
  const audioCtx = hasData ? audioDataRes.data?.audioContext : undefined
  const audioBuffer = hasData ? audioDataRes.data?.audioBuffer : undefined
  const fill = beatId ? 'white' : 'gray'
  const [audioCtxState, setAudioCtxState] = useState<
    AudioContextState | undefined
  >()
  const audioSource = useMemo(() => {
    if (audioCtx && audioBuffer) {
      return createAudioBufferSource({audioCtx, audioBuffer})
    }
  }, [audioBuffer, audioCtx])
  const togglePlay = useCallback(() => {
    if (audioCtx?.state === 'running') {
      audioCtx.suspend()
    } else {
      audioCtx?.resume()
    }
  }, [audioCtx])

  // Auto start playing the audio.
  useEffect(() => {
    if (audioSource) {
      audioSource.start(0)
      setAudioCtxState('running')
    }

    return () => {
      audioSource?.stop()
    }
  }, [audioSource, beatId])

  // Sync audioCtx state with local state.
  useEffect(() => {
    if (audioCtx) {
      audioCtx.onstatechange = () => {
        setAudioCtxState(audioCtx.state)
      }

      return () => {
        audioCtx.onstatechange = null
      }
    }
  }, [audioCtx])

  return (
    <div className="flex items-center justify-center gap-4">
      <Previous size={baseSize * 3} fill={fill} />
      {audioCtxState === 'running' ? (
        <Pause size={baseSize * 4} onClick={togglePlay} circleFill={fill} />
      ) : (
        <Play size={baseSize * 4} onClick={togglePlay} circleFill={fill} />
      )}
      <Next size={baseSize * 3} fill={fill} />
      <Repeat size={baseSize * 2} fill={fill} />
    </div>
  )

  return
}

function createAudioBufferSource({
  audioCtx,
  audioBuffer,
}: {
  audioCtx: AudioContext
  audioBuffer: AudioBuffer
}) {
  const audioSource = audioCtx.createBufferSource()
  audioSource.buffer = audioBuffer
  audioSource.connect(audioCtx.destination)

  return audioSource
}
