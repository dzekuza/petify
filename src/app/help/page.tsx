'use client'

import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { Mail, Phone, MessageCircle, Search } from 'lucide-react'

export default function HelpPage() {
  const { user } = useAuth()

  if (!user) return null

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "To book a service, search for providers in your area, select a service, choose your preferred date and time, and complete the booking form."
    },
    {
      question: "How do I cancel a booking?",
      answer: "You can cancel a booking from your bookings page. Click on the booking you want to cancel and select 'Cancel Booking'."
    },
    {
      question: "How do I contact a service provider?",
      answer: "You can contact service providers through their profile page. Most providers have contact information including phone and email."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is processed securely through our platform."
    },
    {
      question: "How do I become a service provider?",
      answer: "Click on 'Join as Provider' in the navigation menu and fill out the provider registration form. We'll review your application and get back to you."
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@petservices.lt",
      action: "Send Email"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us directly",
      contact: "+370 600 12345",
      action: "Call Now"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available 9 AM - 6 PM",
      action: "Start Chat"
    }
  ]

  return (
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-gray-600">Get help with your account and services</p>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for help topics..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Contact Methods */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactMethods.map((method, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <method.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                      <p className="text-sm font-medium text-gray-900 mb-3">{method.contact}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        {method.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message and we'll get back to you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue={user.user_metadata?.full_name || ''} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email || ''} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What can we help you with?" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue or question..."
                      rows={4}
                    />
                  </div>
                  <Button className="w-full">
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
