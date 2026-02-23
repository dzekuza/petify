import { View, Text, Pressable, ScrollView } from 'react-native'
import type { Service } from '@/types'

interface ServiceSelectorProps {
  services: Service[]
  selectedServiceId: string | null
  onSelect: (service: Service) => void
}

export function ServiceSelector({ services, selectedServiceId, onSelect }: ServiceSelectorProps) {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>
        Pasirinkite paslaugą
      </Text>
      <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
        Pasirinkite norimą paslaugą iš sąrašo
      </Text>

      {services.map(service => {
        const isSelected = service.id === selectedServiceId

        return (
          <Pressable
            key={service.id}
            onPress={() => onSelect(service)}
            style={{
              borderWidth: 2,
              borderColor: isSelected ? '#6366f1' : '#f1f5f9',
              borderRadius: 16,
              borderCurve: 'continuous',
              padding: 16,
              gap: 8,
              backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1 }}>
                {service.name}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#6366f1' }}>
                €{service.price.toFixed(2)}
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
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {service.includes.map((item, i) => (
                  <View key={i} style={{
                    backgroundColor: '#ecfdf5',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}>
                    <Text style={{ fontSize: 12, color: '#059669' }}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {isSelected ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 20, color: '#6366f1' }}>✓</Text>
              </View>
            ) : null}
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
