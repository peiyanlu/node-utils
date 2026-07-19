import { existsSync, statSync } from 'node:fs'
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'


export interface CopyDirOptions {
  rename?: Record<string, string>;
  ignore?: ((name: string, isDir: boolean, parent: string) => boolean)[];
}

/** 目录置空，支持忽略 */
export const emptyDir = async (dir: string, ignore: string[] = []): Promise<boolean> => {
  if (!existsSync(dir)) {
    return false
  }
  for (const file of await readdir(dir)) {
    if (ignore.includes(file)) {
      continue
    }
    await rm(resolve(dir, file), { recursive: true, force: true })
  }
  return true
}

/** 目录是否为空，支持忽略 */
export const isDirEmpty = async (path: string, ignore: string[] = []): Promise<boolean> => {
  const files = await readdir(path)
  const filtered = files.filter(f => !ignore.includes(f))
  return filtered.length === 0
}

/** 获取子目录，支持忽略 */
export const listSubDirs = async (source: string, ignore: string[] = []): Promise<string[]> => {
  const res = await readdir(source, { withFileTypes: true })
  return res
    .filter(k => k.isDirectory() && !ignore.includes(k.name))
    .map(dir => dir.name)
}

/** 复制目录，支持规则 */
export const copyDir = async (
  src: string,
  dest: string,
  options?: CopyDirOptions,
): Promise<void> => {
  await mkdir(dest, { recursive: true })
  const entries = await readdir(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const name = entry.name
    const isDir = entry.isDirectory()
    
    const { rename = {}, ignore = [] } = options ?? {}
    const relName = rename[name] ?? name
    if (ignore.some(rule => rule(name, isDir, src))) {
      continue
    }
    
    const from = join(src, name)
    const to = join(dest, relName)
    if (isDir) {
      await copyDir(from, to, options)
    } else {
      await copyFile(from, to)
    }
  }
}

/** 是否是目录 */
export const isDirSync = (path: string): boolean => {
  return existsSync(path) && statSync(path).isDirectory()
}
