import { describe, it, expect } from 'vitest'
import { snakeToTitle, formatConfiguration, getAttachmentFileName, BROWSER_MAP, OS_MAP } from '@/utils'

describe('snakeToTitle', () => {
  it('converts snake_case to Title Case', () => {
    expect(snakeToTitle('hello_world')).toBe('Hello World')
  })

  it('converts single word', () => {
    expect(snakeToTitle('hello')).toBe('Hello')
  })

  it('handles multiple underscores', () => {
    expect(snakeToTitle('test_case_execution_result')).toBe('Test Case Execution Result')
  })

  it('handles empty string', () => {
    expect(snakeToTitle('')).toBe('')
  })

  it('handles string with no underscores', () => {
    expect(snakeToTitle('already')).toBe('Already')
  })
})

describe('formatConfiguration', () => {
  it('formats known browser and OS combinations', () => {
    Object.entries(BROWSER_MAP).forEach(([browserKey, browserLabel]) => {
      Object.entries(OS_MAP).forEach(([osKey, osLabel]) => {
        const input = `${browserKey} on ${osKey}`
        const expected = `${browserLabel} on ${osLabel}`
        expect(formatConfiguration(input)).toBe(expected)
      })
    })
  })

  it('handles unknown browser and OS', () => {
    expect(formatConfiguration('unknown on custom')).toBe('unknown on custom')
  })

  it('formats partial known combinations', () => {
    expect(formatConfiguration('chrome on unknown')).toBe('Chrome on unknown')
    expect(formatConfiguration('unknown on windows10')).toBe('unknown on Windows 10')
  })
})

describe('getAttachmentFileName', () => {
  it('extracts filename from a path', () => {
    expect(getAttachmentFileName('/path/to/file.jpg')).toBe('file.jpg')
  })

  it('extracts filename from path with query parameters', () => {
    expect(getAttachmentFileName('/uploads/document.pdf?version=1')).toBe('document.pdf')
  })

  it('returns unknown for empty or invalid paths', () => {
    expect(getAttachmentFileName('')).toBe('unknown')
    expect(getAttachmentFileName('/')).toBe('unknown')
  })
})
