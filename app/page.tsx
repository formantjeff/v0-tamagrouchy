'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { TEEN_SPRITES } from '@/components/sprites/sprite-data'
import { PetSprite } from '@/components/sprites/pet-sprite'
import { generateCCode } from '@/components/sprites/c-exporter'
import MainPetScreen from '@/components/screens/main-pet-screen'
import StatsDetailScreen from '@/components/screens/stats-detail-screen'
import ActionMenuScreen from '@/components/screens/action-menu-screen'
import DialogueScreen from '@/components/screens/dialogue-screen'
import EvolutionScreen from '@/components/screens/evolution-screen'
import { PetState } from '@/components/tamagotchi-game'
import { Mood, Action, EvolutionStage } from '@/components/sprites/sprite-types'

// Mock data for screens
const MOCK_PET_STATE: PetState = {
  name: 'GROUCHY',
  born_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day old
  last_fed: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  last_played: new Date().toISOString(),
  last_cleaned: new Date().toISOString(),
  last_slept: new Date().toISOString(),
  hunger: 50,
  happiness: 80,
  health: 90,
  energy: 70,
  evolution_stage: 2, // Teen
  personality_type: 'grouchy',
  current_mood: 'neutral',
  is_sleeping: false,
  is_dead: false,
  dialogue: "I'm not in the mood for this right now..."
}

function GallerySpriteCard({ 
  mood, 
  action, 
  stage = 'teen' 
}: { 
  mood: Mood, 
  action: Action, 
  stage?: EvolutionStage 
}) {
  const [currentFrame, setCurrentFrame] = useState(0)
  
  // Calculate total frames for display
  const spriteSet = TEEN_SPRITES
  const animation = action !== 'idle' 
    ? spriteSet.actions[action] || spriteSet.idle[mood]
    : spriteSet.idle[mood]
  
  const totalFrames = animation?.frames.length || 0

  return (
    <div className="flex flex-col items-center bg-white p-4 border-2 border-gray-200 rounded-lg shadow-sm">
      <div className="mb-4 h-32 flex items-center justify-center">
        <PetSprite 
          stage={stage} 
          mood={mood} 
          action={action} 
          scale={4} 
          onFrameChange={setCurrentFrame}
        />
      </div>
      <span className="font-bold uppercase text-black">{action === 'idle' ? mood : action}</span>
      <div className="flex flex-col items-center mt-1">
        <span className="text-xs text-gray-600">
          {totalFrames} frames
        </span>
        <span className="text-xs font-mono font-bold text-blue-600 mt-1">
          Frame {currentFrame + 1}/{totalFrames}
        </span>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<'sprites' | 'screens'>('sprites')

  const handleExport = () => {
    const code = generateCCode(TEEN_SPRITES)
    console.log(code)
    alert("C Code exported to console! Press F12 to view.")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-mono text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Tamagotchi Design Gallery</h1>
          <div className="flex gap-4">
            <Link href="/game">
              <button className="px-4 py-2 font-bold bg-green-600 text-white hover:bg-green-700">
                PLAY GAME
              </button>
            </Link>
            <Link href="/creatures">
              <button className="px-4 py-2 font-bold bg-purple-600 text-white hover:bg-purple-700">
                NEW CREATURES
              </button>
            </Link>
            <Link href="/video-to-sprite">
              <button className="px-4 py-2 font-bold bg-orange-600 text-white hover:bg-orange-700">
                VIDEO TO SPRITE
              </button>
            </Link>
            <button 
              onClick={() => setActiveTab('sprites')}
              className={`px-4 py-2 font-bold ${activeTab === 'sprites' ? 'bg-black text-white' : 'bg-white border-2 border-black'}`}
            >
              SPRITES
            </button>
            <button 
              onClick={() => setActiveTab('screens')}
              className={`px-4 py-2 font-bold ${activeTab === 'screens' ? 'bg-black text-white' : 'bg-white border-2 border-black'}`}
            >
              SCREENS
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 font-bold bg-blue-600 text-white hover:bg-blue-700"
            >
              EXPORT C CODE
            </button>
          </div>
        </div>

        {activeTab === 'sprites' ? (
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold mb-6 border-b-2 border-black pb-2 text-black">MOODS (IDLE)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {Object.keys(TEEN_SPRITES.idle).map((mood) => (
                  <GallerySpriteCard 
                    key={mood}
                    mood={mood as Mood}
                    action="idle"
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6 border-b-2 border-black pb-2 text-black">ACTIONS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {Object.keys(TEEN_SPRITES.actions).map((action) => (
                  <GallerySpriteCard 
                    key={action}
                    mood="neutral"
                    action={action as Action}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScreenPreview title="Main Screen">
              <MainPetScreen 
                petState={MOCK_PET_STATE}
                onTapPet={() => {}}
                onTapStats={() => {}}
                onOpenActions={() => {}}
              />
            </ScreenPreview>

            <ScreenPreview title="Stats Screen">
              <StatsDetailScreen 
                petState={MOCK_PET_STATE}
                onBack={() => {}}
              />
            </ScreenPreview>

            <ScreenPreview title="Action Menu">
              <ActionMenuScreen 
                petState={MOCK_PET_STATE}
                onAction={() => {}}
                onBack={() => {}}
              />
            </ScreenPreview>

            <ScreenPreview title="Dialogue">
              <DialogueScreen 
                petState={MOCK_PET_STATE}
                onClose={() => {}}
              />
            </ScreenPreview>

            <ScreenPreview title="Evolution">
              <EvolutionScreen 
                petState={MOCK_PET_STATE}
                onContinue={() => {}}
              />
            </ScreenPreview>
          </div>
        )}
      </div>
    </div>
  )
}

function ScreenPreview({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <h3 className="font-bold mb-4 text-black text-lg">{title}</h3>
      <div className="relative bg-black p-4 rounded-xl shadow-xl">
        <div className="w-[240px] h-[280px] bg-white overflow-hidden relative">
          {children}
        </div>
        {/* Hardware buttons simulation */}
        <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 flex flex-col gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-gray-600 bg-gray-800"></div>
          <div className="w-8 h-8 rounded-full border-2 border-gray-600 bg-gray-800"></div>
          <div className="w-8 h-8 rounded-full border-2 border-gray-600 bg-gray-800"></div>
        </div>
      </div>
    </div>
  )
}
