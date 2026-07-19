import { createTempDir, SetupManager, Tool } from '@peiyanlu/test-tools'
import { type BinaryLike, createHash } from 'node:crypto'
import { afterAll, describe, expect, it } from 'vitest'
import { hash, hashFile } from '../src/index.js'


const TEMP_DIR = createTempDir()
let tool: Tool
const manager = new SetupManager()

manager.setSetup([
  () => {
    tool = new Tool(TEMP_DIR)
  },
  () => {
    tool.writeFileSync('a.txt', 'hello')
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


const sha256 = (value: BinaryLike) =>
  createHash('sha256').update(value).digest('hex')

const md5 = (value: BinaryLike) =>
  createHash('md5').update(value).digest('hex')


describe('hash', () => {
  it('should hash a string', () => {
    expect(hash('hello')).toBe(sha256('hello'))
  })
  
  it('should support different algorithms', () => {
    expect(hash('hello', 'md5')).toBe(md5('hello'))
  })
  
  it('should hash a buffer', () => {
    const buffer = Buffer.from('hello')
    
    expect(hash(buffer)).toBe(hash('hello'))
  })
})

describe('hashFile', () => {
  it('should hash a file', async () => {
    await manager.prepare(2)
    
    const result = await hashFile(tool.resolve('a.txt'))
    
    expect(result).toBe(hash('hello'))
  })
  
  it('should support different algorithms', async () => {
    await manager.prepare(2)
    
    const result = await hashFile(tool.resolve('a.txt'), 'md5')
    
    expect(result).toBe(hash('hello', 'md5'))
  })
  
  it('should reject if the file does not exist', async () => {
    await expect(hashFile(tool.resolve('not-found.txt')))
      .rejects.toMatchObject({
        code: 'ENOENT',
      })
  })
})
