/** Buffer → Uint8Array */
export const bufferToUint8 = (buffer: Buffer): Uint8Array => {
  return new Uint8Array(buffer)
}

/** Uint8Array → Buffer */
export const uint8ToBuffer = (uint8: Uint8Array): Buffer => {
  return Buffer.from(uint8)
}

/** Buffer → ArrayBuffer (copy-safe) */
export const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  const uint8 = new Uint8Array(buffer)
  return uint8.buffer.slice(
    uint8.byteOffset,
    uint8.byteOffset + uint8.byteLength,
  )
}

/** ArrayBuffer → Buffer */
export const arrayBufferToBuffer = (arrayBuffer: ArrayBuffer): Buffer => {
  return Buffer.from(new Uint8Array(arrayBuffer))
}
