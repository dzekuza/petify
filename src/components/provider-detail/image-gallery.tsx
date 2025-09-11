'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowLeft, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ServiceProvider } from '@/types'

interface ImageGalleryProps {
  provider: ServiceProvider
  isFavorite: boolean
  onToggleFavorite: () => void
  onShare: () => void
  onBack: () => void
  isMobile?: boolean
}

export function ImageGallery({ 
  provider, 
  isFavorite, 
  onToggleFavorite, 
  onShare, 
  onBack,
  isMobile = false 
}: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handlePreviousImage = () => {
    if (provider?.images && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentImageIndex((prev) => 
        prev === 0 ? provider.images.length - 1 : prev - 1
      )
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const handleNextImage = () => {
    if (provider?.images && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentImageIndex((prev) => 
        prev === provider.images.length - 1 ? 0 : prev + 1
      )
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (provider?.images && provider.images.length > 1 && !isTransitioning) {
        if (event.key === 'ArrowLeft') {
          handlePreviousImage()
        } else if (event.key === 'ArrowRight') {
          handleNextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [provider?.images, isTransitioning])

  if (!provider.images || provider.images.length === 0) {
    return (
      <div className={`${isMobile ? 'aspect-square' : 'aspect-video'} bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ${isMobile ? '' : 'rounded-2xl'}`}>
        <span className="text-6xl">✂️</span>
      </div>
    )
  }

  // If only one image, show as cover image with 1:1 aspect ratio on mobile, 16:9 on desktop
  if (provider.images.length === 1) {
    return (
      <div className={`${isMobile ? 'aspect-square' : 'aspect-video'} relative overflow-hidden ${isMobile ? '' : 'rounded-2xl'}`}>
        <Image
          src={provider.images[0]}
          alt={`${provider.businessName} - Cover Image`}
          fill
          className="object-cover"
          priority
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling as HTMLElement
            if (fallback) {
              fallback.style.display = 'flex'
            }
          }}
        />
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200" style={{ display: 'none' }}>
          <span className="text-6xl">✂️</span>
        </div>
        
        {/* Overlay Controls for single image - Mobile only */}
        <div className="absolute inset-0 bg-black/20 md:hidden">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={onToggleFavorite}
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
              </button>
              <button 
                onClick={onShare}
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
        <div className="relative aspect-square overflow-hidden">
        <div className="relative w-full h-full">
          {provider.images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                index === currentImageIndex
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
            >
              <Image
                src={image}
                alt={`${provider.businessName} - Image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) {
                    fallback.style.display = 'flex'
                  }
                }}
              />
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200" style={{ display: 'none' }}>
                <span className="text-6xl">✂️</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/20">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={onToggleFavorite}
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
              </button>
              <button 
                onClick={onShare}
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Image Counter */}
          {provider.images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {provider.images.length}
            </div>
          )}
          
          {/* Navigation Arrows */}
          {provider.images.length > 1 && (
            <>
              <button
                onClick={handlePreviousImage}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
          
          {/* Pagination Dots */}
          {provider.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {provider.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true)
                      setCurrentImageIndex(index)
                      setTimeout(() => setIsTransitioning(false), 300)
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop layout - Gallery with multiple images
  return (
    <div className="grid grid-cols-4 gap-2 aspect-video">
      {/* Main large image */}
      <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl">
        <Image
          src={provider.images[currentImageIndex]}
          alt={`${provider.businessName} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Smaller images */}
      {provider.images.slice(1, 5).map((image, index) => (
        <div key={index} className="relative overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={`${provider.businessName} - Image ${index + 2}`}
            fill
            className="object-cover aspect-square cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setCurrentImageIndex(index + 1)}
          />
        </div>
      ))}
      {provider.images.length > 5 && (
        <div className="relative overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-600">+{provider.images.length - 5}</div>
            <div className="text-sm text-gray-500">More images</div>
          </div>
        </div>
      )}
    </div>
  )
}
