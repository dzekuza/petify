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
  const [hasVerified, setHasVerified] = useState(false)

  useEffect(() => {
    const sessionId = searchParams?.get('session_id')

    // Prevent multiple verifications
    if (hasVerified || loading === false) {
      return
    }

    if (!sessionId) {
      toast.error('Netinkama sesija')
      router.push('/')
      return
    }

    const verifySession = async () => {
      try {
        setHasVerified(true)

        // Get the session from Supabase auth
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          toast.error('Prašome prisijungti')
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
          throw new Error('Nepavyko patvirtinti sesijos')
        }

        const data = await response.json()
        setBookingDetails(data.booking)
      } catch (error) {
        console.error('Error verifying session:', error)
        toast.error('Nepavyko patvirtinti mokėjimo')
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [searchParams?.get('session_id'), hasVerified, loading])

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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-10 w-10 text-green-600" aria-hidden="true">
                  <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                  <path d="m9 11 3 3L22 4"></path>
                </svg>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Rezervacija patvirtinta!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Jūsų mokėjimas buvo sėkmingas ir rezervacija patvirtinta
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {bookingDetails && (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Rezervacijos detalės</h3>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Data:</span>
                      <span className="ml-auto font-medium text-gray-900">
                        {bookingDetails.booking_date}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Laikas:</span>
                      <span className="ml-auto font-medium text-gray-900">
                        {bookingDetails.start_time} - {bookingDetails.end_time}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Būsena:</span>
                      <span className="ml-auto font-medium text-green-600">
                        Patvirtinta
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">Mokėjimas:</span>
                      <span className="ml-auto font-medium text-green-600">
                        Apmokėta
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
                  Peržiūrėti mano rezervacijas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  Grįžti į pagrindinį
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
                <p className="font-medium mb-1">Kas toliau?</p>
                <p className="text-blue-700">
                  Patvirtinimo el. laiškas išsiųstas į jūsų el. pašto adresą.
                  Galite peržiūrėti ir valdyti savo rezervaciją skyriuje "Mano rezervacijos".
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
            <p className="text-gray-600">Kraunamos rezervacijos detalės...</p>
          </div>
        </div>
      </Layout>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}

