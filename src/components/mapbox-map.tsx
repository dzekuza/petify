'use client'

import { useState, useCallback, useRef } from 'react'
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  MapRef,
  ViewState
} from 'react-map-gl/mapbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Clock, Navigation } from 'lucide-react'
import { MAPBOX_CONFIG, MAP_MARKERS, MAP_STYLES } from '@/lib/mapbox'
import { SearchResult } from '@/types'
import { MapControls } from '@/components/map-controls'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMapProps {
  results: SearchResult[]
  onMarkerClick?: (result: SearchResult) => void
  selectedProviderId?: string
  className?: string
  onSearchClick?: () => void
  onFiltersClick?: () => void
  showControls?: boolean
}

export const MapboxMap = ({ 
  results, 
  onMarkerClick, 
  selectedProviderId,
  className = '',
  onSearchClick,
  onFiltersClick,
  showControls = true
}: MapboxMapProps) => {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: MAPBOX_CONFIG.defaultCenter[0],
    latitude: MAPBOX_CONFIG.defaultCenter[1],
    zoom: MAPBOX_CONFIG.defaultZoom
  })
  
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [hoveredProviderId, setHoveredProviderId] = useState<string | null>(null)
  const [currentMapStyle, setCurrentMapStyle] = useState(MAPBOX_CONFIG.style)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapRef = useRef<MapRef>(null)

  const handleMarkerClick = useCallback((result: SearchResult) => {
    setSelectedResult(result)
    onMarkerClick?.(result)
    
    // Center map on marker
    setViewState(prev => ({
      ...prev,
      longitude: result.provider.location.coordinates.lng,
      latitude: result.provider.location.coordinates.lat,
      zoom: Math.max(prev.zoom || MAPBOX_CONFIG.defaultZoom, 14)
    }))
  }, [onMarkerClick])

  const handleClosePopup = useCallback(() => {
    setSelectedResult(null)
  }, [])

  const handleStyleChange = useCallback((style: string) => {
    setCurrentMapStyle(style)
  }, [])

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const getMarkerStyle = useCallback((result: SearchResult) => {
    const isSelected = selectedProviderId === result.provider.id
    const isHovered = hoveredProviderId === result.provider.id
    
    if (isSelected) {
      return {
        width: MAP_MARKERS.selected.size,
        height: MAP_MARKERS.selected.size,
        backgroundColor: MAP_MARKERS.selected.color,
        borderColor: MAP_MARKERS.selected.borderColor,
        borderWidth: MAP_MARKERS.selected.borderWidth
      }
    }
    
    if (isHovered) {
      return {
        width: MAP_MARKERS.hover.size,
        height: MAP_MARKERS.hover.size,
        backgroundColor: MAP_MARKERS.hover.color,
        borderColor: MAP_MARKERS.hover.borderColor,
        borderWidth: MAP_MARKERS.hover.borderWidth
      }
    }
    
    return {
      width: MAP_MARKERS.provider.size,
      height: MAP_MARKERS.provider.size,
      backgroundColor: MAP_MARKERS.provider.color,
      borderColor: MAP_MARKERS.provider.borderColor,
      borderWidth: MAP_MARKERS.provider.borderWidth
    }
  }, [selectedProviderId, hoveredProviderId])

  const formatPrice = (priceRange: { min: number; max: number }) => {
    if (priceRange.min === priceRange.max) {
      return `$${priceRange.min}`
    }
    return `$${priceRange.min}-${priceRange.max}`
  }

  if (!MAPBOX_CONFIG.accessToken) {
    return (
      <div className={`h-96 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600">
            Please add your Mapbox access token to environment variables
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {showControls && (
        <MapControls
          onStyleChange={handleStyleChange}
          onSearchClick={onSearchClick || (() => {})}
          onFiltersClick={onFiltersClick || (() => {})}
          onFullscreenClick={handleFullscreenToggle}
          currentStyle={currentMapStyle}
          resultCount={results.length}
          className="absolute top-4 left-4 z-10"
        />
      )}
      
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_CONFIG.accessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle={currentMapStyle}
        attributionControl={false}
        logoPosition="bottom-right"
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-left" />
        <GeolocateControl 
          position="top-right"
          trackUserLocation={true}
          showAccuracyCircle={false}
        />

        {/* Provider Markers */}
        {results.map((result) => (
          <Marker
            key={result.provider.id}
            longitude={result.provider.location.coordinates.lng}
            latitude={result.provider.location.coordinates.lat}
            onClick={() => handleMarkerClick(result)}
            onMouseEnter={() => setHoveredProviderId(result.provider.id)}
            onMouseLeave={() => setHoveredProviderId(null)}
          >
            <div
              className="cursor-pointer flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 border-2 border-white"
              style={{
                backgroundColor: selectedProviderId === result.provider.id ? '#FF5A5F' : '#00A699',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                minWidth: '40px',
                height: '40px',
                borderRadius: '20px',
                padding: '0 8px'
              }}
            >
              {formatPrice(result.provider.priceRange)}
            </div>
          </Marker>
        ))}

        {/* Popup for selected marker */}
        {selectedResult && (
          <Popup
            longitude={selectedResult.provider.location.coordinates.lng}
            latitude={selectedResult.provider.location.coordinates.lat}
            onClose={handleClosePopup}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            offset={[0, -10]}
            className="mapbox-popup"
          >
            <Card className="w-80 border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">
                      {selectedResult.provider.services[0] === 'grooming' ? '🐕' : 
                       selectedResult.provider.services[0] === 'veterinary' ? '🏥' :
                       selectedResult.provider.services[0] === 'boarding' ? '🏠' :
                       selectedResult.provider.services[0] === 'training' ? '🎓' : '🐾'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {selectedResult.provider.businessName}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {selectedResult.provider.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-900 ml-1">
                          {selectedResult.provider.rating}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({selectedResult.provider.reviewCount} reviews)
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Navigation className="h-3 w-3 mr-1" />
                      {selectedResult.distance} km away
                    </div>
                    
                    <div className="flex items-center space-x-1 mb-3">
                      {selectedResult.provider.services.map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs px-3 py-1 flex-1"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs px-3 py-1 flex-1"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Popup>
        )}
      </Map>
      
      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  )
}
