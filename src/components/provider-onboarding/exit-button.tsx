'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ExitButtonProps {
  onExit: () => void
  isEditMode?: boolean
}

export default function ExitButton({ onExit, isEditMode }: ExitButtonProps) {
  if (!isEditMode) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onExit}
      className="fixed top-4 right-4 z-50 bg-white border-gray-300 text-foreground hover:bg-gray-50 shadow-md"
    >
      <X className="w-4 h-4 mr-2" />
      Išeiti
    </Button>
  )
}
