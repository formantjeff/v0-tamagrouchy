import React from 'react'

interface PixelRendererProps {
  pixels: (number | string)[][]
  scale?: number
  className?: string
}

export function PixelRenderer({ pixels, scale = 6, className = '' }: PixelRendererProps) {
  const size = pixels.length
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{ 
        width: size * scale, 
        height: size * scale 
      }}
    >
      {pixels.map((row, y) => (
        row.map((pixel, x) => {
          if (pixel === 0) return null
          
          const style: React.CSSProperties = {
            left: x * scale,
            top: y * scale,
            width: scale,
            height: scale,
          }

          if (typeof pixel === 'string') {
            style.backgroundColor = pixel
            return (
              <div
                key={`${x}-${y}`}
                className="absolute"
                style={style}
              />
            )
          }

          return (
            <div
              key={`${x}-${y}`}
              className="absolute bg-black"
              style={style}
            />
          )
        })
      ))}
    </div>
  )
}
