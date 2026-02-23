import { useEffect, useState } from 'react'
import { View, Text, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useStripe } from '@stripe/stripe-react-native'
import { useUpdateBookingPayment } from '@/hooks/useBookings'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/Button'
import Constants from 'expo-constants'

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl
  ?? process.env.EXPO_PUBLIC_API_BASE_URL
  ?? ''

export default function PaymentScreen() {
  const { bookingId, amount, serviceName, providerName } = useLocalSearchParams<{
    bookingId: string
    amount: string
    serviceName: string
    providerName: string
  }>()
  const router = useRouter()
  const { user } = useAuth()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  const updatePayment = useUpdateBookingPayment()

  const [loading, setLoading] = useState(true)
  const [paymentReady, setPaymentReady] = useState(false)
  const [paying, setPaying] = useState(false)

  const numericAmount = parseFloat(amount ?? '0')

  useEffect(() => {
    if (bookingId && numericAmount > 0) {
      initializePayment()
    }
  }, [bookingId])

  const initializePayment = async () => {
    try {
      // Create payment intent via our API
      const response = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          currency: 'eur',
          bookingId,
          customerEmail: user?.email,
          serviceFee: 0.1,
        }),
      })

      const { clientSecret, paymentIntentId } = await response.json()

      if (!clientSecret) {
        throw new Error('No client secret received')
      }

      // Initialize the PaymentSheet
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Petify',
        defaultBillingDetails: {
          email: user?.email ?? undefined,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      setPaymentReady(true)
    } catch (err) {
      console.error('Payment init error:', err)
      Alert.alert(
        'Klaida',
        'Nepavyko paruošti mokėjimo. Bandykite dar kartą.',
        [{ text: 'Gerai', onPress: () => router.back() }]
      )
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (!bookingId) return
    setPaying(true)

    try {
      const { error } = await presentPaymentSheet()

      if (error) {
        if (error.code === 'Canceled') {
          // User cancelled - do nothing
          setPaying(false)
          return
        }
        throw new Error(error.message)
      }

      // Payment succeeded - update booking
      await updatePayment.mutateAsync({
        bookingId,
        paymentId: bookingId, // Will be updated by webhook with real Stripe ID
        paymentStatus: 'paid',
      })

      router.replace('/booking-flow/success')
    } catch (err) {
      console.error('Payment error:', err)
      Alert.alert('Mokėjimo klaida', 'Mokėjimas nepavyko. Bandykite dar kartą.')
      setPaying(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, padding: 20, gap: 24 }}>
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1e293b' }}>
            Mokėjimas
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b' }}>
            Užbaikite užsakymą atlikdami mokėjimą
          </Text>
        </View>

        {/* Order summary card */}
        <View style={{
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 20,
          gap: 12,
        }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
              {serviceName}
            </Text>
            <Text style={{ fontSize: 14, color: '#64748b' }}>
              {providerName}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: '#e2e8f0' }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Paslauga</Text>
            <Text style={{ fontSize: 14, color: '#1e293b' }}>€{numericAmount.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Aptarnavimo mokestis (10%)</Text>
            <Text style={{ fontSize: 14, color: '#1e293b' }}>€{(numericAmount * 0.1).toFixed(2)}</Text>
          </View>

          <View style={{ height: 1, backgroundColor: '#e2e8f0' }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>Iš viso</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#6366f1' }}>
              €{(numericAmount * 1.1).toFixed(2)}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={{ fontSize: 14, color: '#64748b' }}>Ruošiamas mokėjimas...</Text>
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>💳</Text>
            <Text style={{ fontSize: 16, color: '#64748b', marginTop: 12, textAlign: 'center' }}>
              {paymentReady
                ? 'Mokėjimas paruoštas. Spauskite mygtuką žemiau.'
                : 'Mokėjimo sistema nepasiekiama.'}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View style={{
        padding: 20,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 10,
      }}>
        <Button
          title={paying ? 'Apdorojama...' : `Mokėti €${(numericAmount * 1.1).toFixed(2)}`}
          onPress={handlePay}
          disabled={!paymentReady || paying}
          loading={paying}
          size="lg"
        />
        <Button
          title="Atšaukti"
          variant="ghost"
          onPress={() => router.back()}
          disabled={paying}
        />
      </View>
    </SafeAreaView>
  )
}
