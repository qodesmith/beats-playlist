/**
 * https://chatgpt.com/c/59aa040f-0b1b-4f63-99f6-b848a1b50299
 *
 * This script is used to get the initial refresh token for the YouTube API.
 */
/** biome-ignore-all lint/suspicious/noConsole: it's ok here */

import process from 'node:process'
import readline from 'node:readline'

import google from '@googleapis/youtube'
import open from 'open'

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob' // Special redirect URI for manual flow

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']

const authUrl = oauth2Client.generateAuthUrl({
  // biome-ignore lint/style/useNamingConvention: this is Google's api
  access_type: 'offline', // 'offline' to get a refresh token
  scope: SCOPES,
})

console.log('Authorize this app by visiting this url:', authUrl)
open(authUrl)

rl.question('Enter the code from that page here: ', code => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err)
    console.log('Access Token:', token?.access_token)
    console.log('Refresh Token:', token?.refresh_token)
    rl.close()
  })
})
