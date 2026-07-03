import { describe, expect, it } from 'vitest'
import { sum } from './lib/math'

describe('sum', () => {
  it('sums values', () => {
    expect(sum([1, 2, 3])).toBe(6)
  })
})
