import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createGzip } from 'node:zlib'


export const gzipFile = (input: string, output = `${ input }.gz`): Promise<void> => {
  return pipeline(
    createReadStream(input),
    createGzip(),
    createWriteStream(output),
  )
}
