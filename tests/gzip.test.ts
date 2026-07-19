import { createTempDir, SetupManager, Tool } from '@peiyanlu/test-tools'
import { afterAll, expect, it } from 'vitest'
import { gzipFile } from '../src/index.js'


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
  },
  () => {
    tool.mkdirSync('packages')
    tool.mkdirSync('node_modules')
  },
])

manager.setTeardown(() => {
  tool?.cleanup(true)
})

afterAll(() => {
  tool?.cleanup()
})


it('should create a .gz file', async () => {
  await manager.prepare(2)
  
  await gzipFile(tool.resolve('a.txt'))
  
  expect(tool.existsSync('a.txt.gz')).toBe(true)
})

it('should throw for a non-existent file', async () => {
  await manager.prepare(2)
  
  await expect(gzipFile(tool.resolve('no-exist-file.txt')))
    .rejects.toMatchObject({
      code: 'ENOENT',
    })
})
