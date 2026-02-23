import { useState, useMemo } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import { useLocalSearchParams } from 'expo-router'
import { useSearchProviders } from '@/hooks/useProviders'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchBar } from '@/components/SearchBar'
import { CategoryChips } from '@/components/CategoryChips'
import { ProviderCard } from '@/components/ProviderCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ServiceCategory } from '@/types'

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(
    params.category as ServiceCategory | undefined
  )

  const debouncedSearch = useDebounce(searchText, 300)

  const filters = useMemo(() => ({
    category: selectedCategory,
    location: debouncedSearch || undefined,
  }), [selectedCategory, debouncedSearch])

  const { data: results, isLoading, refetch } = useSearchProviders(filters)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <View style={{ gap: 12 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Ieškoti pagal miestą..."
            onClear={() => setSearchText('')}
          />
        </View>

        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {results ? (
          <Text style={{ paddingHorizontal: 20, fontSize: 14, color: '#64748b' }}>
            {results.length} rasta teikėjų
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#6366f1" />
      ) : results && results.length > 0 ? (
        <FlashList
          data={results}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}

          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => (
            <ProviderCard provider={item.provider} />
          )}
        />
      ) : (
        <EmptyState
          icon="🔍"
          title="Teikėjų nerasta"
          description="Pabandykite pakeisti filtrus arba paieškos tekstą"
        />
      )}
    </SafeAreaView>
  )
}
