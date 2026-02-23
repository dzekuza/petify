import { useState } from 'react'
import { View, Text, Pressable, ScrollView, Alert } from 'react-native'
import { Image } from 'expo-image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/auth-context'
import { useUserPets, useCreatePet } from '@/hooks/usePets'
import type { Pet } from '@/types'

const SPECIES_OPTIONS: { value: Pet['species']; label: string; emoji: string }[] = [
  { value: 'dog', label: 'Šuo', emoji: '🐕' },
  { value: 'cat', label: 'Katė', emoji: '🐈' },
  { value: 'bird', label: 'Paukštis', emoji: '🐦' },
  { value: 'rabbit', label: 'Triušis', emoji: '🐇' },
  { value: 'other', label: 'Kitas', emoji: '🐾' },
]

interface PetSelectorProps {
  selectedPetIds: string[]
  onTogglePet: (petId: string) => void
  maxPets?: number
}

export function PetSelector({ selectedPetIds, onTogglePet, maxPets = 5 }: PetSelectorProps) {
  const { user } = useAuth()
  const { data: pets, isLoading } = useUserPets(user?.id)
  const createPet = useCreatePet()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPetName, setNewPetName] = useState('')
  const [newPetSpecies, setNewPetSpecies] = useState<Pet['species']>('dog')
  const [newPetAge, setNewPetAge] = useState('')

  const handleToggle = (petId: string) => {
    if (!selectedPetIds.includes(petId) && selectedPetIds.length >= maxPets) {
      Alert.alert('Limitas', `Galite pasirinkti daugiausiai ${maxPets} gyvūnų`)
      return
    }
    onTogglePet(petId)
  }

  const handleAddPet = async () => {
    if (!newPetName.trim() || !newPetAge.trim() || !user?.id) return

    try {
      await createPet.mutateAsync({
        ownerId: user.id,
        name: newPetName.trim(),
        species: newPetSpecies,
        age: parseInt(newPetAge, 10) || 0,
      })
      setShowAddForm(false)
      setNewPetName('')
      setNewPetAge('')
    } catch {
      Alert.alert('Klaida', 'Nepavyko pridėti gyvūno')
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>
        Pasirinkite augintinį
      </Text>
      <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
        Pasirinkite gyvūnus, kuriems bus teikiama paslauga
      </Text>

      {isLoading ? (
        <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>Kraunama...</Text>
      ) : pets && pets.length > 0 ? (
        pets.map(pet => {
          const isSelected = selectedPetIds.includes(pet.id)
          const speciesInfo = SPECIES_OPTIONS.find(s => s.value === pet.species) ?? SPECIES_OPTIONS[4]

          return (
            <Pressable
              key={pet.id}
              onPress={() => handleToggle(pet.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: isSelected ? '#6366f1' : '#f1f5f9',
                borderRadius: 16,
                borderCurve: 'continuous',
                padding: 14,
                gap: 14,
                backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
              }}
            >
              {pet.profilePicture ? (
                <Image
                  source={{ uri: pet.profilePicture }}
                  style={{ width: 52, height: 52, borderRadius: 26 }}
                  contentFit="cover"
                />
              ) : (
                <View style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 24 }}>{speciesInfo.emoji}</Text>
                </View>
              )}

              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
                  {pet.name}
                </Text>
                <Text style={{ fontSize: 13, color: '#64748b' }}>
                  {speciesInfo.label}{pet.breed ? ` · ${pet.breed}` : ''} · {pet.age} m.
                </Text>
              </View>

              <View style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                borderWidth: 2,
                borderColor: isSelected ? '#6366f1' : '#d1d5db',
                backgroundColor: isSelected ? '#6366f1' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isSelected ? (
                  <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Text>
                ) : null}
              </View>
            </Pressable>
          )
        })
      ) : (
        <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
          <Text style={{ fontSize: 40 }}>🐾</Text>
          <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center' }}>
            Prieš užsakydami paslaugas, pridėkite gyvūnus į savo profilį.
          </Text>
        </View>
      )}

      {/* Add Pet Section */}
      {showAddForm ? (
        <View style={{
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 16,
          gap: 12,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            Naujas gyvūnas
          </Text>

          <Input
            label="Vardas"
            value={newPetName}
            onChangeText={setNewPetName}
            placeholder="Gyvūno vardas"
          />

          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Rūšis</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {SPECIES_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                onPress={() => setNewPetSpecies(option.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: newPetSpecies === option.value ? '#6366f1' : '#e2e8f0',
                  backgroundColor: newPetSpecies === option.value ? '#f5f3ff' : '#ffffff',
                }}
              >
                <Text>{option.emoji}</Text>
                <Text style={{
                  fontSize: 13,
                  color: newPetSpecies === option.value ? '#6366f1' : '#64748b',
                  fontWeight: newPetSpecies === option.value ? '600' : '400',
                }}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Amžius (metai)"
            value={newPetAge}
            onChangeText={setNewPetAge}
            placeholder="0"
            keyboardType="numeric"
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              title="Atšaukti"
              variant="outline"
              onPress={() => setShowAddForm(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Pridėti"
              onPress={handleAddPet}
              loading={createPet.isPending}
              disabled={!newPetName.trim() || !newPetAge.trim()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        <Button
          title="+ Pridėti naują gyvūną"
          variant="outline"
          onPress={() => setShowAddForm(true)}
        />
      )}
    </ScrollView>
  )
}
