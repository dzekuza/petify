import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json()

    if (!email || !userName) {
      return NextResponse.json(
        { error: 'Email and user name are required' },
        { status: 400 }
      )
    }

    const result = await sendWelcomeEmail(email, {
      userName,
      verificationUrl: undefined // No verification needed for now
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    })

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
