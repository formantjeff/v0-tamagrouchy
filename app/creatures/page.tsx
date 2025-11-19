'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { PixelRenderer } from '@/components/sprites/pixel-renderer'
import { getCreaturePages, ConceptCreature } from '@/components/sprites/concept-sprites'

// Component to handle individual creature card state
function CreatureCard({ creature }: { creature: ConceptCreature }) {
  const [stage, setStage] = useState<'egg' | 'baby' | 'teen' | 'adult'>('teen')
  
  const stages: ('egg' | 'baby' | 'teen' | 'adult')[] = ['egg', 'baby', 'teen', 'adult']
  const currentIndex = stages.indexOf(stage)
  
  const nextStage = () => {
    if (currentIndex < stages.length - 1) {
      setStage(stages[currentIndex + 1])
    }
  }
  
  const prevStage = () => {
    if (currentIndex > 0) {
      setStage(stages[currentIndex - 1])
    }
  }

  const currentFrame = creature.stages[stage]

  return (
    <Card className="p-4 flex flex-col items-center gap-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
      <div className="w-full flex justify-between items-center border-b-2 border-black pb-2">
        <h3 className="font-bold text-xl tracking-wider text-black">{creature.name}</h3>
        <span className="text-xs font-mono bg-black text-white px-2 py-1">{stage.toUpperCase()}</span>
      </div>
      
      <div className="w-32 h-32 border-2 border-black flex items-center justify-center bg-white relative">
        <div className="scale-[1]">
          <PixelRenderer 
            pixels={currentFrame.pixels}
            scale={4}
            className=""
          />
        </div>
        
        {/* Navigation overlay */}
        <div className="absolute inset-0 flex justify-between items-center px-1 opacity-0 hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 bg-white/80 hover:bg-black hover:text-white border border-black rounded-none disabled:opacity-0 text-black"
            onClick={prevStage}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 bg-white/80 hover:bg-black hover:text-white border border-black rounded-none disabled:opacity-0 text-black"
            onClick={nextStage}
            disabled={currentIndex === stages.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-center font-mono h-10 text-black">{creature.description}</p>
      
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          className="flex-1 border-2 border-black bg-white hover:bg-black hover:text-white rounded-none h-8 text-xs text-black"
          onClick={prevStage}
          disabled={currentIndex === 0}
        >
          PREV
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 border-2 border-black bg-white hover:bg-black hover:text-white rounded-none h-8 text-xs text-black"
          onClick={nextStage}
          disabled={currentIndex === stages.length - 1}
        >
          NEXT
        </Button>
      </div>
    </Card>
  )
}

export default function CreaturesPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const pages = getCreaturePages()
  const currentCreatures = pages[currentPage] || []

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8 font-mono text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b-4 border-black pb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2 text-black">CREATURE CONCEPTS</h1>
            <p className="text-gray-600">Evolution stages for potential pets</p>
          </div>
          <Link href="/">
            <Button className="border-2 border-black bg-white text-black hover:bg-black hover:text-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO GALLERY
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentCreatures.map((creature) => (
            <CreatureCard key={creature.id} creature={creature} />
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 pt-8 border-t-4 border-black">
          <Button
            variant="outline"
            className="border-2 border-black bg-white hover:bg-black hover:text-white rounded-none w-32 text-black"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> PREV
          </Button>
          <span className="font-bold text-xl text-black">
            PAGE {currentPage + 1} OF {pages.length}
          </span>
          <Button
            variant="outline"
            className="border-2 border-black bg-white hover:bg-black hover:text-white rounded-none w-32 text-black"
            onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
            disabled={currentPage === pages.length - 1}
          >
            NEXT <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
