'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { InputField, TextareaField } from '@/components/ui/input-field'
import { ServiceProvider } from '@/types'
import { toast } from 'sonner'
import { Building2, Mail } from 'lucide-react'

interface ClaimBusinessWidgetProps {
  provider: ServiceProvider
  isMobile?: boolean
}

export function ClaimBusinessWidget({ 
  provider, 
  isMobile = false 
}: ClaimBusinessWidgetProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    message: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/claim-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: provider.id,
          providerName: provider.businessName,
          ...formData
        }),
      })

      if (response.ok) {
        toast.success('Prašymas sėkmingai išsiųstas! Susisieksime su jumis artimiausiu metu.')
        setIsDialogOpen(false)
        setFormData({ email: '', phone: '', name: '', message: '' })
      } else {
        throw new Error('Failed to submit claim request')
      }
    } catch (error) {
      console.error('Error submitting claim request:', error)
      toast.error('Įvyko klaida. Bandykite dar kartą.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="sticky top-8 space-y-4">
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-50 rounded-full">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ar tai jūsų verslas?
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Jei esate šio verslo savininkas, galite jį prisijungti prie mūsų platformos. 
              Pateikite prašymą ir mes susisieksime su jumis.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Mail className="mr-2 h-4 w-4" />
                Pateikti prašymą
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Prisijungti verslą</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Verslas:</strong> {provider.businessName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Adresas:</strong> {provider.location.address}, {provider.location.city}
                    </p>
                  </div>

                  <InputField
                    id="claim-name"
                    label="Jūsų vardas"
                    placeholder="Įveskite savo vardą"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />

                  <InputField
                    id="claim-email"
                    label="El. paštas"
                    type="email"
                    placeholder="jūsų@email.lt"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />

                  <InputField
                    id="claim-phone"
                    label="Telefono numeris"
                    type="tel"
                    placeholder="+370 6XX XXXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />

                  <TextareaField
                    id="claim-message"
                    label="Papildoma informacija"
                    placeholder="Papasakokite apie savo verslą, patirtį ar kitą svarbią informaciją..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Atšaukti
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Siunčiama...' : 'Pateikti prašymą'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="text-xs text-muted-foreground pt-2">
            Prašymas bus išsiųstas į info@petify.lt
          </div>
        </div>
      </div>
    </div>
  )
}
