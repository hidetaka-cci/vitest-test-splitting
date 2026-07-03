import { describe, expect, it } from 'vitest'
import { capitalize, slugify } from './lib/format'

describe('format', () => {
  it('capitalizes text', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('slugifies text', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })
})
