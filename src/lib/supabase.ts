import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client (for browser usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Server-side Supabase client with service role key for API routes
// This should only be used in server-side code (API routes, server components)
export const createSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// For backward compatibility, create a default admin client
// This should only be used in server-side contexts
// Only create this if we're in a server environment
export const supabaseAdmin = typeof window === 'undefined' ? createSupabaseAdmin() : null

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_id: string | null
          duration_minutes: number
          end_time: string
          id: string
          location: Json | null
          payment_id: string | null
          payment_status: string | null
          pet_id: string | null
          provider_id: string | null
          service_id: string | null
          special_instructions: string | null
          start_time: string
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          duration_minutes: number
          end_time: string
          id?: string
          location?: Json | null
          payment_id?: string | null
          payment_status?: string | null
          pet_id?: string | null
          provider_id?: string | null
          service_id?: string | null
          special_instructions?: string | null
          start_time: string
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          duration_minutes?: number
          end_time?: string
          id?: string
          location?: Json | null
          payment_id?: string | null
          payment_status?: string | null
          pet_id?: string | null
          provider_id?: string | null
          service_id?: string | null
          special_instructions?: string | null
          start_time?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          business_hours: Json | null
          business_name: string
          business_type: string | null
          certifications: string[] | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          experience_years: number | null
          id: string
          images: string[] | null
          is_verified: boolean | null
          location: Json
          price_range: Json | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          verification_documents: Json | null
        }
        Insert: {
          availability?: Json | null
          avatar_url?: string | null
          business_hours?: Json | null
          business_name: string
          business_type?: string | null
          certifications?: string[] | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          experience_years?: number | null
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          location: Json
          price_range?: Json | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_documents?: Json | null
        }
        Update: {
          availability?: Json | null
          avatar_url?: string | null
          business_hours?: Json | null
          business_name?: string
          business_type?: string | null
          certifications?: string[] | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          experience_years?: number | null
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          location?: Json
          price_range?: Json | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_documents?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
