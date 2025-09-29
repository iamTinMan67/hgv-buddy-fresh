-- Add comprehensive wage automation tables
-- Run this in Supabase SQL Editor to extend the wage system

-- Create wage_settings table (linked to staff_members)
CREATE TABLE wage_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  standard_hours_per_week DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  hourly_rate DECIMAL(8,2) NOT NULL,
  overtime_rate DECIMAL(8,2) NOT NULL,
  standard_start_time TIME NOT NULL DEFAULT '08:00',
  standard_end_time TIME NOT NULL DEFAULT '16:00',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_settings table (linked to staff_members)
CREATE TABLE tax_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  tax_code VARCHAR(10) NOT NULL DEFAULT '1257L', -- UK tax code
  national_insurance_category CHAR(1) NOT NULL DEFAULT 'A', -- A, B, C, D, E, F, G, H, J, M, Z
  pension_contribution_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
  student_loan_plan VARCHAR(20) DEFAULT NULL, -- Plan 1, Plan 2, Plan 4, or NULL
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timesheet_entries table (linked to staff_members)
CREATE TABLE timesheet_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  break_minutes INTEGER DEFAULT 15,
  lunch_minutes INTEGER DEFAULT 30,
  total_minutes INTEGER DEFAULT 0,
  standard_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  notes TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wage_calculations table (automated calculations)
CREATE TABLE wage_calculations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  total_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  standard_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  overtime_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  standard_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  overtime_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  -- Tax deductions
  income_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  national_insurance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  pension_contribution DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  student_loan DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  -- Other deductions
  other_deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  net_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'calculated', -- calculated, approved, paid
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wage_slips table (generated pay slips)
CREATE TABLE wage_slips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wage_calculation_id UUID REFERENCES wage_calculations(id) ON DELETE CASCADE,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  slip_number VARCHAR(50) UNIQUE NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  -- Employee details
  employee_name VARCHAR(255) NOT NULL,
  employee_number VARCHAR(50),
  national_insurance VARCHAR(20),
  tax_code VARCHAR(10),
  -- Pay details
  gross_pay DECIMAL(10,2) NOT NULL,
  total_deductions DECIMAL(10,2) NOT NULL,
  net_pay DECIMAL(10,2) NOT NULL,
  -- Breakdown
  standard_pay DECIMAL(10,2) NOT NULL,
  overtime_pay DECIMAL(10,2) NOT NULL,
  income_tax DECIMAL(10,2) NOT NULL,
  national_insurance_deduction DECIMAL(10,2) NOT NULL,
  pension_contribution DECIMAL(10,2) NOT NULL,
  student_loan DECIMAL(10,2) NOT NULL,
  other_deductions DECIMAL(10,2) NOT NULL,
  -- Hours
  total_hours DECIMAL(8,2) NOT NULL,
  standard_hours DECIMAL(8,2) NOT NULL,
  overtime_hours DECIMAL(8,2) NOT NULL,
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'generated', -- generated, sent, acknowledged
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_wage_settings_staff_member ON wage_settings(staff_member_id);
CREATE INDEX idx_tax_settings_staff_member ON tax_settings(staff_member_id);
CREATE INDEX idx_timesheet_entries_staff_member ON timesheet_entries(staff_member_id);
CREATE INDEX idx_timesheet_entries_date ON timesheet_entries(date);
CREATE INDEX idx_wage_calculations_staff_member ON wage_calculations(staff_member_id);
CREATE INDEX idx_wage_calculations_pay_period ON wage_calculations(pay_period_start, pay_period_end);
CREATE INDEX idx_wage_slips_staff_member ON wage_slips(staff_member_id);
CREATE INDEX idx_wage_slips_pay_period ON wage_slips(pay_period_start, pay_period_end);

-- Create updated_at triggers
CREATE TRIGGER update_wage_settings_updated_at 
  BEFORE UPDATE ON wage_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_settings_updated_at 
  BEFORE UPDATE ON tax_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheet_entries_updated_at 
  BEFORE UPDATE ON timesheet_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wage_calculations_updated_at 
  BEFORE UPDATE ON wage_calculations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wage_slips_updated_at 
  BEFORE UPDATE ON wage_slips 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE wage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_slips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON wage_settings 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON tax_settings 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON timesheet_entries 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON wage_calculations 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON wage_slips 
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON wage_settings TO authenticated;
GRANT ALL ON tax_settings TO authenticated;
GRANT ALL ON timesheet_entries TO authenticated;
GRANT ALL ON wage_calculations TO authenticated;
GRANT ALL ON wage_slips TO authenticated;

-- Insert default wage settings for existing staff members
INSERT INTO wage_settings (staff_member_id, standard_hours_per_week, hourly_rate, overtime_rate)
SELECT 
  sm.id,
  40.00 as standard_hours_per_week,
  CASE 
    WHEN sm.role = 'driver' THEN 15.50
    WHEN sm.role = 'admin' THEN 18.00
    WHEN sm.role = 'manager' THEN 20.00
    ELSE 15.00
  END as hourly_rate,
  CASE 
    WHEN sm.role = 'driver' THEN 23.25
    WHEN sm.role = 'admin' THEN 27.00
    WHEN sm.role = 'manager' THEN 30.00
    ELSE 22.50
  END as overtime_rate
FROM staff_members sm
WHERE NOT EXISTS (
  SELECT 1 FROM wage_settings ws WHERE ws.staff_member_id = sm.id
);

-- Insert default tax settings for existing staff members
INSERT INTO tax_settings (staff_member_id, tax_code, national_insurance_category)
SELECT 
  sm.id,
  COALESCE(sm.tax_code, '1257L') as tax_code,
  'A' as national_insurance_category
FROM staff_members sm
WHERE NOT EXISTS (
  SELECT 1 FROM tax_settings ts WHERE ts.staff_member_id = sm.id
);

-- Verify the setup
SELECT 'Wage automation tables created successfully!' as status;
SELECT COUNT(*) as wage_settings_created FROM wage_settings;
SELECT COUNT(*) as tax_settings_created FROM tax_settings;
SELECT 'Next: Update wage calculation system to use new tables' as next_step;
