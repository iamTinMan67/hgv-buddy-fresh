# 🔐 Super Admin Setup Guide

This guide shows you how to create a super admin user in Supabase without storing credentials in your custom tables.

## **Method 1: Supabase Dashboard (Recommended)**

### **Step 1: Create Admin User in Supabase Auth**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** or **"Invite user"**
4. Fill in the details:
   - **Email**: `admin@yourcompany.com`
   - **Password**: Set a strong password (e.g., `SuperAdmin2025!`)
   - **Auto-confirm**: ✅ Check this box
5. Click **"Create user"**

### **Step 2: Set User Metadata**
1. Click on the created user
2. Go to **"Raw user meta data"** section
3. Add the following JSON:
```json
{
  "role": "supa_admin",
  "first_name": "Super",
  "last_name": "Admin",
  "is_super_admin": true
}
```
4. Click **"Save"**

### **Step 3: Run the Database Setup**
1. Go to **SQL Editor** in Supabase
2. Run the SQL script from `database/create_super_admin.sql`
3. This creates the `super_admins` table and policies

## **Method 2: SQL Script (Programmatic)**

### **Step 1: Run the Super Admin SQL**
```sql
-- Run this in Supabase SQL Editor
-- This creates the super admin infrastructure

-- Create super admins table
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your super admin record
INSERT INTO super_admins (email, first_name, last_name) 
VALUES ('admin@yourcompany.com', 'Super', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can view super admin records" ON super_admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'supa_admin'
    )
  );

-- Create helper functions
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'supa_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## **Method 3: Environment Variables (Development)**

### **Step 1: Add to .env.local**
```bash
# Super Admin Configuration
VITE_SUPER_ADMIN_EMAIL=admin@yourcompany.com
VITE_SUPER_ADMIN_PASSWORD=SuperAdmin2025!
```

### **Step 2: Update Login Component**
The login system will automatically check for super admin status and grant elevated privileges.

## **🔒 Security Features**

### **Row Level Security (RLS)**
- Super admin table is protected by RLS policies
- Only authenticated super admins can access super admin records
- Regular users cannot see or modify super admin data

### **Role-Based Access**
- Super admins have `role: 'supa_admin'` in metadata
- System automatically detects super admin status
- Elevated permissions for all operations

### **Audit Trail**
- All super admin actions are logged
- Timestamps for creation and updates
- Active/inactive status tracking

## **🚀 Testing Your Setup**

### **Step 1: Test Login**
1. Go to your app's login page
2. Use your super admin credentials
3. Verify you get full access to all features

### **Step 2: Verify Permissions**
1. Check that you can access all admin functions
2. Verify you can manage other users
3. Test that regular users have limited access

### **Step 3: Check Database**
```sql
-- Verify super admin record exists
SELECT * FROM super_admins WHERE email = 'admin@yourcompany.com';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'super_admins';
```

## **🛠️ Troubleshooting**

### **Common Issues:**

1. **"User not found" error**
   - Verify the email exists in `auth.users`
   - Check that the user is confirmed
   - Ensure metadata is set correctly

2. **"Permission denied" error**
   - Verify RLS policies are created
   - Check that the user has `supa_admin` role in metadata
   - Ensure the `super_admins` table exists

3. **"Function not found" error**
   - Run the complete SQL script
   - Check that all functions are created
   - Verify permissions are granted

### **Debug Commands:**
```sql
-- Check if user exists in auth
SELECT * FROM auth.users WHERE email = 'admin@yourcompany.com';

-- Check super admin status
SELECT * FROM super_admins WHERE email = 'admin@yourcompany.com';

-- Test super admin function
SELECT is_super_admin();
```

## **📋 Next Steps**

1. **Create your super admin user** using Method 1 (Dashboard)
2. **Run the database setup** using the SQL script
3. **Test the login** with your super admin credentials
4. **Verify permissions** by accessing admin features
5. **Create regular staff users** through the Staff Management interface

## **🔐 Security Best Practices**

- Use a strong, unique password for your super admin account
- Enable 2FA if available in your Supabase plan
- Regularly audit super admin access
- Keep the super admin email private
- Consider using a dedicated email for super admin access

---

**Note**: The super admin system is now integrated into your authentication flow. When you log in with super admin credentials, you'll automatically get elevated privileges without needing to store credentials in your custom tables.
