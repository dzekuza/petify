import { View, Text } from 'react-native'

interface RatingProps {
  value: number
  count?: number
  size?: 'sm' | 'md'
  showCount?: boolean
}

export function Rating({ value, count, size = 'md', showCount = true }: RatingProps) {
  const fontSize = size === 'sm' ? 12 : 14
  const starSize = size === 'sm' ? 12 : 16

  const fullStars = Math.floor(value)
  const hasHalf = value - fullStars >= 0.5

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ flexDirection: 'row', gap: 1 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Text key={i} style={{ fontSize: starSize }}>
            {i < fullStars ? '★' : (i === fullStars && hasHalf) ? '★' : '☆'}
          </Text>
        ))}
      </View>
      <Text style={{ fontSize, fontWeight: '600', color: '#1e293b' }}>
        {value.toFixed(1)}
      </Text>
      {showCount && count !== undefined ? (
        <Text style={{ fontSize, color: '#64748b' }}>
          ({count})
        </Text>
      ) : null}
    </View>
  )
}
