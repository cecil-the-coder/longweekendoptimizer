import { describe, it, expect } from 'vitest'

describe('Example Utility Tests', () => {
  it('should demonstrate basic test functionality', () => {
    expect(2 + 2).toBe(4)
  })

  it('should demonstrate string matching', () => {
    const message = 'Hello, World!'
    expect(message).toContain('Hello')
    expect(message).toMatch(/Hello/)
  })

  it('should demonstrate array operations', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
  })
})