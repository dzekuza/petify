'use client'

import { useState, useEffect } from 'react'
import { Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ACCESS_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || '123'
const STORAGE_KEY = 'petify_access_granted'

type Tab = 'password' | 'email'

export function DefenceOverlay() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>('email')

    // Password tab state
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState(false)

    // Email tab state
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [emailSubmitted, setEmailSubmitted] = useState(false)
    const [emailLoading, setEmailLoading] = useState(false)

    useEffect(() => {
        const hasAccess = localStorage.getItem(STORAGE_KEY)
        if (hasAccess === 'true') {
            setIsAuthenticated(true)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        if (!isAuthenticated && !loading) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isAuthenticated, loading])

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ACCESS_PASSWORD) {
            localStorage.setItem(STORAGE_KEY, 'true')
            setIsAuthenticated(true)
        } else {
            setPasswordError(true)
            setPassword('')
        }
    }

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = email.trim()
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setEmailError('Įveskite teisingą el. pašto adresą.')
            return
        }

        setEmailLoading(true)
        setEmailError('')

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmed }),
            })
            if (!res.ok) throw new Error('Server error')
            setEmailSubmitted(true)
        } catch {
            setEmailError('Klaida. Bandykite dar kartą.')
        } finally {
            setEmailLoading(false)
        }
    }

    if (loading || isAuthenticated) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-lg p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-sm">
                {/* Logo / brand mark */}
                <div className="flex justify-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl">
                        <span className="text-2xl font-black text-neutral-900 tracking-tight">P</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Tab switcher */}
                    <div className="flex border-b border-neutral-100">
                        <button
                            onClick={() => setTab('email')}
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${
                                tab === 'email'
                                    ? 'text-neutral-900 border-b-2 border-neutral-900 -mb-px'
                                    : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                        >
                            Gauti prieigą
                        </button>
                        <button
                            onClick={() => setTab('password')}
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${
                                tab === 'password'
                                    ? 'text-neutral-900 border-b-2 border-neutral-900 -mb-px'
                                    : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                        >
                            Slaptažodis
                        </button>
                    </div>

                    <div className="px-8 py-8">
                        {/* Email tab */}
                        {tab === 'email' && (
                            <>
                                {emailSubmitted ? (
                                    <div className="flex flex-col items-center text-center gap-4 py-4">
                                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900">Ačiū už užsiregistravimą!</p>
                                            <p className="text-sm text-neutral-500 mt-1">
                                                Pranešime, kai paleisime Petify. Lauksime jūsų!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                                        <div>
                                            <p className="text-xl font-bold text-neutral-900">Ankstyvoji prieiga</p>
                                            <p className="text-sm text-neutral-500 mt-1">
                                                Palikite el. paštą ir gaukite prieigą prie Petify beta versijos.
                                            </p>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                                <Input
                                                    type="email"
                                                    placeholder="jusu@elpastas.lt"
                                                    value={email}
                                                    onChange={(e) => {
                                                        setEmail(e.target.value)
                                                        setEmailError('')
                                                    }}
                                                    className={`pl-10 h-12 ${emailError ? 'border-red-400' : ''}`}
                                                    autoFocus
                                                />
                                            </div>
                                            {emailError && (
                                                <p className="text-xs text-red-500 animate-in slide-in-from-top-1">
                                                    {emailError}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={emailLoading}
                                            className="w-full h-12 font-semibold bg-neutral-900 hover:bg-neutral-800 transition-all"
                                        >
                                            {emailLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                    Registruojama…
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Gauti prieigą
                                                    <ArrowRight className="h-4 w-4" />
                                                </span>
                                            )}
                                        </Button>
                                        <p className="text-xs text-center text-neutral-400">
                                            Jūsų duomenys saugomi ir nenaudojami trečiosioms šalims.
                                        </p>
                                    </form>
                                )}
                            </>
                        )}

                        {/* Password tab */}
                        {tab === 'password' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <p className="text-xl font-bold text-neutral-900">Įveskite slaptažodį</p>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        Turite prieigos kodą? Įveskite jį žemiau.
                                    </p>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            type="password"
                                            placeholder="Slaptažodis"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value)
                                                setPasswordError(false)
                                            }}
                                            className={`pl-10 h-12 ${passwordError ? 'border-red-400' : ''}`}
                                            autoFocus
                                        />
                                    </div>
                                    {passwordError && (
                                        <p className="text-xs text-red-500 animate-in slide-in-from-top-1">
                                            Neteisingas slaptažodis. Bandykite dar kartą.
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 font-semibold bg-neutral-900 hover:bg-neutral-800 transition-all"
                                >
                                    <span className="flex items-center gap-2">
                                        Prisijungti
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-white/40 mt-6">
                    © {new Date().getFullYear()} Petify. Beta versija.
                </p>
            </div>
        </div>
    )
}
