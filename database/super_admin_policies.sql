-- Super Admin RLS Policies
-- This script creates comprehensive policies for super admin access
-- Run this in your Supabase SQL Editor

-- First, let's create a helper function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins sa
    JOIN auth.users au ON au.email = sa.email
    WHERE au.id = auth.uid() 
    AND sa.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;

-- Drop existing policies to avoid conflicts
DO $$
DECLARE
    table_name TEXT;
    policy_name TEXT;
BEGIN
    -- List of all tables that need policies
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('super_admins') -- We'll handle this separately
    LOOP
        -- Drop all existing policies for each table
        FOR policy_name IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = table_name AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
        END LOOP;
    END LOOP;
END $$;

-- Create comprehensive policies for all tables
-- Companies table
CREATE POLICY "Super admins have full access to companies" ON companies
  FOR ALL USING (is_super_admin());

CREATE POLICY "Authenticated users can read companies" ON companies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users table
CREATE POLICY "Super admins have full access to users" ON users
  FOR ALL USING (is_super_admin());

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Drivers table
CREATE POLICY "Super admins have full access to drivers" ON drivers
  FOR ALL USING (is_super_admin());

CREATE POLICY "Drivers can read their own data" ON drivers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own data" ON drivers
  FOR UPDATE USING (auth.uid() = user_id);

-- Vehicles table
CREATE POLICY "Super admins have full access to vehicles" ON vehicles
  FOR ALL USING (is_super_admin());

CREATE POLICY "Authenticated users can read vehicles" ON vehicles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Jobs table
CREATE POLICY "Super admins have full access to jobs" ON jobs
  FOR ALL USING (is_super_admin());

CREATE POLICY "Authenticated users can read jobs" ON jobs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Client contacts table
CREATE POLICY "Super admins have full access to client_contacts" ON client_contacts
  FOR ALL USING (is_super_admin());

CREATE POLICY "Authenticated users can read client_contacts" ON client_contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage client_contacts" ON client_contacts
  FOR ALL USING (auth.role() = 'authenticated');

-- Fuel records table
CREATE POLICY "Super admins have full access to fuel_records" ON fuel_records
  FOR ALL USING (is_super_admin());

CREATE POLICY "Drivers can read their own fuel records" ON fuel_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drivers d 
      WHERE d.id = fuel_records.driver_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can create their own fuel records" ON fuel_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers d 
      WHERE d.id = fuel_records.driver_id 
      AND d.user_id = auth.uid()
    )
  );

-- Delivery addresses table
CREATE POLICY "Super admins have full access to delivery_addresses" ON delivery_addresses
  FOR ALL USING (is_super_admin());

CREATE POLICY "Authenticated users can read delivery_addresses" ON delivery_addresses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage delivery_addresses" ON delivery_addresses
  FOR ALL USING (auth.role() = 'authenticated');

-- Driver vehicle allocations table
CREATE POLICY "Super admins have full access to driver_vehicle_allocations" ON driver_vehicle_allocations
  FOR ALL USING (is_super_admin());

CREATE POLICY "Drivers can read their own allocations" ON driver_vehicle_allocations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drivers d 
      WHERE d.id = driver_vehicle_allocations.driver_id 
      AND d.user_id = auth.uid()
    )
  );

-- Vehicle checks table
CREATE POLICY "Super admins have full access to vehicle_checks" ON vehicle_checks
  FOR ALL USING (is_super_admin());

CREATE POLICY "Drivers can read their own vehicle checks" ON vehicle_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drivers d 
      WHERE d.id = vehicle_checks.driver_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can create their own vehicle checks" ON vehicle_checks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers d 
      WHERE d.id = vehicle_checks.driver_id 
      AND d.user_id = auth.uid()
    )
  );

-- Notifications table
CREATE POLICY "Super admins have full access to notifications" ON notifications
  FOR ALL USING (is_super_admin());

CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Super admins table (special handling)
CREATE POLICY "Super admins can view super admin records" ON super_admins
  FOR SELECT USING (is_super_admin());

CREATE POLICY "Super admins can manage super admin records" ON super_admins
  FOR ALL USING (is_super_admin());

-- Create a function to grant super admin access to a user
CREATE OR REPLACE FUNCTION grant_super_admin_access(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow super admins to grant access
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can grant super admin access';
  END IF;
  
  -- Add user to super_admins table
  INSERT INTO super_admins (email, first_name, last_name, is_active)
  VALUES (user_email, 'Super', 'Admin', true)
  ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    updated_at = NOW();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to revoke super admin access
CREATE OR REPLACE FUNCTION revoke_super_admin_access(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow super admins to revoke access
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can revoke super admin access';
  END IF;
  
  -- Deactivate super admin access
  UPDATE super_admins 
  SET is_active = false, updated_at = NOW()
  WHERE email = user_email;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION grant_super_admin_access(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_super_admin_access(TEXT) TO authenticated;

-- Create a view for super admin dashboard
CREATE OR REPLACE VIEW super_admin_dashboard AS
SELECT 
  'users' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM users
UNION ALL
SELECT 
  'drivers' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM drivers
UNION ALL
SELECT 
  'vehicles' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM vehicles
UNION ALL
SELECT 
  'jobs' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM jobs
UNION ALL
SELECT 
  'client_contacts' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM client_contacts
UNION ALL
SELECT 
  'fuel_records' as table_name,
  COUNT(*) as record_count,
  MAX(updated_at) as last_updated
FROM fuel_records;

-- Grant access to the dashboard view
GRANT SELECT ON super_admin_dashboard TO authenticated;

-- Create a function to get system statistics
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow super admins to access system stats
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can access system statistics';
  END IF;
  
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'total_drivers', (SELECT COUNT(*) FROM drivers),
    'total_vehicles', (SELECT COUNT(*) FROM vehicles),
    'active_jobs', (SELECT COUNT(*) FROM jobs WHERE status = 'active'),
    'total_fuel_records', (SELECT COUNT(*) FROM fuel_records),
    'total_clients', (SELECT COUNT(*) FROM client_contacts),
    'super_admins', (SELECT COUNT(*) FROM super_admins WHERE is_active = true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_system_stats() TO authenticated;

-- Verify all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test the super admin function
SELECT 'Super admin policies created successfully!' as status;
SELECT is_super_admin() as current_user_is_super_admin;
