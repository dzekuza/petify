'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
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
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search breeds..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <CommandEmpty>No breed found.</CommandEmpty>
            <CommandGroup>
              {breeds.map((breed) => (
                <CommandItem
                  key={breed.name}
                  value={breed.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue)
                    setOpen(false)
                    setSearchQuery('')
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === breed.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {breed.name}
                  {breed.popularity >= 80 && (
                    <span className="ml-auto text-xs text-muted-foreground">Popular</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
