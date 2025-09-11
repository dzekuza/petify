'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Clock,
  Save
} from 'lucide-react'
import { toast } from 'sonner'

interface GeneralBusinessInfoProps {
  providerData: any
  onUpdate: (data: any) => void
}

interface BusinessHours {
  day: string
  open: string
  close: string
  closed: boolean
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

export function GeneralBusinessInfo({ providerData, onUpdate }: GeneralBusinessInfoProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Lithuania'
  })

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(() => {
    // Initialize with default business hours
    return DAYS_OF_WEEK.map(day => ({
      day: day.value,
      open: '09:00',
      close: '17:00',
      closed: false
    }))
  })

  const [logo, setLogo] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(providerData?.logo_url || null)
  const [coverPreview, setCoverPreview] = useState<string | null>(providerData?.cover_image_url || null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(providerData?.gallery_images || [])

  // Update form data and previews when providerData changes
  useEffect(() => {
    if (providerData) {
      console.log('GeneralBusinessInfo received providerData:', {
        logo_url: providerData.logo_url,
        cover_image_url: providerData.cover_image_url,
        gallery_images: providerData.gallery_images,
        images: providerData.images,
        avatar_url: providerData.avatar_url,
        contact_info: providerData.contact_info,
        location: providerData.location
      })
      
      // Update form data with existing provider data
      setFormData({
        businessName: providerData.business_name || '',
        businessDescription: providerData.description || '',
        phone: providerData.contact_info?.phone || '',
        email: providerData.contact_info?.email || '',
        website: providerData.contact_info?.website || '',
        address: providerData.location?.address || '',
        city: providerData.location?.city || '',
        state: providerData.location?.state || '',
        zipCode: providerData.location?.zip_code || '',
        country: providerData.location?.country || 'Lithuania'
      })
      
      // Update business hours
      console.log('Business hours from providerData:', providerData.business_hours)
      if (Array.isArray(providerData.business_hours) && providerData.business_hours.length > 0) {
        console.log('Setting business hours from provider data')
        setBusinessHours(providerData.business_hours)
      } else {
        console.log('Setting default business hours')
        // Set default business hours if no data
        const defaultHours = DAYS_OF_WEEK.map(day => ({
          day: day.value,
          open: '09:00',
          close: '17:00',
          closed: false
        }))
        setBusinessHours(defaultHours)
      }
      
      // Update media previews
      setLogoPreview(providerData.logo_url || null)
      setCoverPreview(providerData.cover_image_url || null)
      setGalleryPreviews(providerData.gallery_images || [])
    }
  }, [providerData])

  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBusinessHoursChange = (day: string, field: keyof BusinessHours, value: string | boolean) => {
    setBusinessHours(prev => 
      prev.map(hour => 
        hour.day === day ? { ...hour, [field]: value } : hour
      )
    )
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Logo file size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      setLogo(file)
      const reader = new FileReader()
      reader.onload = (e) => setLogoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Cover image file size must be less than 10MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      setCoverImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setCoverPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length + galleryImages.length > 10) {
      toast.error('Maximum 10 gallery images allowed')
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      return true
    })

    setGalleryImages(prev => [...prev, ...validFiles])
    
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setGalleryPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeLogo = () => {
    setLogo(null)
    setLogoPreview(null)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const removeCover = () => {
    setCoverImage(null)
    setCoverPreview(null)
    if (coverInputRef.current) {
      coverInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    try {
      const updatedData = {
        ...formData,
        business_hours: businessHours,
        logo: logo,
        cover_image: coverImage,
        gallery_images: galleryImages,
        logo_url: logoPreview,
        cover_image_url: coverPreview,
        gallery_image_urls: galleryPreviews
      }
      
      onUpdate(updatedData)
      toast.success('Business information saved successfully!')
    } catch (error) {
      console.error('Error saving business info:', error)
      toast.error('Failed to save business information')
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>General Business Information</CardTitle>
          <CardDescription>
            Update your basic business information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                value={providerData?.business_type || 'individual'}
                disabled
                className="bg-gray-50 text-gray-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description *</Label>
            <Textarea
              id="businessDescription"
              value={formData.businessDescription}
              onChange={(e) => handleInputChange('businessDescription', e.target.value)}
              placeholder="Describe your business and services"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Update your contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+370 600 00000"
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="business@example.com"
                type="email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.yourwebsite.com"
              type="url"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
          <CardDescription>
            Update your business location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Street address"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Vilnius"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Region</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Vilniaus apskritis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="01001"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleInputChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lithuania">Lithuania</SelectItem>
                <SelectItem value="Latvia">Latvia</SelectItem>
                <SelectItem value="Estonia">Estonia</SelectItem>
                <SelectItem value="Poland">Poland</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>
            Set your operating hours for each day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {console.log('Rendering business hours:', businessHours, 'Array check:', Array.isArray(businessHours), 'Length:', businessHours.length)}
          {businessHours.map((hour, index) => (
              <div key={hour.day} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label className="text-sm font-medium capitalize">
                    {DAYS_OF_WEEK.find(d => d.value === hour.day)?.label}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!hour.closed}
                    onChange={(e) => handleBusinessHoursChange(hour.day, 'closed', !e.target.checked)}
                    className="rounded"
                  />
                  <Label className="text-sm">Open</Label>
                </div>
                
                {!hour.closed && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">From:</Label>
                      <Input
                        type="time"
                        value={hour.open}
                        onChange={(e) => handleBusinessHoursChange(hour.day, 'open', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">To:</Label>
                      <Input
                        type="time"
                        value={hour.close}
                        onChange={(e) => handleBusinessHoursChange(hour.day, 'close', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </>
                )}
                
                {hour.closed && (
                  <Badge variant="secondary">Closed</Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Loading business hours...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
          <CardDescription>
            Upload your business logo (max 5MB, recommended: 200x200px)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {logoPreview ? (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium">Logo uploaded</p>
                <p className="text-xs text-gray-500">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">No logo uploaded</p>
              <p className="text-xs text-gray-500 mb-4">Upload a logo to represent your business</p>
            </div>
          )}
          
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          
          <Button
            variant="outline"
            onClick={() => logoInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {logoPreview ? 'Change Logo' : 'Upload Logo'}
          </Button>
        </CardContent>
      </Card>

      {/* Cover Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
          <CardDescription>
            Upload a cover image for your business (max 10MB, recommended: 1200x400px)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {coverPreview ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={removeCover}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">No cover image uploaded</p>
              <p className="text-xs text-gray-500 mb-4">Upload a cover image to showcase your business</p>
            </div>
          )}
          
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
          
          <Button
            variant="outline"
            onClick={() => coverInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {coverPreview ? 'Change Cover Image' : 'Upload Cover Image'}
          </Button>
        </CardContent>
      </Card>

      {/* Gallery Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
          <CardDescription>
            Upload images to showcase your business (max 10 images, 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {galleryPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => removeGalleryImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {galleryPreviews.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">No gallery images uploaded</p>
              <p className="text-xs text-gray-500 mb-4">Upload images to showcase your business</p>
            </div>
          )}
          
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            className="hidden"
          />
          
          <Button
            variant="outline"
            onClick={() => galleryInputRef.current?.click()}
            className="w-full"
            disabled={galleryImages.length >= 10}
          >
            <Upload className="h-4 w-4 mr-2" />
            {galleryPreviews.length > 0 ? 'Add More Images' : 'Upload Gallery Images'}
            {galleryImages.length > 0 && ` (${galleryImages.length}/10)`}
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save General Settings
        </Button>
      </div>
    </div>
  )
}
