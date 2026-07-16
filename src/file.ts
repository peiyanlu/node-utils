import { existsSync, readFileSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'


/** 编辑文件 */
export const editFile = async (
  file: string,
  callback: (content: string) => Promise<string> | string,
): Promise<void> => {
  if (!existsSync(file)) return
  const content = await readFile(file, 'utf-8')
  const data = await callback(content)
  return writeFile(file, `${ data.trimEnd() }\n`, 'utf-8')
}

/** 编辑 JSON 文件 */
export const editJsonFile = async <T extends Record<string, unknown>>(
  file: string,
  callback: (json: T) => Promise<void> | void,
): Promise<void> => {
  return editFile(file, async (str) => {
    try {
      const json = JSON.parse(str) as T
      await callback(json)
      return JSON.stringify(json, null, 2)
    } catch (e) {
      console.error(e)
      return str
    }
  })
}

/** 读取 JSON 文件 */
export const readJsonFile = async <T extends Record<string, unknown>>(file: string): Promise<T> => {
  if (!existsSync(file)) return {} as T
  try {
    const text = await readFile(file, 'utf-8')
    return JSON.parse(text) as T
  } catch (e) {
    console.error(e)
    return {} as T
  }
}

/** {@link readJsonFile} 的同步版本 */
export const readJsonFileSync = <T extends Record<string, unknown>>(file: string): T => {
  if (!existsSync(file)) return {} as T
  try {
    const text = readFileSync(file, 'utf-8')
    return JSON.parse(text) as T
  } catch (e) {
    console.error(e)
    return {} as T
  }
}
