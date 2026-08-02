import { expect, it, vi } from 'vitest'
import { isPlatform } from '../src/platform.js'




it('isPlatform', () => {
  const platformTest = vi.spyOn(process, 'platform', 'get')
  platformTest.mockReturnValue('win32')
  expect(isPlatform('win32')).toBe(true)
  
  platformTest.mockReturnValue('android')
  expect(isPlatform('android')).toBe(true)
  
  platformTest.mockReturnValue('openbsd')
  expect(isPlatform('openbsd')).toBe(true)
  
  platformTest.mockReturnValue('linux')
  expect(isPlatform('openbsd')).toBe(false)
})

it('isWin', async () => {
  const platformTest = vi.spyOn(process, 'platform', 'get')
  platformTest.mockReturnValue('win32')
  
  vi.resetModules()
  
  const { isWin } = await import('../src/platform.js')
  
  expect(isWin).toBe(true)
})

it('isMac', async () => {
  const platformTest = vi.spyOn(process, 'platform', 'get')
  platformTest.mockReturnValue('darwin')
  
  vi.resetModules()
  
  const { isMac } = await import('../src/platform.js')
  
  expect(isMac).toBe(true)
})

it('isLinux', async () => {
  const platformTest = vi.spyOn(process, 'platform', 'get')
  platformTest.mockReturnValue('linux')
  
  vi.resetModules()
  
  const { isLinux } = await import('../src/platform.js')
  
  expect(isLinux).toBe(true)
})
