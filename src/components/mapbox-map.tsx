'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Heart, X, ChevronRight } from 'lucide-react'
import { MAPBOX_CONFIG, MAP_MARKERS } from '@/lib/mapbox'
import { SearchResult } from '@/types'
import { MapControls } from '@/components/map-controls'
import 'mapbox-gl/dist/mapbox-gl.css'

// Custom styles for mapbox popup
const popupStyles = `
  .mapbox-popup .mapboxgl-popup-content {
    padding: 0;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border: none;
    background: transparent;
  }
  
  .mapbox-popup .mapboxgl-popup-tip {
    border-top-color: white;
    border-width: 8px;
  }
  
  .mapbox-popup .mapboxgl-popup-close-button {
    display: none;
  }
`

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
    zoom: MAPBOX_CONFIG.defaultZoom,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  })
  
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [hoveredProviderId] = useState<string | null>(null)
  const [currentMapStyle, setCurrentMapStyle] = useState(MAPBOX_CONFIG.style)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapRef = useRef<MapRef>(null)

  // Inject custom popup styles
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = popupStyles
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

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


  const formatPrice = (priceRange: { min: number; max: number }) => {
    if (priceRange.min === priceRange.max) {
      return `€${priceRange.min}`
    }
    return `€${priceRange.min}-€${priceRange.max}`
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
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={[0, -10]}
            className="mapbox-popup"
          >
            <div className="w-80 bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Cover Image Section */}
              <div className="relative h-48 w-full">
                {selectedResult.provider.images && selectedResult.provider.images.length > 0 ? (
                  <img 
                    src={selectedResult.provider.images[0]} 
                    alt={selectedResult.provider.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-4xl">
                      {selectedResult.provider.services[0] === 'grooming' ? '🐕' : 
                       selectedResult.provider.services[0] === 'veterinary' ? '🏥' :
                       selectedResult.provider.services[0] === 'boarding' ? '🏠' :
                       selectedResult.provider.services[0] === 'training' ? '🎓' : '🐾'}
                    </span>
                  </div>
                )}
                
                {/* Overlay Icons */}
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  {/* Heart Icon */}
                  <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  {/* Close Icon */}
                  <button 
                    onClick={handleClosePopup}
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                
                {/* Navigation Arrow (if multiple images) */}
                {selectedResult.provider.images && selectedResult.provider.images.length > 1 && (
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                )}
                
                {/* Pagination Dots (if multiple images) */}
                {selectedResult.provider.images && selectedResult.provider.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {selectedResult.provider.images.slice(0, 5).map((_, index) => (
                      <div 
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${
                          index === 0 ? 'bg-white' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-4">
                {/* Title and Rating */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-base leading-tight">
                    {selectedResult.provider.businessName}
                  </h4>
                  <div className="flex items-center ml-2">
                    <Star className="w-4 h-4 text-black fill-current" />
                    <span className="text-sm font-medium text-gray-900 ml-1">
                      {selectedResult.provider.rating}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({selectedResult.provider.reviewCount})
                    </span>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {selectedResult.provider.description}
                </p>
                
                {/* Service Tags */}
                <div className="flex items-center space-x-1 mb-3">
                  {selectedResult.provider.services.map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatPrice(selectedResult.provider.priceRange)}
                    <span className="text-sm font-normal text-gray-600 ml-1">service</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs px-3 py-1"
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-xs px-3 py-1"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
