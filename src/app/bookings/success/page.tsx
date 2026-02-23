'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Clock, ChevronRight, Sparkles, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// Confetti particle component
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute top-0 rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        width: Math.random() * 8 + 4,
        height: Math.random() * 8 + 4,
        backgroundColor: color,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0, scale: 0 }}
      animate={{
        y: ['-2vh', '105vh'],
        opacity: [0, 1, 1, 0],
        rotate: [0, Math.random() * 720 - 360],
        scale: [0, 1, 1, 0.5],
        x: [0, (Math.random() - 0.5) * 120],
      }}
      transition={{
        duration: Math.random() * 2.5 + 2.5,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  )
}

function Confetti() {
  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#F97316', '#14B8A6', '#E879F9']
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1.2,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
      ))}
    </div>
  )
}

// Animated checkmark SVG
function AnimatedCheck() {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 2.2, opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />

      {/* Circle */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#checkGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          />
          {/* Filled circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="url(#fillGradient)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            style={{ transformOrigin: '50px 50px' }}
          />
          {/* Check mark */}
          <motion.path
            d="M30 52 L44 66 L70 36"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1.1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="fillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  )
}

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [hasVerified, setHasVerified] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const sessionId = searchParams?.get('session_id')

    if (hasVerified || loading === false) {
      return
    }

    if (!sessionId) {
      toast.error('Netinkama sesija')
      router.push('/')
      return
    }

    const verifySession = async () => {
      try {
        setHasVerified(true)

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          toast.error('Prašome prisijungti')
          router.push('/auth/signin')
          return
        }

        const response = await fetch('/api/checkout/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ sessionId })
        })

        if (!response.ok) {
          throw new Error('Nepavyko patvirtinti sesijos')
        }

        const data = await response.json()
        setBookingDetails(data.booking)
        setShowConfetti(true)
      } catch (error) {
        console.error('Error verifying session:', error)
        toast.error('Nepavyko patvirtinti mokėjimo')
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [searchParams?.get('session_id'), hasVerified, loading])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full border-[3px] border-emerald-200 border-t-emerald-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-sm text-muted-foreground tracking-wide">Tikrinama mokėjimo būsena...</p>
          </motion.div>
        </div>
      </Layout>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  }

  return (
    <Layout hideFooter>
      {showConfetti && <Confetti />}

      <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -right-20 w-72 h-72 rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute -bottom-10 -left-20 w-96 h-96 rounded-full bg-amber-100/30 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Animated checkmark */}
            <motion.div variants={itemVariants} className="mb-6">
              <AnimatedCheck />
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-bold text-foreground text-center tracking-tight"
            >
              Rezervacija patvirtinta!
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-center mt-2 text-sm sm:text-base max-w-sm"
            >
              Jūsų mokėjimas sėkmingai apdorotas ir rezervacija patvirtinta
            </motion.p>

            {/* Booking details card */}
            {bookingDetails && (
              <motion.div
                variants={itemVariants}
                className="w-full mt-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-border/60 shadow-sm overflow-hidden"
              >
                {/* Card header accent */}
                <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />

                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">
                      Rezervacijos detalės
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Date row */}
                    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">Data</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {bookingDetails.booking_date}
                      </span>
                    </div>

                    {/* Time row */}
                    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">Laikas</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {bookingDetails.start_time} – {bookingDetails.end_time}
                      </span>
                    </div>

                    {/* Status indicators */}
                    <div className="flex gap-3 pt-1">
                      <div className="flex-1 flex items-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-700">Patvirtinta</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-emerald-700">Apmokėta</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div variants={itemVariants} className="w-full mt-6 space-y-3">
              <Button
                onClick={() => router.push('/bookings')}
                className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow-md group"
              >
                Peržiūrėti mano rezervacijas
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full h-11 rounded-xl text-sm text-muted-foreground hover:text-foreground"
              >
                Grįžti į pagrindinį
              </Button>
            </motion.div>

            {/* Info banner */}
            <motion.div
              variants={itemVariants}
              className="w-full mt-6 flex items-start gap-3 rounded-xl bg-white/60 backdrop-blur-sm border border-border/40 p-4"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Kas toliau?</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Patvirtinimo el. laiškas išsiųstas į jūsų el. pašto adresą.
                  Galite peržiūrėti ir valdyti savo rezervaciją skyriuje &ldquo;Mano rezervacijos&rdquo;.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-[3px] border-emerald-200 border-t-emerald-500 animate-spin" />
            <p className="text-sm text-muted-foreground tracking-wide">Kraunamos rezervacijos detalės...</p>
          </div>
        </div>
      </Layout>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
