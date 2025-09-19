export interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
  attachments?: {
    filename: string
    content: Buffer
    contentType: string
  }[]
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
  providerId: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  paymentMethod: string
  transactionId: string
  bookingId: string
  petName: string
}
