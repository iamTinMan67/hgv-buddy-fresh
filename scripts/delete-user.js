/**
 * Delete User Script using Supabase Admin API
 * This script can delete users even when SQL can't
 * 
 * Usage:
 * 1. Get your service role key from Supabase Dashboard
 * 2. Set it in the SUPABASE_SERVICE_ROLE_KEY variable below
 * 3. Run: node scripts/delete-user.js
 */

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual service role key from Supabase Dashboard
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key'; // Get this from Supabase Dashboard

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteUser(email) {
  try {
    console.log(`Attempting to delete user: ${email}`);
    
    // Method 1: Try to get user by email first
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log(`User ${email} not found`);
      return;
    }
    
    console.log(`Found user: ${user.id} (${user.email})`);
    
    // Method 2: Delete user by ID
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return;
    }
    
    console.log(`✅ Successfully deleted user: ${email}`);
    
    // Method 3: Clean up from super_admins table
    const { error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .delete()
      .eq('email', email);
    
    if (superAdminError) {
      console.error('Error cleaning up super_admins:', superAdminError);
    } else {
      console.log('✅ Cleaned up super_admins table');
    }
    
    // Method 4: Clean up from users table
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', email);
    
    if (usersError) {
      console.error('Error cleaning up users table:', usersError);
    } else {
      console.log('✅ Cleaned up users table');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the deletion
const emailToDelete = 'admin@yourcompany.com'; // Change this to your email
deleteUser(emailToDelete);
