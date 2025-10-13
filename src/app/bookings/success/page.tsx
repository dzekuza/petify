'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Calendar, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  useEffect(() => {
    const sessionId = searchParams?.get('session_id')
    
    if (!sessionId) {
      toast.error('Invalid session')
      router.push('/')
      return
    }

    const verifySession = async () => {
      try {
        // Get the session from Supabase auth
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          toast.error('Please sign in')
          router.push('/auth/signin')
          return
        }

        // Verify the Stripe session and create booking
        const response = await fetch('/api/checkout/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ sessionId })
        })

        if (!response.ok) {
          throw new Error('Failed to verify session')
        }

        const data = await response.json()
        setBookingDetails(data.booking)
      } catch (error) {
        console.error('Error verifying session:', error)
        toast.error('Failed to verify payment')
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [searchParams, router])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Booking Confirmed!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Your payment was successful and your booking has been confirmed
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {bookingDetails && (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Booking Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-auto font-medium text-gray-900">
                        {bookingDetails.booking_date}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-auto font-medium text-gray-900">
                        {bookingDetails.booking_time}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-auto font-medium text-green-600">
                        Confirmed
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Payment:</span>
                      <span className="ml-auto font-medium text-green-600">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/bookings')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  View My Bookings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
                <p className="font-medium mb-1">What's next?</p>
                <p className="text-blue-700">
                  A confirmation email has been sent to your email address. 
                  You can view and manage your booking in the "My Bookings" section.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </Layout>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}

