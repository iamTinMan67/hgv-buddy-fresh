-- Fix Users Table for App-Created Users
-- This script modifies the users table to handle both auth and app-created users

-- First, let's see the current structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- Add a new column to distinguish between auth users and app users
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'auth_user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_app_user BOOLEAN DEFAULT false;

-- Update existing users to be auth users
UPDATE users SET user_type = 'auth_user', is_app_user = false WHERE user_type IS NULL;

-- Create a sequence for app-generated user IDs
CREATE SEQUENCE IF NOT EXISTS app_user_id_seq START 1000;

-- Create a function to generate app user IDs
CREATE OR REPLACE FUNCTION generate_app_user_id()
RETURNS UUID AS $$
BEGIN
  -- Generate a UUID for app users
  RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- Update the users table to allow NULL auth IDs for app users
-- First, let's check if there are any foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'users';

-- If there are foreign key constraints, we need to handle them
-- Let's create a more flexible approach

-- Create a new table for app users that doesn't require auth integration
CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'driver',
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255), -- Store hashed passwords for app users
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on app_users
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create policies for app_users
CREATE POLICY "Super admins have full access to app_users" ON app_users
  FOR ALL USING (is_super_admin());

CREATE POLICY "App users can read their own data" ON app_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "App users can update their own data" ON app_users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create a function to create app users
CREATE OR REPLACE FUNCTION create_app_user(
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role TEXT DEFAULT 'driver',
  p_username TEXT DEFAULT NULL,
  p_password_hash TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Only allow super admins to create app users
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can create app users';
  END IF;
  
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Insert into app_users table
  INSERT INTO app_users (id, email, first_name, last_name, role, username, password_hash)
  VALUES (new_user_id, p_email, p_first_name, p_last_name, p_role, p_username, p_password_hash);
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_app_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Create a view that combines both auth users and app users
CREATE OR REPLACE VIEW all_users AS
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at,
  'auth_user' as user_type,
  false as is_app_user
FROM users
UNION ALL
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at,
  'app_user' as user_type,
  true as is_app_user
FROM app_users;

-- Grant access to the view
GRANT SELECT ON all_users TO authenticated;

-- Create a function to get user by email (checks both tables)
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  user_type TEXT,
  is_app_user BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    'auth_user'::TEXT as user_type,
    false as is_app_user,
    u.created_at
  FROM users u
  WHERE u.email = user_email
  UNION ALL
  SELECT 
    au.id,
    au.email,
    au.first_name,
    au.last_name,
    au.role,
    'app_user'::TEXT as user_type,
    true as is_app_user,
    au.created_at
  FROM app_users au
  WHERE au.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;

-- Test the functions
SELECT 'App users table and functions created successfully!' as status;

-- Show the new structure
SELECT 'Users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'App users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'app_users' AND table_schema = 'public'
ORDER BY ordinal_position;
