'use client'

import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, PawPrint, MessageCircle, Heart } from 'lucide-react'

const navCards = [
  {
    href: '/bookings',
    icon: Calendar,
    title: 'Mano rezervacijos',
    description: 'Peržiūrėkite ir valdykite savo rezervacijas',
  },
  {
    href: '/pets',
    icon: PawPrint,
    title: 'Mano augintiniai',
    description: 'Tvarkykite savo augintinių profilius',
  },
  {
    href: '/chat',
    icon: MessageCircle,
    title: 'Pranešimai',
    description: 'Susisiekite su paslaugų teikėjais',
  },
  {
    href: '/favorites',
    icon: Heart,
    title: 'Mėgstami',
    description: 'Jūsų išsaugoti paslaugų teikėjai',
  },
]

export default function DashboardPage() {
  return (
    <Layout hideFooter={true}>
      <ProtectedRoute>
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-muted pt-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground mb-6">Mano paskyra</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {navCards.map(({ href, icon: Icon, title, description }) => (
                <Link key={href} href={href}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground mb-1">{title}</h2>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
