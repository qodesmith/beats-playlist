import type {ExtractAtomValue} from 'jotai'

import {useAtomValue} from 'jotai'
import {useEffect, useState} from 'react'

import {AudioThing} from '../AudioThing'
import {
  audioDataAtomFamily,
  currentAudioStateAtom,
  selectedBeatIdAtom,
} from '../globalState'

export function useAudioThing(): [
  AudioThing | undefined,
  ExtractAtomValue<typeof currentAudioStateAtom>,
] {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const audioData = useAtomValue(audioDataAtomFamily(beatId))
  const [audioThing, setAudioThing] = useState<AudioThing | undefined>()
  const currentAudioState = useAtomValue(currentAudioStateAtom)

  useEffect(() => {
    if (audioData) {
      setAudioThing(new AudioThing(audioData))
    }
  }, [audioData])

  useEffect(() => {
    return () => {
      audioThing?.remove()
    }
  }, [audioThing])

  return [audioThing, currentAudioState]
}
