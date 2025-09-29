-- Debug user data to see what's actually stored
-- Run this in Supabase SQL Editor to check the current state

-- Check what's in the users table
SELECT 'Users table data:' as info;
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
ORDER BY created_at;

-- Check what's in auth.users table
SELECT 'Auth users data:' as info;
SELECT id, email, raw_user_meta_data, created_at 
FROM auth.users 
ORDER BY created_at;

-- Check if there are any users with your email
SELECT 'Users with tomboyce@mail.com:' as info;
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE email = 'tomboyce@mail.com';

-- Check if there are any auth users with your email
SELECT 'Auth users with tomboyce@mail.com:' as info;
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'tomboyce@mail.com';

-- Check if there are any users with Adam's email
SELECT 'Users with adam.mustafa1717@gmail.com:' as info;
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE email = 'adam.mustafa1717@gmail.com';

-- Check if there are any auth users with Adam's email
SELECT 'Auth users with adam.mustafa1717@gmail.com:' as info;
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'adam.mustafa1717@gmail.com';
