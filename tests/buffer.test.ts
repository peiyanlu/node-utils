import { expect, it } from 'vitest'
import { arrayBufferToBuffer, bufferToArrayBuffer, bufferToUint8, uint8ToBuffer } from '../src/index.js'


it('bufferToUint8', () => {
  const source = Buffer.from([ 1, 2, 3 ])
  
  const result = bufferToUint8(source)
  
  expect(result)
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  
  // 修改生成的 Uint8Array
  result[0] = 9
  
  // 生成的 Uint8Array 被修改
  expect(result)
    .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
  
  // 原数据不该被修改
  expect(source)
    .toStrictEqual(Buffer.from([ 1, 2, 3 ]))
})

it('bufferToUint8 handles offset', () => {
  const origin = Buffer.from([ 0, 1, 2, 3 ])
  const source = origin.subarray(1, 3)
  
  const result = bufferToUint8(source)
  
  expect(result)
    .toStrictEqual(new Uint8Array([ 1, 2 ]))
})


it('uint8ToBuffer', () => {
  const source = new Uint8Array([ 1, 2, 3 ])
  
  const result = uint8ToBuffer(source)
  
  expect(result)
    .toStrictEqual(Buffer.from([ 1, 2, 3 ]))
  
  // 修改生成的 Buffer
  result[0] = 9
  
  // 生成的 Buffer 被修改
  expect(result)
    .toStrictEqual(Buffer.from([ 9, 2, 3 ]))
  
  // 原数据不该被修改
  expect(source)
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
})

it('uint8ToBuffer handles offset', () => {
  const origin = new Uint8Array([ 0, 1, 2, 3 ])
  const source = origin.subarray(1, 3)
  
  const result = uint8ToBuffer(source)
  
  expect(result)
    .toStrictEqual(Buffer.from([ 1, 2 ]))
})


it('bufferToArrayBuffer', () => {
  const source = Buffer.from([ 1, 2, 3 ])
  
  const result = bufferToArrayBuffer(source)
  
  expect(new Uint8Array(result))
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  
  const uint8 = new Uint8Array(result)
  
  // 修改生成的 ArrayBuffer
  uint8[0] = 9
  
  // 生成的 ArrayBuffer 被修改
  expect(uint8)
    .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
  
  // 原数据不该被修改
  expect(source)
    .toStrictEqual(Buffer.from([ 1, 2, 3 ]))
})

it('bufferToArrayBuffer handles offset', () => {
  const origin = Buffer.from([ 0, 1, 2, 3 ])
  const source = origin.subarray(1, 3)
  
  const result = bufferToArrayBuffer(source)
  
  expect(new Uint8Array(result))
    .toStrictEqual(new Uint8Array([ 1, 2 ]))
})


it('arrayBufferToBuffer', () => {
  const source = new Uint8Array([ 1, 2, 3 ]).buffer
  
  const result = arrayBufferToBuffer(source)
  
  expect(result)
    .toStrictEqual(Buffer.from([ 1, 2, 3 ]))
  
  // 修改生成的 Buffer
  result[0] = 9
  
  // 生成的 Buffer 被修改
  expect(result)
    .toStrictEqual(Buffer.from([ 9, 2, 3 ]))
  
  // 原数据不该被修改
  expect(new Uint8Array(source))
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
})

it('arrayBufferToBuffer handles offset', () => {
  const origin = new Uint8Array([ 0, 1, 2, 3 ]).buffer
  const source = origin.slice(1, 3)
  
  const result = arrayBufferToBuffer(source)
  
  expect(result)
    .toStrictEqual(Buffer.from([ 1, 2 ]))
})
