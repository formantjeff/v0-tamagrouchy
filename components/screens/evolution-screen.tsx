import { PetState } from '../tamagotchi-game'

interface EvolutionScreenProps {
  petState: PetState
  onContinue: () => void
}

const EVOLUTION_EMOJI = ['🥚', '🐣', '🐥', '🐓']

export default function EvolutionScreen({ petState, onContinue }: EvolutionScreenProps) {
  const oldStage = Math.max(0, petState.evolution_stage - 1)
  const newStage = petState.evolution_stage

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-yellow-100 to-orange-100">
      {/* Sparkles/Confetti effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <h1 className="text-xl font-bold mb-6 text-center animate-pulse">
        Your pet is evolving!
      </h1>

      {/* Evolution Animation */}
      <div className="flex items-center gap-4 mb-8">
        <div className="text-6xl">{EVOLUTION_EMOJI[oldStage]}</div>
        <div className="text-3xl animate-pulse">→</div>
        <div className="text-6xl animate-bounce">{EVOLUTION_EMOJI[newStage]}</div>
      </div>

      <button
        onClick={onContinue}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold active:scale-95 transition-transform z-10"
      >
        Continue
      </button>
    </div>
  )
}
