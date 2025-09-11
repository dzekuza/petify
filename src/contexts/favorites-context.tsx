'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth-context'
import { favoritesApi, FavoriteWithProvider } from '@/lib/favorites'

interface FavoritesContextType {
  favorites: FavoriteWithProvider[]
  favoriteIds: Set<string>
  loading: boolean
  error: string | null
  addToFavorites: (providerId: string) => Promise<boolean>
  removeFromFavorites: (providerId: string) => Promise<boolean>
  toggleFavorite: (providerId: string) => Promise<boolean>
  isFavorited: (providerId: string) => boolean
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteWithProvider[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch favorites when user changes
  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavorites([])
      setFavoriteIds(new Set())
      return
    }

    try {
      setLoading(true)
      setError(null)
      const userFavorites = await favoritesApi.getFavorites(user.id)
      setFavorites(userFavorites)
      setFavoriteIds(new Set(userFavorites.map(fav => fav.provider_id)))
    } catch (err) {
      // Error handling - could be logged to monitoring service in production
      setError('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const addToFavorites = useCallback(async (providerId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('You must be logged in to add favorites')
      return false
    }

    try {
      setError(null)
      await favoritesApi.addToFavorites(user.id, providerId)
      setFavoriteIds(prev => new Set([...prev, providerId]))
      // Refresh the full favorites list to get the provider data
      await fetchFavorites()
      return true
    } catch (err) {
      // Error handling - could be logged to monitoring service in production
      setError('Failed to add to favorites')
      return false
    }
  }, [user?.id, fetchFavorites])

  const removeFromFavorites = useCallback(async (providerId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('You must be logged in to remove favorites')
      return false
    }

    try {
      setError(null)
      // Only update state after successful API call
      await favoritesApi.removeFromFavorites(user.id, providerId)
      
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(providerId)
        return newSet
      })
      setFavorites(prev => prev.filter(fav => fav.provider_id !== providerId))
      
      return true
    } catch (err) {
      // Error handling - could be logged to monitoring service in production
      console.error('Error removing from favorites:', err)
      setError('Failed to remove from favorites')
      return false
    }
  }, [user?.id])

  const toggleFavorite = useCallback(async (providerId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('You must be logged in to manage favorites')
      return false
    }

    try {
      setError(null)
      const isNowFavorited = await favoritesApi.toggleFavorite(user.id, providerId)
      
      if (isNowFavorited) {
        setFavoriteIds(prev => new Set([...prev, providerId]))
        // Refresh to get the full provider data
        await fetchFavorites()
      } else {
        setFavoriteIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(providerId)
          return newSet
        })
        setFavorites(prev => prev.filter(fav => fav.provider_id !== providerId))
      }
      
      return isNowFavorited
    } catch (err) {
      // Error handling - could be logged to monitoring service in production
      setError('Failed to update favorites')
      return false
    }
  }, [user?.id, fetchFavorites])

  const isFavorited = useCallback((providerId: string): boolean => {
    return favoriteIds.has(providerId)
  }, [favoriteIds])

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites()
  }, [fetchFavorites])

  const value: FavoritesContextType = {
    favorites,
    favoriteIds,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    refreshFavorites
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
