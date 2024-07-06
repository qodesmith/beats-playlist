import type {Video} from '@qodestack/dl-yt-playlist'

import {QueryClient} from '@tanstack/react-query'

export const queryClient = new QueryClient()

// Prefetch the metadata, exporting variables for use in a hook.
export const metadataQueryKey = ['metadata']
export const metadataQueryFn = async () => {
  return fetch('/metadata').then(res => res.json())
}
queryClient.prefetchQuery<Video[]>({
  queryKey: metadataQueryKey,
  queryFn: metadataQueryFn,
})
