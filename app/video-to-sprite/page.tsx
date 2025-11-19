'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { PixelRenderer } from '@/components/sprites/pixel-renderer'
import { CanvasRenderer } from '@/components/sprites/canvas-renderer'
import { SpriteFrame } from '@/components/sprites/sprite-types'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function VideoToSpritePage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [frames, setFrames] = useState<(number | string)[][][]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Settings
  const [width, setWidth] = useState(16)
  const [height, setHeight] = useState(16)
  const [frameCount, setFrameCount] = useState(4)
  const [threshold, setThreshold] = useState(128)
  const [frameDuration, setFrameDuration] = useState(200) // ms per frame for playback
  
  // New Settings
  const [mode, setMode] = useState<'1-bit' | 'color'>('1-bit')
  const [compressionScheme, setCompressionScheme] = useState<string>('raw')
  const [estimatedSize, setEstimatedSize] = useState<number>(0)
  
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Animation preview state
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)

  // Animation loop
  useEffect(() => {
    if (frames.length === 0) return

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length)
    }, frameDuration)

    return () => clearInterval(interval)
  }, [frames, frameDuration])

  // Calculate estimated size
  useEffect(() => {
    if (frames.length === 0) {
      setEstimatedSize(0)
      return
    }

    let size = 0
    const pixelCount = width * height
    const totalFrames = frames.length

    if (mode === '1-bit') {
      if (compressionScheme === 'raw') {
        // 1 bit per pixel, packed into bytes
        size = Math.ceil(pixelCount / 8) * totalFrames
      } else if (compressionScheme === 'rle') {
        // Simple RLE estimation: 2 bytes per run (count, value)
        // We need to actually calculate runs for accuracy
        let totalRuns = 0
        frames.forEach(frame => {
          const flatPixels = (frame as number[][]).flat()
          let currentRun = 1
          for (let i = 1; i < flatPixels.length; i++) {
            if (flatPixels[i] === flatPixels[i-1] && currentRun < 255) {
              currentRun++
            } else {
              totalRuns++
              currentRun = 1
            }
          }
          totalRuns++ // Last run
        })
        size = totalRuns * 2
      }
    } else {
      // Color modes
      if (compressionScheme === 'rgb565') {
        size = pixelCount * 2 * totalFrames
      } else if (compressionScheme === 'rgb888') {
        size = pixelCount * 3 * totalFrames
      } else if (compressionScheme === 'rgba8888') {
        size = pixelCount * 4 * totalFrames
      }
    }

    setEstimatedSize(size)
  }, [frames, mode, compressionScheme, width, height])

  // Reset compression scheme when mode changes
  useEffect(() => {
    if (mode === '1-bit') {
      setCompressionScheme('raw')
    } else {
      setCompressionScheme('rgb565')
    }
  }, [mode])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setFrames([])
    // Reset times
    setStartTime(0)
    setEndTime(0)
  }

  const handleReset = () => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc)
    }
    setVideoSrc(null)
    setFrames([])
    setStartTime(0)
    setEndTime(0)
    setVideoDuration(0)
    setCurrentFrameIndex(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration
      setVideoDuration(dur)
      setEndTime(dur)
    }
  }

  const setCurrentTimeAsStart = () => {
    if (videoRef.current) {
      setStartTime(videoRef.current.currentTime)
    }
  }

  const setCurrentTimeAsEnd = () => {
    if (videoRef.current) {
      setEndTime(videoRef.current.currentTime)
    }
  }

  const processVideo = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !videoSrc) return

    setIsProcessing(true)
    setFrames([])

    try {
      // Wait for video to be ready
      if (video.readyState < 2) {
        await new Promise((resolve) => {
          video.onloadeddata = resolve
        })
      }

      // Use selected time range
      const effectiveDuration = endTime - startTime
      if (effectiveDuration <= 0) throw new Error('Invalid time range')

      const capturedFrames: (number | string)[][][] = []
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      
      if (!ctx) throw new Error('Could not get canvas context')

      // Set canvas size to target resolution
      canvas.width = width
      canvas.height = height

      // Capture frames
      for (let i = 0; i < frameCount; i++) {
        // Calculate timestamp for this frame relative to start time
        const time = startTime + (effectiveDuration / frameCount) * i
        video.currentTime = time

        // Wait for seek to complete
        await new Promise((resolve) => {
          video.onseeked = resolve
        })

        // Draw video frame to canvas (resized)
        ctx.drawImage(video, 0, 0, width, height)

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        const frameRows: (number | string)[][] = []

        // Convert pixels
        for (let y = 0; y < height; y++) {
          const row: (number | string)[] = []
          for (let x = 0; x < width; x++) {
            const offset = (y * width + x) * 4
            const r = data[offset]
            const g = data[offset + 1]
            const b = data[offset + 2]
            const a = data[offset + 3]

            if (mode === 'color') {
              // Convert to hex
              const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
              row.push(hex)
            } else {
              // 1-bit threshold
              const brightness = (r + g + b) / 3
              row.push(brightness < threshold ? 1 : 0)
            }
          }
          frameRows.push(row)
        }
        capturedFrames.push(frameRows)
      }

      setFrames(capturedFrames)
    } catch (error) {
      console.error('Error processing video:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const exportToConsole = () => {
    if (mode === 'color') {
      console.log('// Exported Color Frames (Hex)')
      console.log(JSON.stringify(frames, null, 2))
      alert('Color frames exported to console as JSON!')
      return
    }

    const cArray = frames.map(frame => {
      return (frame as number[][]).map(row => `"${row.map(p => p === 1 ? '#' : '.').join('')}"`).join(',\n')
    }).join('\n\n// Next Frame\n\n')
    
    console.log('// Exported Frames')
    console.log(cArray)
    alert('Frames exported to console!')
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-mono">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">VIDEO TO SPRITE</h1>
            <p className="text-gray-500">Convert video clips into pixel art animations</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-white text-black border-black hover:bg-gray-100">
              BACK TO GALLERY
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Controls Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Upload & Trim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!videoSrc ? (
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    accept="video/*,.mov,video/quicktime,video/mp4,video/x-m4v" 
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                ) : (
                  <div className="space-y-4">
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      className="w-full border-black text-black hover:bg-gray-100"
                    >
                      UPLOAD NEW VIDEO
                    </Button>
                  </div>
                )}
                {videoSrc && (
                  <div className="space-y-4">
                    <video 
                      ref={videoRef}
                      src={videoSrc}
                      className="w-full rounded-md border bg-black"
                      controls
                      muted
                      onLoadedMetadata={handleVideoLoaded}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time (s)</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            value={startTime.toFixed(2)} 
                            onChange={(e) => setStartTime(Number(e.target.value))}
                            step="0.1"
                          />
                          <Button size="sm" onClick={setCurrentTimeAsStart} variant="outline">
                            SET
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>End Time (s)</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            value={endTime.toFixed(2)} 
                            onChange={(e) => setEndTime(Number(e.target.value))}
                            step="0.1"
                          />
                          <Button size="sm" onClick={setCurrentTimeAsEnd} variant="outline">
                            SET
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Output Style</Label>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant={mode === '1-bit' ? 'default' : 'outline'}
                      onClick={() => setMode('1-bit')}
                      className={mode === '1-bit' ? 'bg-black text-white' : ''}
                    >
                      1-BIT RETRO
                    </Button>
                    <Button 
                      variant={mode === 'color' ? 'default' : 'outline'}
                      onClick={() => setMode('color')}
                      className={mode === 'color' ? 'bg-black text-white' : ''}
                    >
                      FULL COLOR
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Compression Scheme</Label>
                  <Select value={compressionScheme} onValueChange={setCompressionScheme}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select compression" />
                    </SelectTrigger>
                    <SelectContent>
                      {mode === '1-bit' ? (
                        <>
                          <SelectItem value="raw">Raw Bitmap (1-bit packed)</SelectItem>
                          <SelectItem value="rle">RLE (Run-Length Encoded)</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="rgb565">RGB565 (16-bit)</SelectItem>
                          <SelectItem value="rgb888">RGB888 (24-bit)</SelectItem>
                          <SelectItem value="rgba8888">RGBA8888 (32-bit)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Resolution ({width}x{height})</Label>
                  </div>
                  <Slider 
                    value={[width]} 
                    min={8} 
                    max={280} 
                    step={8}
                    onValueChange={(v) => {
                      setWidth(v[0])
                      setHeight(v[0])
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Frame Count ({frameCount})</Label>
                  </div>
                  <Slider 
                    value={[frameCount]} 
                    min={1} 
                    max={16} 
                    step={1}
                    onValueChange={(v) => setFrameCount(v[0])}
                  />
                </div>

                {mode === '1-bit' && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Threshold ({threshold})</Label>
                      <span className="text-xs text-gray-500">Adjust for contrast</span>
                    </div>
                    <Slider 
                      value={[threshold]} 
                      min={0} 
                      max={255} 
                      step={1}
                      onValueChange={(v) => setThreshold(v[0])}
                    />
                  </div>
                )}

                <Button 
                  onClick={processVideo} 
                  disabled={!videoSrc || isProcessing}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  {isProcessing ? 'PROCESSING...' : 'GENERATE SPRITES'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Column */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>3. Preview</CardTitle>
                <CardDescription>
                  Generated {width}x{height} {mode} animation
                  {frames.length > 0 && (
                    <span className="block mt-1 font-bold text-black">
                      Estimated Size: {formatBytes(estimatedSize)}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-8">
                {frames.length > 0 ? (
                  <>
                    <div className="flex flex-col items-center space-y-4">
                      <Label className="text-lg font-bold">ANIMATION</Label>
                      <div className="border-4 border-black p-4 bg-white">
                        <CanvasRenderer 
                          pixels={frames[currentFrameIndex]} 
                          scale={8} 
                        />
                      </div>
                      <div className="flex items-center gap-4 w-full max-w-[200px]">
                        <Label>Speed ({Math.round(1000 / frameDuration)} FPS)</Label>
                        <Slider 
                          value={[Math.round(1000 / frameDuration)]} 
                          min={1} 
                          max={30} 
                          step={1}
                          onValueChange={(v) => setFrameDuration(1000 / v[0])}
                        />
                      </div>
                    </div>

                    <div className="w-full space-y-4">
                      <Label className="font-bold">FRAMES ({frames.length})</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {frames.map((frame, idx) => (
                          <div 
                            key={idx} 
                            className={`border-2 p-1 bg-white ${idx === currentFrameIndex ? 'border-blue-500' : 'border-gray-200'}`}
                          >
                            <CanvasRenderer pixels={frame} scale={2} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={exportToConsole}
                      className="w-full"
                      variant="outline"
                    >
                      EXPORT TO CONSOLE
                    </Button>
                  </>
                ) : (
                  <div className="flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
                    Upload video and generate sprites to preview
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
