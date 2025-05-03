/**
 * `googleapis` is a package that contains all the Google API functionality.
 *
 * As per its [npm docs](https://www.npmjs.com/package/googleapis), you can
 * install submodules (i.e. `@googleapis/youtube`) for better startup times.
 *
 * [This npm search](https://www.npmjs.com/search?q=scope%3Agoogleapis) will
 * show all the submodules available.
 */

import process from 'node:process'

import google from '@googleapis/youtube'

/**
 * https://chatgpt.com/c/59aa040f-0b1b-4f63-99f6-b848a1b50299
 *
 * In order to delete videos with the YouTube API, you *have* to use an oauth2
 * client. An API key and even a service account will not work.
 *
 * "Using a service account to access private YouTube playlists, even if you own
 * the playlist, typically won't work out of the box because service accounts
 * are not tied directly to a specific user's YouTube account."
 */
export async function deletePlaylistItem(playlistItemId: string) {
  const {OAuth2} = google.auth
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  )
  // biome-ignore lint/style/useNamingConvention: this is Google's api
  oauth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})

  const yt = google.youtube({version: 'v3', auth: oauth2Client})

  return yt.playlistItems.delete({id: playlistItemId})
}
