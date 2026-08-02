import { dirname, extname, posix, relative, resolve, sep } from 'node:path'
import { isWin } from './platform.js'


/** 路径归一化 */
export const normalizePath = (path: string): string => {
  const slash = (p: string): string => p.replace(/\\/g, '/')
  return posix.normalize(isWin ? slash(path) : path)
}

/** 移除文件扩展名 */
export const removeExtension = (path: string): string => {
  const oldExt = extname(path)
  return oldExt
    ? path.slice(0, -oldExt.length)
    : path
}

/** 变更文件扩展名 */
export const changeExtension = (path: string, ext: string): string => {
  return removeExtension(path) + ext
}

/** 判断是否有扩展名 */
export const hasExtension = (path: string): boolean => extname(path).length > 0

/** 判断路径是否相同 */
export const isSamePath = (a: string, b: string): boolean => resolve(a) === resolve(b)

/** 判断路径是否位于目录内（包含目录自身） */
export const isInDir = (parent: string, child: string): boolean => {
  const rel = relative(resolve(parent), resolve(child))
  return rel !== '..' && !rel.startsWith(`..${ sep }`)
}

/** 判断路径是否是目录的子路径 */
export const isSubPath = (parent: string, child: string): boolean => {
  const rel = relative(resolve(parent), resolve(child))
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${ sep }`)
}

/** 判断路径是否是目录的直接子路径 */
export const isDirectChild = (parent: string, child: string): boolean => {
  const [ absParent, absChild ] = [ resolve(parent), resolve(child) ]
  return absChild !== absParent && dirname(absChild) === absParent
}
