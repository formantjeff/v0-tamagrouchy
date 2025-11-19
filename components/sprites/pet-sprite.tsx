'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PixelRenderer } from './pixel-renderer'
import { TEEN_SPRITES } from './sprite-data'
import { Mood, Action, EvolutionStage } from './sprite-types'

interface PetSpriteProps {
  stage: EvolutionStage
  mood: Mood
  action: Action
  scale?: number
  onFrameChange?: (frameIndex: number) => void
}

export function PetSprite({ stage, mood, action, scale = 6, onFrameChange }: PetSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0)
  
  // Use a ref to track onFrameChange to avoid dependency loops
  const onFrameChangeRef = useRef(onFrameChange)

  useEffect(() => {
    onFrameChangeRef.current = onFrameChange
  }, [onFrameChange])
  
  // Select the correct animation based on state
  // Currently only TEEN is implemented fully, falling back to TEEN for others
  const spriteSet = TEEN_SPRITES
  
  const animation = action !== 'idle' 
    ? spriteSet.actions[action] || spriteSet.idle[mood]
    : spriteSet.idle[mood]

  useEffect(() => {
    setFrameIndex(0)
  }, [stage, mood, action])

  useEffect(() => {
    if (onFrameChangeRef.current) {
      onFrameChangeRef.current(frameIndex)
    }
  }, [frameIndex]) // Only run when frameIndex changes, not when onFrameChange changes

  useEffect(() => {
    if (!animation || animation.frames.length <= 1) return

    const currentFrame = animation.frames[frameIndex]
    const timer = setTimeout(() => {
      setFrameIndex((prev) => {
        const next = prev + 1
        if (next >= animation.frames.length) {
          return animation.loop ? 0 : prev
        }
        return next
      })
    }, currentFrame.duration)

    return () => clearTimeout(timer)
  }, [animation, frameIndex])

  if (!animation || !animation.frames[frameIndex]) return null

  return (
    <PixelRenderer 
      pixels={animation.frames[frameIndex].pixels} 
      scale={scale}
    />
  )
}
