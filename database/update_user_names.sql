-- Update user names in the users table
-- Run this in Supabase SQL Editor to ensure proper names are stored

-- Check current users table data
SELECT 'Current users table data:' as info;
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
ORDER BY created_at;

-- Update your user record (replace with your actual email and name)
-- You can find your user ID by looking at the auth.users table
UPDATE users 
SET 
  first_name = 'Tom',
  last_name = 'Boyce'
WHERE email = 'tomboyce@mail.com';

-- Update Adam's user record
UPDATE users 
SET 
  first_name = 'Adam',
  last_name = 'Mustafa'
WHERE email = 'adam.mustafa1717@gmail.com';

-- Verify the updates
SELECT 'Updated users table data:' as info;
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
ORDER BY created_at;

-- Also check what's in auth.users for comparison
SELECT 'Auth users data (for reference):' as info;
SELECT id, email, raw_user_meta_data, created_at 
FROM auth.users 
ORDER BY created_at;

SELECT 'User names updated successfully!' as status;
