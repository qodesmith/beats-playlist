export function AudioLoader({
  size,
  fill = 'white',
}: {
  size: number
  fill?: string
}) {
  /**
   * By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL
   * https://samherbert.net/svg-loaders/
   * https://github.com/SamHerbert/SVG-Loaders/blob/master/svg-loaders/audio.svg?short_path=98b3beb
   *
   * The height has been adjusted (and the <rect>'s proportionally) by ChatGPT.
   */
  return (
    <svg
      width={size + size * 0.1}
      height={size}
      viewBox="0 0 55 50"
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
    >
      <title>audio loader</title>
      <g transform="matrix(1 0 0 -1 0 50)">
        <rect width="10" height="12.5" rx="3">
          <animate
            attributeName="height"
            begin="0s"
            dur="4.3s"
            values="12.5;28.125;35.625;50;40;20;41.25;28.125;40;14.375;41.25;8.125;40;35;21.25;21.25;1.25;14.375;47.5;49.375;12.5"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="15" width="10" height="50" rx="3">
          <animate
            attributeName="height"
            begin="0s"
            dur="2s"
            values="50;34.375;20.625;3.125;46.875;14.375;45.625;20.625;7.5;8.75;37.5;50"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="30" width="10" height="31.25" rx="3">
          <animate
            attributeName="height"
            begin="0s"
            dur="1.4s"
            values="31.25;21.25;48.75;14.375;35;14.375;21.25;47.5;50;33.75;13.125;31.25"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="45" width="10" height="18.75" rx="3">
          <animate
            attributeName="height"
            begin="0s"
            dur="2s"
            values="18.75;28.125;8.125;50;35;45;28.125;47.5;21.25;14.375;41.875;18.75"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </rect>
      </g>
    </svg>
  )
}
