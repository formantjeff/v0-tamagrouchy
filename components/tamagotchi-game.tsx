'use client'

import { useState } from 'react'
import HardwareButton from './hardware-button'
import MainPetScreen from './screens/main-pet-screen'
import StatsDetailScreen from './screens/stats-detail-screen'
import ActionMenuScreen from './screens/action-menu-screen'
import DialogueScreen from './screens/dialogue-screen'
import EvolutionScreen from './screens/evolution-screen'

export type Screen = 'main' | 'stats' | 'actions' | 'dialogue' | 'evolution'

export interface PetState {
  name: string
  born_at: string
  evolution_stage: 0 | 1 | 2 | 3
  personality_type: 'grumpy' | 'cheerful' | 'lazy' | 'energetic' | 'sarcastic' | 'shy'
  current_mood: 'happy' | 'sad' | 'angry' | 'excited' | 'tired' | 'neutral'
  is_alive: boolean
  hunger: number
  happiness: number
  health: number
  energy: number
  last_fed: string
  dialogue: string
}

export default function TamagotchiGame() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main')
  const [buttonPressed, setButtonPressed] = useState<number | null>(null)
  
  const [petState, setPetState] = useState<PetState>({
    name: 'Grouchy',
    born_at: new Date().toISOString(),
    evolution_stage: 2,
    personality_type: 'grumpy',
    current_mood: 'neutral',
    is_alive: true,
    hunger: 65,
    happiness: 45,
    health: 80,
    energy: 30,
    last_fed: new Date(Date.now() - 3600000).toISOString(),
    dialogue: "What do you want? Can't you see I'm busy?"
  })

  const handleButtonPress = (buttonNumber: number) => {
    setButtonPressed(buttonNumber)
    setTimeout(() => setButtonPressed(null), 200)
    
    // Hardware button cycles through screens
    const screens: Screen[] = ['main', 'actions', 'stats']
    const currentIndex = screens.indexOf(currentScreen)
    const nextIndex = (currentIndex + 1) % screens.length
    setCurrentScreen(screens[nextIndex])
  }

  const handleAction = (action: 'feed' | 'play' | 'clean' | 'sleep') => {
    setPetState(prev => {
      const newState = { ...prev }
      switch (action) {
        case 'feed':
          newState.hunger = Math.min(100, prev.hunger + 25)
          newState.last_fed = new Date().toISOString()
          newState.dialogue = prev.personality_type === 'grumpy' 
            ? "Fine, I guess I was a bit hungry..." 
            : "Yummy! Thanks!"
          break
        case 'play':
          newState.happiness = Math.min(100, prev.happiness + 20)
          newState.energy = Math.max(0, prev.energy - 15)
          newState.dialogue = prev.personality_type === 'grumpy'
            ? "I suppose that was... tolerable."
            : "That was fun! Again!"
          break
        case 'clean':
          newState.health = Math.min(100, prev.health + 15)
          newState.dialogue = prev.personality_type === 'grumpy'
            ? "About time you cleaned up around here."
            : "Much better, thank you!"
          break
        case 'sleep':
          newState.energy = Math.min(100, prev.energy + 40)
          newState.dialogue = prev.personality_type === 'grumpy'
            ? "Zzz... leave me alone..."
            : "Zzz... such a good nap!"
          break
      }
      return newState
    })
    setCurrentScreen('dialogue')
  }

  return (
    <div className="flex items-center gap-6">
      {/* Display Frame */}
      <div className="bg-[#333] border-4 border-[#000] rounded-none p-4 shadow-2xl">
        {/* Screen Container - Fixed 240x280 */}
        <div
          className="relative overflow-hidden bg-lcd-background"
          style={{
            width: '240px',
            height: '280px',
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, black 2px, black 4px)'
            }}
          />
          
          {/* Screen Content */}
          {currentScreen === 'main' && (
            <MainPetScreen
              petState={petState}
              onTapPet={() => setCurrentScreen('dialogue')}
              onTapStats={() => setCurrentScreen('stats')}
              onOpenActions={() => setCurrentScreen('actions')}
            />
          )}
          {currentScreen === 'stats' && (
            <StatsDetailScreen
              petState={petState}
              onBack={() => setCurrentScreen('main')}
            />
          )}
          {currentScreen === 'actions' && (
            <ActionMenuScreen
              petState={petState}
              onAction={handleAction}
              onBack={() => setCurrentScreen('main')}
            />
          )}
          {currentScreen === 'dialogue' && (
            <DialogueScreen
              petState={petState}
              onClose={() => setCurrentScreen('main')}
            />
          )}
          {currentScreen === 'evolution' && (
            <EvolutionScreen
              petState={petState}
              onContinue={() => setCurrentScreen('main')}
            />
          )}
        </div>
      </div>

      {/* Hardware Buttons */}
      <div className="flex flex-col gap-4">
        <HardwareButton
          label="A"
          onClick={() => handleButtonPress(1)}
          pressed={buttonPressed === 1}
        />
        <HardwareButton
          label="B"
          onClick={() => handleButtonPress(2)}
          pressed={buttonPressed === 2}
        />
        <HardwareButton
          label="C"
          onClick={() => handleButtonPress(3)}
          pressed={buttonPressed === 3}
        />
      </div>
    </div>
  )
}
