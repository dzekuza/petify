import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user already has a provider profile
    const { data: existingProviders } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)

    if (existingProviders && existingProviders.length > 0) {
      return NextResponse.json({ error: 'Provider profile already exists' }, { status: 400 })
    }

    // Insert the provider data
    const { data: provider, error: insertError } = await supabase
      .from('providers')
      .insert({
        user_id: user.id,
        business_name: data.business_name,
        business_type: data.business_type,
        description: data.description,
        services: data.services,
        location: data.location,
        contact_info: data.contact_info,
        business_hours: data.business_hours,
        price_range: data.price_range,
        availability: data.availability,
        images: data.images,
        certifications: data.certifications,
        experience_years: data.experience_years,
        status: data.status,
        is_verified: data.is_verified
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating provider:', insertError)
      return NextResponse.json({ error: 'Failed to create provider profile' }, { status: 500 })
    }

    return NextResponse.json({ provider }, { status: 201 })
  } catch (error) {
    console.error('Provider creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get provider profile
    const { data: providers, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching provider:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch provider profile' }, { status: 500 })
    }

    if (!providers || providers.length === 0) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 })
    }

    // Return the most recent provider
    const provider = providers[0]

    return NextResponse.json({ provider })
  } catch (error) {
    console.error('Provider fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
