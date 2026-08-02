/** 判断操作系统平台 */
export const isPlatform = (platform: NodeJS.Platform): boolean => {
  return typeof process === 'object' && platform === process.platform
}

/** window 平台 */
export const isWin: boolean = isPlatform('win32')

/** macOS 平台 */
export const isMac: boolean = isPlatform('darwin')

/** linux 平台 */
export const isLinux: boolean = isPlatform('linux')
