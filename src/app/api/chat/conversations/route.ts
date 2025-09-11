import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Get conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the current user from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let conversations

    if (userData.role === 'provider') {
      // Get conversations where user is the provider
      const { data: providerData } = await supabaseClient
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!providerData) {
        return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
      }

      const { data, error } = await supabaseClient
        .from('conversations')
        .select(`
          *,
          customer:users!conversations_customer_id_fkey(
            id,
            full_name,
            avatar_url,
            email
          ),
          provider:providers!conversations_provider_id_fkey(
            id,
            business_name,
            user_id,
            user:users!providers_user_id_fkey(
              id,
              full_name,
              avatar_url,
              email
            )
          ),
          messages:messages(
            id,
            content,
            sender_id,
            created_at,
            is_read
          )
        `)
        .eq('provider_id', providerData.id)
        .order('last_message_at', { ascending: false })

      conversations = data
    } else {
      // Get conversations where user is the customer
      const { data, error } = await supabaseClient
        .from('conversations')
        .select(`
          *,
          customer:users!conversations_customer_id_fkey(
            id,
            full_name,
            avatar_url,
            email
          ),
          provider:providers!conversations_provider_id_fkey(
            id,
            business_name,
            user_id,
            user:users!providers_user_id_fkey(
              id,
              full_name,
              avatar_url,
              email
            )
          ),
          messages:messages(
            id,
            content,
            sender_id,
            created_at,
            is_read
          )
        `)
        .eq('customer_id', user.id)
        .order('last_message_at', { ascending: false })

      conversations = data
    }

    return NextResponse.json({ conversations }, { status: 200 })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customer_id, provider_id, booking_id } = await request.json()

    // Check if conversation already exists
    const { data: existingConversation } = await supabaseClient
      .from('conversations')
      .select('id')
      .eq('customer_id', customer_id)
      .eq('provider_id', provider_id)
      .single()

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation }, { status: 200 })
    }

    // Create new conversation
    const { data: conversation, error } = await supabaseClient
      .from('conversations')
      .insert({
        customer_id,
        provider_id,
        booking_id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
