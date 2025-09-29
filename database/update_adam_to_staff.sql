-- Update Adam from business owner to staff member
-- This reflects the proper multi-tenant business model

-- First, let's see the current state
SELECT 'Current Adam data:' as info;
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'adam.mustafa1717@gmail.com';

-- Update Adam's role from 'owner' to 'staff' in the users table
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

-- Check if Adam exists in staff_members table
SELECT 'Adam in staff_members:' as info;
SELECT id, user_id, first_name, family_name, role, is_active 
FROM staff_members 
WHERE email = 'adam.mustafa1717@gmail.com';

-- If Adam doesn't exist in staff_members, create a basic staff record
INSERT INTO staff_members (
  user_id,
  staff_id,
  first_name,
  family_name,
  address_line1,
  postcode,
  email,
  role,
  is_active,
  start_date
)
SELECT 
  u.id,
  'EMP-' || TO_CHAR(NOW(), 'YYYY-MM') || '-001',
  u.first_name,
  u.last_name,
  'Address to be updated', -- Required field - placeholder
  'XX00 0XX', -- Required field - placeholder
  u.email,
  'staff',
  true,
  NOW()
FROM users u
WHERE u.email = 'adam.mustafa1717@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM staff_members sm 
  WHERE sm.email = 'adam.mustafa1717@gmail.com'
);

-- Verify Adam's staff record
SELECT 'Adam staff record:' as info;
SELECT id, user_id, staff_id, first_name, family_name, email, role, is_active, start_date
FROM staff_members 
WHERE email = 'adam.mustafa1717@gmail.com';

-- Show final user roles
SELECT 'Final user roles:' as info;
SELECT email, first_name, last_name, role, created_at 
FROM users 
ORDER BY role, created_at;

SELECT 'Adam successfully updated to staff member!' as status;
