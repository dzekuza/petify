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

export interface OrderDetailsEmailData {
  customerName: string
  customerEmail: string
  providerName: string
  providerEmail: string
  serviceName: string
  serviceDescription?: string
  bookingDate: string
  bookingTime: string
  totalPrice: number
  petName: string
  petSpecies?: string
  petBreed?: string
  notes?: string
  bookingId: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus?: 'pending' | 'paid' | 'refunded'
  providerContact?: {
    phone?: string
    email?: string
    address?: string
  }
}

export interface ProviderNotificationEmailData {
  providerName: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  serviceName: string
  bookingDate: string
  bookingTime: string
  totalPrice: number
  petName: string
  petSpecies?: string
  petBreed?: string
  notes?: string
  bookingId: string
}

export interface PaymentConfirmationEmailData {
  customerName: string
  serviceName: string
  providerName: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  paymentMethod: string
  transactionId: string
  bookingId: string
  petName: string
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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f8f9fa;
            }
            .email-container { 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header { 
              background: #000000; 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700; 
              letter-spacing: -0.025em;
            }
            .header p { 
              margin: 8px 0 0 0; 
              font-size: 16px; 
              opacity: 0.9;
              font-weight: 400;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              margin: 0 0 20px 0; 
              font-size: 24px; 
              font-weight: 600; 
              color: #1a1a1a;
              letter-spacing: -0.025em;
            }
            .content p { 
              margin: 0 0 16px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .content ul { 
              margin: 20px 0; 
              padding-left: 0; 
              list-style: none;
            }
            .content li { 
              margin: 12px 0; 
              font-size: 16px; 
              color: #4a5568;
              padding-left: 0;
            }
            .button { 
              display: inline-block; 
              background: #000000; 
              color: white; 
              padding: 14px 28px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 24px 0; 
              font-weight: 500;
              font-size: 16px;
              transition: background-color 0.2s ease;
            }
            .button:hover { 
              background: #374151; 
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #9ca3af; 
              font-size: 14px; 
              padding: 0 30px 30px;
            }
            .footer p { 
              margin: 8px 0; 
            }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .header, .content { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .content h2 { font-size: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
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
              
              <p>Happy pet parenting!<br><strong>The Petify Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Petify. All rights reserved.</p>
              <p>This email was sent to you because you signed up for Petify.</p>
            </div>
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
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background-color: #f8f9fa !important;
              color: #1a1a1a !important;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
            }
            .email-container { 
              background: #ffffff !important; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              max-width: 600px; 
              margin: 20px auto; 
            }
            .header { 
              background: #000000 !important; 
              color: #ffffff !important; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700; 
              color: #ffffff !important;
            }
            .header p { 
              margin: 8px 0 0 0; 
              font-size: 16px; 
              color: #ffffff !important;
              opacity: 0.9;
            }
            .content { 
              padding: 40px 30px; 
              background: #ffffff !important;
            }
            .content h2 { 
              margin: 0 0 20px 0; 
              font-size: 24px; 
              font-weight: 600; 
              color: #1a1a1a !important;
            }
            .content p { 
              margin: 0 0 16px 0; 
              font-size: 16px; 
              color: #4a5568 !important;
            }
            .booking-details { 
              background: #f8f9fa !important; 
              padding: 24px; 
              border-radius: 8px; 
              margin: 24px 0; 
              border-left: 4px solid #000000 !important;
              border: 1px solid #e5e7eb !important;
            }
            .booking-details h3 { 
              margin: 0 0 16px 0; 
              font-size: 18px; 
              font-weight: 600; 
              color: #1a1a1a !important;
            }
            .booking-details p { 
              margin: 8px 0; 
              font-size: 16px; 
              color: #4a5568 !important;
            }
            .booking-details strong { 
              color: #1a1a1a !important;
              font-weight: 600;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #9ca3af !important;
              font-size: 14px; 
              padding: 0 30px 30px; 
              background: #ffffff !important;
            }
            .footer p { 
              margin: 8px 0; 
              color: #9ca3af !important;
            }
            @media (max-width: 600px) {
              .email-container { margin: 10px; }
              .header, .content { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .content h2 { font-size: 20px; }
              .booking-details { padding: 20px; }
            }
          </style>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8f9fa; color: #1a1a1a;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 20px; background-color: #f8f9fa;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: #000000; color: #ffffff; padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">✅ Booking Confirmed!</h1>
                      <p style="margin: 8px 0 0 0; font-size: 16px; color: #ffffff; opacity: 0.9;">Your pet service is scheduled</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px; background: #ffffff;">
                      <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Hi ${data.customerName}!</h2>
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a5568;">Great news! Your booking has been confirmed. Here are the details:</p>
                      
                      <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #000000; border: 1px solid #e5e7eb;">
                        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">📋 Booking Details</h3>
                        <p style="margin: 8px 0; font-size: 16px; color: #4a5568;"><strong style="color: #1a1a1a; font-weight: 600;">Service:</strong> ${data.serviceName}</p>
                        <p style="margin: 8px 0; font-size: 16px; color: #4a5568;"><strong style="color: #1a1a1a; font-weight: 600;">Provider:</strong> ${data.providerName}</p>
                        <p style="margin: 8px 0; font-size: 16px; color: #4a5568;"><strong style="color: #1a1a1a; font-weight: 600;">Pet:</strong> ${data.petName}</p>
                        <p style="margin: 8px 0; font-size: 16px; color: #4a5568;"><strong style="color: #1a1a1a; font-weight: 600;">Date:</strong> ${data.bookingDate}</p>
                        <p style="margin: 8px 0; font-size: 16px; color: #4a5568;"><strong style="color: #1a1a1a; font-weight: 600;">Time:</strong> ${data.bookingTime}</p>
                        <p style="margin: 8px 0; font-size: 16px; color: #4a5568;"><strong style="color: #1a1a1a; font-weight: 600;">Total Price:</strong> €${data.totalPrice.toFixed(2)}</p>
                        ${data.notes ? `<p style="margin: 8px 0; font-size: 16px; color: #4a5568;"><strong style="color: #1a1a1a; font-weight: 600;">Notes:</strong> ${data.notes}</p>` : ''}
                        <p style="margin: 8px 0; font-size: 16px; color: #4a5568;"><strong style="color: #1a1a1a; font-weight: 600;">Booking ID:</strong> ${data.bookingId}</p>
                      </div>
                      
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a5568;">Please arrive 10 minutes early for your appointment. If you need to make any changes, please contact your service provider directly.</p>
                      
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a5568;">Thank you for choosing Petify!<br><strong style="color: #1a1a1a; font-weight: 600;">The Petify Team</strong></p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="text-align: center; margin-top: 40px; color: #9ca3af; font-size: 14px; padding: 0 30px 30px; background: #ffffff;">
                      <p style="margin: 8px 0; color: #9ca3af;">© 2024 Petify. All rights reserved.</p>
                      <p style="margin: 8px 0; color: #9ca3af;">Booking ID: ${data.bookingId}</p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f8f9fa;
            }
            .email-container { 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header { 
              background: #000000; 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700; 
              letter-spacing: -0.025em;
            }
            .header p { 
              margin: 8px 0 0 0; 
              font-size: 16px; 
              opacity: 0.9;
              font-weight: 400;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              margin: 0 0 20px 0; 
              font-size: 24px; 
              font-weight: 600; 
              color: #1a1a1a;
              letter-spacing: -0.025em;
            }
            .content p { 
              margin: 0 0 16px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .booking-details { 
              background: #f8f9fa; 
              padding: 24px; 
              border-radius: 8px; 
              margin: 24px 0; 
              border-left: 4px solid #000000;
              border: 1px solid #e5e7eb;
            }
            .booking-details h3 { 
              margin: 0 0 16px 0; 
              font-size: 18px; 
              font-weight: 600; 
              color: #1a1a1a;
            }
            .booking-details p { 
              margin: 8px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .booking-details strong { 
              color: #1a1a1a;
              font-weight: 600;
            }
            .status { 
              padding: 20px; 
              border-radius: 8px; 
              margin: 24px 0; 
              border: 1px solid;
            }
            .status h3 { 
              margin: 0 0 12px 0; 
              font-size: 18px; 
              font-weight: 600;
            }
            .status p { 
              margin: 8px 0; 
              font-size: 16px;
            }
            .status.confirmed { 
              background: #f0fdf4; 
              color: #166534; 
              border-color: #bbf7d0; 
            }
            .status.cancelled { 
              background: #fef2f2; 
              color: #991b1b; 
              border-color: #fecaca; 
            }
            .status.completed { 
              background: #f0f9ff; 
              color: #1e40af; 
              border-color: #bfdbfe; 
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #9ca3af; 
              font-size: 14px; 
              padding: 0 30px 30px;
            }
            .footer p { 
              margin: 8px 0; 
            }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .header, .content { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .content h2 { font-size: 20px; }
              .booking-details, .status { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
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
              
              <p>Best regards,<br><strong>The Petify Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Petify. All rights reserved.</p>
              <p>Booking ID: ${data.bookingId}</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  orderDetails: (data: OrderDetailsEmailData) => ({
    subject: `Order Details - ${data.serviceName} with ${data.providerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Details</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              max-width: 700px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f8f9fa;
            }
            .email-container { 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header { 
              background: #000000; 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700; 
              letter-spacing: -0.025em;
            }
            .header p { 
              margin: 8px 0 0 0; 
              font-size: 16px; 
              opacity: 0.9;
              font-weight: 400;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              margin: 0 0 20px 0; 
              font-size: 24px; 
              font-weight: 600; 
              color: #1a1a1a;
              letter-spacing: -0.025em;
            }
            .content p { 
              margin: 0 0 16px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .receipt { 
              background: white; 
              border-radius: 12px; 
              padding: 32px; 
              margin: 24px 0; 
              border: 1px solid #e5e7eb;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            }
            .receipt-header { 
              border-bottom: 2px solid #000000; 
              padding-bottom: 20px; 
              margin-bottom: 24px; 
            }
            .receipt-title { 
              font-size: 24px; 
              font-weight: 700; 
              color: #000000; 
              margin: 0;
              letter-spacing: -0.025em;
            }
            .receipt-subtitle { 
              color: #6b7280; 
              margin: 8px 0 0 0; 
              font-size: 16px;
            }
            .order-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 24px; 
              margin: 24px 0; 
            }
            .info-section h4 { 
              color: #000000; 
              margin: 0 0 12px 0; 
              font-size: 18px; 
              font-weight: 600;
            }
            .info-section p { 
              margin: 8px 0; 
              font-size: 16px;
              color: #4a5568;
            }
            .info-section strong { 
              color: #1a1a1a;
              font-weight: 600;
            }
            .service-details { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #000000;
              border: 1px solid #e5e7eb;
            }
            .pet-details { 
              background: #f0fdf4; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #16a34a;
              border: 1px solid #bbf7d0;
            }
            .payment-summary { 
              background: #fffbeb; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #f59e0b;
              border: 1px solid #fed7aa;
            }
            .status-badge { 
              display: inline-block; 
              padding: 6px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: 600; 
              text-transform: uppercase;
            }
            .status-pending { background: #fffbeb; color: #92400e; border: 1px solid #fed7aa; }
            .status-confirmed { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
            .status-cancelled { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
            .status-completed { background: #f0f9ff; color: #1e40af; border: 1px solid #bfdbfe; }
            .contact-info { 
              background: #f9fafb; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border: 1px solid #e5e7eb;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #9ca3af; 
              font-size: 14px; 
              padding: 0 30px 30px;
            }
            .footer p { 
              margin: 8px 0; 
            }
            .divider { 
              border-top: 1px solid #e5e7eb; 
              margin: 24px 0; 
            }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .header, .content { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .content h2 { font-size: 20px; }
              .order-info { grid-template-columns: 1fr; }
              .receipt { padding: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>📋 Order Details</h1>
              <p>Complete booking information</p>
            </div>
            <div class="content">
              <h2>Hi ${data.customerName}!</h2>
              <p>Thank you for choosing Petify! Here are the complete details of your order:</p>
              
              <div class="receipt">
                <div class="receipt-header">
                  <h3 class="receipt-title">📄 Order Receipt</h3>
                  <p class="receipt-subtitle">Order ID: ${data.bookingId}</p>
                </div>
                
                <div class="order-info">
                  <div class="info-section">
                    <h4>📅 Booking Information</h4>
                    <p><strong>Date:</strong> ${data.bookingDate}</p>
                    <p><strong>Time:</strong> ${data.bookingTime}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${data.status}">${data.status}</span></p>
                    ${data.paymentStatus ? `<p><strong>Payment:</strong> <span class="status-badge status-${data.paymentStatus}">${data.paymentStatus}</span></p>` : ''}
                  </div>
                  
                  <div class="info-section">
                    <h4>🏢 Service Provider</h4>
                    <p><strong>Business:</strong> ${data.providerName}</p>
                    ${data.providerContact?.phone ? `<p><strong>Phone:</strong> ${data.providerContact.phone}</p>` : ''}
                    ${data.providerContact?.email ? `<p><strong>Email:</strong> ${data.providerContact.email}</p>` : ''}
                    ${data.providerContact?.address ? `<p><strong>Address:</strong> ${data.providerContact.address}</p>` : ''}
                  </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="service-details">
                  <h4>🛠️ Service Details</h4>
                  <p><strong>Service:</strong> ${data.serviceName}</p>
                  ${data.serviceDescription ? `<p><strong>Description:</strong> ${data.serviceDescription}</p>` : ''}
                  <p><strong>Price:</strong> €${data.totalPrice.toFixed(2)}</p>
                </div>
                
                <div class="pet-details">
                  <h4>🐾 Pet Information</h4>
                  <p><strong>Name:</strong> ${data.petName}</p>
                  ${data.petSpecies ? `<p><strong>Species:</strong> ${data.petSpecies}</p>` : ''}
                  ${data.petBreed ? `<p><strong>Breed:</strong> ${data.petBreed}</p>` : ''}
                </div>
                
                <div class="payment-summary">
                  <h4>💰 Payment Summary</h4>
                  <p><strong>Service Fee:</strong> €${data.totalPrice.toFixed(2)}</p>
                  <p><strong>Total Amount:</strong> €${data.totalPrice.toFixed(2)}</p>
                  <p><em>Payment processed securely through Petify</em></p>
                </div>
                
                ${data.notes ? `
                  <div class="contact-info">
                    <h4>📝 Special Instructions</h4>
                    <p>${data.notes}</p>
                  </div>
                ` : ''}
              </div>
              
              <div class="contact-info">
                <h4>📞 Need Help?</h4>
                <p>If you have any questions about your booking, please contact:</p>
                <p><strong>Provider:</strong> ${data.providerName}</p>
                ${data.providerContact?.phone ? `<p><strong>Phone:</strong> ${data.providerContact.phone}</p>` : ''}
                ${data.providerContact?.email ? `<p><strong>Email:</strong> ${data.providerContact.email}</p>` : ''}
                <p><strong>Petify Support:</strong> support@petify.lt</p>
              </div>
              
              <p>We hope you and ${data.petName} have a wonderful experience!</p>
              
              <p>Best regards,<br><strong>The Petify Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Petify. All rights reserved.</p>
              <p>Order ID: ${data.bookingId} | Generated on ${new Date().toLocaleDateString('en-US')}</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  providerNotification: (data: ProviderNotificationEmailData) => ({
    subject: `New Booking Request - ${data.serviceName} from ${data.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Request</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f8f9fa;
            }
            .email-container { 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header { 
              background: #16a34a; 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700; 
              letter-spacing: -0.025em;
            }
            .header p { 
              margin: 8px 0 0 0; 
              font-size: 16px; 
              opacity: 0.9;
              font-weight: 400;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              margin: 0 0 20px 0; 
              font-size: 24px; 
              font-weight: 600; 
              color: #1a1a1a;
              letter-spacing: -0.025em;
            }
            .content p { 
              margin: 0 0 16px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .content ul { 
              margin: 20px 0; 
              padding-left: 20px; 
            }
            .content li { 
              margin: 8px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .booking-details { 
              background: #f8f9fa; 
              padding: 24px; 
              border-radius: 8px; 
              margin: 24px 0; 
              border-left: 4px solid #16a34a;
              border: 1px solid #e5e7eb;
            }
            .booking-details h3 { 
              margin: 0 0 16px 0; 
              font-size: 18px; 
              font-weight: 600; 
              color: #1a1a1a;
            }
            .booking-details p { 
              margin: 8px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .booking-details strong { 
              color: #1a1a1a;
              font-weight: 600;
            }
            .customer-info { 
              background: #f0fdf4; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #16a34a;
              border: 1px solid #bbf7d0;
            }
            .service-info { 
              background: #fffbeb; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #f59e0b;
              border: 1px solid #fed7aa;
            }
            .customer-info h3, .service-info h3 { 
              margin: 0 0 12px 0; 
              font-size: 18px; 
              font-weight: 600; 
              color: #1a1a1a;
            }
            .customer-info p, .service-info p { 
              margin: 8px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .customer-info strong, .service-info strong { 
              color: #1a1a1a;
              font-weight: 600;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #9ca3af; 
              font-size: 14px; 
              padding: 0 30px 30px;
            }
            .footer p { 
              margin: 8px 0; 
            }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .header, .content { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .content h2 { font-size: 20px; }
              .booking-details, .customer-info, .service-info { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🎉 New Booking Request!</h1>
              <p>You have a new customer booking</p>
            </div>
            <div class="content">
              <h2>Hi ${data.providerName}!</h2>
              <p>Great news! You've received a new booking request through Petify. Here are the details:</p>
              
              <div class="booking-details">
                <h3>📋 Booking Information</h3>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Date:</strong> ${data.bookingDate}</p>
                <p><strong>Time:</strong> ${data.bookingTime}</p>
                <p><strong>Total Amount:</strong> €${data.totalPrice.toFixed(2)}</p>
                ${data.notes ? `<p><strong>Special Instructions:</strong> ${data.notes}</p>` : ''}
              </div>
              
              <div class="customer-info">
                <h3>👤 Customer Information</h3>
                <p><strong>Name:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.customerEmail}</p>
                ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
              </div>
              
              <div class="service-info">
                <h3>🐾 Pet Information</h3>
                <p><strong>Pet Name:</strong> ${data.petName}</p>
                ${data.petSpecies ? `<p><strong>Species:</strong> ${data.petSpecies}</p>` : ''}
                ${data.petBreed ? `<p><strong>Breed:</strong> ${data.petBreed}</p>` : ''}
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Review the booking details in your Petify dashboard</li>
                <li>Confirm or modify the booking as needed</li>
                <li>Contact the customer if you have any questions</li>
                <li>Prepare for the scheduled appointment</li>
              </ul>
              
              <p>Please respond to this booking request promptly to maintain excellent customer service.</p>
              
              <p>Thank you for being part of the Petify community!<br><strong>The Petify Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Petify. All rights reserved.</p>
              <p>Booking ID: ${data.bookingId}</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  paymentConfirmation: (data: PaymentConfirmationEmailData) => ({
    subject: `Payment Confirmed - ${data.serviceName} with ${data.providerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #1a1a1a; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f8f9fa;
            }
            .email-container { 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header { 
              background: #16a34a; 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700; 
              letter-spacing: -0.025em;
            }
            .header p { 
              margin: 8px 0 0 0; 
              font-size: 16px; 
              opacity: 0.9;
              font-weight: 400;
            }
            .success-icon { 
              font-size: 48px; 
              margin-bottom: 16px; 
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              margin: 0 0 20px 0; 
              font-size: 24px; 
              font-weight: 600; 
              color: #1a1a1a;
              letter-spacing: -0.025em;
            }
            .content p { 
              margin: 0 0 16px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .content ul { 
              margin: 20px 0; 
              padding-left: 20px; 
            }
            .content li { 
              margin: 8px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .payment-details { 
              background: #f8f9fa; 
              padding: 24px; 
              border-radius: 8px; 
              margin: 24px 0; 
              border-left: 4px solid #16a34a;
              border: 1px solid #e5e7eb;
            }
            .payment-details h3 { 
              margin: 0 0 16px 0; 
              font-size: 18px; 
              font-weight: 600; 
              color: #1a1a1a;
            }
            .payment-details p { 
              margin: 8px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .payment-details strong { 
              color: #1a1a1a;
              font-weight: 600;
            }
            .amount { 
              font-size: 24px; 
              font-weight: 700; 
              color: #16a34a; 
            }
            .booking-info { 
              background: #f0fdf4; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #16a34a;
              border: 1px solid #bbf7d0;
            }
            .payment-info { 
              background: #fffbeb; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #f59e0b;
              border: 1px solid #fed7aa;
            }
            .booking-info h3, .payment-info h3 { 
              margin: 0 0 12px 0; 
              font-size: 18px; 
              font-weight: 600; 
              color: #1a1a1a;
            }
            .booking-info p, .payment-info p { 
              margin: 8px 0; 
              font-size: 16px; 
              color: #4a5568;
            }
            .booking-info strong, .payment-info strong { 
              color: #1a1a1a;
              font-weight: 600;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #9ca3af; 
              font-size: 14px; 
              padding: 0 30px 30px;
            }
            .footer p { 
              margin: 8px 0; 
            }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .header, .content { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .content h2 { font-size: 20px; }
              .payment-details, .booking-info, .payment-info { padding: 20px; }
              .success-icon { font-size: 40px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Payment Confirmed!</h1>
              <p>Your payment has been successfully processed</p>
            </div>
            <div class="content">
              <h2>Hi ${data.customerName}!</h2>
              <p>Great news! Your payment has been successfully processed. Your booking is now confirmed.</p>
              
              <div class="payment-details">
                <h3>💰 Payment Summary</h3>
                <p><strong>Amount Paid:</strong> <span class="amount">€${data.totalAmount.toFixed(2)}</span></p>
                <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">✅ Confirmed</span></p>
              </div>
              
              <div class="booking-info">
                <h3>📋 Booking Details</h3>
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Provider:</strong> ${data.providerName}</p>
                <p><strong>Pet:</strong> ${data.petName}</p>
                <p><strong>Date:</strong> ${data.bookingDate}</p>
                <p><strong>Time:</strong> ${data.bookingTime}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>
              
              <div class="payment-info">
                <h3>🔒 Security Information</h3>
                <p>Your payment was processed securely through Stripe, our trusted payment processor. Your card details are never stored on our servers.</p>
                <p>If you have any questions about this payment, please contact our support team.</p>
              </div>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Your booking is now confirmed with the service provider</li>
                <li>You'll receive a reminder email before your appointment</li>
                <li>Please arrive 10 minutes early for your scheduled service</li>
                <li>Contact the provider directly if you need to make any changes</li>
              </ul>
              
              <p>Thank you for choosing Petify! We hope you and ${data.petName} have a wonderful experience.</p>
              
              <p>Best regards,<br><strong>The Petify Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Petify. All rights reserved.</p>
              <p>Transaction ID: ${data.transactionId} | Booking ID: ${data.bookingId}</p>
            </div>
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

export const sendOrderDetailsEmail = async (email: string, data: OrderDetailsEmailData) => {
  const template = emailTemplates.orderDetails(data)
  return sendEmail({
    to: email,
    ...template
  })
}

export const sendProviderNotificationEmail = async (email: string, data: ProviderNotificationEmailData) => {
  const template = emailTemplates.providerNotification(data)
  return sendEmail({
    to: email,
    ...template
  })
}

export const sendPaymentConfirmationEmail = async (email: string, data: PaymentConfirmationEmailData) => {
  const template = emailTemplates.paymentConfirmation(data)
  return sendEmail({
    to: email,
    ...template
  })
}
