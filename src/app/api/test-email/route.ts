import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendBookingConfirmationEmail, sendBookingUpdateEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { type = 'welcome' } = await request.json()

    const testEmail = 'dzekuza@gmail.com'
    const testUserName = 'Test User'

    let result

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(testEmail, {
          userName: testUserName,
          verificationUrl: 'https://petify.lt/auth/verify?token=test-token'
        })
        break

      case 'booking':
        result = await sendBookingConfirmationEmail(testEmail, {
          customerName: testUserName,
          providerName: 'Test Pet Grooming',
          serviceName: 'Full Grooming Service',
          bookingDate: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bookingTime: '10:00 AM - 12:00 PM',
          totalPrice: 75.00,
          petName: 'Buddy',
          notes: 'Please be gentle, Buddy is nervous around new people.',
          bookingId: 'TEST-BOOKING-123'
        })
        break

      case 'update':
        result = await sendBookingUpdateEmail(testEmail, {
          customerName: testUserName,
          providerName: 'Test Pet Grooming',
          serviceName: 'Full Grooming Service',
          bookingDate: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bookingTime: '10:00 AM - 12:00 PM',
          status: 'confirmed',
          bookingId: 'TEST-BOOKING-123'
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: welcome, booking, or update' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send test email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} test email sent successfully to ${testEmail}`,
      type
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
