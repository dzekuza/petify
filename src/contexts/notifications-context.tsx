'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  type: 'new_booking' | 'upcoming_booking' | 'booking_cancelled' | 'booking_completed' | 'payment_received' | 'review_received' | 'error'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  provider_id: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  fetchNotifications: () => Promise<void>
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

interface NotificationsProviderProps {
  children: ReactNode
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasTableError, setHasTableError] = useState(false)
  const { user } = useAuth()

  const unreadCount = notifications.filter(n => !n.read).length

  const fetchNotifications = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        // Check if it's a table not found error or permission issue
        if (error.code === 'PGRST116' || error.message?.includes('relation "notifications" does not exist')) {
          console.warn('Notifications table does not exist yet. This is normal for new installations.')
          setHasTableError(true)
        } else if (error.code === '42501' || error.message?.includes('permission denied')) {
          console.warn('Permission denied for notifications table. Check RLS policies.')
          setHasTableError(true)
        }
        // Set empty array to prevent UI issues
        setNotifications([])
        return
      }

      // Reset table error if successful
      setHasTableError(false)

      // Transform the data to match our interface
      const transformedData = (data || []).map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        read: notification.read || false,
        created_at: notification.created_at,
        provider_id: notification.provider_id
      }))

      setNotifications(transformedData)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Set empty array on error to prevent UI issues
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('provider_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single()

      if (error) {
        console.error('Error adding notification:', error)
        return
      }

      if (data) {
        // Transform the data to match our interface
        const transformedNotification = {
          id: data.id,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          read: data.read || false,
          created_at: data.created_at,
          provider_id: data.provider_id
        }
        setNotifications(prev => [transformedNotification, ...prev])
      }
    } catch (error) {
      console.error('Error adding notification:', error)
    }
  }

  // Fetch notifications when user changes
  useEffect(() => {
    if (user?.id) {
      setHasTableError(false) // Reset table error for new user
      fetchNotifications()
    } else {
      setNotifications([])
      setHasTableError(false)
    }
  }, [user?.id])

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user?.id || hasTableError) return

    // Only set up subscription if we have notifications (table exists)
    if (notifications.length === 0 && isLoading === false) {
      return
    }

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `provider_id=eq.${user.id}`
        },
        (payload) => {
          const rawNotification = payload.new as any
          const newNotification: Notification = {
            id: rawNotification.id,
            type: rawNotification.type,
            title: rawNotification.title,
            message: rawNotification.message,
            data: rawNotification.data || {},
            read: rawNotification.read || false,
            created_at: rawNotification.created_at,
            provider_id: rawNotification.provider_id
          }
          setNotifications(prev => [newNotification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `provider_id=eq.${user.id}`
        },
        (payload) => {
          const rawNotification = payload.new as any
          const updatedNotification: Notification = {
            id: rawNotification.id,
            type: rawNotification.type,
            title: rawNotification.title,
            message: rawNotification.message,
            data: rawNotification.data || {},
            read: rawNotification.read || false,
            created_at: rawNotification.created_at,
            provider_id: rawNotification.provider_id
          }
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === updatedNotification.id 
                ? updatedNotification 
                : notification
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, notifications.length, isLoading, hasTableError])

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    addNotification
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}