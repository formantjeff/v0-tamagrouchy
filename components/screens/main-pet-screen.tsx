import { PetState } from '../tamagotchi-game'
import { PetSprite } from '../sprites/pet-sprite'
import { Mood, Action, EvolutionStage } from '../sprites/sprite-types'
import { useState } from 'react'
import { TEEN_SPRITES } from '../sprites/sprite-data'
import { generateCCode } from '../sprites/c-exporter'

interface MainPetScreenProps {
  petState: PetState
  onTapPet: () => void
  onTapStats: () => void
  onOpenActions: () => void
}

const getStage = (stage: number): EvolutionStage => {
  switch (stage) {
    case 0: return 'egg'
    case 1: return 'baby'
    case 2: return 'teen'
    case 3: return 'adult'
    default: return 'teen'
  }
}

const getMood = (mood: string): Mood => {
  const validMoods: Mood[] = ['happy', 'neutral', 'sad', 'sick', 'sleeping', 'dead']
  return validMoods.includes(mood as Mood) ? (mood as Mood) : 'neutral'
}

const getMoodIcon = (mood: string) => {
  switch (mood) {
    case 'happy': return '^_^'
    case 'sad': return 'T_T'
    case 'sick': return 'X_X'
    case 'sleeping': return '-_-'
    case 'dead': return 'RIP'
    default: return '-_-'
  }
}

export default function MainPetScreen({ petState, onTapPet, onTapStats, onOpenActions }: MainPetScreenProps) {
  const [showDebug, setShowDebug] = useState(false)
  const [debugMood, setDebugMood] = useState<Mood | null>(null)
  const [debugAction, setDebugAction] = useState<Action | null>(null)

  const currentMood = debugMood || getMood(petState.current_mood)
  const currentAction = debugAction || 'idle'

  const handleExportC = () => {
    const code = generateCCode(TEEN_SPRITES)
    console.log(code)
    alert("C Code exported to console! Press F12 to view.")
  }

  return (
    <div className="h-full flex flex-col bg-lcd-background text-lcd-foreground font-mono relative">
      {/* Header - minimal */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-lcd-foreground">
        <span 
          className="text-xs font-bold tracking-wider cursor-pointer"
          onClick={() => setShowDebug(!showDebug)}
        >
          {petState.name.toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs">AGE:{Math.floor((Date.now() - new Date(petState.born_at).getTime()) / 1000 / 60)}</span>
          <span className="text-xs font-bold">{getMoodIcon(currentMood)}</span>
        </div>
      </div>

      {/* Main pet area */}
      <div 
        className="flex-1 flex flex-col items-center justify-center cursor-pointer active:opacity-70 transition-opacity relative"
        onClick={onTapPet}
      >
        <PetSprite 
          stage={getStage(petState.evolution_stage)}
          mood={currentMood}
          action={currentAction}
          scale={8}
        />
        
        {currentMood === 'sleeping' && (
          <div className="absolute top-10 right-10 animate-bounce">
            <span className="text-xl font-bold">Z</span>
          </div>
        )}
      </div>

      {showDebug && (
        <div className="absolute top-10 left-2 right-2 bg-white border-2 border-black p-2 z-50 text-[10px] grid grid-cols-2 gap-2 shadow-lg">
          <div className="col-span-2 font-bold border-b border-black mb-1">DEBUG ANIMATIONS</div>
          
          <div className="flex flex-col gap-1">
            <span className="font-bold">MOOD:</span>
            {['neutral', 'happy', 'sad', 'sick', 'sleeping'].map((m) => (
              <button 
                key={m}
                onClick={() => { setDebugMood(m as Mood); setDebugAction(null); }}
                className={`text-left px-1 ${debugMood === m ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-bold">ACTION:</span>
            {['idle', 'eating', 'playing', 'cleaning'].map((a) => (
              <button 
                key={a}
                onClick={() => { setDebugAction(a as Action); setDebugMood(null); }}
                className={`text-left px-1 ${debugAction === a ? 'bg-black text-white' : 'hover:bg-gray-200'}`}
              >
                {a}
              </button>
            ))}
          </div>
          
          <button 
            className="col-span-2 border border-black mt-1 hover:bg-gray-200"
            onClick={() => { setDebugMood(null); setDebugAction(null); }}
          >
            RESET
          </button>

          <div className="col-span-2 mt-2 pt-2 border-t border-black">
            <button 
              onClick={handleExportC}
              className="w-full border border-blue-500 text-blue-500 px-2 py-1 hover:bg-blue-50 font-bold"
            >
              EXPORT C CODE
            </button>
          </div>
        </div>
      )}

      {/* Bottom buttons */}
      <div className="grid grid-cols-2 gap-2 p-2">
        <button
          onClick={onOpenActions}
          className="bg-lcd-foreground text-lcd-background py-3 font-bold text-xs tracking-wider active:opacity-70 transition-opacity"
        >
          ACTION
        </button>
        <button
          onClick={onTapStats}
          className="bg-lcd-foreground text-lcd-background py-3 font-bold text-xs tracking-wider active:opacity-70 transition-opacity"
        >
          STATS
        </button>
      </div>
    </div>
  )
}
