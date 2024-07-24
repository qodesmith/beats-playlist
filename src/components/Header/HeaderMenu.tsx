import {useLayoutEffect, useState} from 'react'

export function HeaderMenu({id}: {id: string}) {
  const [mobileHeight, setMobileHeight] = useState<number>()

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
       * We use the ! important modifier in the TW class below for height to
       * override the style attribute for non-mobile sizes. This way we don't
       * have to use JavaScript to determine if we're at a mobile breakpoint.
       */
      className="fixed left-2 z-10 mt-2 h-[calc(100%-5px)] w-[calc(100%-1em)] rounded border border-neutral-700 p-2 backdrop-blur-md md:absolute md:left-auto md:right-0 md:!h-max md:w-max"
    >
      <div>Menu content!</div>
      <div>Menu content!</div>
      <div>Menu content!</div>
      <div>Menu content!</div>
      <div>Menu content!</div>
      <div>Menu content!</div>
    </div>
  )
}
