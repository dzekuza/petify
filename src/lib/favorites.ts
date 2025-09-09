import { supabase } from './supabase'

export interface Favorite {
  id: string
  user_id: string
  provider_id: string
  created_at: string
}

export interface FavoriteWithProvider extends Favorite {
  provider: {
    id: string
    business_name: string
    services: string[] | null
    rating: number | null
    review_count: number | null
    location: { address?: string } | null
    contact_info: { phone?: string } | null
  } | null
}

export const favoritesApi = {
  // Get all favorites for a user
  async getFavorites(userId: string): Promise<FavoriteWithProvider[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        user_id,
        provider_id,
        created_at,
        provider:providers(
          id,
          business_name,
          services,
          rating,
          review_count,
          location,
          contact_info
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favorites:', error)
      throw new Error('Failed to fetch favorites')
    }

    return data as unknown as FavoriteWithProvider[]
  },

  // Add a provider to favorites
  async addToFavorites(userId: string, providerId: string): Promise<Favorite> {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        provider_id: providerId
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding to favorites:', error)
      throw new Error('Failed to add to favorites')
    }

    return data
  },

  // Remove a provider from favorites
  async removeFromFavorites(userId: string, providerId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('provider_id', providerId)

    if (error) {
      console.error('Error removing from favorites:', error)
      throw new Error('Failed to remove from favorites')
    }
  },

  // Check if a provider is favorited by a user
  async isFavorited(userId: string, providerId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking favorite status:', error)
      throw new Error('Failed to check favorite status')
    }

    return !!data
  },

  // Toggle favorite status
  async toggleFavorite(userId: string, providerId: string): Promise<boolean> {
    const isCurrentlyFavorited = await this.isFavorited(userId, providerId)
    
    if (isCurrentlyFavorited) {
      await this.removeFromFavorites(userId, providerId)
      return false
    } else {
      await this.addToFavorites(userId, providerId)
      return true
    }
  }
}
