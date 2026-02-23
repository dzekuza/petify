import { View, Text, ScrollView, Pressable, ActivityIndicator, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { useProvider, useProviderServices } from '@/hooks/useProviders'
import { useProviderReviews } from '@/hooks/useReviews'
import { Rating } from '@/components/ui/Rating'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { FavoriteButton } from '@/components/FavoriteButton'
import { ServiceCard } from '@/components/ServiceCard'

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: provider, isLoading } = useProvider(id)
  const { data: services } = useProviderServices(id)
  const { data: reviews } = useProviderReviews(id)

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    )
  }

  if (!provider) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#64748b' }}>Teikėjas nerastas</Text>
      </SafeAreaView>
    )
  }

  const firstImage = provider.images?.[0] ?? provider.avatarUrl

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: 12,
            left: 16,
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>

        {/* Hero image */}
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={{ width: '100%', height: 260 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={{ width: '100%', height: 200, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 64 }}>🏪</Text>
          </View>
        )}

        <View style={{ padding: 20, gap: 20 }}>
          {/* Header */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#1e293b', flex: 1 }}>
                {provider.businessName}
              </Text>
              <FavoriteButton providerId={provider.id} size={28} />
            </View>

            {provider.location?.city ? (
              <Text style={{ fontSize: 15, color: '#64748b' }}>
                📍 {provider.location.address ? `${provider.location.address}, ` : ''}{provider.location.city}
              </Text>
            ) : null}

            <Rating value={provider.rating} count={provider.reviewCount} />

            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {provider.experience > 0 ? (
                <Badge label={`${provider.experience} m. patirtis`} variant="info" />
              ) : null}
              {provider.certifications?.map((cert, i) => (
                <Badge key={i} label={cert} variant="success" />
              ))}
            </View>
          </View>

          {/* About */}
          {provider.description ? (
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b' }}>Apie</Text>
              <Text style={{ fontSize: 15, color: '#475569', lineHeight: 22 }}>
                {provider.description}
              </Text>
            </View>
          ) : null}

          {/* Services */}
          {services && services.length > 0 ? (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b' }}>
                Paslaugos ir kainos
              </Text>
              {services.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={() => router.push({
                    pathname: '/booking-flow/[providerId]',
                    params: { providerId: provider.id, serviceId: service.id },
                  })}
                />
              ))}
            </View>
          ) : null}

          {/* Reviews */}
          {reviews && reviews.length > 0 ? (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b' }}>
                Atsiliepimai ({reviews.length})
              </Text>
              {reviews.slice(0, 5).map(review => (
                <View key={review.id} style={{
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  padding: 14,
                  gap: 8,
                }}>
                  <Rating value={review.rating} showCount={false} size="sm" />
                  <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
                    {review.comment}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                    {new Date(review.createdAt).toLocaleDateString('lt-LT')}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Contact */}
          {provider.contactInfo ? (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {provider.contactInfo.phone ? (
                <Button
                  title="Skambinti"
                  variant="outline"
                  size="md"
                  onPress={() => Linking.openURL(`tel:${provider.contactInfo!.phone}`)}
                  style={{ flex: 1 }}
                />
              ) : null}
              <Button
                title="Rašyti"
                variant="secondary"
                size="md"
                onPress={() => {
                  // Will navigate to chat in Phase 5
                }}
                style={{ flex: 1 }}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Fixed book button */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 36,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
      }}>
        <Button
          title="Užsakyti paslaugą"
          onPress={() => router.push({
            pathname: '/booking-flow/[providerId]',
            params: { providerId: provider.id },
          })}
          size="lg"
        />
      </View>
    </SafeAreaView>
  )
}
