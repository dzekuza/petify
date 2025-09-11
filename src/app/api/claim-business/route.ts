import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

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

    await sendEmail({
      to: 'info@petify.lt',
      subject: `Naujas prašymas prisijungti verslą: ${providerName}`,
      html: emailContent.replace(/\n/g, '<br>')
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
