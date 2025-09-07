'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getBreedsBySpecies, searchBreeds, type Breed } from '@/lib/breeds'

interface BreedSelectorProps {
  value: string
  onValueChange: (value: string) => void
  species: string
  placeholder?: string
  className?: string
}

export function BreedSelector({ 
  value, 
  onValueChange, 
  species, 
  placeholder = "Select breed...",
  className 
}: BreedSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [breeds, setBreeds] = useState<Breed[]>([])

  useEffect(() => {
    if (searchQuery.trim()) {
      setBreeds(searchBreeds(species, searchQuery))
    } else {
      setBreeds(getBreedsBySpecies(species))
    }
  }, [species, searchQuery])

  const selectedBreed = breeds.find(breed => breed.name === value)

  const handleBreedSelect = (breedName: string) => {
    onValueChange(breedName === value ? '' : breedName)
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedBreed ? selectedBreed.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search breeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          
          {/* Breeds List */}
          <div className="max-h-60 overflow-auto">
            {breeds.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No breed found.
              </div>
            ) : (
              <div className="p-1">
                {breeds.map((breed) => (
                  <div
                    key={breed.name}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      value === breed.name && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleBreedSelect(breed.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === breed.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{breed.name}</span>
                    {breed.popularity >= 80 && (
                      <span className="ml-auto text-xs text-muted-foreground">Popular</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
