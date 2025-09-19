// Re-export everything from the modular email system
export * from './email/types'
export * from './email/email-service'
export * from './email/pdf-generator'
export * from './email/template-engine'

// Main email functions for backward compatibility
import { EmailService } from './email/email-service'
import { generateInvoicePDF } from './email/pdf-generator'
import type { 
  BookingEmailData, 
  WelcomeEmailData, 
  BookingUpdateEmailData, 
  OrderDetailsEmailData,
  ProviderNotificationEmailData,
  PaymentConfirmationEmailData 
} from './email/types'

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (data: BookingEmailData & { customerEmail: string }) => {
  return EmailService.sendBookingConfirmation(data)
}

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (data: WelcomeEmailData & { userEmail: string }) => {
  return EmailService.sendWelcomeEmail(data)
}

/**
 * Send booking update email
 */
export const sendBookingUpdateEmail = async (data: BookingUpdateEmailData & { customerEmail: string }) => {
  return EmailService.sendBookingUpdate(data)
}

/**
 * Send order details email
 */
export const sendOrderDetailsEmail = async (data: OrderDetailsEmailData & { customerEmail: string }) => {
  return EmailService.sendBookingConfirmation(data)
}

/**
 * Send provider notification email
 */
export const sendProviderNotificationEmail = async (data: ProviderNotificationEmailData & { providerEmail: string }) => {
  return EmailService.sendProviderNotification(data)
}

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (data: PaymentConfirmationEmailData & { customerEmail: string }) => {
  return EmailService.sendPaymentConfirmation(data)
}

/**
 * Generate PDF invoice
 */
export { generateInvoicePDF }
