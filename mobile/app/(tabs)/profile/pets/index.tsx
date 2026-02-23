import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EmptyState } from '@/components/ui/EmptyState'

export default function PetsListScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1e293b' }}>
          Mano gyvūnai
        </Text>
      </View>
      <EmptyState
        icon="🐾"
        title="Dar nėra gyvūnų"
        description="Pridėkite savo pirmą gyvūną"
        actionLabel="Pridėti gyvūną"
        onAction={() => {}}
      />
    </SafeAreaView>
  )
}
