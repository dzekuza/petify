import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'customer' | 'provider' | 'admin'
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'customer' | 'provider' | 'admin'
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'customer' | 'provider' | 'admin'
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_providers: {
        Row: {
          id: string
          user_id: string
          business_name: string
          description: string
          services: string[]
          location: {
            address: string
            city: string
            state: string
            zip_code: string
            coordinates: {
              lat: number
              lng: number
            }
          }
          rating: number
          review_count: number
          price_range: {
            min: number
            max: number
          }
          availability: {
            monday: Array<{ start: string; end: string; available: boolean }>
            tuesday: Array<{ start: string; end: string; available: boolean }>
            wednesday: Array<{ start: string; end: string; available: boolean }>
            thursday: Array<{ start: string; end: string; available: boolean }>
            friday: Array<{ start: string; end: string; available: boolean }>
            saturday: Array<{ start: string; end: string; available: boolean }>
            sunday: Array<{ start: string; end: string; available: boolean }>
          }
          images: string[]
          certifications: string[] | null
          experience: number
          status: 'active' | 'inactive' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          description: string
          services: string[]
          location: {
            address: string
            city: string
            state: string
            zip_code: string
            coordinates: {
              lat: number
              lng: number
            }
          }
          rating?: number
          review_count?: number
          price_range: {
            min: number
            max: number
          }
          availability: {
            monday: Array<{ start: string; end: string; available: boolean }>
            tuesday: Array<{ start: string; end: string; available: boolean }>
            wednesday: Array<{ start: string; end: string; available: boolean }>
            thursday: Array<{ start: string; end: string; available: boolean }>
            friday: Array<{ start: string; end: string; available: boolean }>
            saturday: Array<{ start: string; end: string; available: boolean }>
            sunday: Array<{ start: string; end: string; available: boolean }>
          }
          images: string[]
          certifications?: string[] | null
          experience: number
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          description?: string
          services?: string[]
          location?: {
            address: string
            city: string
            state: string
            zip_code: string
            coordinates: {
              lat: number
              lng: number
            }
          }
          rating?: number
          review_count?: number
          price_range?: {
            min: number
            max: number
          }
          availability?: {
            monday: Array<{ start: string; end: string; available: boolean }>
            tuesday: Array<{ start: string; end: string; available: boolean }>
            wednesday: Array<{ start: string; end: string; available: boolean }>
            thursday: Array<{ start: string; end: string; available: boolean }>
            friday: Array<{ start: string; end: string; available: boolean }>
            saturday: Array<{ start: string; end: string; available: boolean }>
            sunday: Array<{ start: string; end: string; available: boolean }>
          }
          images?: string[]
          certifications?: string[] | null
          experience?: number
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          provider_id: string
          category: string
          name: string
          description: string
          price: number
          duration: number
          max_pets: number
          requirements: string[] | null
          includes: string[] | null
          images: string[]
          status: 'active' | 'inactive' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          category: string
          name: string
          description: string
          price: number
          duration: number
          max_pets: number
          requirements?: string[] | null
          includes?: string[] | null
          images: string[]
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          category?: string
          name?: string
          description?: string
          price?: number
          duration?: number
          max_pets?: number
          requirements?: string[] | null
          includes?: string[] | null
          images?: string[]
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          provider_id: string
          service_id: string
          date: string
          time_slot: {
            start: string
            end: string
            available: boolean
          }
          pets: Array<{
            id: string
            name: string
            species: string
            breed?: string
            age: number
            weight?: number
            special_needs?: string[]
            medical_notes?: string
          }>
          total_price: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          provider_id: string
          service_id: string
          date: string
          time_slot: {
            start: string
            end: string
            available: boolean
          }
          pets: Array<{
            id: string
            name: string
            species: string
            breed?: string
            age: number
            weight?: number
            special_needs?: string[]
            medical_notes?: string
          }>
          total_price: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          provider_id?: string
          service_id?: string
          date?: string
          time_slot?: {
            start: string
            end: string
            available: boolean
          }
          pets?: Array<{
            id: string
            name: string
            species: string
            breed?: string
            age: number
            weight?: number
            special_needs?: string[]
            medical_notes?: string
          }>
          total_price?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          owner_id: string
          name: string
          species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
          breed: string | null
          age: number
          weight: number | null
          special_needs: string[] | null
          medical_notes: string | null
          images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
          breed?: string | null
          age: number
          weight?: number | null
          special_needs?: string[] | null
          medical_notes?: string | null
          images: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
          breed?: string | null
          age?: number
          weight?: number | null
          special_needs?: string[] | null
          medical_notes?: string | null
          images?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          customer_id: string
          provider_id: string
          rating: number
          comment: string
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          customer_id: string
          provider_id: string
          rating: number
          comment: string
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          customer_id?: string
          provider_id?: string
          rating?: number
          comment?: string
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
