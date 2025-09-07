'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
  showNavigation?: boolean
  showPagination?: boolean
  showCounter?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  onImageChange?: (index: number) => void
}

export const ImageGallery = ({
  images,
  alt,
  className = '',
  showNavigation = true,
  showPagination = true,
  showCounter = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  onImageChange
}: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handlePrevious = useCallback(() => {
    if (images.length > 1 && !isTransitioning) {
      setIsTransitioning(true)
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
      setCurrentIndex(newIndex)
      onImageChange?.(newIndex)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [images.length, currentIndex, isTransitioning, onImageChange])

  const handleNext = useCallback(() => {
    if (images.length > 1 && !isTransitioning) {
      setIsTransitioning(true)
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
      setCurrentIndex(newIndex)
      onImageChange?.(newIndex)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [images.length, currentIndex, isTransitioning, onImageChange])

  const handlePaginationClick = useCallback((index: number) => {
    if (index !== currentIndex && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex(index)
      onImageChange?.(index)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [currentIndex, isTransitioning, onImageChange])

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        if (!isTransitioning) {
          handleNext()
        }
      }, autoPlayInterval)

      return () => clearInterval(interval)
    }
  }, [autoPlay, images.length, isTransitioning, autoPlayInterval, handleNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (images.length > 1 && !isTransitioning) {
        if (event.key === 'ArrowLeft') {
          handlePrevious()
        } else if (event.key === 'ArrowRight') {
          handleNext()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length, isTransitioning, handlePrevious, handleNext])

  if (!images || images.length === 0) {
    return (
      <div className={cn('relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center', className)}>
        <span className="text-gray-500 text-sm">No images available</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Images Container */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              'absolute inset-0 transition-all duration-300 ease-in-out',
              index === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            )}
          >
            <Image
              src={image}
              alt={`${alt} - Image ${index + 1}`}
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" style={{ display: 'none' }}>
              <span className="text-gray-500 text-sm">Image failed to load</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Image Counter */}
      {showCounter && images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Pagination Dots */}
      {showPagination && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handlePaginationClick(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/60 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
