import { jsPDF } from 'jspdf'
import { PaymentConfirmationEmailData } from './types'

/**
 * Generate PDF invoice for a booking
 */
export const generateInvoicePDF = (data: PaymentConfirmationEmailData): Buffer => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Petify', 20, 30)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Invoice', 20, 40)
  doc.text(`Invoice #: INV-${data.bookingId.slice(-8).toUpperCase()}`, 20, 50)
  doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, 20, 60)
  
  // Customer Information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 20, 80)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(data.customerName, 20, 90)
  
  // Service Provider Information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Service Provider:', 20, 110)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(data.providerName, 20, 120)
  
  // Service Details
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Service Details:', 20, 140)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Service: ${data.serviceName}`, 20, 150)
  doc.text(`Pet: ${data.petName}`, 20, 160)
  doc.text(`Date: ${data.bookingDate}`, 20, 170)
  doc.text(`Time: ${data.bookingTime}`, 20, 180)
  
  // Payment Information
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Information:', 20, 200)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Amount: €${data.totalAmount.toFixed(2)}`, 20, 210)
  doc.text(`Payment Method: ${data.paymentMethod}`, 20, 220)
  doc.text(`Transaction ID: ${data.transactionId}`, 20, 230)
  
  // Footer
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.text('Thank you for using Petify!', 20, 250)
  doc.text('For support, contact us at info@petify.lt', 20, 260)
  
  return Buffer.from(doc.output('arraybuffer'))
}
