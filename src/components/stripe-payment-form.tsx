'use client'

import { useState, useEffect } from 'react'
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { t } from '@/lib/translations'

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  currency: string
  onSuccess: (paymentIntent: { id: string; status: string }) => void
  onError: (error: string) => void
  bookingDetails?: {
    serviceName: string
    providerName: string
    date: string
    time: string
  }
}

export const StripePaymentForm = ({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
  bookingDetails,
}: StripePaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!stripe) {
      return
    }

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          toast.success('Payment succeeded!')
          onSuccess(paymentIntent)
          break
        case 'processing':
          toast.info('Your payment is processing.')
          break
        case 'requires_payment_method':
          toast.error(t('payment.paymentNotSuccessful'))
          break
        default:
          toast.error('Something went wrong.')
          break
      }
    })
  }, [stripe, clientSecret, onSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings`,
        },
        redirect: 'if_required',
      })

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          toast.error(error.message || 'An unexpected error occurred.')
        } else {
          toast.error('An unexpected error occurred.')
        }
        onError(error.message || 'Payment failed')
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent)
        toast.success('Payment completed successfully!')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.'
      toast.error(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h3 className="leading-none font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('payment.paymentDetails')}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t('payment.completePaymentSecurely')}
        </p>
      </div>

      {/* Booking Summary */}
      {bookingDetails && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">{t('payment.bookingSummary')}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{t('payment.service')}: {bookingDetails.serviceName}</div>
            <div>{t('payment.provider')}: {bookingDetails.providerName}</div>
            <div>{t('payment.date')}: {bookingDetails.date}</div>
            <div>{t('payment.time')}: {bookingDetails.time}</div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('payment.totalAmount')}:</span>
              <span className="font-bold text-lg">{formatAmount(amount, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <LinkAuthenticationElement
          onChange={(e) => setEmail(e.value.email)}
        />
        <PaymentElement />
        

        <Button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {t('payment.pay')} {formatAmount(amount, currency)}
              </>
            )}
        </Button>
      </form>

      {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="h-4 w-4" />
          <span>{t('payment.securedByStripe')}</span>
        </div>

      {/* Test Card Information */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <h5 className="font-medium text-sm text-blue-900 mb-2">{t('payment.testCards')}</h5>
        <div className="text-xs text-blue-700 space-y-1">
          <div>{t('payment.success')}: 4242 4242 4242 4242</div>
          <div>{t('payment.decline')}: 4000 0000 0000 0002</div>
          <div>{t('payment.testCardInstructions')}</div>
        </div>
      </div>
    </div>
  )
}
