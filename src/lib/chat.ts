import { supabase } from './supabase'

export interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar: string
    isOnline: boolean
  }
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
  reactions?: Array<{
    emoji: string
    count: number
    reacted: boolean
  }>
  message_type?: string
  is_read?: boolean
  created_at: string
}

export interface Conversation {
  id: string
  customer_id: string
  provider_id: string
  booking_id?: string
  last_message_at: string
  created_at: string
  customer?: {
    id: string
    full_name: string
    avatar_url: string
    email: string
  }
  provider?: {
    id: string
    business_name: string
    user_id: string
    user: {
      id: string
      full_name: string
      avatar_url: string
      email: string
    }
  }
  messages?: Message[]
}

class ChatService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No authentication token found')
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch('/api/chat/conversations', {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      return data.conversations || []
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return []
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`/api/chat/messages?conversation_id=${conversationId}`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      return this.transformMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message | null> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversation_id: conversationId,
          content,
          message_type: 'text'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      return this.transformMessage(data.message)
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }

  async createConversation(customerId: string, providerId: string, bookingId?: string): Promise<Conversation | null> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch('/api/chat/start-conversation', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          provider_id: providerId,
          booking_id: bookingId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to create conversation:', errorData)
        throw new Error(`Failed to create conversation: ${errorData.error || 'Unknown error'}`)
      }

      const data = await response.json()
      return data.conversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      return null
    }
  }

  private transformMessages(messages: any[]): Message[] {
    return messages.map(msg => this.transformMessage(msg))
  }

  private transformMessage(msg: any): Message {
    const sender = msg.sender || {}
    const isRead = msg.is_read || false
    
    return {
      id: msg.id,
      content: msg.content,
      sender: {
        id: sender.id || '',
        name: sender.full_name || sender.email || 'Unknown',
        avatar: sender.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isOnline: true // We'll implement real-time presence later
      },
      timestamp: new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Vilnius'
      }),
      status: isRead ? 'read' : 'delivered',
      message_type: msg.message_type || 'text',
      is_read: isRead,
      created_at: msg.created_at
    }
  }

  // Real-time subscription for new messages
  subscribeToMessages(conversationId: string, onMessage: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const message = this.transformMessage(payload.new)
          onMessage(message)
        }
      )
      .subscribe()
  }

  // Real-time subscription for conversation updates
  async subscribeToConversations(onConversationUpdate: (conversation: Conversation) => void) {
    const { data: { user } } = await supabase.auth.getUser()
    
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          // Only process if the current user is involved
          const newConversation = payload.new as Conversation
          if (newConversation.customer_id === user?.id || 
              newConversation.provider_id === user?.id) {
            onConversationUpdate(newConversation)
          }
        }
      )
      .subscribe()
  }
}

export const chatService = new ChatService()
