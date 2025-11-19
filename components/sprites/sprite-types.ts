export type Mood = 'happy' | 'neutral' | 'sad' | 'sick' | 'sleeping' | 'dead'
export type Action = 'idle' | 'eating' | 'playing' | 'cleaning' | 'sleeping' | 'evolving'
export type EvolutionStage = 'egg' | 'baby' | 'teen' | 'adult'

export interface SpriteFrame {
  pixels: number[][] // 16x16 grid where 1 is black, 0 is white
  duration: number // ms
}

export interface SpriteAnimation {
  frames: SpriteFrame[]
  loop: boolean
}

export interface SpriteSet {
  idle: Record<Mood, SpriteAnimation>
  actions: Record<Action, SpriteAnimation>
}
