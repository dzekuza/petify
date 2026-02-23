import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>
          Redaguoti gyvūną
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
          ID: {id}
        </Text>
      </View>
    </SafeAreaView>
  )
}
