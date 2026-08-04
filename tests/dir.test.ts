import { Tool, useToolWithManager } from '@peiyanlu/test-tools'
import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, describe, expect, it, vi } from 'vitest'
import {
  copyDir,
  createMatcher,
  createTempDir,
  emptyDir,
  isDirEmpty,
  isDirSync,
  listSubDirs,
  openDir,
} from '../src/dir.js'


vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({
    unref: vi.fn(),
  })),
}))

const { manager, tool, tempDir } = useToolWithManager(
  Tool,
  [
    () => {
      tool.writeFileSync('a.txt', 'a')
      tool.writeFileSync('b.txt', 'b')
    },
    () => {
      tool.mkdirSync('packages')
      tool.mkdirSync('node_modules')
    },
    () => {
      tool.mkdirSync('packages/node_modules', { recursive: true })
      tool.mkdirSync('packages/sub', { recursive: true })
      tool.mkdirSync('packages/ignored', { recursive: true })
      
      tool.writeFileSync('packages/sub/a.txt', 'a')
      tool.writeFileSync('packages/sub/b.txt', 'b')
      tool.writeFileSync('packages/ignored/b.txt', 'b')
      
      tool.writeFileSync('packages/a.txt', 'a')
      tool.writeFileSync('packages/_gitignore', 'logs/')
      tool.writeFileSync('packages/package.json', '{"version": "1.0.0"}')
    },
  ],
  afterAll,
)


describe('emptyDir', () => {
  it('should returns false when directory does not exist', async () => {
    await manager.prepare(1)
    
    expect(await emptyDir(tool.resolve('not-exist'))).toBe(false)
  })
  
  it('should removes files except ignored', async () => {
    await manager.prepare(1)
    
    await emptyDir(tempDir, [ 'b.txt' ])
    
    const files = await readdir(tempDir)
    expect(files).toEqual([ 'b.txt' ])
  })
})

describe('isDirEmpty', () => {
  it('should respects ignore', async () => {
    await manager.prepare(1)
    
    expect(await isDirEmpty(tempDir, [ 'a.txt', 'b.txt' ])).toBe(true)
  })
  
  it('should returns false when non-ignored files exist', async () => {
    await manager.prepare(1)
    
    expect(await isDirEmpty(tempDir, [ 'a.txt' ])).toBe(false)
  })
})

describe('listSubDirs', () => {
  it('should returns sub directories except ignored names', async () => {
    await manager.prepare(2)
    
    expect(await listSubDirs(tempDir, [ 'node_modules' ])).toEqual([ 'packages' ])
  })
  
  it('should returns all sub directories', async () => {
    await manager.prepare(2)
    
    expect(await listSubDirs(tempDir)).toEqual([ 'node_modules', 'packages' ])
  })
})

describe('copyDir', () => {
  it('should copies directory with rename & ignore rules', async () => {
    await manager.prepare(3)
    
    const src = tool.resolve('packages')
    const dest = tool.resolve('dest')
    
    await copyDir(src, dest, {
      rename: {
        _gitignore: '.gitignore',
      },
      ignore: [
        (name) => name === 'a.txt',
      ],
    })
    
    const files = await readdir(dest)
    expect(files).toContain('.gitignore')
    expect(files).not.toContain('a.txt')
    
    const sub = await readdir(join(dest, 'sub'))
    expect(sub).not.toContain('a.txt')
    expect(sub).toContain('b.txt')
  })
  
  it('should copies directory with default behavior', async () => {
    await manager.prepare(3)
    
    const src = tool.resolve('packages')
    const dest = tool.resolve('dest')
    
    await copyDir(src, dest)
    
    const files = await readdir(dest)
    expect(files).toContain('node_modules')
    expect(files).toContain('a.txt')
    expect(files).toContain('_gitignore')
    expect(files).toContain('package.json')
  })
  
  it('should copies nested directories and can ignore directories', async () => {
    await manager.prepare(3)
    
    const src = tool.resolve('packages')
    const dest = tool.resolve('dest')
    
    await copyDir(src, dest, {
      ignore: [
        (name, isDir) => isDir && name === 'ignored',
      ],
    })
    
    expect(tool.readFileSync(join(dest, 'sub', 'a.txt'), 'utf-8')).toBe('a')
    expect(tool.existsSync(join(dest, 'ignored'))).toBe(false)
  })
})

it('isDirSync should determine whether the path is dir', async () => {
  await manager.prepare(2)
  
  expect(isDirSync(tool.resolve('packages'))).toBe(true)
  expect(isDirSync(tool.resolve('no-exist-packages'))).toBe(false)
  expect(isDirSync(tool.resolve('a.txt'))).toBe(false)
})

it('createTempDir should create temp dir', async () => {
  const { path, name, remove } = await createTempDir(tool.cwd)
  
  expect(name).toMatch(/temp-/)
  expect(path.endsWith(name)).toBe(true)
  expect(tool.existsSync(path)).toBe(true)
  
  await remove()
  
  expect(tool.existsSync(path)).toBe(false)
})

describe('createMatcher', () => {
  it('should support literal string', () => {
    const matcher = createMatcher('literal-string')
    
    expect(matcher('literal string')).toBe(false)
    expect(matcher('literal-string')).toBe(true)
  })
  
  it('should support regexp', () => {
    const matcher = createMatcher(/README\.[\w-]+\.md/)
    
    expect(matcher('README.md')).toBe(false)
    expect(matcher('README.en.md')).toBe(true)
    expect(matcher('README.zh.md')).toBe(true)
  })
  
  it('should support glob', () => {
    const matcher = createMatcher('*.config.{ts,cts,mts}')
    
    expect(matcher('tsdown.config.mts')).toBe(true)
    expect(matcher('vitest.config.mts')).toBe(true)
    expect(matcher('vitestconfig.mts')).toBe(false)
  })
})

it('openDir should opens directory', () => {
  const platformTest = vi.spyOn(process, 'platform', 'get')
  platformTest.mockReturnValue('win32')
  
  openDir('c:/tmp/test')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('darwin')
  
  openDir('/tmp/test')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('linux')
  
  openDir('/tmp/test')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('android')
  
  expect(() => openDir('/tmp/test')).toThrow()
})
