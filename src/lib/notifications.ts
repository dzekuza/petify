import { supabase } from './supabase'
import { Notification } from '@/contexts/notifications-context'

export interface CreateNotificationData {
  provider_id: string
  type: Notification['type']
  title: string
  message: string
  data?: Record<string, any>
}

export const createNotification = async (notificationData: CreateNotificationData) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return { error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { error }
  }
}

export const createBookingNotification = async (
  providerId: string,
  bookingId: string,
  customerName: string,
  serviceDate: string,
  serviceTime: string
) => {
  return createNotification({
    provider_id: providerId,
    type: 'new_booking',
    title: 'Naujas rezervavimas',
    message: `Gavote naują rezervavimą nuo ${customerName}`,
    data: {
      booking_id: bookingId,
      customer_name: customerName,
      service_date: serviceDate,
      service_time: serviceTime
    }
  })
}

export const createUpcomingBookingNotification = async (
  providerId: string,
  bookingId: string,
  customerName: string,
  serviceDate: string,
  serviceTime: string
) => {
  return createNotification({
    provider_id: providerId,
    type: 'upcoming_booking',
    title: 'Artėjantis rezervavimas',
    message: `Jūsų rezervavimas su ${customerName} yra rytoj`,
    data: {
      booking_id: bookingId,
      customer_name: customerName,
      service_date: serviceDate,
      service_time: serviceTime
    }
  })
}

export const createPaymentNotification = async (
  providerId: string,
  paymentId: string,
  bookingId: string,
  amount: number
) => {
  return createNotification({
    provider_id: providerId,
    type: 'payment_received',
    title: 'Gautas mokėjimas',
    message: `Gavote mokėjimą už rezervavimą #${bookingId}`,
    data: {
      payment_id: paymentId,
      booking_id: bookingId,
      amount: amount
    }
  })
}

export const createReviewNotification = async (
  providerId: string,
  reviewId: string,
  customerName: string,
  rating: number
) => {
  return createNotification({
    provider_id: providerId,
    type: 'review_received',
    title: 'Gautas atsiliepimas',
    message: `${customerName} paliko ${rating} žvaigždučių atsiliepimą`,
    data: {
      review_id: reviewId,
      customer_name: customerName,
      rating: rating
    }
  })
}

export const createBookingCancelledNotification = async (
  providerId: string,
  bookingId: string,
  customerName: string,
  reason?: string
) => {
  return createNotification({
    provider_id: providerId,
    type: 'booking_cancelled',
    title: 'Rezervavimas atšauktas',
    message: `${customerName} atšaukė rezervavimą${reason ? `: ${reason}` : ''}`,
    data: {
      booking_id: bookingId,
      customer_name: customerName,
      reason: reason
    }
  })
}

export const createBookingCompletedNotification = async (
  providerId: string,
  bookingId: string,
  customerName: string
) => {
  return createNotification({
    provider_id: providerId,
    type: 'booking_completed',
    title: 'Rezervavimas užbaigtas',
    message: `Rezervavimas su ${customerName} sėkmingai užbaigtas`,
    data: {
      booking_id: bookingId,
      customer_name: customerName
    }
  })
}
