import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback} from 'react'

import {
  handleNextClick,
  handlePlayPause,
  handlePreviousClick,
  isPlayingAtom,
} from '../../AudioThing'
import {isSearchOpenAtom, selectedBeatIdAtom} from '../../globalState'
import {Next, Pause, Play, Previous, SearchIcon} from './ControlIcons'
import {RepeatButton} from './RepeatButton'
import {ShuffleButton} from './ShuffleButton'
import {VolumeButton} from './VolumeButton'

export function Controls({baseSize}: {baseSize: number}) {
  const beatId = useAtomValue(selectedBeatIdAtom)
  const fill = beatId ? 'white' : 'gray'
  const isPlaying = useAtomValue(isPlayingAtom)
  const setIsSearchOpen = useSetAtom(isSearchOpenAtom)
  const toggleSearch = useCallback(() => {
    setIsSearchOpen(v => !v)
  }, [])

  return (
    <div className="grid grid-cols-[repeat(7,1fr)] place-items-center justify-center pb-2 md:grid-cols-[repeat(7,32px)] md:gap-4">
      {/* VOLUME */}
      <VolumeButton baseSize={baseSize} fill={fill} />

      {/* SHUFFLE */}
      <ShuffleButton baseSize={baseSize} />

      {/* PREVIOUS */}
      <button
        type="button"
        className="grid size-full place-items-center"
        onClick={handlePreviousClick}
      >
        <Previous size={baseSize * 3} fill={fill} />
      </button>

      {/* PLAY / PAUSE */}
      <button type="button" onClick={handlePlayPause}>
        {isPlaying ? (
          <Pause size={baseSize * 4} circleFill={fill} />
        ) : (
          <Play size={baseSize * 4} circleFill={fill} />
        )}
      </button>

      {/* NEXT */}
      <button
        type="button"
        className="grid size-full place-items-center"
        onClick={handleNextClick}
      >
        <Next size={baseSize * 3} fill={fill} />
      </button>

      {/* REPEAT */}
      <RepeatButton
        className="grid size-full place-items-center"
        size={baseSize * 2.5 * 0.9}
      />

      {/* SEARCH */}
      <button
        type="button"
        className="grid size-full place-items-center"
        onClick={toggleSearch}
      >
        <SearchIcon size={baseSize * 2.25} />
      </button>
    </div>
  )
}
