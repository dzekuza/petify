import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth-context'
import { supabase } from '@/lib/supabase'

interface FavoritesContextType {
  favorites: string[]
  isFavorite: (providerId: string) => boolean
  toggleFavorite: (providerId: string) => Promise<void>
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadFavorites()
    } else {
      setFavorites([])
    }
  }, [user])

  const loadFavorites = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('favorites')
      .select('provider_id')
      .eq('user_id', user.id)
    setFavorites(data?.map(f => f.provider_id) ?? [])
    setLoading(false)
  }

  const isFavorite = useCallback(
    (providerId: string) => favorites.includes(providerId),
    [favorites]
  )

  const toggleFavorite = useCallback(async (providerId: string) => {
    if (!user) return

    if (favorites.includes(providerId)) {
      setFavorites(prev => prev.filter(id => id !== providerId))
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('provider_id', providerId)
    } else {
      setFavorites(prev => [...prev, providerId])
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, provider_id: providerId })
    }
  }, [user, favorites])

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  )
}
