import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendBookingConfirmationEmail, sendProviderNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, template } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    let result

    switch (template) {
      case 'welcome':
        result = await sendWelcomeEmail(email, {
          userName: 'Test User',
          verificationUrl: 'https://petify.lt/verify?token=test123'
        })
        break

      case 'booking':
        result = await sendBookingConfirmationEmail(email, {
          customerName: 'Test Customer',
          providerName: 'Test Pet Groomer',
          serviceName: 'Full Grooming Service',
          bookingDate: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bookingTime: '10:00 AM',
          totalPrice: 75.00,
          petName: 'Buddy',
          notes: 'Please trim nails and clean ears',
          bookingId: 'TEST-' + Date.now()
        })
        break

      case 'provider':
        result = await sendProviderNotificationEmail(email, {
          providerName: 'Test Pet Groomer',
          customerName: 'Test Customer',
          customerEmail: 'customer@example.com',
          customerPhone: '+370 600 12345',
          serviceName: 'Full Grooming Service',
          bookingDate: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bookingTime: '10:00 AM',
          totalPrice: 75.00,
          petName: 'Buddy',
          petSpecies: 'Dog',
          petBreed: 'Golden Retriever',
          notes: 'Please trim nails and clean ears',
          bookingId: 'TEST-' + Date.now()
        })
        break

      default:
        // Send welcome email as default
        result = await sendWelcomeEmail(email, {
          userName: 'Test User',
          verificationUrl: 'https://petify.lt/verify?token=test123'
        })
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test ${template || 'welcome'} email sent successfully to ${email}`
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}