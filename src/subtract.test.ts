import { describe, expect, it } from 'vitest'
import { subtract } from './lib/math'

describe('subtract', () => {
  it('subtracts two numbers', () => {
    expect(subtract(5, 3)).toBe(2)
  })
})
