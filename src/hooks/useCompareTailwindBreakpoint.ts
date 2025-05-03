import type {TailwindBreakpoint} from '../constants'

import {useAtomValue} from 'jotai'

import {tailwindBreakpoints} from '../constants'
import {tailwindBreakpointAtom} from '../globalState'

type Operator = '!=' | '<' | '<=' | '=' | '>' | '>='

/**
 * A hook to compare Tailwind breakpoint values (strings) as if they were
 * numbers.
 */
export function useCompareTailwindBreakpoint(
  operator: Operator,
  breakpoint: TailwindBreakpoint
): boolean {
  const currentBp = useAtomValue(tailwindBreakpointAtom)
  const currentBpIndex = currentBp ? tailwindBreakpoints.indexOf(currentBp) : -1
  const bpIndex = tailwindBreakpoints.indexOf(breakpoint)

  switch (operator) {
    case '!=':
      return currentBpIndex !== bpIndex
    case '<':
      return currentBpIndex < bpIndex
    case '<=':
      return currentBpIndex <= bpIndex
    case '=':
      return currentBpIndex === bpIndex
    case '>':
      return currentBpIndex > bpIndex
    case '>=':
      return currentBpIndex >= bpIndex
    default:
      throw new Error(`Unknown operator value: ${operator}`)
  }
}
