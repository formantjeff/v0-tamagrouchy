import { PetState } from '../tamagotchi-game'

interface ActionMenuScreenProps {
  petState: PetState
  onAction: (action: 'feed' | 'play' | 'clean' | 'sleep') => void
  onBack: () => void
}

const ActionIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    feed: (
      <svg width="40" height="40" viewBox="0 0 16 16" className="pixel-art">
        <rect x="6" y="2" width="4" height="2" fill="black"/>
        <rect x="5" y="4" width="6" height="2" fill="black"/>
        <rect x="4" y="6" width="8" height="6" fill="black"/>
        <rect x="5" y="12" width="6" height="2" fill="black"/>
      </svg>
    ),
    play: (
      <svg width="40" height="40" viewBox="0 0 16 16" className="pixel-art">
        <rect x="3" y="3" width="10" height="10" fill="black"/>
        <rect x="5" y="5" width="2" height="2" fill="white"/>
        <rect x="9" y="5" width="2" height="2" fill="white"/>
        <rect x="5" y="9" width="2" height="2" fill="white"/>
        <rect x="9" y="9" width="2" height="2" fill="white"/>
      </svg>
    ),
    clean: (
      <svg width="40" height="40" viewBox="0 0 16 16" className="pixel-art">
        <rect x="2" y="8" width="2" height="6" fill="black"/>
        <rect x="4" y="6" width="8" height="2" fill="black"/>
        <rect x="6" y="4" width="4" height="2" fill="black"/>
        <rect x="7" y="2" width="2" height="2" fill="black"/>
      </svg>
    ),
    sleep: (
      <svg width="40" height="40" viewBox="0 0 16 16" className="pixel-art">
        <rect x="2" y="2" width="4" height="1" fill="black"/>
        <rect x="5" y="3" width="1" height="1" fill="black"/>
        <rect x="2" y="4" width="4" height="1" fill="black"/>
        <rect x="8" y="6" width="4" height="1" fill="black"/>
        <rect x="11" y="7" width="1" height="1" fill="black"/>
        <rect x="8" y="8" width="4" height="1" fill="black"/>
      </svg>
    )
  }
  
  return icons[type] || icons.feed
}

export default function ActionMenuScreen({ petState, onAction, onBack }: ActionMenuScreenProps) {
  return (
    <div className="h-full flex flex-col bg-lcd-background text-lcd-foreground font-mono">
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-lcd-foreground">
        <button onClick={onBack} className="text-xs font-bold active:opacity-70">← BACK</button>
        <span className="text-xs font-bold tracking-wider">ACTIONS</span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 p-3">
        <button
          onClick={() => onAction('feed')}
          className="flex flex-col items-center justify-center gap-2 border-2 border-lcd-foreground active:bg-lcd-foreground active:text-lcd-background transition-colors min-h-[60px] font-bold text-xs"
        >
          <ActionIcon type="feed" />
          <span>FEED</span>
        </button>
        <button
          onClick={() => onAction('play')}
          className="flex flex-col items-center justify-center gap-2 border-2 border-lcd-foreground active:bg-lcd-foreground active:text-lcd-background transition-colors min-h-[60px] font-bold text-xs"
        >
          <ActionIcon type="play" />
          <span>PLAY</span>
        </button>
        <button
          onClick={() => onAction('clean')}
          className="flex flex-col items-center justify-center gap-2 border-2 border-lcd-foreground active:bg-lcd-foreground active:text-lcd-background transition-colors min-h-[60px] font-bold text-xs"
        >
          <ActionIcon type="clean" />
          <span>CLEAN</span>
        </button>
        <button
          onClick={() => onAction('sleep')}
          className="flex flex-col items-center justify-center gap-2 border-2 border-lcd-foreground active:bg-lcd-foreground active:text-lcd-background transition-colors min-h-[60px] font-bold text-xs"
        >
          <ActionIcon type="sleep" />
          <span>SLEEP</span>
        </button>
      </div>
    </div>
  )
}
