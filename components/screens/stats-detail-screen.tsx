import { PetState } from '../tamagotchi-game'

interface StatsDetailScreenProps {
  petState: PetState
  onBack: () => void
}

const EVOLUTION_NAMES = ['EGG', 'BABY', 'TEEN', 'ADULT']

function RetroStatBar({ label, value }: { label: string; value: number }) {
  const bars = Math.round((value / 100) * 8)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 font-bold">{label}</span>
      <div className="flex-1 flex gap-0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 border border-lcd-foreground ${
              i < bars ? 'bg-lcd-foreground' : ''
            }`}
          />
        ))}
      </div>
      <span className="w-8 text-right">{value}</span>
    </div>
  )
}

export default function StatsDetailScreen({ petState, onBack }: StatsDetailScreenProps) {
  const age = Math.floor((Date.now() - new Date(petState.born_at).getTime()) / 1000 / 60)
  const lastFedMinutes = Math.floor((Date.now() - new Date(petState.last_fed).getTime()) / 1000 / 60)

  return (
    <div className="h-full flex flex-col bg-lcd-background text-lcd-foreground font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-lcd-foreground">
        <button onClick={onBack} className="text-xs font-bold active:opacity-70">← BACK</button>
        <span className="text-xs font-bold tracking-wider">STATS</span>
      </div>

      {/* Stats Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="space-y-2">
          <RetroStatBar label="HNGR" value={petState.hunger} />
          <RetroStatBar label="HPPY" value={petState.happiness} />
          <RetroStatBar label="HLTH" value={petState.health} />
          <RetroStatBar label="NRGY" value={petState.energy} />
        </div>

        {/* Additional Info */}
        <div className="border-2 border-lcd-foreground p-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="font-bold">AGE:</span>
            <span>{age} MIN</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">STAGE:</span>
            <span>{EVOLUTION_NAMES[petState.evolution_stage]}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">MOOD:</span>
            <span>{petState.current_mood.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">TYPE:</span>
            <span>{petState.personality_type.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">FED:</span>
            <span>{lastFedMinutes}M AGO</span>
          </div>
        </div>
      </div>
    </div>
  )
}
