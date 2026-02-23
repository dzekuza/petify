import { Pressable, Text } from 'react-native'
import { useFavorites } from '@/contexts/favorites-context'
import * as Haptics from 'expo-haptics'

interface FavoriteButtonProps {
  providerId: string
  size?: number
}

export function FavoriteButton({ providerId, size = 24 }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(providerId)

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    toggleFavorite(providerId)
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={12}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={{ fontSize: size }}>
        {active ? '❤️' : '🤍'}
      </Text>
    </Pressable>
  )
}
