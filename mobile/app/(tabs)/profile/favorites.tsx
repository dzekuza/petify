import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState } from '@/components/ui/EmptyState'

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1e293b' }}>
          Mėgstami
        </Text>
      </View>
      <EmptyState
        icon="❤️"
        title="Dar nėra mėgstamų"
        description="Pridėkite teikėjus prie mėgstamų"
      />
    </SafeAreaView>
  )
}
