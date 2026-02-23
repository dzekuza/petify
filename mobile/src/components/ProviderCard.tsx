import { View, Text, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Rating } from '@/components/ui/Rating'
import { FavoriteButton } from '@/components/FavoriteButton'
import type { ServiceProvider } from '@/types'

interface ProviderCardProps {
  provider: ServiceProvider
  compact?: boolean
}

export function ProviderCard({ provider, compact = false }: ProviderCardProps) {
  const router = useRouter()
  const firstImage = provider.images?.[0] ?? provider.avatarUrl

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/search/${provider.id}`)}
      style={({ pressed }) => ({
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderCurve: 'continuous',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        opacity: pressed ? 0.9 : 1,
        width: compact ? 260 : '100%',
      })}
    >
      {firstImage ? (
        <Image
          source={{ uri: firstImage }}
          style={{ width: '100%', height: compact ? 140 : 180 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={{
          width: '100%',
          height: compact ? 140 : 180,
          backgroundColor: '#f1f5f9',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 40 }}>🏪</Text>
        </View>
      )}

      <View style={{ padding: 12, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text
            style={{ fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1 }}
            numberOfLines={1}
          >
            {provider.businessName}
          </Text>
          <FavoriteButton providerId={provider.id} size={20} />
        </View>

        {provider.location?.city ? (
          <Text style={{ fontSize: 13, color: '#64748b' }} numberOfLines={1}>
            {provider.location.city}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Rating value={provider.rating} count={provider.reviewCount} size="sm" />
          {provider.priceRange?.min > 0 ? (
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
              nuo €{provider.priceRange.min}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}
