import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateProviderId, checkRateLimit } from '@/lib/sanitization'

// Start a conversation between customer and provider
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

    // Check rate limit - more permissive for development
    if (checkRateLimit(user.id, 20, 60000)) { // 20 conversations per minute for development
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    const { provider_id, booking_id } = await request.json()

    if (!provider_id) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 })
    }

    // Validate provider ID format
    if (!validateProviderId(provider_id)) {
      return NextResponse.json({ error: 'Invalid provider ID format' }, { status: 400 })
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabaseClient
      .from('conversations')
      .select('id')
      .eq('customer_id', user.id)
      .eq('provider_id', provider_id)
      .single()

    if (existingConversation) {
      return NextResponse.json({ 
        conversation: existingConversation,
        message: 'Conversation already exists'
      }, { status: 200 })
    }

    // Create new conversation
    const { data: conversation, error } = await supabaseClient
      .from('conversations')
      .insert({
        customer_id: user.id,
        provider_id,
        booking_id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json({ 
      conversation,
      message: 'Conversation created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error starting conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


