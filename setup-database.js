#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://bjmmipjnmtymaawryaid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbW1pcGpubXR5bWFhd3J5YWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODEzMTYsImV4cCI6MjA3Mjc1NzMxNn0.reNyFUhHVanJZjURDzw_MvOTVlfYCNYQIGhBZiN5JNc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🐾 Setting up Petify database...');
  
  try {
    // Test connection
    console.log('✅ Testing Supabase connection...');
    const { data, error } = await supabase.from('service_categories').select('*').limit(1);
    
    if (error && error.message.includes('Could not find the table')) {
      console.log('📋 Database tables not found. Please run the SQL migrations in Supabase Dashboard.');
      console.log('');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/bjmmipjnmtymaawryaid/sql');
      console.log('');
      console.log('📝 Copy and paste the SQL from: supabase/migrations/001_initial_schema.sql');
      console.log('📝 Then run: supabase/migrations/002_rls_policies.sql');
      console.log('📝 Then run: supabase/migrations/003_storage_setup.sql');
      console.log('📝 Then run: supabase/migrations/004_functions_views.sql');
      console.log('📝 Finally run: supabase/migrations/005_seed_data.sql');
      return;
    }
    
    if (error) {
      console.log('❌ Connection error:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('📊 Found', data?.length || 0, 'service categories');
    
    // Test other tables
    const tables = ['users', 'providers', 'services', 'pets', 'bookings', 'reviews'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*').limit(1);
        if (tableError) {
          console.log(`❌ Table '${table}' not found or accessible`);
        } else {
          console.log(`✅ Table '${table}' is ready`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupDatabase();
