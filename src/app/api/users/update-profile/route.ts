import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    // Profile update request received
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No authorization header found
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    // Token received
    
    // Create admin client for server-side operations
    const supabaseAdmin = createSupabaseAdmin()
    
    // Verify the user token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      // Auth error
      return NextResponse.json({ error: `Unauthorized - Invalid token: ${authError?.message}` }, { status: 401 })
    }
    
    // User authenticated

    const formData = await request.formData()
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const profileImage = formData.get('profileImage') as File | null

    // Form data received

    // Update user metadata
    const updates: Record<string, string> = {
      full_name: fullName
    }

    // Handle profile image upload if provided
    if (profileImage) {
      // Uploading profile image
      
      const fileExt = profileImage.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage with proper authentication
      const { error: uploadError } = await supabaseAdmin.storage
        .from('profile-images')
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        // Upload error
        return NextResponse.json({ error: `Failed to upload image: ${uploadError.message}` }, { status: 500 })
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // Image uploaded successfully
      updates.avatar_url = publicUrl
    }

    // Update user metadata using admin client
    // Updating user metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: updates
    })

    if (updateError) {
      // Update error
      return NextResponse.json({ error: `Failed to update profile: ${updateError.message}` }, { status: 500 })
    }

    // If email is being changed, update it separately
    if (email && email !== user.email) {
      // Updating email
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email: email
      })

      if (emailError) {
        // Email update error
        return NextResponse.json({ error: `Failed to update email: ${emailError.message}` }, { status: 500 })
      }
    }

    // Profile update completed successfully
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    // Profile update error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
