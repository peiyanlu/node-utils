import type { Stats } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createEtag, createWeakEtag, createWeakFileEtag } from '../src/etag.js'


describe('createEtag', () => {
  it('should create strong etag', () => {
    const etag = createEtag('hello')
    
    expect(etag).toMatch(/^"[^"]+"$/)
    expect(etag.startsWith('W/')).toBe(false)
  })
  
  it('should generate same etag for same data', () => {
    expect(createEtag('hello')).toBe(createEtag('hello'))
  })
  
  it('should generate different etag for different data', () => {
    expect(createEtag('hello')).not.toBe(createEtag('world'))
  })
  
  it('should support Buffer', () => {
    expect(createEtag('hello')).toBe(createEtag(Buffer.from('hello')))
  })
})

describe('createWeakEtag', () => {
  it('should create weak etag with size only', () => {
    expect(
      createWeakEtag({
        size: 100,
      }),
    ).toBe('W/"64"')
  })
  
  it('should create weak etag with size and mtime', () => {
    expect(
      createWeakEtag({
        size: 1024,
        mtime: 1700000000000,
      }),
    ).toBe(`W/"400-${ Math.floor(1700000000000).toString(16) }"`)
  })
  
  it('should ignore undefined mtime', () => {
    expect(
      createWeakEtag({
        size: 1024,
        mtime: undefined,
      }),
    ).toBe('W/"400"')
  })
  
  it('should create weak etag with version', () => {
    expect(
      createWeakEtag({
        size: 100,
        version: 10,
      }),
    ).toBe('W/"64-10"')
  })
  
  it('should create weak etag with all fields', () => {
    expect(
      createWeakEtag({
        size: 1024,
        mtime: 1000,
        version: 2,
      }),
    ).toBe('W/"400-3e8-2"')
  })
  
  it('should floor float mtime', () => {
    expect(
      createWeakEtag({
        size: 1,
        mtime: 10.9,
      }),
    ).toBe('W/"1-a"')
  })
  
  it('should support zero values', () => {
    expect(
      createWeakEtag({
        size: 0,
        mtime: 0,
        version: 0,
      }),
    ).toBe('W/"0-0-0"')
  })
})

describe('createWeakFileEtag', () => {
  it('should create etag from Stats', () => {
    const stat = {
      size: 1024,
      mtimeMs: 1000,
    } as Stats
    
    expect(createWeakFileEtag(stat)).toBe('W/"400-3e8"')
  })
  
  it('should create etag from file path', () => {
    const etag = createWeakFileEtag(__filename)
    
    expect(etag).toMatch(/^W\/"[0-9a-f]+-[0-9a-f]+"/)
  })
  
  it('should throw when file does not exist', () => {
    expect(() => createWeakFileEtag('./not-exist-file.txt')).toThrow()
  })
})
