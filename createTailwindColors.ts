import fs from 'node:fs'
import process from 'node:process'

import defaultColors from 'tailwindcss/colors'

import twConfig from './tailwind.config'

function filterOutGetters<T extends object>(obj: T) {
  const result = {}
  const descriptors = Object.getOwnPropertyDescriptors(obj)

  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!descriptor.get) {
      result[key] = obj[key]
    }
  }

  return result
}

function flattenColorObj(
  obj: Record<string, Record<string, string> | string>
): Record<string, string> {
  const finalObj = {} as Record<string, string>

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      for (const [key2, value2] of Object.entries(value)) {
        const newKey = `${key}-${key2}`
        finalObj[newKey] = value2
      }
    } else {
      finalObj[key] = value
    }
  }

  return finalObj
}

function sortObject<T extends object>(obj: T): T {
  const sortedKeys = Object.keys(obj).sort((a, b) => {
    return a
      .slice(0, a.lastIndexOf('-'))
      .localeCompare(b.slice(0, b.lastIndexOf('-')))
  })

  return sortedKeys.reduce((acc, key) => {
    acc[key] = obj[key]
    return acc
  }, {} as T)
}

function createTailwindColors() {
  const colors = sortObject(
    flattenColorObj({
      ...filterOutGetters(defaultColors),
      ...twConfig.theme?.extend?.colors,
    })
  )

  const colorsJson = JSON.stringify(colors, null, 2)
  const fileComment = '// AUTO-GENERATED FILE - DO NOT EDIT'
  const twColorType = 'export type TailwindColor = keyof typeof tailwindColors'
  const fileContents = `${fileComment}\nexport const tailwindColors = ${colorsJson} as const\n\n${twColorType}\n`

  fs.writeFileSync('./src/tailwindColors.ts', fileContents)
}

/**
 * Why wrap execution logic in `createTailwindColors` and use a try/catch?
 * It's because npm scripts will run this file with stderr suppressed. We want
 * the ability to still show errors.
 *
 * Why are we suppressing stderr? Because accessing Tailwind's `defaultColors`
 * logs a bunch of noise about deprecated colors. Those colors are stored on the
 * object as getters and log a message whenever accessed.
 */
try {
  createTailwindColors()
} catch (error) {
  // biome-ignore lint/suspicious/noConsole: this is ok here
  console.log(error)
  process.exit(1)
}
