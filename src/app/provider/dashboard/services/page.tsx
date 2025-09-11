'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { dashboardApi } from '@/lib/dashboard'
import { serviceApi } from '@/lib/services'
import { Plus, Scissors } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ServiceItem {
  id: string
  name: string
  description: string
  price: number
  images?: string[]
}

export default function ProviderServicesPage() {
  const { user } = useAuth()
  const [providerId, setProviderId] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Add service form state (optimized for groomers)
  const [category, setCategory] = useState<'grooming' | 'training' | 'veterinary' | 'boarding' | 'sitting' | 'adoption'>('grooming')
  const [businessType, setBusinessType] = useState<string>('grooming')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [duration, setDuration] = useState<number>(60)
  const [maxPets, setMaxPets] = useState<number>(1)
  const [requirements, setRequirements] = useState('')
  const [includes, setIncludes] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      try {
        setError(null)
        setLoading(true)
        const provider = await dashboardApi.getProviderByUserId(user.id)
        if (!provider?.id) {
          setError('Provider not found')
          setLoading(false)
          return
        }
        setProviderId(provider.id)
        const bt = (provider as any).business_type || 'grooming'
        setBusinessType(bt)
        // Map business type to service category
        const mapped = ['grooming','training','veterinary','boarding','sitting','adoption'].includes(bt) ? bt : 'grooming'
        setCategory(mapped as any)
        const list = await serviceApi.getServicesByProvider(provider.id)
        setServices((list || []) as ServiceItem[])
      } catch (e) {
        setError('Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const handleCreateService = async () => {
    if (!providerId) return
    if (!name || !description || price <= 0 || duration <= 0) {
      setFormError('Please fill all required fields correctly')
      return
    }
    try {
      setFormError(null)
      setIsSubmitting(true)
      const created = await serviceApi.createService({
        providerId,
        category,
        name,
        description,
        price,
        duration,
        maxPets,
        requirements: requirements
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        includes: includes
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      })
      // Optimistically update list
      if (created) {
        setServices(prev => [
          {
            id: (created as any).id,
            name,
            description,
            price,
            images: [],
          },
          ...prev,
        ])
      }
      // Reset and close
      setIsAddOpen(false)
      setName('')
      setDescription('')
      setPrice(0)
      setDuration(60)
      setMaxPets(1)
      setRequirements('')
      setIncludes('')
    } catch (e) {
      setFormError('Failed to create service')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="provider">
      <>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {businessType === 'adoption' ? 'Gyvūnų tipai' : 'Paslaugos'}
            </h1>
            <p className="text-gray-600 text-sm">
              {businessType === 'adoption' 
                ? 'Kurkite ir tvarkykite gyvūnų tipus, kuriuos parduodate' 
                : 'Kurkite ir tvarkykite paslaugas, kurias teikiate'
              }
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> 
                {businessType === 'adoption' ? 'Pridėti gyvūnų tipą' : 'Pridėti paslaugą'}
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-service-desc">
              <DialogHeader>
                <DialogTitle>
                  {businessType === 'adoption' ? 'Pridėti naują gyvūnų tipą' : 'Pridėti naują paslaugą'}
                </DialogTitle>
              </DialogHeader>
              <p id="add-service-desc" className="sr-only">Fill in service details and save to add it to your offerings.</p>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Input value={category} readOnly aria-readonly />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Full Groom Package" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what is included" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (€)</Label>
                    <Input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input id="duration" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxPets">Max pets</Label>
                    <Input id="maxPets" type="number" min={1} value={maxPets} onChange={(e) => setMaxPets(Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="requirements">Requirements (comma separated)</Label>
                  <Input id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="e.g. Vaccination proof" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="includes">Includes (comma separated)</Label>
                  <Input id="includes" value={includes} onChange={(e) => setIncludes(e.target.value)} placeholder="e.g. Bath, nail trim, ear cleaning" />
                </div>
                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleCreateService} disabled={isSubmitting || !providerId}>{isSubmitting ? 'Saving...' : 'Save Service'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {businessType === 'adoption' ? 'Jūsų gyvūnų tipai' : 'Jūsų paslaugos'}
            </CardTitle>
            <CardDescription>
              {businessType === 'adoption' 
                ? 'Gyvūnų tipai, matomi klientams ieškant' 
                : 'Paslaugos, matomos klientams rezervuojant'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : services.length === 0 ? (
              <div className="text-center py-10">
                <Scissors className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {businessType === 'adoption' ? 'Dar nėra gyvūnų tipų' : 'Dar nėra paslaugų'}
                </p>
                <p className="text-sm text-gray-500">
                  {businessType === 'adoption' 
                    ? 'Sukurkite pirmąjį gyvūnų tipą, kad pradėtumėte gauti užklausas.' 
                    : 'Sukurkite pirmąją paslaugą, kad pradėtumėte gauti rezervacijas.'
                  }
                </p>
                <Button onClick={() => setIsAddOpen(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> 
                  {businessType === 'adoption' ? 'Pridėti gyvūnų tipą' : 'Pridėti paslaugą'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(svc => (
                  <div key={svc.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{svc.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{svc.description}</p>
                      </div>
                      <span className="text-sm font-semibold">€{(svc.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.location.assign(`/providers/${providerId}`)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    </ProtectedRoute>
  )
}

