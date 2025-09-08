'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PawPrint, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { t } from '@/lib/translations'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setError(t('auth.resetPassword.invalidSession'))
          setIsValidSession(false)
        } else {
          setIsValidSession(true)
        }
      } catch (err) {
        setError(t('auth.resetPassword.sessionError'))
        setIsValidSession(false)
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.signup.passwordsDoNotMatch'))
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(t('auth.signup.passwordTooShort'))
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    } catch (err) {
      setError(t('auth.resetPassword.updateError'))
    }
    
    setLoading(false)
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {t('auth.resetPassword.checkingSession')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.resetPassword.checkingSessionDescription')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {t('auth.resetPassword.invalidSessionTitle')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || t('auth.resetPassword.invalidSessionDescription')}
            </p>
            <div className="mt-6 space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  {t('auth.resetPassword.backToSignIn')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signup">
                  {t('auth.resetPassword.createNewAccount')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {t('auth.resetPassword.successTitle')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.resetPassword.successDescription')}
            </p>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href="/">
                  {t('auth.resetPassword.continueToApp')}
                </Link>
              </Button>
              <p className="mt-4 text-xs text-gray-500">
                {t('auth.resetPassword.redirecting')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <PawPrint className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.resetPassword.pageTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.resetPassword.pageDescription')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.resetPassword.cardTitle')}</CardTitle>
            <CardDescription>
              {t('auth.resetPassword.cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="password">{t('auth.resetPassword.newPassword')}</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    placeholder={t('auth.resetPassword.enterNewPassword')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.signup.passwordMinLength')}
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPassword')}</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    placeholder={t('auth.resetPassword.confirmNewPassword')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? t('auth.resetPassword.updating') : t('auth.resetPassword.updatePassword')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.resetPassword.rememberPassword')}{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('auth.signin.signIn')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <PawPrint className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {t('auth.resetPassword.pageTitle')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.resetPassword.pageDescription')}
            </p>
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
      <ResetPasswordContent />
    </Suspense>
  )
}
