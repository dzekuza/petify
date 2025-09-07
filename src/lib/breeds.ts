export interface Breed {
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  popularity: number // Higher number = more popular
}

export const BREEDS: Breed[] = [
  // Dog breeds (most popular first)
  { name: 'Labrador Retriever', species: 'dog', popularity: 100 },
  { name: 'Golden Retriever', species: 'dog', popularity: 95 },
  { name: 'German Shepherd', species: 'dog', popularity: 90 },
  { name: 'French Bulldog', species: 'dog', popularity: 85 },
  { name: 'Bulldog', species: 'dog', popularity: 80 },
  { name: 'Poodle', species: 'dog', popularity: 75 },
  { name: 'Beagle', species: 'dog', popularity: 70 },
  { name: 'Rottweiler', species: 'dog', popularity: 65 },
  { name: 'German Shorthaired Pointer', species: 'dog', popularity: 60 },
  { name: 'Yorkshire Terrier', species: 'dog', popularity: 55 },
  { name: 'Siberian Husky', species: 'dog', popularity: 50 },
  { name: 'Dachshund', species: 'dog', popularity: 45 },
  { name: 'Boxer', species: 'dog', popularity: 40 },
  { name: 'Great Dane', species: 'dog', popularity: 35 },
  { name: 'Chihuahua', species: 'dog', popularity: 30 },
  { name: 'Shih Tzu', species: 'dog', popularity: 25 },
  { name: 'Border Collie', species: 'dog', popularity: 20 },
  { name: 'Australian Shepherd', species: 'dog', popularity: 15 },
  { name: 'Cocker Spaniel', species: 'dog', popularity: 10 },
  { name: 'Maltese', species: 'dog', popularity: 5 },

  // Cat breeds (most popular first)
  { name: 'Persian', species: 'cat', popularity: 100 },
  { name: 'Maine Coon', species: 'cat', popularity: 95 },
  { name: 'British Shorthair', species: 'cat', popularity: 90 },
  { name: 'Ragdoll', species: 'cat', popularity: 85 },
  { name: 'Siamese', species: 'cat', popularity: 80 },
  { name: 'American Shorthair', species: 'cat', popularity: 75 },
  { name: 'Scottish Fold', species: 'cat', popularity: 70 },
  { name: 'Sphynx', species: 'cat', popularity: 65 },
  { name: 'Russian Blue', species: 'cat', popularity: 60 },
  { name: 'Abyssinian', species: 'cat', popularity: 55 },
  { name: 'Bengal', species: 'cat', popularity: 50 },
  { name: 'Birman', species: 'cat', popularity: 45 },
  { name: 'Oriental Shorthair', species: 'cat', popularity: 40 },
  { name: 'Devon Rex', species: 'cat', popularity: 35 },
  { name: 'Cornish Rex', species: 'cat', popularity: 30 },
  { name: 'Himalayan', species: 'cat', popularity: 25 },
  { name: 'Exotic Shorthair', species: 'cat', popularity: 20 },
  { name: 'Norwegian Forest Cat', species: 'cat', popularity: 15 },
  { name: 'Manx', species: 'cat', popularity: 10 },
  { name: 'Burmese', species: 'cat', popularity: 5 },

  // Bird breeds
  { name: 'Budgerigar (Budgie)', species: 'bird', popularity: 100 },
  { name: 'Cockatiel', species: 'bird', popularity: 95 },
  { name: 'Canary', species: 'bird', popularity: 90 },
  { name: 'Lovebird', species: 'bird', popularity: 85 },
  { name: 'Cockatoo', species: 'bird', popularity: 80 },
  { name: 'African Grey Parrot', species: 'bird', popularity: 75 },
  { name: 'Conure', species: 'bird', popularity: 70 },
  { name: 'Finch', species: 'bird', popularity: 65 },
  { name: 'Parakeet', species: 'bird', popularity: 60 },
  { name: 'Macaw', species: 'bird', popularity: 55 },

  // Rabbit breeds
  { name: 'Holland Lop', species: 'rabbit', popularity: 100 },
  { name: 'Netherland Dwarf', species: 'rabbit', popularity: 95 },
  { name: 'Mini Rex', species: 'rabbit', popularity: 90 },
  { name: 'Lionhead', species: 'rabbit', popularity: 85 },
  { name: 'Flemish Giant', species: 'rabbit', popularity: 80 },
  { name: 'English Lop', species: 'rabbit', popularity: 75 },
  { name: 'French Lop', species: 'rabbit', popularity: 70 },
  { name: 'Mini Lop', species: 'rabbit', popularity: 65 },
  { name: 'American Fuzzy Lop', species: 'rabbit', popularity: 60 },
  { name: 'Himalayan', species: 'rabbit', popularity: 55 },

  // Other
  { name: 'Mixed Breed', species: 'other', popularity: 100 },
  { name: 'Unknown', species: 'other', popularity: 50 }
]

export const getBreedsBySpecies = (species: string): Breed[] => {
  return BREEDS
    .filter(breed => breed.species === species)
    .sort((a, b) => b.popularity - a.popularity)
}

export const searchBreeds = (species: string, query: string): Breed[] => {
  const breeds = getBreedsBySpecies(species)
  if (!query.trim()) return breeds
  
  const lowercaseQuery = query.toLowerCase()
  return breeds.filter(breed => 
    breed.name.toLowerCase().includes(lowercaseQuery)
  )
}
