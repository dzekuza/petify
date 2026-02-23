'use client'

import React from 'react'
import { Bell, Calendar, DollarSign, Star, X, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, Notification } from '@/contexts/notifications-context'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { lt } from 'date-fns/locale'

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_booking':
      return <Calendar className="h-4 w-4 text-blue-500" />
    case 'upcoming_booking':
      return <Clock className="h-4 w-4 text-orange-500" />
    case 'booking_cancelled':
      return <X className="h-4 w-4 text-red-500" />
    case 'booking_completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'payment_received':
      return <DollarSign className="h-4 w-4 text-green-600" />
    case 'review_received':
      return <Star className="h-4 w-4 text-yellow-500" />
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />
  }
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'new_booking':
      return 'bg-blue-50 border-blue-200'
    case 'upcoming_booking':
      return 'bg-orange-50 border-orange-200'
    case 'booking_cancelled':
      return 'bg-red-50 border-red-200'
    case 'booking_completed':
      return 'bg-green-50 border-green-200'
    case 'payment_received':
      return 'bg-green-50 border-green-200'
    case 'review_received':
      return 'bg-yellow-50 border-yellow-200'
    default:
      return 'bg-muted border-border'
  }
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={cn(
        "p-3 border-l-4 cursor-pointer transition-colors hover:bg-muted",
        getNotificationColor(notification.type),
        !notification.read && "bg-blue-50/50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-sm font-medium",
              !notification.read ? "text-foreground" : "text-foreground"
            )}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true, 
              locale: lt 
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export const NotificationsDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pranešimai</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Pažymėti visus kaip skaitytus
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Kraunama...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
              <p>Nėra pranešimų</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-muted">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                // Navigate to full notifications page
                window.location.href = '/provider/notifications'
              }}
            >
              Peržiūrėti visus pranešimus
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}