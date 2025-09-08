'use client'

import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { Heart, Star, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Array<{
    id: string
    provider_id: string
    provider: {
      id: string
      business_name: string
      services: string[] | null
      rating: number | null
      review_count: number | null
      location: { address?: string } | null
      contact_info: { phone?: string } | null
    } | null
  }>>([])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) return
      setLoading(true)
      const { data, error } = await supabase
        .from('favorites')
        .select('id, provider_id, provider:providers(id, business_name, services, rating, review_count, location, contact_info)')
        .eq('user_id', user.id)

      if (!error && data) setFavorites(data as any)
      setLoading(false)
    }
    fetchFavorites()
  }, [user?.id])

  const handleRemove = async (favoriteId: string) => {
    if (!favoriteId) return
    const { error } = await supabase.from('favorites').delete().eq('id', favoriteId)
    if (!error) setFavorites(prev => prev.filter(f => f.id !== favoriteId))
  }

  if (!user) return null

  return (
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600">Your saved service providers</p>
            </div>

            {/* Favorites List */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="text-center py-8">Loading...</CardContent>
                </Card>
              ) : favorites.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding providers to your favorites</p>
                    <Button onClick={() => window.location.href = '/'}>
                      Find Services
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                favorites.map((fav) => (
                  <Card key={fav.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🏥</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {fav.provider?.business_name || 'Provider'}
                              </h3>
                              <p className="text-gray-600 mb-2">{fav.provider?.services?.[0] || 'Service'}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span>{fav.provider?.rating ?? 0}</span>
                                  <span>({fav.provider?.review_count ?? 0} reviews)</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Link href={`/providers/${fav.provider?.id || ''}`}>
                                <Button variant="outline" size="sm">
                                  View Profile
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRemove(fav.id)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{fav.provider?.location && (fav.provider.location as any).address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{fav.provider?.contact_info && (fav.provider.contact_info as any).phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
