import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserBookings, getBookingById, createBooking, cancelBooking, updateBookingPayment } from '@/lib/api/bookings'

export function useUserBookings(userId: string | undefined) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: () => getUserBookings(userId!),
    enabled: !!userId,
  })
}

export function useBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['bookings', 'detail', bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useUpdateBookingPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, paymentId, paymentStatus }: {
      bookingId: string
      paymentId: string
      paymentStatus: 'paid' | 'failed'
    }) => updateBookingPayment(bookingId, paymentId, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
