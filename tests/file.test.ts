import { createTempDir, SetupManager, Tool } from '@peiyanlu/test-tools'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, expect, it, vi } from 'vitest'
import { editFile, editJsonFile, readJsonFile, readJsonFileSync } from '../src/index.js'


const TEMP_DIR = createTempDir()
let tool: Tool
const manager = new SetupManager()

manager.setSetup([
  () => {
    tool = new Tool(TEMP_DIR)
  },
  () => {
    tool.writeFileSync('a.txt', 'a')
    tool.writeFileSync('a.json', '{"version": "1.0.1"}')
    tool.writeFileSync('b.json', '{ invalid json }')
  },
])

manager.setTeardown(() => {
  tool?.cleanup(true)
})

afterAll(() => {
  tool?.cleanup()
})


it('editFile skips missing file', async () => {
  await manager.prepare(1)
  
  const file = join(TEMP_DIR, 'missing.txt')
  await editFile(file, () => 'created')
  
  expect(existsSync(file)).toBe(false)
})

it('editFile edits text file', async () => {
  await manager.prepare(2)
  
  const file = join(TEMP_DIR, 'a.txt')
  await editFile(file, c => c.toUpperCase())
  
  expect(tool.readFileSync('a.txt', 'utf-8')).toBe('A\n')
})

it('editJsonFile edits json safely', async () => {
  await manager.prepare(2)
  
  const file = join(TEMP_DIR, 'a.json')
  await editJsonFile(file, json => {
    json.version = '2.0.0'
  })
  
  const content = JSON.parse(tool.readFileSync(file, 'utf-8'))
  expect(content.version).toBe('2.0.0')
})

it('editJsonFile keeps invalid json unchanged', async () => {
  await manager.prepare(2)
  
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  
  const file = join(TEMP_DIR, 'b.json')
  await editJsonFile(file, json => {})
  
  expect(tool.readFileSync(file, 'utf-8')).toBe('{ invalid json }\n')
  expect(spy).toHaveBeenCalled()
  spy.mockRestore()
})

it('readJsonFile reads and parses json file', async () => {
  await manager.prepare(2)
  
  const file = join(TEMP_DIR, 'a.json')
  expect(await readJsonFile(file)).toEqual({ version: '1.0.1' })
})

it('readJsonFile return {} if json is invalid', async () => {
  await manager.prepare(2)
  
  const file = join(TEMP_DIR, 'b.json')
  expect(await readJsonFile(file)).toEqual({})
})

it('readJsonFile return {} if file does not exist', async () => {
  await manager.prepare(1)
  
  const file = join(TEMP_DIR, '404.json')
  expect(await readJsonFile(file)).toEqual({})
})

it('readJsonFileSync reads and parses json file', async () => {
  await manager.prepare(2)
  
  const file = join(TEMP_DIR, 'a.json')
  expect(readJsonFileSync(file)).toEqual({ version: '1.0.1' })
})

it('readJsonFileSync return {} if json is invalid', async () => {
  await manager.prepare(2)
  
  const file = join(TEMP_DIR, 'b.json')
  expect(readJsonFileSync(file)).toEqual({})
})

it('readJsonFileSync return {} if file does not exist', async () => {
  await manager.prepare(1)
  
  const file = join(TEMP_DIR, '404.json')
  expect(readJsonFileSync(file)).toEqual({})
})
