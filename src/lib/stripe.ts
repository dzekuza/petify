import { loadStripe, Stripe } from '@stripe/stripe-js'
import StripeServer from 'stripe'

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable')
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Server-side Stripe instance
export const getStripeServer = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }
  return new StripeServer(secretKey, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  })
}

// Lazy initialization of Stripe server instance
let stripeServerInstance: StripeServer | null = null
export const stripe = new Proxy({} as StripeServer, {
  get(target, prop) {
    if (!stripeServerInstance) {
      stripeServerInstance = getStripeServer()
    }
    return stripeServerInstance[prop as keyof StripeServer]
  }
})

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethods: ['card'],
  mode: 'payment' as const,
} as const

// Test card numbers for development
export const TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069',
  incorrectCvc: '4000000000000127',
  processingError: '4000000000000119',
} as const

// Helper function to format amount for Stripe (convert to cents)
export const formatAmountForStripe = (amount: number, currency: string): number => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  })
  const parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency = true
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
    }
  }
  return zeroDecimalCurrency ? Math.round(amount) : Math.round(amount * 100)
}

// Helper function to format amount from Stripe (convert from cents)
export const formatAmountFromStripe = (amount: number, currency: string): number => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  })
  const parts = numberFormat.formatToParts(100)
  let zeroDecimalCurrency = true
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
    }
  }
  return zeroDecimalCurrency ? amount / 100 : amount
}
