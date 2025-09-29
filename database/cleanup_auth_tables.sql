-- Clean up authentication tables - keep only what we need
-- Run this in Supabase SQL Editor to simplify the authentication system

-- First, let's see what we currently have
SELECT 'Current authentication tables:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'app_users', 'staff_members', 'super_admins')
ORDER BY table_name;

-- Check if app_users table is being used
SELECT 'App users count:' as info, COUNT(*) as count FROM app_users;
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'Staff members count:' as info, COUNT(*) as count FROM staff_members;

-- Since we're using Supabase Auth for authentication and staff_members for detailed data,
-- we can remove the app_users table as it's redundant

-- Drop app_users table and related functions (if they exist)
DROP TABLE IF EXISTS app_users CASCADE;

-- Drop the all_users view (if it exists)
DROP VIEW IF EXISTS all_users CASCADE;

-- Drop the create_app_user function (if it exists)
DROP FUNCTION IF EXISTS create_app_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;

-- Drop the get_user_by_email function (if it exists)
DROP FUNCTION IF EXISTS get_user_by_email(TEXT) CASCADE;

-- Keep the users table as it's linked to Supabase Auth for you and Adam
-- Keep the staff_members table as it contains all detailed staff information
-- Keep the super_admins table for super admin functionality

-- Verify the simplified structure
SELECT 'Simplified authentication structure:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'staff_members', 'super_admins')
ORDER BY table_name;

-- Show the final authentication flow
SELECT 'Authentication Flow:' as info;
SELECT '1. Super Admin (you) and Business Owner (Adam) → Supabase Auth + users table' as step_1;
SELECT '2. New staff members → staff_members table (detailed info) + Supabase Auth users' as step_2;
SELECT '3. Wage automation → Uses staff_members table for calculations' as step_3;

-- Verify counts
SELECT 'Final table counts:' as info;
SELECT 'users (auth users):' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'staff_members (detailed staff):' as table_name, COUNT(*) as count FROM staff_members
UNION ALL
SELECT 'super_admins:' as table_name, COUNT(*) as count FROM super_admins;
