import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'

export default function BookingSuccessScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#ecfdf5',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 40 }}>✓</Text>
        </View>

        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
          Užsakymas patvirtintas!
        </Text>
        <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24 }}>
          Jūsų užsakymas sėkmingai sukurtas ir mokėjimas gautas.
          Paslaugų teikėjas netrukus patvirtins jūsų vizitą.
        </Text>
      </View>

      <View style={{ padding: 20, paddingBottom: 12, gap: 10 }}>
        <Button
          title="Peržiūrėti užsakymus"
          onPress={() => router.replace('/(tabs)/bookings')}
          size="lg"
        />
        <Button
          title="Grįžti į pradžią"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </SafeAreaView>
  )
}
