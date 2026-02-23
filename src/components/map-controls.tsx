'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Map, 
  Satellite, 
  Sun, 
  Moon, 
  Layers, 
  Search,
  Filter,
  Maximize2
} from 'lucide-react'
import { MAP_STYLES } from '@/lib/mapbox'

interface MapControlsProps {
  onStyleChange: (style: string) => void
  onSearchClick: () => void
  onFiltersClick: () => void
  onFullscreenClick: () => void
  currentStyle: string
  resultCount: number
  className?: string
}

export const MapControls = ({
  onStyleChange,
  onSearchClick,
  onFiltersClick,
  onFullscreenClick,
  currentStyle,
  resultCount,
  className = ''
}: MapControlsProps) => {
  const [showStyleMenu, setShowStyleMenu] = useState(false)

  const styleOptions = [
    { key: MAP_STYLES.custom, label: 'Custom', icon: Map },
    { key: MAP_STYLES.streets, label: 'Streets', icon: Map },
    { key: MAP_STYLES.satellite, label: 'Satellite', icon: Satellite },
    { key: MAP_STYLES.light, label: 'Light', icon: Sun },
    { key: MAP_STYLES.dark, label: 'Dark', icon: Moon }
  ]

  const getCurrentStyleIcon = () => {
    const current = styleOptions.find(style => style.key === currentStyle)
    return current?.icon || Map
  }

  const CurrentIcon = getCurrentStyleIcon()

  return (
    <div className={`flex flex-wrap items-center gap-2 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg ${className}`}>
      {/* Style Selector */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          className="flex items-center gap-2"
        >
          <CurrentIcon className="h-4 w-4" />
          <Layers className="h-3 w-3" />
        </Button>
        
        {showStyleMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border z-10 min-w-32">
            {styleOptions.map((style) => {
              const Icon = style.icon
              return (
                <button
                  key={style.key}
                  onClick={() => {
                    onStyleChange(style.key)
                    setShowStyleMenu(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    currentStyle === style.key ? 'bg-blue-50 text-blue-600' : 'text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {style.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Search Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSearchClick}
        className="flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        Search
      </Button>

      {/* Filters Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFiltersClick}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filters
        {resultCount > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {resultCount}
          </Badge>
        )}
      </Button>

      {/* Fullscreen Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFullscreenClick}
        className="flex items-center gap-2"
      >
        <Maximize2 className="h-4 w-4" />
        Fullscreen
      </Button>

      {/* Results Counter */}
      <div className="ml-auto">
        <Badge variant="outline" className="text-xs">
          {resultCount} providers found
        </Badge>
      </div>
    </div>
  )
}
