import { SpriteSet, SpriteFrame } from './sprite-types'

/**
 * Converts a 16x16 boolean grid to a 32-byte C array string (hex format)
 * Assumes 1 bit per pixel, row-major order, MSB first.
 * 16 pixels per row = 2 bytes per row.
 * 16 rows = 32 bytes total.
 */
function frameToHex(frame: SpriteFrame): string {
  const bytes: string[] = []
  
  for (let y = 0; y < 16; y++) {
    let rowByte1 = 0
    let rowByte2 = 0
    
    // First 8 pixels (0-7) -> Byte 1
    for (let x = 0; x < 8; x++) {
      if (frame.pixels[y][x] === 1) {
        rowByte1 |= (1 << (7 - x))
      }
    }
    
    // Next 8 pixels (8-15) -> Byte 2
    for (let x = 0; x < 8; x++) {
      if (frame.pixels[y][x + 8] === 1) {
        rowByte2 |= (1 << (7 - x))
      }
    }
    
    bytes.push(`0x${rowByte1.toString(16).padStart(2, '0').toUpperCase()}`)
    bytes.push(`0x${rowByte2.toString(16).padStart(2, '0').toUpperCase()}`)
  }
  
  return bytes.join(', ')
}

export function generateCCode(spriteSet: SpriteSet): string {
  let cCode = `// Generated Sprite Data for ESP32\n`
  cCode += `// Format: 16x16 pixels, 1 bit per pixel, 32 bytes per frame\n\n`
  
  const processAnimation = (name: string, frames: SpriteFrame[]) => {
    cCode += `// Animation: ${name}\n`
    cCode += `const uint8_t ${name}_frames[][32] = {\n`
    
    frames.forEach((frame, index) => {
      cCode += `  { ${frameToHex(frame)} }, // Frame ${index} (${frame.duration}ms)\n`
    })
    
    cCode += `};\n`
    cCode += `const int ${name}_durations[] = { ${frames.map(f => f.duration).join(', ')} };\n`
    cCode += `const int ${name}_count = ${frames.length};\n\n`
  }

  // Export Idle Moods
  Object.entries(spriteSet.idle).forEach(([mood, anim]) => {
    processAnimation(`anim_idle_${mood}`, anim.frames)
  })

  // Export Actions
  Object.entries(spriteSet.actions).forEach(([action, anim]) => {
    processAnimation(`anim_action_${action}`, anim.frames)
  })

  return cCode
}
