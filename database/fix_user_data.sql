-- Fix user data in the users table
-- Run this in Supabase SQL Editor to ensure proper user data

-- First, let's see what we have
SELECT 'Current state before fix:' as info;
SELECT 'Users table:' as table_name, COUNT(*) as count FROM users;
SELECT 'Auth users table:' as table_name, COUNT(*) as count FROM auth.users;

-- Get the auth user IDs for our emails
SELECT 'Auth user IDs:' as info;
SELECT id, email FROM auth.users WHERE email IN ('tomboyce@mail.com', 'adam.mustafa1717@gmail.com');

-- Insert or update your user record (Tom)
INSERT INTO users (id, email, first_name, last_name, role)
SELECT 
  au.id,
  'tomboyce@mail.com',
  'Tom',
  'Boyce',
  'supa_admin'
FROM auth.users au
WHERE au.email = 'tomboyce@mail.com'
ON CONFLICT (id) DO UPDATE SET
  first_name = 'Tom',
  last_name = 'Boyce',
  role = 'supa_admin',
  updated_at = NOW();

-- Insert or update Adam's user record
INSERT INTO users (id, email, first_name, last_name, role)
SELECT 
  au.id,
  'adam.mustafa1717@gmail.com',
  'Adam',
  'Mustafa',
  'owner'
FROM auth.users au
WHERE au.email = 'adam.mustafa1717@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  first_name = 'Adam',
  last_name = 'Mustafa',
  role = 'owner',
  updated_at = NOW();

-- Verify the results
SELECT 'Final users table data:' as info;
SELECT id, email, first_name, last_name, role, created_at, updated_at 
FROM users 
ORDER BY created_at;

-- Check if the auth users have the correct IDs
SELECT 'Auth users verification:' as info;
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('tomboyce@mail.com', 'adam.mustafa1717@gmail.com')
ORDER BY created_at;

SELECT 'User data fix completed!' as status;
