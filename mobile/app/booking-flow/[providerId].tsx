import { useState, useMemo, useCallback } from 'react'
import { View, Text, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format, addMinutes } from 'date-fns'
import { useAuth } from '@/contexts/auth-context'
import { useProvider, useProviderServices } from '@/hooks/useProviders'
import { useUserPets } from '@/hooks/usePets'
import { useCreateBooking } from '@/hooks/useBookings'
import { Button } from '@/components/ui/Button'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { PetSelector } from '@/components/booking/PetSelector'
import { DateTimeSelector } from '@/components/booking/DateTimeSelector'
import { BookingSummary } from '@/components/booking/BookingSummary'
import type { Service } from '@/types'

export default function BookingWizardScreen() {
  const { providerId, serviceId } = useLocalSearchParams<{
    providerId: string
    serviceId?: string
  }>()
  const router = useRouter()
  const { user } = useAuth()

  const { data: provider, isLoading: providerLoading } = useProvider(providerId)
  const { data: services, isLoading: servicesLoading } = useProviderServices(providerId)
  const { data: pets } = useUserPets(user?.id)
  const createBooking = useCreateBooking()

  // Wizard state
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Auto-select service if serviceId passed
  useMemo(() => {
    if (serviceId && services && !selectedService) {
      const found = services.find(s => s.id === serviceId)
      if (found) {
        setSelectedService(found)
        setStep(1) // skip to pet selection
      }
    }
  }, [serviceId, services])

  const selectedPets = useMemo(
    () => (pets ?? []).filter(p => selectedPetIds.includes(p.id)),
    [pets, selectedPetIds]
  )

  const totalPrice = useMemo(
    () => (selectedService?.price ?? 0) * Math.max(selectedPetIds.length, 1),
    [selectedService, selectedPetIds]
  )

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return !!selectedService
      case 1: return selectedPetIds.length > 0
      case 2: return !!selectedDate && !!selectedTime
      case 3: return true
      default: return false
    }
  }, [step, selectedService, selectedPetIds, selectedDate, selectedTime])

  const handleTogglePet = useCallback((petId: string) => {
    setSelectedPetIds(prev =>
      prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
    )
  }, [])

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleConfirm()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    } else {
      router.back()
    }
  }

  const handleConfirm = async () => {
    if (!user?.id || !selectedService || !selectedDate || !selectedTime || !provider) return

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const startTime = `${selectedTime}:00`
    const endDate = addMinutes(
      new Date(`${dateStr}T${startTime}`),
      selectedService.duration || 60
    )
    const endTime = format(endDate, 'HH:mm:ss')

    // For multiple pets, use first as primary and note others
    const primaryPetId = selectedPetIds[0]
    const extraPetsNote = selectedPetIds.length > 1
      ? `Papildomi gyvūnai: ${selectedPets.slice(1).map(p => p.name).join(', ')}`
      : undefined

    try {
      const booking = await createBooking.mutateAsync({
        customerId: user.id,
        providerId: provider.id,
        serviceId: selectedService.id,
        petId: primaryPetId,
        bookingDate: dateStr,
        startTime,
        endTime,
        durationMinutes: selectedService.duration || 60,
        totalPrice,
        specialInstructions: extraPetsNote,
      })

      // Navigate to payment screen with booking data
      router.push({
        pathname: '/booking-flow/payment',
        params: {
          bookingId: booking.id,
          amount: totalPrice.toString(),
          serviceName: selectedService.name,
          providerName: provider.businessName,
        },
      })
    } catch {
      Alert.alert('Klaida', 'Nepavyko sukurti užsakymo. Bandykite dar kartą.')
    }
  }

  if (providerLoading || servicesLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    )
  }

  if (!provider || !services) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#64748b' }}>Teikėjas nerastas</Text>
        <Button title="Grįžti" variant="outline" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
      }}>
        <Button title="← Atgal" variant="ghost" size="sm" onPress={handleBack} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            {provider.businessName}
          </Text>
        </View>
        <View style={{ width: 80 }} />
      </View>

      <StepIndicator currentStep={step} />

      {/* Step content */}
      <View style={{ flex: 1 }}>
        {step === 0 && (
          <ServiceSelector
            services={services}
            selectedServiceId={selectedService?.id ?? null}
            onSelect={setSelectedService}
          />
        )}
        {step === 1 && (
          <PetSelector
            selectedPetIds={selectedPetIds}
            onTogglePet={handleTogglePet}
            maxPets={selectedService?.maxPets}
          />
        )}
        {step === 2 && (
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
          />
        )}
        {step === 3 && selectedService && selectedDate && selectedTime && (
          <BookingSummary
            provider={provider}
            service={selectedService}
            pets={selectedPets}
            date={selectedDate}
            time={selectedTime}
            totalPrice={totalPrice}
          />
        )}
      </View>

      {/* Bottom action bar */}
      <View style={{
        padding: 20,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 8,
      }}>
        {selectedService && step > 0 ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Iš viso</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#6366f1' }}>
              €{totalPrice.toFixed(2)}
            </Text>
          </View>
        ) : null}

        <Button
          title={step === 3 ? 'Patvirtinti ir mokėti' : 'Toliau'}
          onPress={handleNext}
          disabled={!canProceed}
          loading={createBooking.isPending}
          size="lg"
        />
      </View>
    </SafeAreaView>
  )
}
