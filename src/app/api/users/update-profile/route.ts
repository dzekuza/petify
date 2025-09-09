import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    console.log('Profile update request received')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header found')
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    console.log('Token received:', token.substring(0, 20) + '...')
    
    // Create admin client for server-side operations
    const supabaseAdmin = createSupabaseAdmin()
    
    // Verify the user token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: `Unauthorized - Invalid token: ${authError?.message}` }, { status: 401 })
    }
    
    console.log('User authenticated:', user.id)

    const formData = await request.formData()
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const profileImage = formData.get('profileImage') as File | null

    console.log('Form data received:', { fullName, email, hasProfileImage: !!profileImage })

    // Update user metadata
    const updates: any = {
      full_name: fullName
    }

    // Handle profile image upload if provided
    if (profileImage) {
      console.log('Uploading profile image:', profileImage.name, profileImage.size)
      
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
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: `Failed to upload image: ${uploadError.message}` }, { status: 500 })
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      console.log('Image uploaded successfully:', publicUrl)
      updates.avatar_url = publicUrl
    }

    // Update user metadata using admin client
    console.log('Updating user metadata:', updates)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: updates
    })

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: `Failed to update profile: ${updateError.message}` }, { status: 500 })
    }

    // If email is being changed, update it separately
    if (email && email !== user.email) {
      console.log('Updating email from', user.email, 'to', email)
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email: email
      })

      if (emailError) {
        console.error('Email update error:', emailError)
        return NextResponse.json({ error: `Failed to update email: ${emailError.message}` }, { status: 500 })
      }
    }

    console.log('Profile update completed successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
