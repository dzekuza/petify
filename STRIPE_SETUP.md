# Stripe Payment Integration

This document explains how to set up and test the Stripe payment integration in
the Petify application.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration (Test Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

**Note**: The current keys are placeholder test keys. Replace them with your
actual Stripe test keys from the Stripe Dashboard.

### 2. Getting Real Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in "Test mode" (toggle in the top left)
3. Go to "Developers" > "API keys"
4. Copy your "Publishable key" and "Secret key"
5. Replace the placeholder keys in your `.env.local` file

### 3. Webhook Setup (Optional for Testing)

For production, you'll need to set up webhooks:

1. In Stripe Dashboard, go to "Developers" > "Webhooks"
2. Click "Add endpoint"
3. Set URL to: `https://yourdomain.com/api/payments/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook secret and add it to your environment variables

## Testing

### Test Page

Visit `/test-payment` to test the Stripe integration with a simple payment form.

### Test Cards

Use these test card numbers to simulate different scenarios:

| Card Number           | Description        |
| --------------------- | ------------------ |
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined payment   |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card       |
| `4000 0000 0000 0127` | Incorrect CVC      |
| `4000 0000 0000 0119` | Processing error   |

**Note**: Use any future expiration date and any 3-digit CVC for test cards.

### Integration with Booking Flow

The Stripe integration is already integrated into the booking flow:

1. Go to a provider page: `/providers/[id]`
2. Select a service and book a time
3. Proceed to payment: `/providers/[id]/payment`
4. Complete payment with test cards

## API Endpoints

### Create Payment Intent

- **POST** `/api/payments/create-intent`
- Creates a new payment intent for a booking
- Body: `{ amount, currency, bookingId, customerEmail, serviceFee }`

### Webhook Handler

- **POST** `/api/payments/webhook`
- Handles Stripe webhook events
- Updates booking status based on payment results

## Components

### StripePaymentForm

- Main payment form component using Stripe Elements
- Handles payment processing and validation
- Shows booking summary and test card information

### Payment Utilities

- `src/lib/stripe.ts` - Stripe configuration and utilities
- `src/lib/payments.ts` - Payment processing functions

## Security Notes

1. **Never commit real API keys** to version control
2. **Use test keys** for development
3. **Validate webhook signatures** in production
4. **Store sensitive data** securely in your database

## Troubleshooting

### Common Issues

1. **"Missing publishable key" error**
   - Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
   - Ensure the key starts with `pk_test_` for test mode

2. **Payment intent creation fails**
   - Verify `STRIPE_SECRET_KEY` is set correctly
   - Check that the key starts with `sk_test_` for test mode

3. **Webhook signature verification fails**
   - Ensure `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint secret
   - Check that the webhook URL is accessible

### Debug Mode

Enable Stripe debug mode by adding to your environment:

```bash
STRIPE_DEBUG=true
```

This will log additional information to help debug payment issues.

## Production Deployment

1. Replace test keys with live keys from Stripe Dashboard
2. Set up production webhooks
3. Update webhook URLs to your production domain
4. Test thoroughly with small amounts before going live
5. Implement proper error handling and logging
6. Set up monitoring for failed payments

## Support

For Stripe-specific issues, refer to:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Discord Community](https://discord.gg/stripe)
