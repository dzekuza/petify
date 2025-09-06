import { Booking } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface UpdateBookingRequest {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  reason?: string
}

export interface BookingResponse {
  success: boolean
  booking: Booking
}

export interface BookingsResponse {
  bookings: Booking[]
}

export const bookingApi = {
  // Get all bookings for a provider
  async getProviderBookings(providerId: string): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/api/bookings?provider_id=${providerId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch provider bookings')
    }
    
    const data: BookingsResponse = await response.json()
    return data.bookings
  },

  // Get all bookings for a customer
  async getCustomerBookings(customerId: string): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/api/bookings?customer_id=${customerId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch customer bookings')
    }
    
    const data: BookingsResponse = await response.json()
    return data.bookings
  },

  // Get a specific booking by ID
  async getBooking(bookingId: string): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch booking')
    }
    
    const data: { booking: Booking } = await response.json()
    return data.booking
  },

  // Update booking status
  async updateBookingStatus(
    bookingId: string, 
    updateData: UpdateBookingRequest
  ): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update booking status')
    }
    
    const data: BookingResponse = await response.json()
    return data.booking
  },

  // Accept a booking
  async acceptBooking(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, { status: 'confirmed' })
  },

  // Reject a booking
  async rejectBooking(bookingId: string, reason?: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, { 
      status: 'cancelled', 
      reason: reason || 'Booking rejected by provider' 
    })
  },

  // Complete a booking
  async completeBooking(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, { status: 'completed' })
  }
}
