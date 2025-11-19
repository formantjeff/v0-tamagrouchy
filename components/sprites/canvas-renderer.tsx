import { useEffect, useRef } from 'react'

interface CanvasRendererProps {
  pixels: (number | string)[][]
  scale?: number
  className?: string
}

export function CanvasRenderer({ pixels, scale = 6, className = '' }: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const size = pixels.length

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw pixels
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel === 0) return

        if (typeof pixel === 'string') {
          ctx.fillStyle = pixel
        } else {
          ctx.fillStyle = '#000000'
        }
        ctx.fillRect(x * scale, y * scale, scale, scale)
      })
    })
  }, [pixels, scale])

  return (
    <canvas
      ref={canvasRef}
      width={size * scale}
      height={size * scale}
      className={className}
      style={{ 
        width: size * scale, 
        height: size * scale,
        imageRendering: 'pixelated' // Keep sharp edges
      }}
    />
  )
}
