import {useCallback, useLayoutEffect, useState} from 'react'
import {HeaderButton} from './HeaderButton'
import {scrollBeatIntoView} from '../../utils'
import {useAtomValue, useSetAtom} from 'jotai'
import {
  isMenuOpenAtom,
  metadataSelector,
  selectedBeatIdAtom,
} from '../../globalState'

export function HeaderMenu({
  id,
}: {
  /**
   * The id to the menu button that renders this menu when clicked.
   */
  id: string
}) {
  const metadata = useAtomValue(metadataSelector)
  const selectedBeatId = useAtomValue(selectedBeatIdAtom)
  const [mobileHeight, setMobileHeight] = useState<number>()
  const setMenuState = useSetAtom(isMenuOpenAtom)
  const closeMenu = useCallback(() => setMenuState(false), [])

  /**
   * The button that renders this component is absolutely positioned. Since we
   * want this menu to flow below the button when opened, we need to calculate
   * the buttons position so we know how far down we need to be. We need the
   * screen's height so this menu can be full screen height on mobile devices.
   */
  useLayoutEffect(() => {
    const {y: topOffset} =
      document.getElementById(id)?.getBoundingClientRect() ?? {}
    const windowHeight = window.innerHeight

    if (topOffset) {
      setMobileHeight(windowHeight - topOffset - 8)
    }
  }, [id])

  return (
    <div
      id={id}
      style={{height: mobileHeight}}
      /**
       * We use the `!` important modifier in the TW class below for height to
       * override the style attribute for non-mobile sizes. This way we don't
       * have to use JavaScript to determine if we're at a mobile breakpoint.
       */
      className="fixed left-2 z-10 mt-2 h-[calc(100%-5px)] w-[calc(100%-1em)] rounded border border-neutral-700 p-2 backdrop-blur-md md:absolute md:left-auto md:right-0 md:!h-max md:w-max"
    >
      <div className="absolute right-2 top-2 flex flex-col gap-2">
        <HeaderButton
          onClick={() => {
            closeMenu()
            scrollBeatIntoView(metadata.at(0)?.id)
          }}
        >
          ⬆
        </HeaderButton>
        <HeaderButton
          onClick={() => {
            closeMenu()
            scrollBeatIntoView(selectedBeatId)
          }}
        >
          ⦿
        </HeaderButton>
        <HeaderButton
          onClick={() => {
            closeMenu()
            scrollBeatIntoView(metadata.at(-1)?.id)
          }}
        >
          ⬇
        </HeaderButton>
      </div>

      <div>Hello world</div>
      <div>Hello world</div>
      <div>Hello world</div>
      <div>Hello world</div>
      <div>Hello world</div>
    </div>
  )
}
