import { Resend } from 'resend'
import { EmailTemplate } from './types'
import { TemplateEngine } from './template-engine'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@petify.lt'

export class EmailService {
  /**
   * Send email using Resend
   */
  static async sendEmail(template: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await resend.emails.send({
        from: template.from || fromEmail,
        to: template.to,
        subject: template.subject,
        html: template.html,
        attachments: template.attachments
      })

      if (result.error) {
        console.error('Email sending failed:', result.error)
        return { success: false, error: result.error.message }
      }

      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('Email service error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(data: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = TemplateEngine.loadTemplate('booking-confirmation')
    const html = TemplateEngine.render(template, {
      ...data,
      totalPrice: TemplateEngine.formatCurrency(data.totalPrice),
      bookingDate: TemplateEngine.formatDate(data.bookingDate)
    })

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Booking Confirmed - ${data.serviceName} with ${data.providerName}`,
      html
    })
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(data: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = TemplateEngine.loadTemplate('welcome')
    const html = TemplateEngine.render(template, data)

    return this.sendEmail({
      to: data.userEmail,
      subject: 'Welcome to Petify - Your Pet Care Journey Starts Here!',
      html
    })
  }

  /**
   * Send booking update email
   */
  static async sendBookingUpdate(data: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = TemplateEngine.loadTemplate('booking-update')
    const html = TemplateEngine.render(template, {
      ...data,
      totalPrice: TemplateEngine.formatCurrency(data.totalPrice),
      bookingDate: TemplateEngine.formatDate(data.bookingDate)
    })

    const statusMessages = {
      confirmed: 'confirmed',
      cancelled: 'cancelled',
      completed: 'completed'
    }

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Booking ${statusMessages[data.status as keyof typeof statusMessages]} - ${data.serviceName}`,
      html
    })
  }

  /**
   * Send provider notification email
   */
  static async sendProviderNotification(data: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = TemplateEngine.loadTemplate('provider-notification')
    const html = TemplateEngine.render(template, {
      ...data,
      totalPrice: TemplateEngine.formatCurrency(data.totalPrice),
      bookingDate: TemplateEngine.formatDate(data.bookingDate)
    })

    return this.sendEmail({
      to: data.providerEmail,
      subject: `New Booking - ${data.serviceName} from ${data.customerName}`,
      html
    })
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(data: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = TemplateEngine.loadTemplate('payment-confirmation')
    const html = TemplateEngine.render(template, {
      ...data,
      totalAmount: TemplateEngine.formatCurrency(data.totalAmount),
      bookingDate: TemplateEngine.formatDate(data.bookingDate)
    })

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Payment Confirmed - ${data.serviceName} Booking`,
      html
    })
  }
}
