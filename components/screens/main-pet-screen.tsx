import { PetState } from '../tamagotchi-game'

interface MainPetScreenProps {
  petState: PetState
  onTapPet: () => void
  onTapStats: () => void
  onOpenActions: () => void
}

const PixelSprite = ({ stage }: { stage: number }) => {
  const sprites = [
    // Stage 0 - Egg
    <svg key="egg" width="80" height="80" viewBox="0 0 16 16" className="pixel-art">
      <rect x="6" y="3" width="4" height="2" fill="black"/>
      <rect x="5" y="5" width="6" height="6" fill="black"/>
      <rect x="4" y="7" width="8" height="4" fill="black"/>
      <rect x="6" y="11" width="4" height="2" fill="black"/>
    </svg>,
    // Stage 1 - Baby
    <svg key="baby" width="80" height="80" viewBox="0 0 16 16" className="pixel-art">
      <rect x="5" y="4" width="6" height="4" fill="black"/>
      <rect x="6" y="5" width="1" height="1" fill="white"/>
      <rect x="9" y="5" width="1" height="1" fill="white"/>
      <rect x="4" y="8" width="8" height="5" fill="black"/>
      <rect x="3" y="10" width="2" height="2" fill="black"/>
      <rect x="11" y="10" width="2" height="2" fill="black"/>
    </svg>,
    // Stage 2 - Teen
    <svg key="teen" width="96" height="96" viewBox="0 0 16 16" className="pixel-art">
      <rect x="5" y="3" width="6" height="5" fill="black"/>
      <rect x="6" y="4" width="1" height="1" fill="white"/>
      <rect x="9" y="4" width="1" height="1" fill="white"/>
      <rect x="4" y="8" width="8" height="6" fill="black"/>
      <rect x="3" y="10" width="2" height="3" fill="black"/>
      <rect x="11" y="10" width="2" height="3" fill="black"/>
      <rect x="2" y="13" width="2" height="1" fill="black"/>
      <rect x="12" y="13" width="2" height="1" fill="black"/>
    </svg>,
    // Stage 3 - Adult
    <svg key="adult" width="96" height="96" viewBox="0 0 16 16" className="pixel-art">
      <rect x="4" y="2" width="8" height="6" fill="black"/>
      <rect x="5" y="3" width="1" height="2" fill="white"/>
      <rect x="10" y="3" width="1" height="2" fill="white"/>
      <rect x="3" y="8" width="10" height="5" fill="black"/>
      <rect x="2" y="10" width="2" height="3" fill="black"/>
      <rect x="12" y="10" width="2" height="3" fill="black"/>
      <rect x="1" y="13" width="2" height="1" fill="black"/>
      <rect x="13" y="13" width="2" height="1" fill="black"/>
    </svg>
  ]
  
  return sprites[stage] || sprites[0]
}

const MoodIndicator = ({ mood }: { mood: string }) => {
  const moodSprites: Record<string, JSX.Element> = {
    happy: (
      <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art">
        <rect x="1" y="1" width="2" height="2" fill="black"/>
        <rect x="5" y="1" width="2" height="2" fill="black"/>
        <rect x="1" y="5" width="1" height="1" fill="black"/>
        <rect x="2" y="6" width="4" height="1" fill="black"/>
        <rect x="6" y="5" width="1" height="1" fill="black"/>
      </svg>
    ),
    sad: (
      <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art">
        <rect x="1" y="1" width="2" height="2" fill="black"/>
        <rect x="5" y="1" width="2" height="2" fill="black"/>
        <rect x="1" y="6" width="1" height="1" fill="black"/>
        <rect x="2" y="5" width="4" height="1" fill="black"/>
        <rect x="6" y="6" width="1" height="1" fill="black"/>
      </svg>
    ),
    angry: (
      <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art">
        <rect x="1" y="2" width="2" height="1" fill="black"/>
        <rect x="1" y="1" width="1" height="1" fill="black"/>
        <rect x="5" y="2" width="2" height="1" fill="black"/>
        <rect x="6" y="1" width="1" height="1" fill="black"/>
        <rect x="2" y="5" width="4" height="1" fill="black"/>
      </svg>
    ),
    excited: (
      <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art">
        <rect x="1" y="1" width="2" height="2" fill="black"/>
        <rect x="5" y="1" width="2" height="2" fill="black"/>
        <rect x="3" y="5" width="2" height="2" fill="black"/>
        <rect x="2" y="6" width="1" height="1" fill="black"/>
        <rect x="5" y="6" width="1" height="1" fill="black"/>
      </svg>
    ),
    tired: (
      <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art">
        <rect x="1" y="2" width="2" height="1" fill="black"/>
        <rect x="5" y="2" width="2" height="1" fill="black"/>
        <rect x="2" y="5" width="4" height="1" fill="black"/>
      </svg>
    ),
    neutral: (
      <svg width="32" height="32" viewBox="0 0 8 8" className="pixel-art">
        <rect x="1" y="1" width="2" height="2" fill="black"/>
        <rect x="5" y="1" width="2" height="2" fill="black"/>
        <rect x="2" y="5" width="4" height="1" fill="black"/>
      </svg>
    )
  }
  
  return moodSprites[mood] || moodSprites.neutral
}

export default function MainPetScreen({ petState, onTapPet, onTapStats, onOpenActions }: MainPetScreenProps) {
  return (
    <div className="h-full flex flex-col bg-lcd-background text-lcd-foreground font-mono">
      {/* Header - minimal */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-lcd-foreground">
        <span className="text-xs font-bold tracking-wider">{petState.name.toUpperCase()}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">AGE:{Math.floor((Date.now() - new Date(petState.born_at).getTime()) / 1000 / 60)}</span>
          <MoodIndicator mood={petState.current_mood} />
        </div>
      </div>

      {/* Main pet area */}
      <div 
        className="flex-1 flex flex-col items-center justify-center cursor-pointer active:opacity-70 transition-opacity"
        onClick={onTapPet}
      >
        <div>
          <PixelSprite stage={petState.evolution_stage} />
        </div>
      </div>

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
