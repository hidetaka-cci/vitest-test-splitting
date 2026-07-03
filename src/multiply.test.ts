import { describe, expect, it } from 'vitest'
import { multiply } from './lib/math'

describe('multiply', () => {
  it('multiplies two numbers', () => {
    expect(multiply(4, 3)).toBe(12)
  })
})
