import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
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

    // Get user from request (you might need to implement authentication)
    // For now, we'll use a placeholder - you should implement proper auth
    const userId = 'temp-user-id' // This should come from your auth system

    const supabaseAdmin = createSupabaseAdmin()

    // Check if review already exists for this booking
    if (bookingId) {
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
      // Don't fail the review creation if we can't update the provider stats
    } else {
      const currentRating = provider.rating || 0
      const currentCount = provider.review_count || 0
      const newCount = currentCount + 1
      const newRating = ((currentRating * currentCount) + rating) / newCount

      await supabaseAdmin
        .from('providers')
        .update({
          rating: Math.round(newRating * 10) / 10, // Round to 1 decimal place
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
    const limit = parseInt(searchParams.get('limit') || '10')

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
