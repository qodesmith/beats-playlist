import {useAtomValue} from 'jotai'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {Pause, Play} from './ControlIcons'
import {selectedBeatIdAtom} from '../Beats/state'
import {audioDataAtomFamily} from '../Visualizer/state'

export function PlayPause({size}: {size: number}) {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioDataRes = useAtomValue(audioDataAtomFamily(beatId))
  const hasData = audioDataRes.state === 'hasData'
  const audioCtx = hasData ? audioDataRes.data?.audioContext : undefined
  const audioBuffer = hasData ? audioDataRes.data?.audioBuffer : undefined
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

  return audioCtxState === 'running' ? (
    <Pause size={size} onClick={togglePlay} />
  ) : (
    <Play size={size} onClick={togglePlay} />
  )
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
