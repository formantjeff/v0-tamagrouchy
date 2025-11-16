import { PetState } from '../tamagotchi-game'

interface DialogueScreenProps {
  petState: PetState
  onClose: () => void
}

const PetSprite = ({ stage }: { stage: number }) => {
  if (stage === 0) {
    // Egg
    return (
      <svg width="48" height="48" viewBox="0 0 16 16" className="pixel-art">
        <rect x="6" y="4" width="4" height="2" fill="black"/>
        <rect x="4" y="6" width="8" height="6" fill="black"/>
        <rect x="6" y="12" width="4" height="2" fill="black"/>
      </svg>
    )
  } else if (stage === 1) {
    // Baby
    return (
      <svg width="48" height="48" viewBox="0 0 16 16" className="pixel-art">
        <rect x="6" y="4" width="4" height="2" fill="black"/>
        <rect x="4" y="6" width="8" height="4" fill="black"/>
        <rect x="6" y="6" width="1" height="1" fill="white"/>
        <rect x="9" y="6" width="1" height="1" fill="white"/>
        <rect x="3" y="10" width="2" height="2" fill="black"/>
        <rect x="11" y="10" width="2" height="2" fill="black"/>
      </svg>
    )
  } else if (stage === 2) {
    // Teen
    return (
      <svg width="64" height="64" viewBox="0 0 16 16" className="pixel-art">
        <rect x="5" y="3" width="6" height="2" fill="black"/>
        <rect x="4" y="5" width="8" height="5" fill="black"/>
        <rect x="5" y="5" width="1" height="1" fill="white"/>
        <rect x="10" y="5" width="1" height="1" fill="white"/>
        <rect x="3" y="10" width="2" height="3" fill="black"/>
        <rect x="11" y="10" width="2" height="3" fill="black"/>
      </svg>
    )
  } else {
    // Adult
    return (
      <svg width="80" height="80" viewBox="0 0 16 16" className="pixel-art">
        <rect x="5" y="2" width="6" height="2" fill="black"/>
        <rect x="4" y="4" width="8" height="6" fill="black"/>
        <rect x="5" y="5" width="1" height="1" fill="white"/>
        <rect x="10" y="5" width="1" height="1" fill="white"/>
        <rect x="2" y="10" width="3" height="4" fill="black"/>
        <rect x="11" y="10" width="3" height="4" fill="black"/>
        <rect x="6" y="7" width="4" height="1" fill="white"/>
      </svg>
    )
  }
}

export default function DialogueScreen({ petState, onClose }: DialogueScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="mb-4">
        <PetSprite stage={petState.evolution_stage} />
      </div>

      <div className="relative mb-6 max-w-[180px]">
        {/* Pixelated speech bubble tail */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-2 bg-black" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        
        {/* Speech bubble box with thick pixelated border */}
        <div className="border-4 border-black bg-white p-3">
          <p className="text-xs text-center leading-relaxed text-black font-mono">
            {petState.dialogue}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="border-4 border-black bg-white px-6 py-2 font-mono font-bold text-black active:bg-black active:text-white transition-colors"
      >
        OK
      </button>
    </div>
  )
}
