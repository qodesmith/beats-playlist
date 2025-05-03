export function Play({
  size = 40,
  circleFill = 'white',
  triangleFill = 'black',
  triangleClass,
}: {
  size?: number
  circleFill?: string
  triangleFill?: string
  triangleClass?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <title>play</title>
      <circle cx="25" cy="25" r="24" fill={circleFill} />
      <path
        d="M20 15 L20 35 L35 25 Z"
        fill={triangleFill}
        className={triangleClass}
      />
    </svg>
  )
}

export function Pause({
  size = 40,
  circleFill = 'white',
  pauseFill = 'black',
}: {
  size?: number
  circleFill?: string
  pauseFill?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <title>pause</title>
      <circle cx="25" cy="25" r="24" fill={circleFill} stroke="black" />
      <rect x="16" y="15" width="6" height="20" fill={pauseFill} />
      <rect x="28" y="15" width="6" height="20" fill={pauseFill} />
    </svg>
  )
}

export function Next({
  size = 30,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <title>next</title>
      <path
        d="M10 10 Q10 9 11 9 L28 23 Q30 24 28 25 L11 39 Q10 40 10 39 V10"
        fill={fill}
      />
      <rect x="33" y="10" width="7" height="30" rx="2" fill={fill} />
    </svg>
  )
}

export function Previous({
  size = 30,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <title>previous</title>
      <path
        d="M40 10 Q40 9 39 9 L22 23 Q20 24 22 25 L39 39 Q40 40 40 39 V10"
        fill={fill}
      />
      <rect x="10" y="10" width="7" height="30" rx="2" fill={fill} />
    </svg>
  )
}

export function Repeat({
  size = 20,
  fill = 'white',
  one,
}: {
  size?: number
  fill?: string
  one?: boolean
}) {
  if (one) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16">
        <title>repeat one</title>
        <path
          fill={fill}
          d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5zM12.25 2.5h-.75V1h.75A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25z"
        />
        <path
          fill={fill}
          d="M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z"
        />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <title>repeat</title>
      <path
        fill={fill}
        d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"
      />
    </svg>
  )
}

export function Shuffle({
  size = 20,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <title>Shuffle</title>
      <path
        fill={fill}
        d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"
      />
      <path
        fill={fill}
        d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"
      />
    </svg>
  )
}

export function VolumeIcon({
  size = 20,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 -0.5 25 25">
      <title>volume</title>
      <path
        transform="translate(-209.000000, -573.000000)"
        fill={fill}
        d="M228,578.101 L228,580.101 C230.282,580.564 232,582.581 232,585 C232,587.419 230.282,589.436 228,589.899 L228,591.899 C231.388,591.41 234,588.523 234,585 C234,581.477 231.388,578.59 228,578.101 L228,578.101 Z M209,581 L209,589 C209,590.104 209.896,591 211,591 L214,591 L214,579 L211,579 C209.896,579 209,579.896 209,581 L209,581 Z M223,573 L216,577.667 L216,592.333 L223,597 C224.104,597 225,596.104 225,595 L225,575 C225,573.896 224.104,573 223,573 L223,573 Z"
      />
    </svg>
  )
}

export function PlaybackSpeedIcon({
  size = 20,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <title>playback speed</title>
      <path
        d="M10,8v8l6-4L10,8L10,8z M6.3,5L5.7,4.2C7.2,3,9,2.2,11,2l0.1,1C9.3,3.2,7.7,3.9,6.3,5z            M5,6.3L4.2,5.7C3,7.2,2.2,9,2,11 l1,.1C3.2,9.3,3.9,7.7,5,6.3z            M5,17.7c-1.1-1.4-1.8-3.1-2-4.8L2,13c0.2,2,1,3.8,2.2,5.4L5,17.7z            M11.1,21c-1.8-0.2-3.4-0.9-4.8-2 l-0.6,.8C7.2,21,9,21.8,11,22L11.1,21z            M22,12c0-5.2-3.9-9.4-9-10l-0.1,1c4.6,.5,8.1,4.3,8.1,9s-3.5,8.5-8.1,9l0.1,1 C18.2,21.5,22,17.2,22,12z"
        fill={fill}
      />
    </svg>
  )
}

export function ResetIcon({
  size = 20,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <title>reset</title>
      <path
        d="M5.75463 7C7.21158 5.18252 9.44546 4.01468 11.9526 4.00014C11.987 3.99994 12.0213 3.99996 12.0557 4.00019C14.1899 4.01474 16.1256 4.86498 17.5518 6.24003C17.6346 6.31978 17.7156 6.40134 17.7949 6.48468C19.136 7.89332 19.9688 9.79034 19.9991 11.8816C20.0004 11.9644 20.0003 12.0472 19.999 12.1301C19.9659 14.2041 19.1436 16.0863 17.8194 17.4896C17.7136 17.6017 17.6045 17.7108 17.4922 17.8169C16.0866 19.1445 14.2001 19.9682 12.1214 19.9991C12.0447 20.0003 11.9678 20.0003 11.8909 19.9993C7.85982 19.9454 4.54848 16.9101 4.06165 12.998C3.99344 12.45 3.55229 12 3 12C2.44772 12 1.99481 12.4488 2.04994 12.9983C2.08376 13.3355 2.13461 13.6698 2.20202 14C2.5565 15.7365 3.36894 17.3602 4.57153 18.6946C6.22692 20.5315 8.50415 21.6899 10.9636 21.9461C13.423 22.2024 15.8901 21.5384 17.8886 20.0823C19.8872 18.6262 21.2754 16.4813 21.7852 14.0617C22.295 11.6421 21.8902 9.11945 20.6491 6.98077C19.408 4.84208 17.4185 3.23907 15.0648 2.48123C12.7111 1.72339 10.16 1.86448 7.90423 2.87725C6.34818 3.57586 5.00873 4.65506 4 5.99997V4C4 3.44772 3.55228 3 3 3C2.44772 3 2 3.44772 2 4V8V9H3H7C7.55228 9 8 8.55228 8 8C8 7.44772 7.55228 7 7 7H5.75463Z"
        fill="white"
      />
    </svg>
  )
}

export function SearchIcon({
  size = 18,
  fill = 'white',
}: {
  size?: number
  fill?: string
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill}>
      <title>search</title>
      <path d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.1616 14.7849 19.94 12.7634 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.55226 6.42768 3.27893 10.533 3.27893C14.6383 3.27893 17.94 6.55226 17.94 10.5579C17.94 14.5636 14.6383 17.8369 10.533 17.8369C6.42768 17.8369 3.12598 14.5636 3.12598 10.5579Z" />
    </svg>
  )
}
