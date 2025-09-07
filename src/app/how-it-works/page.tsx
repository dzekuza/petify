import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Calendar, 
  CreditCard, 
  Star, 
  Shield, 
  Users, 
  Clock,
  CheckCircle,
  PawPrint
} from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    number: 1,
    title: 'Search & Discover',
    description: 'Find trusted pet service providers in your area using our advanced search filters.',
    icon: Search,
    details: [
      'Browse by service type (grooming, veterinary, boarding, etc.)',
      'Filter by location, price range, and ratings',
      'View detailed provider profiles and reviews',
      'Compare services and pricing'
    ]
  },
  {
    number: 2,
    title: 'Book Your Service',
    description: 'Select your preferred date, time, and service with just a few clicks.',
    icon: Calendar,
    details: [
      'Choose from available time slots',
      'Select which pets need the service',
      'Add special instructions or notes',
      'Review and confirm your booking'
    ]
  },
  {
    number: 3,
    title: 'Enjoy the Service',
    description: 'Your pet receives professional care from verified service providers.',
    icon: PawPrint,
    details: [
      'Meet your service provider',
      'Your pet gets the care they need',
      'Receive real-time updates',
      'Track service progress'
    ]
  },
  {
    number: 4,
    title: 'Rate & Review',
    description: 'Share your experience to help other pet owners make informed decisions.',
    icon: Star,
    details: [
      'Rate your experience',
      'Write a detailed review',
      'Help other pet owners',
      'Build the community'
    ]
  }
]

const features = [
  {
    icon: Shield,
    title: 'Verified Providers',
    description: 'All service providers are background-checked and certified professionals.'
  },
  {
    icon: Users,
    title: 'Trusted Community',
    description: 'Join thousands of pet owners who trust Petify for their pet care needs.'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Our customer support team is always here to help you and your pets.'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Safe and secure payment processing with multiple payment options.'
  }
]

const faqs = [
  {
    question: 'How do I find a pet service provider?',
    answer: 'Use our search filters to find providers by location, service type, price range, and ratings. You can also browse by category or use the map view to see providers near you.'
  },
  {
    question: 'Are all providers verified?',
    answer: 'Yes, all service providers on our platform undergo background checks and verification processes. We also require proof of certifications and insurance.'
  },
  {
    question: 'How do I book a service?',
    answer: 'Simply select a provider, choose your service, pick a date and time, select your pets, and confirm your booking. You\'ll receive a confirmation email with all the details.'
  },
  {
    question: 'What if I need to cancel or reschedule?',
    answer: 'You can cancel or reschedule your booking up to 24 hours before the scheduled time through your account dashboard or by contacting the provider directly.'
  },
  {
    question: 'How do payments work?',
    answer: 'Payments are processed securely after service completion. You can pay with credit card, debit card, or other supported payment methods.'
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We have a satisfaction guarantee. If you\'re not happy with the service, contact our support team and we\'ll work to resolve the issue or provide a refund.'
  }
]

export default function HowItWorksPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                How Petify Works
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                Getting started with Petify is simple. Follow these easy steps to find and book 
                trusted pet care services for your furry friends.
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Simple 4-Step Process
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                From search to service completion, we make pet care booking effortless
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.number} className="relative">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Badge variant="secondary" className="mr-2">
                            Step {step.number}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300 transform -translate-y-1/2" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why Choose Petify?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We're committed to providing the best pet care experience for you and your pets
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Get answers to common questions about using Petify
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Join thousands of pet owners who trust Petify for their pet care needs
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/search">
                    Find Services
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/provider/signup">
                    Become a Provider
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
