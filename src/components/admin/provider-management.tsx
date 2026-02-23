'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import type { Provider } from './types'

interface ProviderManagementProps {
  providers: Provider[]
  loading: boolean
  onProviderUpdate: (providerId: string, updates: Partial<Provider>) => Promise<void>
}

export function ProviderManagement({ providers, loading, onProviderUpdate }: ProviderManagementProps) {
  const [editProviderModal, setEditProviderModal] = useState<{ open: boolean; provider: Provider | null }>({ open: false, provider: null })
  const [editProviderForm, setEditProviderForm] = useState({ status: '', is_verified: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEditProvider = (provider: Provider) => {
    setEditProviderForm({
      status: provider.status || '',
      is_verified: provider.is_verified || false
    })
    setEditProviderModal({ open: true, provider })
  }

  const handleSaveProvider = async () => {
    if (!editProviderModal.provider) return
    
    setIsSubmitting(true)
    try {
      await onProviderUpdate(editProviderModal.provider.id, editProviderForm)
      setEditProviderModal({ open: false, provider: null })
      toast.success('Provider updated successfully')
    } catch (error) {
      toast.error('Failed to update provider')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Provider Management</CardTitle>
          <CardDescription>Manage service providers and their verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Provider Management</CardTitle>
          <CardDescription>Manage service providers and their verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {provider.business_name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{provider.business_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {provider.users?.full_name} • {provider.users?.email}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                        {provider.status}
                      </Badge>
                      <Badge variant={provider.is_verified ? 'default' : 'destructive'}>
                        {provider.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge variant="outline">
                        {provider.business_type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {provider.location?.city}, {provider.location?.state}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProvider(provider)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Provider Modal */}
      <Dialog open={editProviderModal.open} onOpenChange={(open) => setEditProviderModal({ open, provider: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
            <DialogDescription>
              Update provider status and verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <p className="text-sm text-muted-foreground">{editProviderModal.provider?.business_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editProviderForm.status}
                onValueChange={(value) => setEditProviderForm({ ...editProviderForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_verified"
                checked={editProviderForm.is_verified}
                onChange={(e) => setEditProviderForm({ ...editProviderForm, is_verified: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_verified" className="text-sm font-medium">
                Verified Provider
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProviderModal({ open: false, provider: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveProvider} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
