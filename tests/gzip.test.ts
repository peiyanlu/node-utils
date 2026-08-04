import { Tool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, expect, it } from 'vitest'
import { gzipFile } from '../src/gzip.js'


const { manager, tool } = useToolWithManager(
  Tool,
  [
    () => {
      tool.writeFileSync('a.txt', 'a')
      tool.writeFileSync('a.json', '{"version": "1.0.1"}')
    },
  ],
  afterAll,
)


it('should create a .gz file', async () => {
  await manager.prepare(1)
  
  await gzipFile(tool.resolve('a.txt'))
  
  expect(tool.existsSync('a.txt.gz')).toBe(true)
})

it('should throw for a non-existent file', async () => {
  await manager.prepare(1)
  
  await expect(gzipFile(tool.resolve('no-exist-file.txt')))
    .rejects.toMatchObject({
      code: 'ENOENT',
    })
})
