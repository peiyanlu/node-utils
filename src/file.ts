import { type Dict, tryCall, tryCallSync } from '@peiyanlu/ts-utils'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'


/** 编辑文件 */
export const editFile = async (
  file: string,
  callback: (content: string) => Promise<string> | string,
): Promise<void> => {
  if (!existsSync(file)) return
  const content = await readFile(file, 'utf-8')
  const data = await callback(content)
  return writeFile(file, `${ data }\n`, 'utf-8')
}

/** 编辑 JSON 文件 */
export const editJsonFile = async <T extends Dict>(
  file: string,
  callback: (json: T) => Promise<void> | void,
): Promise<void> => {
  return editFile(file, async (str) => {
    return tryCall(async () => {
      const json = JSON.parse(str) as T
      await callback(json)
      return JSON.stringify(json, null, 2)
    }, str)
  })
}

/** 读取 JSON 文件 */
export const readJsonFile = async <T extends Dict<any>>(file: string): Promise<T> => {
  if (!existsSync(file)) return {} as T
  return tryCall(async () => {
    const text = await readFile(file, 'utf-8')
    return JSON.parse(text) as T
  }, {} as T)
}

/** {@link readJsonFile} 的同步版本 */
export const readJsonFileSync = <T extends Record<string, unknown>>(file: string): T => {
  if (!existsSync(file)) return {} as T
  return tryCallSync(() => {
    const text = readFileSync(file, 'utf-8')
    return JSON.parse(text) as T
  }, {} as T)
}

/** 写入 JSON 文件 */
export const writeJsonFile = async <T extends Dict>(file: string, json: T): Promise<void> => {
  const data = JSON.stringify(json, null, 2)
  return writeFile(file, `${ data }\n`, 'utf-8')
}

/** {@link writeJsonFile} 的同步版本 */
export const writeJsonFileSync = <T extends Dict>(file: string, json: T): void => {
  const data = JSON.stringify(json, null, 2)
  return writeFileSync(file, `${ data }\n`, 'utf-8')
}

/** 是否是文件 */
export const isFileSync = (path: string): boolean => {
  return existsSync(path) && statSync(path).isFile()
}
