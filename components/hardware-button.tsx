'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HardwareButtonProps {
  label: string
  onClick: () => void
  pressed: boolean
}

export default function HardwareButton({ label, onClick, pressed }: HardwareButtonProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={onClick}
        className={cn(
          "w-16 h-16 rounded-full border-4 border-foreground bg-muted text-foreground font-mono font-bold text-xl shadow-lg transition-all hover:bg-muted/80",
          pressed && "scale-95 shadow-sm"
        )}
        style={{
          boxShadow: pressed
            ? 'inset 0 4px 8px rgba(0, 0, 0, 0.3)'
            : '0 6px 0 var(--color-foreground), 0 8px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        {label}
      </Button>
      <span className="text-xs font-mono font-bold opacity-50">{label}</span>
    </div>
  )
}
