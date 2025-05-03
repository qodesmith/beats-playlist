import process from 'node:process'

export function getEnvVar(key: string): string {
  const value = process.env[key]

  if (value === undefined) {
    throw new Error(`No value for ${key} env var found.`)
  }

  return value
}
