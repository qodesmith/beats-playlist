import {CloseButton} from './CloseButton'

type Props = {
  text: string
  onClose: () => void
}

export function Chip({text, onClose}: Props) {
  return (
    <div className="flex items-center rounded bg-puerto-rico-500 pr-2 text-black">
      <CloseButton size={22} fill="black" onClick={onClose} />
      {text}
    </div>
  )
}
