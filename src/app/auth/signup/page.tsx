'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { PawPrint, Eye, EyeOff } from 'lucide-react'
import { t } from '@/lib/translations'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signUp } = useAuth()
  const router = useRouter()

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

    const { error } = await signUp(formData.email, formData.password, formData.fullName, 'customer')

    if (error) {
      setError(error.message)
    } else {
      // Redirect to home page for customers immediately
      router.push('/')
    }

    setLoading(false)
  }


  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <PawPrint className="size-4" />
            </div>
            Petify
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">{t('auth.signup.createAccount')}</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    {t('auth.signup.joinAsPetOwner')}
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="fullName">{t('auth.signup.fullName')}</FieldLabel>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                    placeholder={t('auth.signup.enterFullName')}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">{t('auth.signup.emailAddress')}</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder={t('auth.signup.enterEmail')}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">{t('auth.signup.createPassword')}</FieldLabel>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      placeholder={t('auth.signup.createPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('auth.signup.passwordMinLength')}
                  </p>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">{t('auth.signup.confirmPassword')}</FieldLabel>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      placeholder={t('auth.signup.confirmYourPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </Field>

                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? t('auth.signup.creatingAccount') : t('auth.signup.createAccount')}
                  </Button>
                </Field>

                <FieldSeparator>{t('auth.signin.orContinueWith')}</FieldSeparator>

                <Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="currentColor"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor" />
                      </svg>
                      Facebook
                    </Button>
                  </div>

                  <FieldDescription className="text-center mt-4 space-y-2">
                    <p>
                      {t('auth.signin.noAccount')}{' '}
                      <Link
                        href="/auth/signin"
                        className="font-medium text-primary hover:text-primary/90 underline underline-offset-4"
                      >
                        {t('auth.signin.signIn')}
                      </Link>
                    </p>
                    <p className="text-xs">
                      {t('auth.signup.areYouServiceProvider')}{' '}
                      <Link
                        href="/provider/signup"
                        className="font-medium text-primary hover:text-primary/90 underline underline-offset-4"
                      >
                        {t('auth.signup.joinAsProvider')}
                      </Link>
                    </p>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
        <div className="text-muted-foreground text-center text-xs text-balance">
          By clicking continue, you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop"
          alt="Image"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
