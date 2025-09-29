-- Delete User Script for Supabase
-- This script attempts multiple methods to delete a user

-- Method 1: Try to delete from auth.users (requires admin access)
-- Uncomment the line below if you have admin permissions
-- DELETE FROM auth.users WHERE email = 'admin@yourcompany.com';

-- Method 2: Use Supabase Admin API (if you have service role key)
-- This requires running from your application or a script with service role key
-- The Admin API can delete users even when SQL can't

-- Method 3: Delete from super_admins table (safe to run)
DELETE FROM super_admins WHERE email = 'admin@yourcompany.com';

-- Method 4: Clean up any related data in custom tables (safe to run)
DELETE FROM users WHERE email = 'admin@yourcompany.com';

-- Method 5: Try to delete using auth schema functions (if available)
-- This might work depending on your Supabase version and permissions
DO $$
BEGIN
    -- Try to delete user using auth functions
    PERFORM auth.delete_user('admin@yourcompany.com');
EXCEPTION
    WHEN OTHERS THEN
        -- If the function doesn't exist or fails, continue
        RAISE NOTICE 'Could not delete user via auth function: %', SQLERRM;
END $$;

-- Method 6: Alternative approach - disable the user instead of deleting
-- UPDATE auth.users SET 
--     email_confirmed_at = NULL,
--     phone_confirmed_at = NULL,
--     confirmation_sent_at = NULL,
--     recovery_sent_at = NULL,
--     email_change_sent_at = NULL,
--     last_sign_in_at = NULL,
--     raw_app_meta_data = '{"provider": "email", "providers": ["email"], "disabled": true}'::jsonb
-- WHERE email = 'admin@yourcompany.com';

-- Verify cleanup
SELECT 'User cleanup complete. Check if user still exists in auth.users' as status;
SELECT email, created_at FROM auth.users WHERE email = 'admin@yourcompany.com';
SELECT * FROM super_admins WHERE email = 'admin@yourcompany.com';
