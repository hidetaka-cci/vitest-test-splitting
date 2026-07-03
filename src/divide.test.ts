import { describe, expect, it } from 'vitest'
import { divide } from './lib/math'

describe('divide', () => {
  it('divides two numbers', () => {
    expect(divide(8, 2)).toBe(4)
  })
})
