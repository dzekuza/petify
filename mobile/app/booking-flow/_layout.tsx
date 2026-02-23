import { Stack } from 'expo-router'

export default function BookingFlowLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen name="[providerId]" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="success" />
    </Stack>
  )
}
