import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const profileImage = formData.get('profileImage') as File | null

    // Update user metadata
    const updates: any = {
      full_name: fullName
    }

    // Handle profile image upload if provided
    if (profileImage) {
      const fileExt = profileImage.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('provider-images')
        .upload(filePath, profileImage)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('provider-images')
        .getPublicUrl(filePath)

      updates.avatar_url = publicUrl
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: updates
    })

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // If email is being changed, update it separately
    if (email && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email
      })

      if (emailError) {
        console.error('Email update error:', emailError)
        return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
