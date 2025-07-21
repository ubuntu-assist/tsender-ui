import { describe, it, expect } from 'vitest'
import { parseListInput } from './parse-input'

describe('parseListInput', () => {
  it('parses comma-separated values', () => {
    expect(parseListInput('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('parses newline-separated values', () => {
    expect(parseListInput('a\nb\nc')).toEqual(['a', 'b', 'c'])
  })

  it('parses mixed comma and newline', () => {
    expect(parseListInput('a,\nb,\nc')).toEqual(['a', 'b', 'c'])
    expect(parseListInput('a\n,b\n,c')).toEqual(['a', 'b', 'c'])
  })

  it('trims spaces around values', () => {
    expect(parseListInput(' a , b ,  c ')).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array for empty string', () => {
    expect(parseListInput('')).toEqual([])
  })

  it('ignores empty values from extra commas/newlines', () => {
    expect(parseListInput('a,,b,\n, ,c,')).toEqual(['a', 'b', 'c'])
    expect(parseListInput('\n, ,')).toEqual([])
  })
})
