import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { FlashList } from '@shopify/flash-list'
import { useAuth } from '@/contexts/auth-context'
import { useFeaturedProviders } from '@/hooks/useProviders'
import { categories } from '@/constants/categories'
import { ProviderCard } from '@/components/ProviderCard'

export default function HomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const { data: featured, isLoading } = useFeaturedProviders()

  const userName = user?.user_metadata?.full_name ?? 'Vartotojas'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ padding: 20, gap: 4 }}>
          <Text style={{ fontSize: 16, color: '#64748b' }}>
            Sveiki,
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#1e293b' }}>
            {userName}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>
            Paslaugos
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {categories.map(cat => (
              <Pressable
                key={cat.id}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { category: cat.id } })}
                style={({ pressed }) => ({
                  width: '47%',
                  backgroundColor: cat.color + '15',
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  padding: 20,
                  gap: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 32 }}>{cat.icon}</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>
              Rekomenduojami
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/search')}>
              <Text style={{ fontSize: 14, color: '#6366f1', fontWeight: '500' }}>
                Visi
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator style={{ paddingVertical: 40 }} color="#6366f1" />
          ) : featured && featured.length > 0 ? (
            <View style={{ height: 280 }}>
              <FlashList
                data={featured}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}

                renderItem={({ item }) => (
                  <ProviderCard provider={item.provider} compact />
                )}
              />
            </View>
          ) : (
            <Text style={{ paddingHorizontal: 20, color: '#94a3b8', fontSize: 14 }}>
              Kol kas nėra teikėjų
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
