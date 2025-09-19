import { supabase } from './supabase'

export interface ImageUploadResult {
  url: string
  path: string
}

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'pet-images'
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Nepalaikomas failo tipas. Naudokite JPEG, PNG arba WebP.' }
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'Failas per didelis. Maksimalus dydis: 5MB.' }
    }

    return { valid: true }
  }

  static async uploadImage(
    file: File, 
    folder: string = 'pets',
    userId?: string
  ): Promise<ImageUploadResult> {
    const validation = this.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`
    
    // Create path with folder structure
    const path = userId ? `${folder}/${userId}/${fileName}` : `${folder}/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading image:', error)
      throw new Error('Nepavyko įkelti nuotraukos')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  }

  static async uploadMultipleImages(
    files: File[],
    folder: string = 'pets',
    userId?: string
  ): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, folder, userId)
    )

    try {
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      throw new Error('Nepavyko įkelti kai kurių nuotraukų')
    }
  }

  static async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('Error deleting image:', error)
      throw new Error('Nepavyko ištrinti nuotraukos')
    }
  }

  static async deleteMultipleImages(paths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove(paths)

    if (error) {
      console.error('Error deleting images:', error)
      throw new Error('Nepavyko ištrinti kai kurių nuotraukų')
    }
  }

  static getImageUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path)

    return data.publicUrl
  }
}

// Helper function for extracting path from URL
export function extractPathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === ImageUploadService['BUCKET_NAME'])
    
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/')
    }
    
    return ''
  } catch {
    return ''
  }
}
