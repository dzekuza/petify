import { NextRequest, NextResponse } from 'next/server'
import { sendProviderNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, providerName, email, phone, name, message } = body

    // Validate required fields
    if (!providerId || !providerName || !email || !phone || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email notification
    const emailContent = `
Naujas prašymas prisijungti verslą prie PetiFy platformos:

Verslo informacija:
- Verslo pavadinimas: ${providerName}
- Verslo ID: ${providerId}

Kontaktinė informacija:
- Vardas: ${name}
- El. paštas: ${email}
- Telefonas: ${phone}

Papildoma informacija:
${message || 'Nepateikta'}

---
Šis prašymas buvo pateiktas per PetiFy platformą.
`

    await sendProviderNotificationEmail({
      providerEmail: 'info@petify.lt',
      providerName: 'PetiFy Admin',
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      serviceName: 'Business Claim Request',
      bookingDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      bookingTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      totalPrice: 0,
      petName: 'N/A',
      notes: emailContent,
      bookingId: `CLAIM-${providerId}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing claim business request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
