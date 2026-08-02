import { isString, isUndefined } from '@peiyanlu/ts-utils'
import { createHash } from 'node:crypto'
import { Stats, statSync } from 'node:fs'


export type EtagValue =
  | string
  | Buffer

export interface WeakEtagOptions {
  size: number
  mtime?: number
  version?: string | number
}


/** 创建强 ETag-基于内容 */
export const createEtag = (data: EtagValue): string => {
  const hash = createHash('sha1')
    .update(data)
    .digest('base64url')
  
  return `"${ hash }"`
}

/** 创建弱 ETag-基于资源特征 */
export const createWeakEtag = (options: WeakEtagOptions): string => {
  const { size, mtime, version } = options
  
  const values = [ size.toString(16) ]
  
  if (!isUndefined(mtime)) {
    values.push(Math.floor(mtime).toString(16))
  }
  
  if (!isUndefined(version)) {
    values.push(String(version))
  }
  
  return `W/"${ values.join('-') }"`
}

/** 创建弱 ETag-基于文件特征 */
export const createWeakFileEtag = (file: Stats | string) => {
  const { size, mtimeMs: mtime } = isString(file) ? statSync(file) : file
  return createWeakEtag({ size, mtime })
}
