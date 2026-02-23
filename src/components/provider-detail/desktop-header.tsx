'use client'

import { ArrowLeft, Share2, Heart } from 'lucide-react'
import { t } from '@/lib/translations'

interface DesktopHeaderProps {
  onBack: () => void
  onShare: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function DesktopHeader({ onBack, onShare, isFavorite, onToggleFavorite }: DesktopHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('provider.back')}</span>
      </button>
      <div className="flex items-center space-x-4">
        <button
          onClick={onShare}
          className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>{t('provider.share')}</span>
        </button>
        <button
          onClick={onToggleFavorite}
          className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
          <span>{t('provider.save')}</span>
        </button>
      </div>
    </div>
  )
}
