'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

type ImageMultiUploadProps = {
  files: File[]
  onChange: (nextFiles: File[]) => void
  existingImages?: string[]
  onRemoveExisting?: (url: string) => void
  onReorder?: (nextExisting: string[], nextFiles: File[]) => void
  accept?: string
  maxFiles?: number
  maxSizeMb?: number
  disabled?: boolean
  className?: string
  placeholder?: string
  description?: string
}

export function ImageMultiUpload ({
  files,
  onChange,
  existingImages = [],
  onRemoveExisting,
  onReorder,
  accept = 'image/*',
  maxFiles = 10,
  maxSizeMb = 10,
  disabled = false,
  className = '',
  placeholder = 'Vilkite ir numeskite arba spustelėkite, kad įkeltumėte',
  description = 'PNG, JPG, WEBP iki 10MB'
}: ImageMultiUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const totalCount = (existingImages?.length || 0) + (files?.length || 0)
  const remaining = Math.max(0, maxFiles - totalCount)

  const validate = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Pasirinkite paveikslėlio failą')
      return false
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Failo dydis turi būti mažesnis nei ${maxSizeMb}MB`)
      return false
    }
    setError(null)
    return true
  }

  const addFiles = useCallback((incoming: File[]) => {
    if (disabled) return
    if (!incoming?.length) return

    const allowed = Math.max(0, maxFiles - ((existingImages?.length || 0) + (files?.length || 0)))
    const nextSlice = incoming.slice(0, allowed)
    const filtered = nextSlice.filter(validate)
    if (!filtered.length) return
    onChange([...(files || []), ...filtered])
  }, [disabled, maxFiles, existingImages, files, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const list = Array.from(e.dataTransfer.files || [])
    if (!list.length) return
    addFiles(list)
  }, [addFiles, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handlePick = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || [])
    if (!list.length) return
    addFiles(list)
    e.currentTarget.value = ''
  }

  const handleRemoveNew = (index: number) => {
    const next = [...files]
    next.splice(index, 1)
    onChange(next)
  }

  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files])

  type Item = { kind: 'existing', value: string } | { kind: 'new', value: File }
  const combinedItems: Item[] = useMemo(() => {
    const ex = (existingImages || []).map(url => ({ kind: 'existing', value: url } as Item))
    const nw = (files || []).map(f => ({ kind: 'new', value: f } as Item))
    return [...ex, ...nw]
  }, [existingImages, files])

  const handleItemDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggingIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleItemDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleItemDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const fromRaw = e.dataTransfer.getData('text/plain')
    const from = fromRaw ? parseInt(fromRaw, 10) : draggingIndex
    if (from == null) return
    if (from === index) return

    const next = [...combinedItems]
    const [moved] = next.splice(from, 1)
    next.splice(index, 0, moved)

    // Split back into existing and files
    const nextExisting: string[] = []
    const nextFiles: File[] = []
    for (const it of next) {
      if (it.kind === 'existing') nextExisting.push(it.value)
      else nextFiles.push(it.value)
    }

    if (onReorder) {
      onReorder(nextExisting, nextFiles)
    } else {
      // Fallback: if reordering only within new files, update files
      const onlyNewMoved = nextExisting.length === (existingImages?.length || 0)
      if (onlyNewMoved) onChange(nextFiles)
    }

    setDraggingIndex(null)
  }

  return (
    <div className={className}>
      <div
        role='button'
        tabIndex={0}
        aria-label='Įkelti nuotraukas'
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer outline-none focus-visible:border-neutral-400
          ${isDragOver ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-black'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handlePick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePick() }}
      >
        <input
          ref={inputRef}
          id='image-multi-upload-input'
          type='file'
          accept={accept}
          multiple
          className='hidden'
          disabled={disabled || remaining <= 0}
          onChange={handleInputChange}
        />
        <div className='text-muted-foreground mb-2'>
          <Upload className='mx-auto h-12 w-12 text-muted-foreground' />
        </div>
        <p className='text-sm text-foreground'>{placeholder}</p>
        <p className='text-xs text-muted-foreground mt-1'>{description}</p>
        <p className='text-xs text-muted-foreground mt-1'>{totalCount}/{maxFiles}</p>
      </div>

      {error && (
        <p className='text-red-600 text-sm mt-2'>{error}</p>
      )}

      {(existingImages.length > 0 || files.length > 0) && (
        <div className='grid grid-cols-3 gap-2 mt-3'>
          {existingImages.map((url, i) => (
            <div
              key={`existing-${i}`}
              className='relative aspect-square rounded-lg overflow-hidden border'
              draggable={!disabled}
              onDragStart={handleItemDragStart(i)}
              onDragOver={handleItemDragOver(i)}
              onDrop={handleItemDrop(i)}
            >
              <Image src={url} alt={`Service image ${i + 1}`} fill className='object-cover' />
              {!!onRemoveExisting && !disabled && (
                <button
                  type='button'
                  aria-label='Pašalinti'
                  onClick={() => onRemoveExisting(url)}
                  className='absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>
          ))}

          {previews.map((src, i) => {
            const combinedIndex = (existingImages?.length || 0) + i
            return (
              <div
                key={`new-${i}`}
                className='relative aspect-square rounded-lg overflow-hidden border'
                draggable={!disabled}
                onDragStart={handleItemDragStart(combinedIndex)}
                onDragOver={handleItemDragOver(combinedIndex)}
                onDrop={handleItemDrop(combinedIndex)}
              >
              <img src={src} alt={`Upload ${i + 1}`} className='w-full h-full object-cover' />
              {!disabled && (
                <button
                  type='button'
                  aria-label='Pašalinti'
                  onClick={() => handleRemoveNew(i)}
                  className='absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


