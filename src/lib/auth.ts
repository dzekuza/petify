import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  role: string | null
  full_name: string | null
}

export interface AuthResult {
  user: AuthUser | null
  error: NextResponse | null
}

/**
 * Authenticates a request using the Authorization header
 * Returns the authenticated user or an error response
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabaseAdmin = createSupabaseAdmin()
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Fetch user data from users table to get role
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      // Fallback to auth user metadata if users table lookup fails
      return {
        user: {
          id: user.id,
          email: user.email || '',
          role: user.user_metadata?.role || null,
          full_name: user.user_metadata?.full_name || null
        },
        error: null
      }
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        full_name: userData.full_name
      },
      error: null
    }
  } catch {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
}

/**
 * Requires the user to have admin role
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const authResult = await authenticateRequest(request)

  if (authResult.error) {
    return authResult
  }

  if (authResult.user?.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }
  }

  return authResult
}

/**
 * Requires the user to have provider role
 */
export async function requireProvider(request: NextRequest): Promise<AuthResult> {
  const authResult = await authenticateRequest(request)

  if (authResult.error) {
    return authResult
  }

  if (authResult.user?.role !== 'provider' && authResult.user?.role !== 'admin') {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden - Provider access required' }, { status: 403 })
    }
  }

  return authResult
}

/**
 * Valid roles that users can self-assign (excludes admin)
 */
export const SELF_ASSIGNABLE_ROLES = ['customer', 'provider'] as const
export type SelfAssignableRole = typeof SELF_ASSIGNABLE_ROLES[number]

/**
 * Validates if a role can be self-assigned by users
 */
export function isValidSelfAssignableRole(role: string): role is SelfAssignableRole {
  return SELF_ASSIGNABLE_ROLES.includes(role as SelfAssignableRole)
}
