import type {Video} from '@qodestack/dl-yt-playlist'

import {pluralize} from '@qodestack/utils'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import {metadataQueryFn, metadataQueryKey} from '../appFoundation'

export function useFetchMetadata() {
  const {data, ...rest} = useQuery<Video[]>({
    queryKey: metadataQueryKey,
    queryFn: metadataQueryFn,
  })
  const metadata = data?.filter(({audioFileExtension}) => !!audioFileExtension)

  return {metadata, ...rest}
}

export function useMetadataStats(): {totalBeats?: number; totalTime?: string} {
  const {metadata} = useFetchMetadata()

  return useMemo(() => {
    if (!metadata) return {}
    const totalBeats = metadata.length
    const totalSeconds = metadata.reduce<number>((acc, beat) => {
      return acc + beat.durationInSeconds
    }, 0)

    return {totalTime: secondsToPlainSentence(totalSeconds), totalBeats}
  }, [metadata])
}

function secondsToPlainSentence(totalSeconds: number): string {
  if (totalSeconds < 0) {
    throw new Error('Input must be a non-negative number')
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []

  if (hours > 0) {
    parts.push(pluralize(hours, 'hour'))
  }

  if (minutes > 0) {
    parts.push(pluralize(minutes, 'minute'))
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(pluralize(seconds, 'second'))
  }

  return parts.join(', ')
}
