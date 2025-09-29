-- Simple script to update Adam's role from owner to staff
-- This avoids the staff_members table complexity

-- Show current state
SELECT 'Current Adam data:' as info;
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'adam.mustafa1717@gmail.com';

-- Update Adam's role from 'owner' to 'staff'
UPDATE users 
SET 
  role = 'staff',
  updated_at = NOW()
WHERE email = 'adam.mustafa1717@gmail.com';

-- Verify the update
SELECT 'Updated Adam data:' as info;
SELECT id, email, first_name, last_name, role, updated_at 
FROM users 
WHERE email = 'adam.mustafa1717@gmail.com';

-- Show all user roles
SELECT 'All user roles:' as info;
SELECT email, first_name, last_name, role, created_at 
FROM users 
ORDER BY role, created_at;

SELECT 'Adam successfully updated to staff role!' as status;
