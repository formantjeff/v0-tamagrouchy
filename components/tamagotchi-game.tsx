'use client'

import { useState } from 'react'
import LCDDisplay from './lcd-display'
import HardwareButton from './hardware-button'

export default function TamagotchiGame() {
  const [buttonPressed, setButtonPressed] = useState<number | null>(null)

  const handleButtonPress = (buttonNumber: number) => {
    setButtonPressed(buttonNumber)
    setTimeout(() => setButtonPressed(null), 200)
  }

  return (
    <div className="flex items-center gap-6">
      {/* LCD Display */}
      <LCDDisplay buttonPressed={buttonPressed} />

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
