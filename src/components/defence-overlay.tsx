'use client'

import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const ACCESS_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || '123'
const STORAGE_KEY = 'petify_access_granted'

export function DefenceOverlay() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check local storage on mount
        const hasAccess = localStorage.getItem(STORAGE_KEY)
        if (hasAccess === 'true') {
            setIsAuthenticated(true)
        }
        setLoading(false)
    }, [])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ACCESS_PASSWORD) {
            localStorage.setItem(STORAGE_KEY, 'true')
            setIsAuthenticated(true)
            setError(false)
        } else {
            setError(true)
            setPassword('')
        }
    }

    // Prevent scrolling when locked
    useEffect(() => {
        if (!isAuthenticated && !loading) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isAuthenticated, loading])

    if (loading || isAuthenticated) {
        return null
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-white/20">
                <CardHeader className="text-center space-y-4 pt-10 pb-2">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-2">
                        <Lock className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                        Protected Access
                    </CardTitle>
                    <CardDescription className="text-base">
                        Please enter the access code to continue to Petify.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-10 px-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Enter password..."
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setError(false)
                                }}
                                className={`text-center text-lg h-12 transition-all ${error
                                        ? 'border-red-500 focus-visible:border-red-500'
                                        : 'focus-visible:border-neutral-400'
                                    }`}
                                autoFocus
                            />
                            {error && (
                                <p className="text-sm text-red-500 text-center font-medium animate-in slide-in-from-top-1">
                                    Incorrect password. Please try again.
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Enter Site
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Protected by Petify Security
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
