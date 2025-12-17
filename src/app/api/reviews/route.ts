import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await authenticateRequest(request)
    if (authResult.error) {
      return authResult.error
    }

    const body = await request.json()
    const { providerId, bookingId, rating, title, comment } = body

    // Validate required fields
    if (!providerId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const userId = authResult.user!.id
    const supabaseAdmin = createSupabaseAdmin()

    // If bookingId is provided, verify user owns that booking and it's completed
    if (bookingId) {
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .select('id, customer_id, provider_id, status')
        .eq('id', bookingId)
        .single()

      if (bookingError || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      // Verify user owns the booking
      if (booking.customer_id !== userId) {
        return NextResponse.json(
          { error: 'Forbidden - You can only review your own bookings' },
          { status: 403 }
        )
      }

      // Verify booking is for the correct provider
      if (booking.provider_id !== providerId) {
        return NextResponse.json(
          { error: 'Booking does not match the provider' },
          { status: 400 }
        )
      }

      // Verify booking is completed
      if (booking.status !== 'completed') {
        return NextResponse.json(
          { error: 'Can only review completed bookings' },
          { status: 400 }
        )
      }

      // Check if review already exists for this booking
      const { data: existingReview } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .single()

      if (existingReview) {
        return NextResponse.json(
          { error: 'Review already exists for this booking' },
          { status: 400 }
        )
      }
    }

    // Create the review
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        provider_id: providerId,
        customer_id: userId,
        booking_id: bookingId || null,
        rating,
        title: title || null,
        comment,
        is_public: true
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    // Update provider's average rating and review count
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('providers')
      .select('rating, review_count')
      .eq('id', providerId)
      .single()

    if (providerError) {
      console.error('Error fetching provider:', providerError)
    } else {
      const currentRating = provider.rating || 0
      const currentCount = provider.review_count || 0
      const newCount = currentCount + 1
      const newRating = ((currentRating * currentCount) + rating) / newCount

      await supabaseAdmin
        .from('providers')
        .update({
          rating: Math.round(newRating * 10) / 10,
          review_count: newCount
        })
        .eq('id', providerId)
    }

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.created_at
      }
    })
  } catch (error) {
    console.error('Error in reviews API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('provider_id')
    let limit = parseInt(searchParams.get('limit') || '10')

    // Cap limit to prevent excessive data retrieval
    const MAX_LIMIT = 100
    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT
    }

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createSupabaseAdmin()

    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        comment,
        created_at,
        customer:users!customer_id(full_name, avatar_url)
      `)
      .eq('provider_id', providerId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error in reviews GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
