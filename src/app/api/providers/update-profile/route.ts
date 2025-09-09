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
    const businessName = formData.get('businessName') as string
    const businessType = formData.get('businessType') as string
    const description = formData.get('description') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const website = formData.get('website') as string
    const profileImage = formData.get('profileImage') as File | null

    // Update user metadata
    const updates: Record<string, string> = {
      business_name: businessName,
      business_type: businessType,
      description: description,
      address: address,
      phone: phone,
      website: website
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

    // Return updated profile data
    const updatedProfile = {
      id: user.id,
      businessName: businessName,
      businessType: businessType,
      description: description,
      address: address,
      phone: phone,
      email: email || user.email,
      website: website,
      avatarUrl: updates.avatar_url || user.user_metadata?.avatar_url || '',
      verificationStatus: 'pending',
      profileComplete: true,
      rating: 4.5,
      totalReviews: 12,
      joinedDate: user.created_at
    }

    return NextResponse.json(updatedProfile)

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
