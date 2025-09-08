'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PawPrint, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { t } from '@/lib/translations'
import Link from 'next/link'

function EmailConfirmContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token || !type) {
          setStatus('error')
          setError(t('auth.confirm.missingParameters'))
          return
        }

        // In a real implementation, you would verify the token with Supabase
        // For now, we'll simulate the confirmation process
        await new Promise(resolve => setTimeout(resolve, 2000))

        if (type === 'signup') {
          setStatus('success')
          // Redirect to home page after 3 seconds
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } else {
          setStatus('error')
          setError(t('auth.confirm.invalidType'))
        }
      } catch (err) {
        setStatus('error')
        setError(t('auth.confirm.verificationFailed'))
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('auth.confirm.verifying')}
            </h2>
            <p className="text-gray-600">
              {t('auth.confirm.verifyingDescription')}
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('auth.confirm.successTitle')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('auth.confirm.successDescription')}
            </p>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/">
                  {t('auth.confirm.continueToApp')}
                </Link>
              </Button>
              <p className="text-sm text-gray-500">
                {t('auth.confirm.redirecting')}
              </p>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('auth.confirm.errorTitle')}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || t('auth.confirm.errorDescription')}
            </p>
            <div className="space-y-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signup">
                  {t('auth.confirm.tryAgain')}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/auth/signin">
                  {t('auth.confirm.backToSignIn')}
                </Link>
              </Button>
            </div>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="h-12 w-12 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('auth.confirm.expiredTitle')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('auth.confirm.expiredDescription')}
            </p>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/signup">
                  {t('auth.confirm.resendConfirmation')}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/auth/signin">
                  {t('auth.confirm.backToSignIn')}
                </Link>
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <PawPrint className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.confirm.pageTitle')}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {t('auth.confirm.cardTitle')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.confirm.cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <PawPrint className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              {t('auth.confirm.pageTitle')}
            </h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <EmailConfirmContent />
    </Suspense>
  )
}
