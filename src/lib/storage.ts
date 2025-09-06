import { supabase } from './supabase'

export interface UploadResult {
  data: { path: string } | null
  error: Error | null
}

export interface UploadOptions {
  bucket: 'profile-images' | 'service-images' | 'assets' | 'pet-images'
  folder?: string
  fileName?: string
}

/**
 * Upload a file to Supabase storage
 */
export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    const { bucket, folder = '', fileName } = options
    
    // Ensure we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('No valid session found:', sessionError)
      return { data: null, error: new Error('Authentication required for upload') }
    }
    
    // Generate unique filename if not provided
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const finalFileName = fileName || `${timestamp}-${randomString}.${fileExtension}`
    
    // Create the full path
    const filePath = folder ? `${folder}/${finalFileName}` : finalFileName
    
    console.log('Uploading file:', {
      bucket,
      filePath,
      fileName: finalFileName,
      fileSize: file.size,
      fileType: file.type,
      userId: session.user.id
    })
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', {
        message: error.message,
        bucket,
        filePath,
        userId: session.user.id
      })
      return { data: null, error: new Error(`Upload failed: ${error.message}`) }
    }
    
    console.log('Upload successful:', data)
    return { data, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Upload failed') 
    }
  }
}

/**
 * Get a public URL for a file in Supabase storage
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

/**
 * Delete a file from Supabase storage
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) {
      console.error('Delete error:', error)
      return { error: new Error(error.message) }
    }
    
    return { error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { 
      error: error instanceof Error ? error : new Error('Delete failed') 
    }
  }
}

/**
 * Upload a profile image
 */
export const uploadProfileImage = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'profile-images',
    folder: `users/${userId}`,
    fileName: `profile-${Date.now()}.${file.name.split('.').pop()}`
  })
}

/**
 * Upload a service image
 */
export const uploadServiceImage = async (
  file: File,
  serviceId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'service-images',
    folder: `services/${serviceId}`,
    fileName: `service-${Date.now()}.${file.name.split('.').pop()}`
  })
}

/**
 * Upload a cover image for business profile
 */
export const uploadCoverImage = async (
  file: File,
  providerId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'profile-images',
    folder: `providers/${providerId}`,
    fileName: `cover-${Date.now()}.${file.name.split('.').pop()}`
  })
}

/**
 * Upload a profile picture for business profile
 */
export const uploadProfilePicture = async (
  file: File,
  providerId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'profile-images',
    folder: `providers/${providerId}`,
    fileName: `profile-${Date.now()}.${file.name.split('.').pop()}`
  })
}

/**
 * Upload a pet profile picture
 */
export const uploadPetProfilePicture = async (
  file: File,
  petId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'pet-images',
    folder: `pets/${petId}`,
    fileName: `profile-${Date.now()}.${file.name.split('.').pop()}`
  })
}

/**
 * Upload a pet gallery image
 */
export const uploadPetGalleryImage = async (
  file: File,
  petId: string
): Promise<UploadResult> => {
  return uploadFile(file, {
    bucket: 'pet-images',
    folder: `pets/${petId}/gallery`,
    fileName: `gallery-${Date.now()}.${file.name.split('.').pop()}`
  })
}

/**
 * Validate file before upload
 */
export const validateFile = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    }
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be an image (JPEG, PNG, WebP, or GIF)'
    }
  }
  
  return { valid: true }
}
