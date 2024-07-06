import type {Video} from '@qodestack/dl-yt-playlist'

import {useQuery} from '@tanstack/react-query'

import {metadataQueryFn, metadataQueryKey} from '../appFoundation'

export function useFetchMetadata() {
  const {data: metadata, ...rest} = useQuery<Video[]>({
    queryKey: metadataQueryKey,
    queryFn: metadataQueryFn,
  })

  return {metadata, ...rest}
}
