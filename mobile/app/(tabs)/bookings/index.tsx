import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState } from '@/components/ui/EmptyState'

export default function BookingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1e293b' }}>
          Užsakymai
        </Text>
      </View>
      <EmptyState
        icon="📅"
        title="Dar nėra užsakymų"
        description="Pradėkite užsakydami paslaugą savo augintiniui"
      />
    </SafeAreaView>
  )
}
