import { type BinaryLike, createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'


export type HashAlgorithm =
  | 'md5'
  | 'sha1'
  | 'sha256'
  | 'sha384'
  | 'sha512'


export const hash = (data: BinaryLike, algorithm: HashAlgorithm = 'sha256'): string => {
  return createHash(algorithm)
    .update(data)
    .digest('hex')
}


export const hashFile = (file: string, algorithm: HashAlgorithm = 'sha256'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm)
    
    createReadStream(file)
      .on('error', reject)
      .on('data', chunk => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
  })
}
