'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  Star, 
  X, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  CheckCheck
} from 'lucide-react'
import { useNotifications, Notification } from '@/contexts/notifications-context'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { lt } from 'date-fns/locale'

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_booking':
      return <Calendar className="h-5 w-5 text-blue-500" />
    case 'upcoming_booking':
      return <Clock className="h-5 w-5 text-orange-500" />
    case 'booking_cancelled':
      return <X className="h-5 w-5 text-red-500" />
    case 'booking_completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'payment_received':
      return <DollarSign className="h-5 w-5 text-green-600" />
    case 'review_received':
      return <Star className="h-5 w-5 text-yellow-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
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
      return 'bg-gray-50 border-gray-200'
  }
}

const getTypeLabel = (type: Notification['type']) => {
  switch (type) {
    case 'new_booking':
      return 'Nauji rezervavimai'
    case 'upcoming_booking':
      return 'Artėjantys rezervavimai'
    case 'booking_cancelled':
      return 'Atšaukti rezervavimai'
    case 'booking_completed':
      return 'Užbaigti rezervavimai'
    case 'payment_received':
      return 'Mokėjimai'
    case 'review_received':
      return 'Atsiliepimai'
    default:
      return 'Kiti'
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
        "p-4 border-l-4 cursor-pointer transition-colors hover:bg-gray-50 rounded-lg",
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
              !notification.read ? "text-gray-900" : "text-gray-700"
            )}>
              {notification.title}
            </p>
            <div className="flex items-center space-x-2">
              {!notification.read && (
                <Badge variant="secondary" className="text-xs">
                  Naujas
                </Badge>
              )}
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true, 
                  locale: lt 
                })}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {(() => {
                const data = notification.data as NotificationData
                return (
                  <>
                    {data.customer_name && (
                      <p>Klientas: {data.customer_name}</p>
                    )}
                    {data.service_date && (
                      <p>Data: {new Date(data.service_date).toLocaleDateString('lt-LT')}</p>
                    )}
                    {data.amount && (
                      <p>Suma: €{data.amount}</p>
                    )}
                    {data.rating && (
                      <p>Įvertinimas: {data.rating}/5</p>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProviderNotificationsPage() {
  const router = useRouter()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()

  const [activeTab, setActiveTab] = useState('all')

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !notification.read
    return notification.type === activeTab
  })

  const notificationTypes = [
    { value: 'all', label: 'Visi', count: notifications.length },
    { value: 'unread', label: 'Neskaityti', count: unreadCount },
    { value: 'new_booking', label: 'Nauji rezervavimai', count: notifications.filter(n => n.type === 'new_booking').length },
    { value: 'upcoming_booking', label: 'Artėjantys', count: notifications.filter(n => n.type === 'upcoming_booking').length },
    { value: 'payment_received', label: 'Mokėjimai', count: notifications.filter(n => n.type === 'payment_received').length },
    { value: 'review_received', label: 'Atsiliepimai', count: notifications.filter(n => n.type === 'review_received').length },
  ]

  return (
    <Layout hideFooter={true}>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 pt-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Pranešimai</h1>
                  <p className="text-gray-600">
                    {unreadCount > 0 
                      ? `Turite ${unreadCount} neskaitytų pranešimų`
                      : 'Nėra neskaitytų pranešimų'
                    }
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="mb-4"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Pažymėti visus kaip skaitytus
                </Button>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {notificationTypes.map((type) => (
                  <TabsTrigger 
                    key={type.value} 
                    value={type.value}
                    className="relative"
                  >
                    {type.label}
                    {type.count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {type.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>
                        {activeTab === 'all' && 'Visi pranešimai'}
                        {activeTab === 'unread' && 'Neskaityti pranešimai'}
                        {activeTab !== 'all' && activeTab !== 'unread' && getTypeLabel(activeTab as Notification['type'])}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {filteredNotifications.length} pranešimų
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        Kraunama...
                      </div>
                    ) : filteredNotifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nėra pranešimų</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {filteredNotifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkAsRead={handleMarkAsRead}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
