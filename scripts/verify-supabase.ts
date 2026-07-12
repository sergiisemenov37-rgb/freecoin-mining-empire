/**
 * Verify Supabase Connection and Players Table
 * Run with: npx tsx scripts/verify-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

// Try multiple possible environment variable names
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.SUPABASE_URL || 
                    '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        process.env.SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
                        process.env.SUPABASE_PUBLISHABLE_KEY ||
                        '';

console.log('Environment check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_URL:', !!process.env.SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('SUPABASE_ANON_KEY:', !!process.env.SUPABASE_ANON_KEY);
console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
console.log('SUPABASE_PUBLISHABLE_KEY:', !!process.env.SUPABASE_PUBLISHABLE_KEY);
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Resolved URL:', !!supabaseUrl);
  console.error('Resolved Anon Key:', !!supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySupabase() {
  console.log('=== Supabase Verification ===');
  console.log('URL:', supabaseUrl);
  console.log('');

  // Test connection
  console.log('Testing connection...');
  try {
    const { data, error } = await supabase.from('players').select('count').limit(1);
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('✓ Connection successful');
    }
  } catch (e) {
    console.error('Connection failed:', e);
  }
  console.log('');

  // Check if players table exists
  console.log('Checking players table...');
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('✗ Players table error:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
    } else {
      console.log('✓ Players table exists');
      console.log('Sample data:', data);
    }
  } catch (e) {
    console.error('✗ Query failed:', e);
  }
  console.log('');

  // List all tables
  console.log('Listing all tables...');
  try {
    const { data, error } = await supabase.rpc('get_tables');
    if (error) {
      console.error('Could not list tables:', error);
    } else {
      console.log('Tables:', data);
    }
  } catch (e) {
    console.error('Listing tables failed:', e);
  }
  console.log('');

  // Try to create a test player
  console.log('Attempting to create test player...');
  try {
    const testTelegramId = 999999999;
    const { data, error } = await supabase
      .from('players')
      .insert({
        telegram_id: testTelegramId,
        telegram_username: 'test_user',
        is_active: true,
        is_banned: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error('✗ Player creation failed:', error.message);
      console.error('Error code:', error.code);
    } else {
      console.log('✓ Test player created:', data);
      
      // Clean up
      await supabase.from('players').delete().eq('telegram_id', testTelegramId);
      console.log('✓ Test player cleaned up');
    }
  } catch (e) {
    console.error('✗ Player creation failed:', e);
  }
}

verifySupabase().catch(console.error);
