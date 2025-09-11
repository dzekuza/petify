import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Get messages for a conversation
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select(`
        *,
        customer:users!conversations_customer_id_fkey(id),
        provider:providers!conversations_provider_id_fkey(
          id,
          user_id
        )
      `)
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check if user is part of this conversation
    const isCustomer = conversation.customer_id === user.id
    const isProvider = conversation.provider?.user_id === user.id

    if (!isCustomer && !isProvider) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages
    const { data: messages, error } = await supabaseClient
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Send a new message
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

    const { conversation_id, content, message_type = 'text' } = await request.json()

    if (!conversation_id || !content) {
      return NextResponse.json({ error: 'Conversation ID and content are required' }, { status: 400 })
    }

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select(`
        *,
        customer:users!conversations_customer_id_fkey(id),
        provider:providers!conversations_provider_id_fkey(
          id,
          user_id
        )
      `)
      .eq('id', conversation_id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check if user is part of this conversation
    const isCustomer = conversation.customer_id === user.id
    const isProvider = conversation.provider?.user_id === user.id

    if (!isCustomer && !isProvider) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create message
    const { data: message, error } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content,
        message_type
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update conversation's last_message_at
    await supabaseClient
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation_id)

    // Create notification for the recipient
    const recipientId = isCustomer ? conversation.provider?.user_id : conversation.customer_id
    
    if (recipientId) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: recipientId,
          title: 'New Message',
          message: `You have a new message from ${user.user_metadata?.full_name || user.email}`,
          type: 'message',
          data: {
            conversation_id,
            message_id: message.id
          }
        })
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
