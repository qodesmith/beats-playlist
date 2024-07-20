import {useAtomValue} from 'jotai'
import {useCallback, useEffect, useRef, useState} from 'react'

import {Next, Pause, Play, Previous} from './ControlIcons'
import {RepeatButton} from './RepeatButton'
import {
  getAudioDataLoadableAtomFamily,
  selectedBeatIdAtom,
} from '../../globalState'

export function Controls({
  baseSize,
}: {
  /**
   * This value determines the size of the icons. Each icon's size will be a
   * multiple of this value so they will proportionally stay the same.
   */
  baseSize: number
}) {
  const beatId = useAtomValue(selectedBeatIdAtom)

  return <ControlsBody key={beatId} baseSize={baseSize} />
}

function ControlsBody({baseSize}: {baseSize: number}) {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioDataRes = useAtomValue(getAudioDataLoadableAtomFamily(beatId))
  const hasData = audioDataRes.state === 'hasData'
  const audioCtx = hasData ? audioDataRes.data?.audioContext : undefined
  const audioBuffer = hasData ? audioDataRes.data?.audioBuffer : undefined
  const fill = beatId ? 'white' : 'gray'
  const [audioCtxState, setAudioCtxState] = useState<
    AudioContextState | undefined
  >()
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode>()
  const initialAudioSourceCreatedRef = useRef<boolean>(false)
  const togglePlay = useCallback(() => {
    if (audioCtx?.state === 'running') {
      audioCtx.suspend()
    } else {
      audioCtx?.resume()
    }
  }, [audioCtx])

  // Initial audio source creation.
  useEffect(() => {
    if (!initialAudioSourceCreatedRef.current && audioCtx && audioBuffer) {
      const newAudioSource = createAudioBufferSource({audioCtx, audioBuffer})
      newAudioSource.loop = true
      setAudioSource(newAudioSource)
    }
  }, [audioBuffer, audioCtx])

  /**
   * Auto start playing the audio:
   * - On initial mount
   * - Whenever the audio source changes.
   */
  useEffect(() => {
    if (audioSource) {
      audioSource.start()
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

  // For single song looping - create new audio source.
  useEffect(() => {
    // function handleEnded() {
    //   // Use the store to avoid component re-renders from changes in the value.
    //   const repeatState = store.get(repeatStateSelector)
    //   const shouldRestartAudio =
    //     repeatState === 'single' && audioCtx && audioBuffer
    //   if (shouldRestartAudio) {
    //     const newAudioSource = createAudioBufferSource({audioCtx, audioBuffer})
    //     setAudioSource(newAudioSource)
    //   }
    // }
    // if (audioSource) {
    //   audioSource.addEventListener('ended', handleEnded)
    //   return () => {
    //     audioSource.removeEventListener('ended', handleEnded)
    //   }
    // }
  }, [audioBuffer, audioCtx, audioSource])

  return (
    <div className="flex items-center justify-center gap-4">
      <Previous size={baseSize * 3} fill={fill} />
      {audioCtxState === 'running' ? (
        <Pause size={baseSize * 4} onClick={togglePlay} circleFill={fill} />
      ) : (
        <Play size={baseSize * 4} onClick={togglePlay} circleFill={fill} />
      )}
      <Next size={baseSize * 3} fill={fill} />
      <RepeatButton />
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
