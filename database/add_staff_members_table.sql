-- Add comprehensive staff_members table
-- Run this in Supabase SQL Editor to add the missing staff details table

-- Create staff_members table with all detailed information
CREATE TABLE staff_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  staff_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  family_name VARCHAR(100) NOT NULL,
  
  -- Address Information
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  address_line3 VARCHAR(255),
  town VARCHAR(100),
  postcode VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'UK',
  
  -- Contact Information
  phone VARCHAR(20),
  mobile VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  
  -- Next of Kin Information
  next_of_kin_name VARCHAR(255),
  next_of_kin_relationship VARCHAR(100),
  next_of_kin_phone VARCHAR(20),
  next_of_kin_email VARCHAR(255),
  
  -- Employment Information
  role VARCHAR(20) NOT NULL DEFAULT 'driver', -- manager, admin, driver
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL,
  
  -- Tax Information
  tax_code VARCHAR(20),
  national_insurance VARCHAR(20),
  
  -- Driver-specific Information (only for driver role)
  employee_number VARCHAR(50),
  date_of_birth DATE,
  license_number VARCHAR(50),
  license_expiry DATE,
  
  -- Bank Details (encrypted in production)
  bank_account_number VARCHAR(50),
  bank_sort_code VARCHAR(20),
  bank_name VARCHAR(100),
  
  -- Additional Information
  notes TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX idx_staff_members_staff_id ON staff_members(staff_id);
CREATE INDEX idx_staff_members_email ON staff_members(email);
CREATE INDEX idx_staff_members_role ON staff_members(role);
CREATE INDEX idx_staff_members_is_active ON staff_members(is_active);

-- Create updated_at trigger
CREATE TRIGGER update_staff_members_updated_at 
  BEFORE UPDATE ON staff_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Enable all operations for authenticated users" ON staff_members 
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON staff_members TO authenticated;

-- Insert existing users into staff_members table
INSERT INTO staff_members (
  user_id,
  staff_id,
  first_name,
  family_name,
  email,
  role,
  start_date,
  address_line1,
  postcode,
  country
)
SELECT 
  u.id,
  'EMP-' || EXTRACT(YEAR FROM u.created_at) || '-' || LPAD(EXTRACT(MONTH FROM u.created_at)::text, 2, '0') || '-001' as staff_id,
  u.first_name,
  u.last_name,
  u.email,
  u.role,
  u.created_at::date,
  'Address not provided' as address_line1,
  'N/A' as postcode,
  'UK' as country
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM staff_members sm WHERE sm.user_id = u.id
);

-- Create staff_qualifications table for multiple qualifications per staff member
CREATE TABLE staff_qualifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  issuing_body VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_licenses table for multiple licenses per staff member
CREATE TABLE staff_licenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  number VARCHAR(100) NOT NULL,
  issuing_body VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for qualifications and licenses
CREATE INDEX idx_staff_qualifications_staff_member ON staff_qualifications(staff_member_id);
CREATE INDEX idx_staff_licenses_staff_member ON staff_licenses(staff_member_id);
CREATE INDEX idx_staff_licenses_expiry ON staff_licenses(expiry_date);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_staff_qualifications_updated_at 
  BEFORE UPDATE ON staff_qualifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_licenses_updated_at 
  BEFORE UPDATE ON staff_licenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE staff_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_licenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Enable all operations for authenticated users" ON staff_qualifications 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON staff_licenses 
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions for new tables
GRANT ALL ON staff_qualifications TO authenticated;
GRANT ALL ON staff_licenses TO authenticated;

-- Verify the setup
SELECT 'Staff members table created successfully!' as status;
SELECT COUNT(*) as existing_users_migrated FROM staff_members;
SELECT 'Qualifications and licenses tables created!' as additional_tables;
SELECT 'Next: Update StaffManagement component to use staff_members table' as next_step;
