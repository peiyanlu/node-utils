import { createTempWorkspace, SetupManager, Tool } from '@peiyanlu/test-tools'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, expect, it } from 'vitest'
import { copyDir, createMatcher, createTempDir, emptyDir, isDirEmpty, isDirSync, listSubDirs } from '../src/index.js'


const { path: TEMP_DIR } = createTempWorkspace()
let tool: Tool
const manager = new SetupManager()

manager.setSetup([
  () => {
    tool = new Tool(TEMP_DIR)
  },
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
])

manager.setTeardown(() => {
  tool?.cleanup(true)
})

afterAll(() => {
  tool?.cleanup()
})


it('emptyDir returns false when directory does not exist', async () => {
  await manager.prepare(1)
  expect(await emptyDir(join(TEMP_DIR, 'not-exist'))).toBe(false)
})

it('emptyDir removes files except ignored', async () => {
  await manager.prepare(2)
  
  await emptyDir(TEMP_DIR, [ 'b.txt' ])
  
  const files = await readdir(TEMP_DIR)
  expect(files).toEqual([ 'b.txt' ])
})

it('isDirEmpty respects ignore', async () => {
  await manager.prepare(2)
  expect(await isDirEmpty(TEMP_DIR, [ 'a.txt', 'b.txt' ])).toBe(true)
})

it('isDirEmpty returns false when non-ignored files exist', async () => {
  await manager.prepare(2)
  
  expect(await isDirEmpty(TEMP_DIR, [ 'a.txt' ])).toBe(false)
})

it('listSubDirs returns sub directories except ignored names', async () => {
  await manager.prepare(3)
  
  expect(await listSubDirs(TEMP_DIR, [ 'node_modules' ])).toEqual([ 'packages' ])
})

it('listSubDirs returns all sub directories', async () => {
  await manager.prepare(3)
  
  expect(await listSubDirs(TEMP_DIR)).toEqual([ 'node_modules', 'packages' ])
})

it('copyDir copies directory with rename & ignore rules', async () => {
  await manager.prepare(4)
  
  const src = join(TEMP_DIR, 'packages')
  const dest = join(TEMP_DIR, 'dest')
  
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

it('copyDir copies directory with default behavior', async () => {
  await manager.prepare(4)
  
  const src = join(TEMP_DIR, 'packages')
  const dest = join(TEMP_DIR, 'dest')
  
  await copyDir(src, dest)
  
  const files = await readdir(dest)
  expect(files).toContain('node_modules')
  expect(files).toContain('a.txt')
  expect(files).toContain('_gitignore')
  expect(files).toContain('package.json')
})

it('copyDir copies nested directories and can ignore directories', async () => {
  await manager.prepare(4)
  
  const src = join(TEMP_DIR, 'packages')
  const dest = join(TEMP_DIR, 'dest')
  
  await copyDir(src, dest, {
    ignore: [
      (name, isDir) => isDir && name === 'ignored',
    ],
  })
  
  expect(tool.readFileSync(join(dest, 'sub', 'a.txt'), 'utf-8')).toBe('a')
  expect(tool.existsSync(join(dest, 'ignored'))).toBe(false)
})

it('isDirSync determine whether the path is dir', async () => {
  await manager.prepare(3)
  
  expect(isDirSync(tool.resolve('packages'))).toBe(true)
  expect(isDirSync(tool.resolve('no-exist-packages'))).toBe(false)
  expect(isDirSync(tool.resolve('a.txt'))).toBe(false)
})

it('createTempDir should create temp dir', async () => {
  await manager.prepare(1)
  
  const { path, name, remove } = await createTempDir(tool.cwd)
  
  expect(name).toMatch(/tmp-/)
  expect(path.endsWith(name)).toBe(true)
  expect(tool.existsSync(path)).toBe(true)
  
  await remove()
  
  expect(tool.existsSync(path)).toBe(false)
})

it('createMatcher should support literal string', () => {
  const matcher = createMatcher('literal-string')
  
  expect(matcher('literal string')).toBe(false)
  expect(matcher('literal-string')).toBe(true)
})

it('createMatcher should support regexp', () => {
  const matcher = createMatcher(/README\.[\w-]+\.md/)
  
  expect(matcher('README.md')).toBe(false)
  expect(matcher('README.en.md')).toBe(true)
  expect(matcher('README.zh.md')).toBe(true)
})

it('createMatcher should support glob', () => {
  const matcher = createMatcher('*.config.{ts,cts,mts}')
  
  expect(matcher('tsdown.config.mts')).toBe(true)
  expect(matcher('vitest.config.mts')).toBe(true)
  expect(matcher('vitestconfig.mts')).toBe(false)
})
