import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    console.log('Profile update API called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Token length:', token.length)
    
    // Create admin client to verify the JWT token
    const supabaseAdmin = createSupabaseAdmin()
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      console.error('User:', user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('User authenticated:', user.id)

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
      const { error: uploadError } = await supabaseAdmin.storage
        .from('provider-images')
        .upload(filePath, profileImage)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('provider-images')
        .getPublicUrl(filePath)

      updates.avatar_url = publicUrl
    }

    // Update user metadata using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: updates
    })

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // If email is being changed, update it separately
    if (email && email !== user.email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
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
