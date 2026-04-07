'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useFavorites } from '@/contexts/favorites-context'
import { Heart, Star, MapPin, Phone, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function FavoritesPage() {
  const { user } = useAuth()
  const { favorites, loading, removeFromFavorites } = useFavorites()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (providerId: string) => {
    if (!providerId || removingId) return

    setRemovingId(providerId)
    try {
      await removeFromFavorites(providerId)
    } finally {
      setRemovingId(null)
    }
  }

  if (!user) return null

  return (
    <Layout hideFooter={true}>
      <ProtectedRoute>
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-muted pt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
              <p className="text-muted-foreground">Your saved service providers</p>
            </div>

            {/* Favorites List */}
            {loading ? (
              <Card>
                <CardContent className="text-center py-8">Loading...</CardContent>
              </Card>
            ) : favorites.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-4">Start by adding providers to your favorites</p>
                  <Button onClick={() => window.location.href = '/'}>
                    Find Services
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favorites.map((fav) => (
                  <div key={`favorite-${fav.id}-${fav.provider_id}`} data-slot="card" className="bg-card text-card-foreground space-y-4 flex flex-col rounded-xl border transition-all duration-300 overflow-hidden">
                    <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                      {fav.provider?.avatar_url || (fav.provider?.images && fav.provider.images.length > 0) ? (
                        <Image
                          src={fav.provider.avatar_url || fav.provider.images?.[0] || ''}
                          alt={fav.provider?.business_name || 'Provider'}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) {
                              fallback.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: fav.provider?.avatar_url || (fav.provider?.images && fav.provider.images.length > 0) ? 'none' : 'flex' }}>
                        <span className="text-6xl">✂️</span>
                      </div>
                    </div>

                    <div data-slot="card-content" className="p-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{fav.provider?.business_name || 'Provider'}</h3>
                        <p className="text-muted-foreground mb-2">{fav.provider?.services?.[0] || 'Service'}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span>{fav.provider?.rating ?? 0}</span>
                            <span>({fav.provider?.review_count ?? 0} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{fav.provider?.location && typeof fav.provider.location === 'object' && 'address' in fav.provider.location ? (fav.provider.location as { address: string }).address : ''}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{fav.provider?.contact_info && typeof fav.provider.contact_info === 'object' && 'phone' in fav.provider.contact_info ? (fav.provider.contact_info as { phone: string }).phone : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="flex space-x-2">
                          <Link href={`/providers/${fav.provider?.id || ''}`}>
                            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-neutral-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-2 bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:border-primary/20 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5">
                              View Profile
                            </button>
                          </Link>
                          <button
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-neutral-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-2 bg-background hover:bg-accent dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:border-primary/20 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-red-600 hover:text-red-700"
                            onClick={() => handleRemove(fav.provider_id)}
                            disabled={removingId === fav.provider_id}
                          >
                            {removingId === fav.provider_id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                Removing...
                              </>
                            ) : (
                              'Remove'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
