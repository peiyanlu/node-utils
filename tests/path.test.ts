import { describe, expect, it, vi } from 'vitest'
import {
  changeExtension,
  hasExtension,
  isDirectChild,
  isInDir,
  isSamePath,
  isSubPath,
  removeExtension,
} from '../src/path.js'


describe('normalizePath', () => {
  it('should normalize windows path', async () => {
    vi.spyOn(process, 'platform', 'get')
      .mockReturnValue('win32')
    
    vi.resetModules()
    
    const { normalizePath } = await import('../src/path.js')
    
    expect(normalizePath('C:\\foo\\bar\\..\\baz'))
      .toBe('C:/foo/baz')
  })
  
  it('should normalize windows path separator', async () => {
    vi.spyOn(process, 'platform', 'get')
      .mockReturnValue('win32')
    
    vi.resetModules()
    
    const { normalizePath } = await import('../src/path.js')
    
    expect(normalizePath('foo\\bar\\baz'))
      .toBe('foo/bar/baz')
  })
  
  it('should normalize unix path', async () => {
    vi.spyOn(process, 'platform', 'get')
      .mockReturnValue('linux')
    
    vi.resetModules()
    
    const { normalizePath } = await import('../src/path.js')
    
    expect(normalizePath('/foo/bar/../baz'))
      .toBe('/foo/baz')
  })
  
  it('should keep unix separator', async () => {
    vi.spyOn(process, 'platform', 'get')
      .mockReturnValue('linux')
    
    vi.resetModules()
    
    const { normalizePath } = await import('../src/path.js')
    
    expect(normalizePath('foo/bar'))
      .toBe('foo/bar')
  })
})

it('removeExtension', () => {
  expect(removeExtension('src/path.ts')).toBe('src/path')
  expect(removeExtension('src/path')).toBe('src/path')
  expect(removeExtension('.env')).toBe('.env')
})

it('changeExtension', () => {
  expect(changeExtension('src/path.ts', '.mts')).toBe('src/path.mts')
  expect(changeExtension('src/path', '.ts')).toBe('src/path.ts')
})

it('hasExtension', () => {
  expect(hasExtension('src/path.ts')).toBe(true)
  expect(hasExtension('src/path')).toBe(false)
  expect(hasExtension('.env')).toBe(false)
})

it('isSamePath', () => {
  expect(isSamePath('src/path.ts', 'src\\path.ts')).toBe(true)
})

describe('isInDir', () => {
  it('should return true when path is inside directory', () => {
    expect(isInDir('/tmp/test', '/tmp/test/file.txt')).toBe(true)
    expect(isInDir('/tmp/test', '/tmp/test/a/b/file.txt')).toBe(true)
  })
  
  it('should return true when path equals directory', () => {
    expect(isInDir('/tmp/test', '/tmp/test')).toBe(true)
    expect(isInDir('/tmp/test', '/tmp/test/')).toBe(true)
  })
  
  it('should handle trailing slash', () => {
    expect(isInDir('/tmp/test/', '/tmp/test/file.txt')).toBe(true)
    expect(isInDir('/tmp/test/', '/tmp/test/')).toBe(true)
  })
  
  it('should return false when path is parent directory', () => {
    expect(isInDir('/tmp/test', '/tmp')).toBe(false)
  })
  
  it('should return false when path is sibling directory', () => {
    expect(isInDir('/tmp/test', '/tmp/foo')).toBe(false)
    expect(isInDir('/tmp/test', '/tmp/testing')).toBe(false)
  })
  
  it('should not confuse similar directory names', () => {
    expect(isInDir('/tmp/test', '/tmp/test2/file.txt')).toBe(false)
  })
})

describe('isSubPath', () => {
  it('should return true when path is inside directory', () => {
    expect(isSubPath('/tmp/test', '/tmp/test/file.txt')).toBe(true)
    expect(isSubPath('/tmp/test', '/tmp/test/a/b/file.txt')).toBe(true)
  })
  
  it('should return false when path equals directory', () => {
    expect(isSubPath('/tmp/test', '/tmp/test')).toBe(false)
    expect(isSubPath('/tmp/test', '/tmp/test/')).toBe(false)
  })
  
  it('should handle trailing slash', () => {
    expect(isSubPath('/tmp/test/', '/tmp/test/file.txt')).toBe(true)
    expect(isSubPath('/tmp/test/', '/tmp/test/')).toBe(false)
  })
  
  it('should return false when path is parent directory', () => {
    expect(isSubPath('/tmp/test', '/tmp')).toBe(false)
  })
  
  it('should return false when path is sibling directory', () => {
    expect(isSubPath('/tmp/test', '/tmp/foo')).toBe(false)
    expect(isSubPath('/tmp/test', '/tmp/testing')).toBe(false)
  })
  
  it('should not confuse similar directory names', () => {
    expect(isSubPath('/tmp/test', '/tmp/test2/file.txt')).toBe(false)
  })
})

describe('isDirectChild', () => {
  it('should return true when path is direct child', () => {
    expect(isDirectChild('/tmp/test', '/tmp/test/file.txt')).toBe(true)
    expect(isDirectChild('/tmp/test', '/tmp/test/child')).toBe(true)
  })
  
  it('should return false when path equals directory', () => {
    expect(isDirectChild('/tmp/test', '/tmp/test')).toBe(false)
    expect(isDirectChild('/tmp/test', '/tmp/test/')).toBe(false)
  })
  
  it('should return false when path is nested child', () => {
    expect(isDirectChild('/tmp/test', '/tmp/test/a/b')).toBe(false)
    expect(isDirectChild('/tmp/test', '/tmp/test/a/b.txt')).toBe(false)
  })
  
  it('should return false when path is parent directory', () => {
    expect(isDirectChild('/tmp/test', '/tmp')).toBe(false)
  })
  
  it('should return false when path is sibling', () => {
    expect(isDirectChild('/tmp/test', '/tmp/foo')).toBe(false)
  })
  
  it('should not confuse similar directory names', () => {
    expect(isDirectChild('/tmp/test', '/tmp/testing')).toBe(false)
  })
})
