#!/usr/bin/env node

/**
 * Script to promote a user to admin role
 * Usage: node scripts/promote-to-admin.js <email>
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
/* eslint-enable @typescript-eslint/no-require-imports */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function promoteToAdmin(email) {
  try {
    console.log(`Promoting user ${email} to admin...`)

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.error('User not found:', email)
      return
    }

    console.log('Found user:', user)

    // Update user role to admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update user role:', updateError)
      return
    }

    // Also update the user metadata in Supabase Auth
    const { error: metadataError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' }
    })

    if (metadataError) {
      console.warn('Failed to update user metadata:', metadataError)
    }

    console.log(`✅ Successfully promoted ${user.full_name} (${user.email}) to admin!`)
    console.log('You can now access the admin dashboard at /admin')

  } catch (error) {
    console.error('Error promoting user to admin:', error)
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.log('Usage: node scripts/promote-to-admin.js <email>')
  console.log('Example: node scripts/promote-to-admin.js admin@example.com')
  process.exit(1)
}

promoteToAdmin(email)
