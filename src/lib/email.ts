import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
}

export interface BookingEmailData {
  customerName: string
  providerName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  totalPrice: number
  petName: string
  notes?: string
  bookingId: string
}

export interface WelcomeEmailData {
  userName: string
  verificationUrl?: string
}

export interface BookingUpdateEmailData {
  customerName: string
  providerName: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  status: 'confirmed' | 'cancelled' | 'completed'
  reason?: string
  bookingId: string
}

const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@petify.lt'

export const emailTemplates = {
  welcome: (data: WelcomeEmailData) => ({
    subject: 'Welcome to Petify! 🐾',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Petify</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🐾 Welcome to Petify!</h1>
            <p>Your pet's new best friend</p>
          </div>
          <div class="content">
            <h2>Hi ${data.userName}!</h2>
            <p>Welcome to Petify, the premier marketplace for pet services! We're excited to have you join our community of pet lovers and service providers.</p>
            
            ${data.verificationUrl ? `
              <p>To get started, please verify your email address:</p>
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            ` : ''}
            
            <p>With Petify, you can:</p>
            <ul>
              <li>🐕 Find trusted pet service providers in your area</li>
              <li>🏥 Book veterinary appointments</li>
              <li>✂️ Schedule grooming sessions</li>
              <li>🎓 Enroll in training programs</li>
              <li>💕 Connect with other pet owners</li>
            </ul>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy pet parenting!<br>The Petify Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Petify. All rights reserved.</p>
            <p>This email was sent to you because you signed up for Petify.</p>
          </div>
        </body>
      </html>
    `
  }),

  bookingConfirmation: (data: BookingEmailData) => ({
    subject: `Booking Confirmed - ${data.serviceName} with ${data.providerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Booking Confirmed!</h1>
            <p>Your pet service is scheduled</p>
          </div>
          <div class="content">
            <h2>Hi ${data.customerName}!</h2>
            <p>Great news! Your booking has been confirmed. Here are the details:</p>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p><strong>Provider:</strong> ${data.providerName}</p>
              <p><strong>Pet:</strong> ${data.petName}</p>
              <p><strong>Date:</strong> ${data.bookingDate}</p>
              <p><strong>Time:</strong> ${data.bookingTime}</p>
              <p><strong>Total Price:</strong> €${data.totalPrice.toFixed(2)}</p>
              ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            </div>
            
            <p>Please arrive 10 minutes early for your appointment. If you need to make any changes, please contact your service provider directly.</p>
            
            <p>Thank you for choosing Petify!<br>The Petify Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Petify. All rights reserved.</p>
            <p>Booking ID: ${data.bookingId}</p>
          </div>
        </body>
      </html>
    `
  }),

  bookingUpdate: (data: BookingUpdateEmailData) => ({
    subject: `Booking Update - ${data.serviceName} with ${data.providerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Update</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .status { padding: 10px; border-radius: 6px; margin: 10px 0; }
            .status.confirmed { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .status.cancelled { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .status.completed { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📧 Booking Update</h1>
            <p>Your booking status has changed</p>
          </div>
          <div class="content">
            <h2>Hi ${data.customerName}!</h2>
            <p>We have an update regarding your booking:</p>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p><strong>Provider:</strong> ${data.providerName}</p>
              <p><strong>Date:</strong> ${data.bookingDate}</p>
              <p><strong>Time:</strong> ${data.bookingTime}</p>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            </div>
            
            <div class="status ${data.status}">
              <h3>Status: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</h3>
              ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            </div>
            
            ${data.status === 'cancelled' ? `
              <p>We're sorry for any inconvenience. If you have any questions or would like to reschedule, please contact your service provider or our support team.</p>
            ` : data.status === 'confirmed' ? `
              <p>Your booking is confirmed! Please arrive 10 minutes early for your appointment.</p>
            ` : `
              <p>Thank you for using Petify! We hope you and your pet had a great experience.</p>
            `}
            
            <p>Best regards,<br>The Petify Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Petify. All rights reserved.</p>
            <p>Booking ID: ${data.bookingId}</p>
          </div>
        </body>
      </html>
    `
  })
}

export const sendEmail = async (template: EmailTemplate): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await resend.emails.send({
      from: template.from || fromEmail,
      to: template.to,
      subject: template.subject,
      html: template.html
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export const sendWelcomeEmail = async (email: string, data: WelcomeEmailData) => {
  const template = emailTemplates.welcome(data)
  return sendEmail({
    to: email,
    ...template
  })
}

export const sendBookingConfirmationEmail = async (email: string, data: BookingEmailData) => {
  const template = emailTemplates.bookingConfirmation(data)
  return sendEmail({
    to: email,
    ...template
  })
}

export const sendBookingUpdateEmail = async (email: string, data: BookingUpdateEmailData) => {
  const template = emailTemplates.bookingUpdate(data)
  return sendEmail({
    to: email,
    ...template
  })
}
