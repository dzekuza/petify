import { supabase } from './supabase'
import { Booking } from '@/types'

export interface DashboardStats {
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
}

export interface RecentBooking {
  id: string
  customerName: string
  service: string
  date: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  amount: number
}

export interface ProviderProfileStatus {
  profileComplete: boolean
  verification: 'verified' | 'pending' | 'rejected'
  availability: 'pending' | 'complete'
}

export const dashboardApi = {
  // Get dashboard statistics for a provider
  async getDashboardStats(providerId: string): Promise<DashboardStats> {
    try {
      // Get total bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('status, total_price')
        .eq('provider_id', providerId)

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        throw bookingsError
      }

      // Get reviews and rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', providerId)

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
        throw reviewsError
      }

      // Calculate stats
      const totalBookings = bookings?.length || 0
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
      const totalReviews = reviews?.length || 0
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0

      return {
        totalBookings,
        completedBookings,
        pendingBookings,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews
      }
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      throw error
    }
  },

  // Get recent bookings for a provider
  async getRecentBookings(providerId: string, limit: number = 5): Promise<RecentBooking[]> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          total_price,
          status,
          services(name),
          users(full_name)
        `)
        .eq('provider_id', providerId)
        .order('booking_date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent bookings:', error)
        throw error
      }

      return bookings?.map(booking => ({
        id: booking.id,
        customerName: (booking.users as any)?.full_name || 'Unknown Customer',
        service: (booking.services as any)?.name || 'Unknown Service',
        date: booking.booking_date,
        status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        amount: booking.total_price || 0
      })) || []
    } catch (error) {
      console.error('Error in getRecentBookings:', error)
      throw error
    }
  },

  // Get provider profile status
  async getProviderProfileStatus(providerId: string): Promise<ProviderProfileStatus> {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .select('is_verified, status, business_name, description, location, contact_info')
        .eq('id', providerId)
        .single()

      if (error) {
        console.error('Error fetching provider status:', error)
        throw error
      }

      if (!provider) {
        return {
          profileComplete: false,
          verification: 'pending',
          availability: 'pending'
        }
      }

      // Check if profile is complete
      const profileComplete = !!(
        provider.business_name &&
        provider.description &&
        provider.location &&
        provider.contact_info
      )

      // Check verification status
      const verification = provider.is_verified ? 'verified' : 'pending'

      // Check availability (simplified - you might want to check actual availability settings)
      const availability = profileComplete ? 'complete' : 'pending'

      return {
        profileComplete,
        verification,
        availability
      }
    } catch (error) {
      console.error('Error in getProviderProfileStatus:', error)
      throw error
    }
  },

  // Get provider by user ID
  async getProviderByUserId(userId: string) {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching provider:', error)
        throw error
      }

      return provider
    } catch (error) {
      console.error('Error in getProviderByUserId:', error)
      throw error
    }
  }
}
