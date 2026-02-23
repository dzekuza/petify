import { supabase } from '@/lib/supabase'
import { transformBooking } from '@/lib/transforms'
import type { Booking } from '@/types'

const BOOKING_SELECT = `
  *,
  pets (*),
  services (*),
  providers (*)
`

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('customer_id', userId)
    .order('booking_date', { ascending: false })

  if (error) throw error
  return (data ?? []).map(transformBooking)
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', bookingId)
    .single()

  if (error) throw error
  if (!data) return null
  return transformBooking(data)
}

export async function createBooking(booking: {
  customerId: string
  providerId: string
  serviceId: string
  petId: string
  bookingDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  totalPrice: number
  specialInstructions?: string
}): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: booking.customerId,
      provider_id: booking.providerId,
      service_id: booking.serviceId,
      pet_id: booking.petId,
      booking_date: booking.bookingDate,
      start_time: booking.startTime,
      end_time: booking.endTime,
      duration_minutes: booking.durationMinutes,
      total_price: booking.totalPrice,
      special_instructions: booking.specialInstructions || null,
      status: 'pending',
      payment_status: 'pending',
    })
    .select(BOOKING_SELECT)
    .single()

  if (error) throw error
  return transformBooking(data)
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancellation_reason: reason || null,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select(BOOKING_SELECT)
    .single()

  if (error) throw error
  return transformBooking(data)
}

export async function updateBookingPayment(
  bookingId: string,
  paymentId: string,
  paymentStatus: 'paid' | 'failed'
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      payment_id: paymentId,
      payment_status: paymentStatus,
      status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
    })
    .eq('id', bookingId)
    .select(BOOKING_SELECT)
    .single()

  if (error) throw error
  return transformBooking(data)
}
