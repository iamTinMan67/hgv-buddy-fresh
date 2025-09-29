-- Super Admin Setup Script (Simplified)
-- This works even if you can't modify auth.users metadata

-- 1. Create super_admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert your super admin record (replace with your actual email)
INSERT INTO super_admins (email, first_name, last_name) 
VALUES ('admin@yourcompany.com', 'Super', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 4. Create simple policies (allow all authenticated users for now)
DROP POLICY IF EXISTS "Allow all for super_admins" ON super_admins;
CREATE POLICY "Allow all for super_admins" ON super_admins
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create helper function that checks super_admins table
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user's email exists in super_admins table
  RETURN EXISTS (
    SELECT 1 FROM super_admins sa
    JOIN auth.users au ON au.email = sa.email
    WHERE au.id = auth.uid() 
    AND sa.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON super_admins TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;

-- 7. Verify the setup
SELECT 'Super admin setup complete!' as status;
SELECT * FROM super_admins WHERE email = 'admin@yourcompany.com';
