import { View, Text, Pressable } from 'react-native'
import type { Service } from '@/types'

interface ServiceCardProps {
  service: Service
  onPress?: () => void
}

export function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        borderCurve: 'continuous',
        padding: 16,
        gap: 8,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1 }} numberOfLines={2}>
          {service.name}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#6366f1' }}>
          €{service.price}
        </Text>
      </View>

      {service.description ? (
        <Text style={{ fontSize: 14, color: '#64748b', lineHeight: 20 }} numberOfLines={2}>
          {service.description}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 16 }}>
        {service.duration > 0 ? (
          <Text style={{ fontSize: 13, color: '#94a3b8' }}>
            ⏱ {service.duration} min
          </Text>
        ) : null}
        {service.maxPets > 1 ? (
          <Text style={{ fontSize: 13, color: '#94a3b8' }}>
            🐾 Iki {service.maxPets} gyvūnų
          </Text>
        ) : null}
      </View>

      {service.includes && service.includes.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {service.includes.map((item, i) => (
            <View key={i} style={{
              backgroundColor: '#f0fdf4',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              borderCurve: 'continuous',
            }}>
              <Text style={{ fontSize: 12, color: '#166534' }}>✓ {item}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  )
}
