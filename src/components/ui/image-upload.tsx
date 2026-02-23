'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  value?: File | null
  onChange: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  placeholder?: string
  description?: string
  previewClassName?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  className = "",
  placeholder = "Click or drag and drop image here",
  description = "PNG, JPG, GIF up to 5MB",
  previewClassName = "w-24 h-24 object-cover rounded-lg",
  disabled = false
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return false
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return false
    }

    setError(null)
    return true
  }

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      onChange(file)
    }
  }, [onChange, maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveImage = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError(null)
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={className}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragOver ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-black'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        {value ? (
          <div className="relative inline-block">
            <img
              src={URL.createObjectURL(value)}
              alt="Preview"
              className={previewClassName}
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage()
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="text-muted-foreground mb-2">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {placeholder}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
