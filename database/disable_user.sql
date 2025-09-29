-- Disable User Script (Alternative to deletion)
-- This disables the user instead of deleting them
-- Often more reliable than deletion

-- Method 1: Disable user by clearing confirmation and adding disabled flag
UPDATE auth.users SET 
    email_confirmed_at = NULL,
    phone_confirmed_at = NULL,
    confirmation_sent_at = NULL,
    recovery_sent_at = NULL,
    email_change_sent_at = NULL,
    last_sign_in_at = NULL,
    raw_app_meta_data = '{"provider": "email", "providers": ["email"], "disabled": true}'::jsonb,
    raw_user_meta_data = '{"first_name": "Super", "last_name": "Admin", "user_role": "supa_admin"}'::jsonb
WHERE email = 'admin@yourcompany.com';

-- Method 2: Alternative - just update the metadata to be correct
-- UPDATE auth.users SET 
--     raw_user_meta_data = '{"first_name": "Super", "last_name": "Admin", "user_role": "supa_admin"}'::jsonb
-- WHERE email = 'admin@yourcompany.com';

-- Clean up super_admins table
DELETE FROM super_admins WHERE email = 'admin@yourcompany.com';

-- Clean up users table
DELETE FROM users WHERE email = 'admin@yourcompany.com';

-- Verify the changes
SELECT 
    email, 
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    created_at
FROM auth.users 
WHERE email = 'admin@yourcompany.com';

SELECT 'User disabled and cleaned up. You can now recreate with correct metadata.' as status;
