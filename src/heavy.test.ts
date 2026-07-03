import { describe, expect, it } from 'vitest'
import { runHeavyWork } from './lib/heavy'

describe('heavy workload', () => {
  it('completes expensive async work', async () => {
    const result = await runHeavyWork()
    expect(result).toBeGreaterThan(0)
  }, 15_000)
})
