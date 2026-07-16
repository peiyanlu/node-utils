import { createTempDir, SetupManager, Tool } from '@peiyanlu/test-tools'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, expect, it } from 'vitest'
import { copyDir, emptyDir, isDirEmpty, listSubDirs } from '../src/index.js'


const TEMP_DIR = createTempDir()
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
