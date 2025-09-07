'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Map, { 
  Marker, 
  Popup, 
  MapRef,
  ViewState
} from 'react-map-gl/mapbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Heart, X, ChevronRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { MAPBOX_CONFIG } from '@/lib/mapbox'
import { SearchResult } from '@/types'
import 'mapbox-gl/dist/mapbox-gl.css'

// Custom styles for mapbox popup and canvas
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
  
  .mapboxgl-canvas {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    transform: none !important;
    object-fit: cover !important;
  }
  
  .mapboxgl-map {
    width: 100% !important;
    height: 100% !important;
  }
  
  .mapboxgl-canvas-container {
    width: 100% !important;
    height: 100% !important;
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
  // Calculate center based on results
  const calculateMapCenter = useCallback(() => {
    if (results.length === 0) {
      return {
        longitude: MAPBOX_CONFIG.defaultCenter[0],
        latitude: MAPBOX_CONFIG.defaultCenter[1],
        zoom: MAPBOX_CONFIG.defaultZoom
      }
    }

    // Calculate bounds of all markers
    const lats = results.map(r => r.provider.location.coordinates.lat)
    const lngs = results.map(r => r.provider.location.coordinates.lng)
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    
    // Calculate center point
    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2
    
    // Calculate zoom level based on bounds
    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)
    
    let zoom = MAPBOX_CONFIG.defaultZoom
    if (maxDiff > 0.1) zoom = 10
    else if (maxDiff > 0.05) zoom = 12
    else if (maxDiff > 0.02) zoom = 14
    else zoom = 16
    
    return {
      longitude: centerLng,
      latitude: centerLat,
      zoom: zoom
    }
  }, [results])

  const [viewState, setViewState] = useState<ViewState>(() => {
    const center = calculateMapCenter()
    return {
      longitude: center.longitude,
      latitude: center.latitude,
      zoom: center.zoom,
      bearing: 0,
      pitch: 0,
      padding: { top: 0, bottom: 0, left: 0, right: 0 }
    }
  })

  // Update map center when results change
  useEffect(() => {
    const center = calculateMapCenter()
    setViewState(prev => ({
      ...prev,
      longitude: center.longitude,
      latitude: center.latitude,
      zoom: center.zoom
    }))
  }, [calculateMapCenter])
  
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [popupImageIndex, setPopupImageIndex] = useState(0)
  const [isPopupTransitioning, setIsPopupTransitioning] = useState(false)
  const mapRef = useRef<MapRef>(null)

  // Check screen size for desktop/mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

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
    setPopupImageIndex(0) // Reset to first image when selecting new marker
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
    setPopupImageIndex(0)
  }, [])

  const handlePopupPreviousImage = useCallback(() => {
    if (selectedResult?.provider.images && !isPopupTransitioning) {
      setIsPopupTransitioning(true)
      setPopupImageIndex((prev) => 
        prev === 0 ? selectedResult.provider.images.length - 1 : prev - 1
      )
      setTimeout(() => setIsPopupTransitioning(false), 300)
    }
  }, [selectedResult?.provider.images, isPopupTransitioning])

  const handlePopupNextImage = useCallback(() => {
    if (selectedResult?.provider.images && !isPopupTransitioning) {
      setIsPopupTransitioning(true)
      setPopupImageIndex((prev) => 
        prev === selectedResult.provider.images.length - 1 ? 0 : prev + 1
      )
      setTimeout(() => setIsPopupTransitioning(false), 300)
    }
  }, [selectedResult?.provider.images, isPopupTransitioning])


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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600">
            Please add your Mapbox access token to environment variables
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${isDesktop ? 'rounded-lg' : ''} ${className}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_CONFIG.accessToken}
        mapStyle={MAPBOX_CONFIG.style}
        attributionControl={false}
        logoPosition="bottom-right"
      >

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
                backgroundColor: selectedProviderId === result.provider.id ? '#FF5A5F' : '#000000',
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

        {/* Popup for selected marker - Desktop only */}
        {selectedResult && isDesktop && (
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
              <div className="relative h-48 w-full overflow-hidden">
                {selectedResult.provider.images && selectedResult.provider.images.length > 0 ? (
                  <div className="relative w-full h-full">
                    {selectedResult.provider.images.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                          index === popupImageIndex
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-105'
                        }`}
                      >
                        <Image 
                          src={image} 
                          alt={selectedResult.provider.businessName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
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
                
                {/* Navigation Arrows (if multiple images) */}
                {selectedResult.provider.images && selectedResult.provider.images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePopupPreviousImage}
                      disabled={isPopupTransitioning}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    <button 
                      onClick={handlePopupNextImage}
                      disabled={isPopupTransitioning}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                  </>
                )}
                
                {/* Pagination Dots (if multiple images) */}
                {selectedResult.provider.images && selectedResult.provider.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {selectedResult.provider.images.slice(0, 5).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isPopupTransitioning) {
                            setIsPopupTransitioning(true)
                            setPopupImageIndex(index)
                            setTimeout(() => setIsPopupTransitioning(false), 300)
                          }
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          index === popupImageIndex
                            ? 'bg-white scale-125'
                            : 'bg-white/60 hover:bg-white/80'
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
      
      {/* Mobile Listing Card - Shows when marker is selected */}
      {selectedResult && (
        <div className="lg:hidden absolute bottom-24 left-4 right-4 z-20">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex">
              {/* Image Section */}
              <div className="relative w-24 h-24 flex-shrink-0">
                {selectedResult.provider.images && selectedResult.provider.images.length > 0 ? (
                  <Image 
                    src={selectedResult.provider.images[0]} 
                    alt={selectedResult.provider.businessName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-2xl">
                      {selectedResult.provider.services[0] === 'grooming' ? '🐕' : 
                       selectedResult.provider.services[0] === 'veterinary' ? '🏥' :
                       selectedResult.provider.services[0] === 'boarding' ? '🏠' :
                       selectedResult.provider.services[0] === 'training' ? '🎓' : '🐾'}
                    </span>
                  </div>
                )}
                
                {/* Close Button */}
                <button 
                  onClick={handleClosePopup}
                  className="absolute top-1 left-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                  <X className="w-3 h-3 text-gray-700" />
                </button>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                    {selectedResult.provider.businessName}
                  </h4>
                  <button className="w-6 h-6 flex items-center justify-center ml-2 flex-shrink-0">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 truncate">
                  {selectedResult.provider.services.join(' • ')} • {selectedResult.provider.location.city}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatPrice(selectedResult.provider.priceRange)}
                    <span className="text-xs font-normal text-gray-600 ml-1">service</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-black fill-current" />
                    <span className="text-xs font-medium text-gray-900 ml-1">
                      {selectedResult.provider.rating}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({selectedResult.provider.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Map attribution - Desktop only */}
      {isDesktop && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          © Mapbox © OpenStreetMap
        </div>
      )}
    </div>
  )
}
