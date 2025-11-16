'use client'

import { cn } from '@/lib/utils'

interface LCDDisplayProps {
  buttonPressed: number | null
}

export default function LCDDisplay({ buttonPressed }: LCDDisplayProps) {
  return (
    <div className="relative">
      {/* Display Frame */}
      <div className="bg-card border-4 border-foreground rounded-sm p-4 shadow-lg">
        {/* LCD Screen */}
        <div
          className="relative overflow-hidden rounded-sm shadow-inner"
          style={{
            width: '240px',
            height: '280px',
            backgroundColor: 'var(--color-lcd-background)',
          }}
        >
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />
          
          {/* Display Content */}
          <div className="relative h-full flex flex-col items-center justify-between p-4">
            {/* Status Icons */}
            <div className="flex gap-4 w-full justify-between text-[10px] font-mono font-bold tracking-wider">
              <div className={cn(
                "flex items-center gap-1",
                buttonPressed === 1 ? "opacity-100" : "opacity-30"
              )}>
                <span>♥</span>
              </div>
              <div className={cn(
                "flex items-center gap-1",
                buttonPressed === 2 ? "opacity-100" : "opacity-30"
              )}>
                <span>☺</span>
              </div>
              <div className={cn(
                "flex items-center gap-1",
                buttonPressed === 3 ? "opacity-100" : "opacity-30"
              )}>
                <span>♪</span>
              </div>
            </div>

            {/* Main Character Area */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                {/* Simple Pixel Art Character */}
                <svg
                  viewBox="0 0 32 32"
                  className={cn(
                    "w-24 h-24 transition-transform",
                    buttonPressed ? "scale-110" : "scale-100"
                  )}
                  style={{ fill: 'var(--color-lcd-foreground)' }}
                >
                  {/* Body */}
                  <rect x="12" y="10" width="8" height="12" />
                  {/* Head */}
                  <rect x="10" y="6" width="12" height="8" />
                  {/* Eyes */}
                  <rect x="13" y="9" width="2" height="2" fill="var(--color-lcd-background)" />
                  <rect x="17" y="9" width="2" height="2" fill="var(--color-lcd-background)" />
                  {/* Legs */}
                  <rect x="12" y="22" width="3" height="4" />
                  <rect x="17" y="22" width="3" height="4" />
                  {/* Arms */}
                  <rect x="8" y="12" width="4" height="3" />
                  <rect x="20" y="12" width="4" height="3" />
                </svg>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="w-full space-y-2 font-mono text-[9px] font-bold tracking-wider">
              <div className="flex items-center gap-2">
                <span className="opacity-70">HUNGER</span>
                <div className="flex-1 flex gap-[2px]">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-full h-2 border border-lcd-foreground",
                        i < 5 ? "bg-lcd-foreground" : "bg-lcd-pixel-off"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-70">HAPPY</span>
                <div className="flex-1 flex gap-[2px]">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-full h-2 border border-lcd-foreground",
                        i < 6 ? "bg-lcd-foreground" : "bg-lcd-pixel-off"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
