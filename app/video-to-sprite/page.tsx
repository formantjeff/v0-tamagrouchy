"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { CanvasRenderer } from "@/components/sprites/canvas-renderer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch" // Import Switch for toggle
import { generateBinaryAnimation, calculateFlashSize, type ColorFormat } from "@/components/sprites/binary-exporter"

// Helper type for Crop
interface Crop {
  x: number // percentage 0-100
  y: number // percentage 0-100
  width: number // percentage 0-100
  height: number // percentage 0-100
}

const VideoCropper = ({
  src,
  videoRef,
  onCropChange,
  aspectRatio,
  onLoadedMetadata,
  isEnabled, // Add isEnabled prop
}: {
  src: string
  videoRef: React.RefObject<HTMLVideoElement>
  onCropChange: (crop: Crop) => void
  aspectRatio: number
  onLoadedMetadata: () => void
  isEnabled: boolean // Add type definition
}) => {
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 100, height: 100 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropStart, setCropStart] = useState<Crop>({ x: 0, y: 0, width: 100, height: 100 })
  const [activeHandle, setActiveHandle] = useState<string | null>(null)

  // Initialize crop to center with correct aspect ratio
  useEffect(() => {
    // Default to full center
    setCrop({ x: 0, y: 0, width: 100, height: 100 })
    onCropChange({ x: 0, y: 0, width: 100, height: 100 })
  }, [src, aspectRatio]) // Reset when src or aspect ratio changes

  const handleMouseDown = (e: React.MouseEvent, handle: string | null) => {
    e.preventDefault()
    setIsDragging(true)
    setActiveHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
    setCropStart(crop)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100

      const newCrop = { ...cropStart }

      if (activeHandle === "move") {
        newCrop.x = Math.max(0, Math.min(100 - newCrop.width, cropStart.x + deltaX))
        newCrop.y = Math.max(0, Math.min(100 - newCrop.height, cropStart.y + deltaY))
      } else if (activeHandle === "se") {
        // Simple resize logic (bottom-right)
        // For aspect ratio, we need to constrain width/height
        // This is a simplified implementation
        newCrop.width = Math.max(10, Math.min(100 - newCrop.x, cropStart.width + deltaX))

        if (aspectRatio) {
          // Calculate height based on width and container aspect ratio
          // This is tricky because percentages depend on container dimensions
          // Let's just allow freeform for now or simple scaling?
          // The prompt asks for "scaled to the resolution", implying we might want to enforce aspect ratio
          // But enforcing aspect ratio in percentages requires knowing the video aspect ratio.
          // Let's stick to freeform for now to ensure it works, user can eyeball it.
          // Or better: just let them crop freely and we stretch it.
          newCrop.height = Math.max(10, Math.min(100 - newCrop.y, cropStart.height + deltaY))
        } else {
          newCrop.height = Math.max(10, Math.min(100 - newCrop.y, cropStart.height + deltaY))
        }
      }

      setCrop(newCrop)
      onCropChange(newCrop)
    },
    [isDragging, dragStart, cropStart, activeHandle, aspectRatio, onCropChange],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setActiveHandle(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className="relative w-full group select-none">
      <video
        ref={videoRef}
        src={src}
        className="w-full rounded-md border bg-black block"
        controls={!isEnabled} // Show native controls when NOT in crop mode
        muted={false} // Allow sound if user wants, or keep muted. Defaulting to false (unmuted) or true? usually muted for autoplay but here we have controls.
        onLoadedMetadata={onLoadedMetadata}
      />

      {isEnabled && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            {/* Dimmed Background using box-shadow on the crop box is cleaner */}
            <div
              className="absolute border-2 border-white pointer-events-auto cursor-move"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
              }}
              onMouseDown={(e) => handleMouseDown(e, "move")}
            >
              {/* Resize Handle (Bottom Right) */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-black cursor-se-resize"
                style={{ transform: "translate(50%, 50%)" }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handleMouseDown(e, "se")
                }}
              />

              {/* Grid lines for visual aid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                <div className="border-r border-white h-full col-start-2"></div>
                <div className="border-r border-white h-full col-start-3"></div>
                <div className="border-b border-white w-full row-start-2 absolute top-0"></div>
                <div className="border-b border-white w-full row-start-3 absolute top-0"></div>
              </div>
            </div>
          </div>

          {/* Simple Play/Pause Control since we covered the video */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (videoRef.current?.paused) videoRef.current.play()
                else videoRef.current?.pause()
              }}
            >
              PLAY / PAUSE
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function VideoToSpritePage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [frames, setFrames] = useState<(number | string)[][][]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Settings
  const [width, setWidth] = useState(240)
  const [height, setHeight] = useState(280)
  const [frameCount, setFrameCount] = useState(4)
  const [threshold, setThreshold] = useState(128)
  const [frameDuration, setFrameDuration] = useState(200) // ms per frame for playback

  // New Settings
  const [mode, setMode] = useState<"1-bit" | "color">("1-bit")
  const [compressionScheme, setCompressionScheme] = useState<ColorFormat>("GRAYSCALE_8BIT")
  const [estimatedSize, setEstimatedSize] = useState<number>(0)
  const [lockAspect, setLockAspect] = useState(true)
  const [scalingMode, setScalingMode] = useState<"fit" | "fill" | "stretch">("fill")

  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)

  // Crop State
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 100, height: 100 })
  const [isCropMode, setIsCropMode] = useState(false) // Add crop mode state
  const [exportName, setExportName] = useState("sprite_anim") // Added export name state

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

    const size = calculateFlashSize(width, height, frames.length, compressionScheme)
    setEstimatedSize(size)
  }, [frames, compressionScheme, width, height])

  // Reset compression scheme when mode changes
  useEffect(() => {
    if (mode === "1-bit") {
      setCompressionScheme("GRAYSCALE_8BIT")
    } else {
      setCompressionScheme("RGB565")
    }
  }, [mode])

  const handleDownloadBinary = () => {
    if (frames.length === 0) return

    const binaryData = generateBinaryAnimation(frames, {
      width,
      height,
      frameCount: frames.length,
      fps: Math.round(1000 / frameDuration),
      colorFormat: compressionScheme,
      compression: 0, // No compression for now
    })

    const blob = new Blob([binaryData], { type: "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${exportName}.bin`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
    setIsCropMode(false) // Reset crop mode
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
      if (effectiveDuration <= 0) throw new Error("Invalid time range")

      const capturedFrames: (number | string)[][][] = []
      const ctx = canvas.getContext("2d", { willReadFrequently: true })

      if (!ctx) throw new Error("Could not get canvas context")

      // Set canvas size to target resolution
      canvas.width = width
      canvas.height = height

      // Calculate source coordinates from crop (crop percentages are relative to video natural size)
      const sx = (crop.x / 100) * video.videoWidth
      const sy = (crop.y / 100) * video.videoHeight
      const sw = (crop.width / 100) * video.videoWidth
      const sh = (crop.height / 100) * video.videoHeight

      const sourceAspect = sw / sh
      const targetAspect = width / height

      let drawWidth = width
      let drawHeight = height
      let offsetX = 0
      let offsetY = 0

      if (scalingMode === "fit") {
        // Fit with letterboxing (preserve aspect ratio, no cropping)
        if (sourceAspect > targetAspect) {
          drawWidth = width
          drawHeight = width / sourceAspect
          offsetY = (height - drawHeight) / 2
        } else {
          drawHeight = height
          drawWidth = height * sourceAspect
          offsetX = (width - drawWidth) / 2
        }
      } else if (scalingMode === "fill") {
        // Fill canvas (preserve aspect ratio, crop to fit)
        if (sourceAspect > targetAspect) {
          // Source is wider - make it fit height and crop width
          drawHeight = height
          drawWidth = height * sourceAspect
          offsetX = -(drawWidth - width) / 2 // negative offset to center the crop
        } else {
          // Source is taller - make it fit width and crop height
          drawWidth = width
          drawHeight = width / sourceAspect
          offsetY = -(drawHeight - height) / 2 // negative offset to center the crop
        }
      }
      // else "stretch" - use default drawWidth/drawHeight (fills canvas, distorts)

      // Capture frames
      for (let i = 0; i < frameCount; i++) {
        // Calculate timestamp for this frame relative to start time
        const time = startTime + (effectiveDuration / frameCount) * i
        video.currentTime = time

        // Wait for seek to complete
        await new Promise((resolve) => {
          video.onseeked = resolve
        })

        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, width, height)

        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.clip()

        ctx.drawImage(
          video,
          sx,
          sy,
          sw,
          sh, // source rect from crop
          offsetX,
          offsetY,
          drawWidth,
          drawHeight, // dest rect
        )

        ctx.restore()

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

            if (mode === "color") {
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
      console.error("Error processing video:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const exportToConsole = () => {
    if (mode === "color") {
      console.log("// Exported Color Frames (Hex)")
      console.log(JSON.stringify(frames, null, 2))
      alert("Color frames exported to console as JSON!")
      return
    }

    const cArray = frames
      .map((frame) => {
        return (frame as number[][]).map((row) => `"${row.map((p) => (p === 1 ? "#" : ".")).join("")}"`).join(",\n")
      })
      .join("\n\n// Next Frame\n\n")

    console.log("// Exported Frames")
    console.log(cArray)
    alert("Frames exported to console!")
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
                <CardTitle>1. Upload, Crop & Trim</CardTitle>
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
                      className="w-full border-black text-black hover:bg-gray-100 bg-transparent"
                    >
                      UPLOAD NEW VIDEO
                    </Button>
                  </div>
                )}
                {videoSrc && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                      <Label htmlFor="crop-mode" className="cursor-pointer">
                        Enable Crop Mode
                      </Label>
                      <Switch id="crop-mode" checked={isCropMode} onCheckedChange={setIsCropMode} />
                    </div>

                    <VideoCropper
                      src={videoSrc}
                      videoRef={videoRef}
                      onCropChange={setCrop}
                      aspectRatio={width / height}
                      onLoadedMetadata={handleVideoLoaded}
                      isEnabled={isCropMode} // Pass enabled state
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
                <CardTitle className="text-black">2. Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label>Output Style</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={mode === "1-bit" ? "default" : "outline"}
                      onClick={() => setMode("1-bit")}
                      className={mode === "1-bit" ? "bg-black text-white" : ""}
                    >
                      1-BIT RETRO
                    </Button>
                    <Button
                      variant={mode === "color" ? "default" : "outline"}
                      onClick={() => setMode("color")}
                      className={mode === "color" ? "bg-black text-white" : ""}
                    >
                      FULL COLOR
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Color Format</Label>
                  <Select
                    value={compressionScheme}
                    onValueChange={(value) => setCompressionScheme(value as ColorFormat)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mode === "1-bit" ? (
                        <>
                          <SelectItem value="GRAYSCALE_8BIT">Grayscale 8-bit (1 byte/pixel)</SelectItem>
                          <SelectItem value="GRAYSCALE_4BIT">Grayscale 4-bit (0.5 bytes/pixel)</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="RGB565">RGB565 (2 bytes/pixel)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>
                      Resolution ({width}x{height})
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch id="lock-aspect" checked={lockAspect} onCheckedChange={setLockAspect} />
                      <Label htmlFor="lock-aspect" className="text-sm cursor-pointer">
                        Lock aspect ratio (240:280)
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Width: {width}px</Label>
                      <Slider
                        value={[width]}
                        min={8}
                        max={240}
                        step={8}
                        onValueChange={(v) => {
                          setWidth(v[0])
                          if (lockAspect) {
                            setHeight(Math.round((v[0] * 280) / 240))
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Height: {height}px</Label>
                      <Slider
                        value={[height]}
                        min={8}
                        max={280}
                        step={8}
                        onValueChange={(v) => {
                          setHeight(v[0])
                          if (lockAspect) {
                            setWidth(Math.round((v[0] * 240) / 280))
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Frame Count ({frameCount})</Label>
                  </div>
                  <Slider value={[frameCount]} min={1} max={16} step={1} onValueChange={(v) => setFrameCount(v[0])} />
                </div>

                {mode === "1-bit" && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Threshold ({threshold})</Label>
                      <span className="text-xs text-gray-500">Adjust for contrast</span>
                    </div>
                    <Slider value={[threshold]} min={0} max={255} step={1} onValueChange={(v) => setThreshold(v[0])} />
                  </div>
                )}

                <div className="space-y-4">
                  <Label>Export Name</Label>
                  <Input
                    value={exportName}
                    onChange={(e) => setExportName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    placeholder="sprite_anim"
                  />
                  <p className="text-xs text-gray-500">Used for C variables and filename</p>
                </div>

                <div className="space-y-4 pt-2">
                  <Label className="text-black font-semibold">Scaling Mode</Label>
                  <Select value={scalingMode} onValueChange={(v: any) => setScalingMode(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fill">Fill (Crop to Fit)</SelectItem>
                      <SelectItem value="fit">Fit (Letterbox)</SelectItem>
                      <SelectItem value="stretch">Stretch (Distort)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    {scalingMode === "fill" && "Fills entire frame, crops excess (recommended)"}
                    {scalingMode === "fit" && "Fits entire video, adds black bars if needed"}
                    {scalingMode === "stretch" && "Stretches to fill, may distort image"}
                  </p>
                </div>

                <Button
                  onClick={processVideo}
                  disabled={!videoSrc || isProcessing}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  {isProcessing ? "PROCESSING..." : "GENERATE SPRITES"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Column */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>3. Preview</span>
                  <span className="text-sm font-normal text-gray-600">
                    Estimated Flash Size: {formatBytes(estimatedSize)}
                  </span>
                </CardTitle>
                <CardDescription>
                  Generated {width}x{height} {mode} animation
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-8">
                {frames.length > 0 ? (
                  <>
                    <div className="flex flex-col items-center space-y-4">
                      <Label className="text-lg font-bold">ANIMATION PREVIEW</Label>
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="border-4 border-black bg-white relative flex items-center justify-center overflow-hidden shadow-xl"
                          style={{
                            width: "240px",
                            height: "280px",
                            // Ensure the border is outside the content box if we want exact 240x280 content,
                            // but usually 'border' adds to size.
                            // Let's assume the *screen area* is 240x280.
                            boxSizing: "content-box",
                          }}
                        >
                          <CanvasRenderer pixels={frames[currentFrameIndex]} scale={1} />

                          {/* Optional: Overlay to show it's a screen */}
                          <div className="absolute top-2 right-2 pointer-events-none opacity-20">
                            <div className="w-4 h-2 bg-black rounded-full"></div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">Device Screen (240x280)</span>
                      </div>

                      <div className="flex items-center gap-4 w-full max-w-[200px] pt-4">
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
                      <div className="flex flex-wrap gap-2 justify-center">
                        {frames.map((frame, idx) => (
                          <div
                            key={idx}
                            className={`border-2 p-1 bg-white ${idx === currentFrameIndex ? "border-blue-500" : "border-gray-200"}`}
                          >
                            <CanvasRenderer pixels={frame} scale={1} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button onClick={exportToConsole} className="w-full bg-transparent" variant="outline">
                      EXPORT TO CONSOLE
                    </Button>
                    <Button onClick={handleDownloadBinary} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      EXPORT BINARY FILE (.bin)
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
