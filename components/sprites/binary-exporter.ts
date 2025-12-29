/**
 * Generates binary animation files according to Tamagrouchy Asset Format Specification v1.0
 * Binary format for ESP32-S3 with LVGL
 */

export type ColorFormat = "GRAYSCALE_8BIT" | "GRAYSCALE_4BIT" | "INDEXED_256" | "RGB565"

export interface AnimationConfig {
  width: number
  height: number
  frameCount: number
  fps: number
  colorFormat: ColorFormat
  compression: number // 0=None, 1=RLE, 2=LZ4 (currently only 0 supported)
}

/**
 * Generates a binary .bin file compatible with the Tamagrouchy Asset Format Specification
 */
export function generateBinaryAnimation(frames: (number | string)[][][], config: AnimationConfig): Uint8Array {
  const { width, height, frameCount, fps, colorFormat, compression } = config

  // Calculate frame data size
  let frameDataSize = 0
  const processedFrames: Uint8Array[] = []

  frames.forEach((frame) => {
    const frameData = encodeFrame(frame, width, height, colorFormat)
    processedFrames.push(frameData)
    frameDataSize += frameData.length
  })

  // Total file size = 32 byte header + frame data
  const totalSize = 32 + frameDataSize
  const buffer = new Uint8Array(totalSize)
  let offset = 0

  // Write Header (32 bytes)
  // Magic number: 0x54414D41 ("TAMA") - little endian
  buffer[offset++] = 0x41 // 'A'
  buffer[offset++] = 0x4d // 'M'
  buffer[offset++] = 0x41 // 'A'
  buffer[offset++] = 0x54 // 'T'

  // Version: 0x0100 (v1.0) - little endian
  buffer[offset++] = 0x00
  buffer[offset++] = 0x01

  // Width (uint16_t, little endian)
  buffer[offset++] = width & 0xff
  buffer[offset++] = (width >> 8) & 0xff

  // Height (uint16_t, little endian)
  buffer[offset++] = height & 0xff
  buffer[offset++] = (height >> 8) & 0xff

  // Frame count (uint16_t, little endian)
  buffer[offset++] = frameCount & 0xff
  buffer[offset++] = (frameCount >> 8) & 0xff

  // FPS (uint16_t, little endian)
  buffer[offset++] = fps & 0xff
  buffer[offset++] = (fps >> 8) & 0xff

  // Color format (uint8_t)
  const colorFormatValue = getColorFormatValue(colorFormat)
  buffer[offset++] = colorFormatValue

  // Compression (uint8_t)
  buffer[offset++] = compression

  // Frame data size (uint32_t, little endian)
  buffer[offset++] = frameDataSize & 0xff
  buffer[offset++] = (frameDataSize >> 8) & 0xff
  buffer[offset++] = (frameDataSize >> 16) & 0xff
  buffer[offset++] = (frameDataSize >> 24) & 0xff

  // Reserved (12 bytes, set to 0)
  for (let i = 0; i < 12; i++) {
    buffer[offset++] = 0
  }

  // Write frame data
  processedFrames.forEach((frameData) => {
    buffer.set(frameData, offset)
    offset += frameData.length
  })

  return buffer
}

function getColorFormatValue(format: ColorFormat): number {
  switch (format) {
    case "GRAYSCALE_8BIT":
      return 0
    case "GRAYSCALE_4BIT":
      return 1
    case "INDEXED_256":
      return 2
    case "RGB565":
      return 3
    default:
      return 0
  }
}

function encodeFrame(
  frame: (number | string)[][],
  width: number,
  height: number,
  colorFormat: ColorFormat,
): Uint8Array {
  switch (colorFormat) {
    case "GRAYSCALE_8BIT":
      return encodeGrayscale8bit(frame, width, height)
    case "GRAYSCALE_4BIT":
      return encodeGrayscale4bit(frame, width, height)
    case "RGB565":
      return encodeRGB565(frame, width, height)
    default:
      throw new Error(`Unsupported color format: ${colorFormat}`)
  }
}

function encodeGrayscale8bit(frame: (number | string)[][], width: number, height: number): Uint8Array {
  const buffer = new Uint8Array(width * height)
  let offset = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = frame[y][x]
      // If pixel is a number (0 or 1 from 1-bit mode), convert to grayscale
      // 0 = black (0), 1 = white (255)
      if (typeof pixel === "number") {
        buffer[offset++] = pixel === 0 ? 0 : 255
      } else {
        // If pixel is a hex color, convert to grayscale
        const r = Number.parseInt(pixel.slice(1, 3), 16)
        const g = Number.parseInt(pixel.slice(3, 5), 16)
        const b = Number.parseInt(pixel.slice(5, 7), 16)
        const gray = Math.round((r + g + b) / 3)
        buffer[offset++] = gray
      }
    }
  }

  return buffer
}

function encodeGrayscale4bit(frame: (number | string)[][], width: number, height: number): Uint8Array {
  const buffer = new Uint8Array(Math.ceil((width * height) / 2))
  let offset = 0
  let nibbleCount = 0
  let currentByte = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = frame[y][x]
      let gray4bit: number

      if (typeof pixel === "number") {
        // 0 or 1 -> 0 or 15
        gray4bit = pixel === 0 ? 0 : 15
      } else {
        // Convert hex to grayscale, then to 4-bit (0-15)
        const r = Number.parseInt(pixel.slice(1, 3), 16)
        const g = Number.parseInt(pixel.slice(3, 5), 16)
        const b = Number.parseInt(pixel.slice(5, 7), 16)
        const gray = Math.round((r + g + b) / 3)
        gray4bit = Math.round((gray / 255) * 15)
      }

      // Pack 2 pixels per byte (high nibble, low nibble)
      if (nibbleCount === 0) {
        currentByte = (gray4bit & 0x0f) << 4
        nibbleCount = 1
      } else {
        currentByte |= gray4bit & 0x0f
        buffer[offset++] = currentByte
        currentByte = 0
        nibbleCount = 0
      }
    }
  }

  // If odd number of pixels, write the last partial byte
  if (nibbleCount === 1) {
    buffer[offset++] = currentByte
  }

  return buffer
}

function encodeRGB565(frame: (number | string)[][], width: number, height: number): Uint8Array {
  const buffer = new Uint8Array(width * height * 2)
  let offset = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = frame[y][x]
      let r: number, g: number, b: number

      if (typeof pixel === "number") {
        // 0 = black, 1 = white
        const val = pixel === 0 ? 0 : 255
        r = val
        g = val
        b = val
      } else {
        // Parse hex color
        r = Number.parseInt(pixel.slice(1, 3), 16)
        g = Number.parseInt(pixel.slice(3, 5), 16)
        b = Number.parseInt(pixel.slice(5, 7), 16)
      }

      // Convert to RGB565
      const r5 = (r >> 3) & 0x1f
      const g6 = (g >> 2) & 0x3f
      const b5 = (b >> 3) & 0x1f

      const rgb565 = (r5 << 11) | (g6 << 5) | b5

      // Little endian: low byte first, then high byte
      buffer[offset++] = rgb565 & 0xff
      buffer[offset++] = (rgb565 >> 8) & 0xff
    }
  }

  return buffer
}

/**
 * Calculate the estimated flash size for the given configuration
 */
export function calculateFlashSize(
  width: number,
  height: number,
  frameCount: number,
  colorFormat: ColorFormat,
): number {
  const headerSize = 32
  let frameSize = 0

  switch (colorFormat) {
    case "GRAYSCALE_8BIT":
      frameSize = width * height
      break
    case "GRAYSCALE_4BIT":
      frameSize = Math.ceil((width * height) / 2)
      break
    case "RGB565":
      frameSize = width * height * 2
      break
    case "INDEXED_256":
      frameSize = 512 + width * height // palette + pixels
      break
  }

  return headerSize + frameSize * frameCount
}
