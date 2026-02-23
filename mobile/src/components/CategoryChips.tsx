import { ScrollView, Pressable, Text } from 'react-native'
import { categories } from '@/constants/categories'
import type { ServiceCategory } from '@/types'

interface CategoryChipsProps {
  selected?: ServiceCategory
  onSelect: (category: ServiceCategory | undefined) => void
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      <Pressable
        onPress={() => onSelect(undefined)}
        style={({ pressed }) => ({
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          borderCurve: 'continuous',
          backgroundColor: selected === undefined ? '#6366f1' : '#f1f5f9',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: selected === undefined ? '#ffffff' : '#475569',
        }}>
          Visos
        </Text>
      </Pressable>
      {categories.map(cat => (
        <Pressable
          key={cat.id}
          onPress={() => onSelect(cat.id === selected ? undefined : cat.id)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderCurve: 'continuous',
            backgroundColor: selected === cat.id ? '#6366f1' : '#f1f5f9',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: selected === cat.id ? '#ffffff' : '#475569',
          }}>
            {cat.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}
