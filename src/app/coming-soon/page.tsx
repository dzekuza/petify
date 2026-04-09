"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const DEFAULT_REDIRECT = "/"

export default function ComingSoonPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const redirectTo = React.useMemo(() => {
    const r = searchParams.get("redirect")
    if (!r || r.startsWith("/coming-soon")) return DEFAULT_REDIRECT
    return r
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!code) {
      setError("Please enter the access code")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) {
        setError("Invalid access code")
        setIsSubmitting(false)
        return
      }

      router.replace(redirectTo)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page is currently locked. Enter the access code to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-code">Access Code</Label>
              <Input
                id="access-code"
                name="access-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter access code"
                autoComplete="one-time-code"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "access-code-error" : undefined}
              />
              {error ? (
                <p id="access-code-error" className="text-sm text-red-600">
                  {error}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Unlock"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
