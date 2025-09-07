'use client'

import { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { Layout } from '@/components/layout'
import { StripePaymentForm } from '@/components/stripe-payment-form'
import { getStripe } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function TestPaymentPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  const createTestPaymentIntent = async () => {
    setIsCreatingPayment(true)
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50, // €50 test amount
          currency: 'eur',
          bookingId: `test_${Date.now()}`,
          customerEmail: 'test@example.com',
          serviceFee: 0.15,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      toast.success('Payment intent created successfully!')
    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast.error('Failed to create payment intent')
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('Payment succeeded:', paymentIntent)
    toast.success('Payment completed successfully!')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    toast.error(`Payment failed: ${error}`)
  }

  const resetPayment = () => {
    setClientSecret(null)
    setPaymentIntentId(null)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Stripe Payment Test
            </h1>
            <p className="text-gray-600">
              Test the Stripe payment integration with test cards
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Payment Form */}
            <div>
              {!clientSecret ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Initialize Test Payment</CardTitle>
                    <CardDescription>
                      Create a test payment intent to start the payment flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={createTestPaymentIntent}
                      disabled={isCreatingPayment}
                      className="w-full"
                    >
                      {isCreatingPayment ? 'Creating...' : 'Create Test Payment (€50)'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Payment Form</h2>
                    <Button variant="outline" onClick={resetPayment}>
                      Reset
                    </Button>
                  </div>
                  
                  <Elements
                    stripe={getStripe()}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#3b82f6',
                          colorBackground: '#ffffff',
                          colorText: '#1f2937',
                          colorDanger: '#ef4444',
                          fontFamily: 'system-ui, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '8px',
                        },
                      },
                    }}
                  >
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      amount={5750} // €50 + 15% fee = €57.50 in cents
                      currency="eur"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      bookingDetails={{
                        serviceName: 'Test Pet Grooming',
                        providerName: 'Test Provider',
                        date: 'Dec 25, 2024',
                        time: '2:00 PM',
                      }}
                    />
                  </Elements>
                </div>
              )}
            </div>

            {/* Right Column - Test Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Test Cards</CardTitle>
                  <CardDescription>
                    Use these test card numbers to simulate different payment scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900">Successful Payment</h4>
                      <p className="text-sm text-green-700">4242 4242 4242 4242</p>
                      <p className="text-xs text-green-600">Use any future date and any 3-digit CVC</p>
                    </div>

                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900">Declined Payment</h4>
                      <p className="text-sm text-red-700">4000 0000 0000 0002</p>
                      <p className="text-xs text-red-600">Card will be declined</p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900">Insufficient Funds</h4>
                      <p className="text-sm text-yellow-700">4000 0000 0000 9995</p>
                      <p className="text-xs text-yellow-600">Insufficient funds error</p>
                    </div>

                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-900">Expired Card</h4>
                      <p className="text-sm text-orange-700">4000 0000 0000 0069</p>
                      <p className="text-xs text-orange-600">Expired card error</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Amount: €50.00</div>
                      <div>Service Fee (15%): €7.50</div>
                      <div className="font-medium">Total: €57.50</div>
                    </div>
                  </div>

                  {paymentIntentId && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Payment Intent ID</h4>
                      <p className="text-xs text-gray-600 font-mono break-all">
                        {paymentIntentId}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
