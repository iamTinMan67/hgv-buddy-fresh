-- Check existing wage automation tables and create only missing ones
-- Run this in Supabase SQL Editor to safely add missing wage tables

-- Check what wage tables already exist
SELECT 'Existing wage automation tables:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%wage%' OR table_name LIKE '%tax%' OR table_name LIKE '%timesheet%'
ORDER BY table_name;

-- Check if wage_settings exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wage_settings') THEN
        -- Create wage_settings table
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
        
        CREATE INDEX idx_wage_settings_staff_member ON wage_settings(staff_member_id);
        CREATE TRIGGER update_wage_settings_updated_at 
          BEFORE UPDATE ON wage_settings 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ALTER TABLE wage_settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON wage_settings 
          FOR ALL USING (auth.role() = 'authenticated');
        GRANT ALL ON wage_settings TO authenticated;
        
        RAISE NOTICE 'Created wage_settings table';
    ELSE
        RAISE NOTICE 'wage_settings table already exists';
    END IF;
END $$;

-- Check if tax_settings exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tax_settings') THEN
        -- Create tax_settings table
        CREATE TABLE tax_settings (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
          tax_code VARCHAR(10) NOT NULL DEFAULT '1257L',
          national_insurance_category CHAR(1) NOT NULL DEFAULT 'A',
          pension_contribution_rate DECIMAL(5,2) DEFAULT 0.00,
          student_loan_plan VARCHAR(20) DEFAULT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_tax_settings_staff_member ON tax_settings(staff_member_id);
        CREATE TRIGGER update_tax_settings_updated_at 
          BEFORE UPDATE ON tax_settings 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON tax_settings 
          FOR ALL USING (auth.role() = 'authenticated');
        GRANT ALL ON tax_settings TO authenticated;
        
        RAISE NOTICE 'Created tax_settings table';
    ELSE
        RAISE NOTICE 'tax_settings table already exists';
    END IF;
END $$;

-- Check if timesheet_entries exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timesheet_entries') THEN
        -- Create timesheet_entries table
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
        
        CREATE INDEX idx_timesheet_entries_staff_member ON timesheet_entries(staff_member_id);
        CREATE INDEX idx_timesheet_entries_date ON timesheet_entries(date);
        CREATE TRIGGER update_timesheet_entries_updated_at 
          BEFORE UPDATE ON timesheet_entries 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON timesheet_entries 
          FOR ALL USING (auth.role() = 'authenticated');
        GRANT ALL ON timesheet_entries TO authenticated;
        
        RAISE NOTICE 'Created timesheet_entries table';
    ELSE
        RAISE NOTICE 'timesheet_entries table already exists';
    END IF;
END $$;

-- Check if wage_calculations exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wage_calculations') THEN
        -- Create wage_calculations table
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
          income_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          national_insurance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          pension_contribution DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          student_loan DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          other_deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          net_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          status VARCHAR(20) NOT NULL DEFAULT 'calculated',
          calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          approved_by UUID REFERENCES users(id),
          approved_at TIMESTAMP WITH TIME ZONE,
          paid_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_wage_calculations_staff_member ON wage_calculations(staff_member_id);
        CREATE INDEX idx_wage_calculations_pay_period ON wage_calculations(pay_period_start, pay_period_end);
        CREATE TRIGGER update_wage_calculations_updated_at 
          BEFORE UPDATE ON wage_calculations 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ALTER TABLE wage_calculations ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON wage_calculations 
          FOR ALL USING (auth.role() = 'authenticated');
        GRANT ALL ON wage_calculations TO authenticated;
        
        RAISE NOTICE 'Created wage_calculations table';
    ELSE
        RAISE NOTICE 'wage_calculations table already exists';
    END IF;
END $$;

-- Check if wage_slips exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wage_slips') THEN
        -- Create wage_slips table
        CREATE TABLE wage_slips (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          wage_calculation_id UUID REFERENCES wage_calculations(id) ON DELETE CASCADE,
          staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
          slip_number VARCHAR(50) UNIQUE NOT NULL,
          pay_period_start DATE NOT NULL,
          pay_period_end DATE NOT NULL,
          employee_name VARCHAR(255) NOT NULL,
          employee_number VARCHAR(50),
          national_insurance VARCHAR(20),
          tax_code VARCHAR(10),
          gross_pay DECIMAL(10,2) NOT NULL,
          total_deductions DECIMAL(10,2) NOT NULL,
          net_pay DECIMAL(10,2) NOT NULL,
          standard_pay DECIMAL(10,2) NOT NULL,
          overtime_pay DECIMAL(10,2) NOT NULL,
          income_tax DECIMAL(10,2) NOT NULL,
          national_insurance_deduction DECIMAL(10,2) NOT NULL,
          pension_contribution DECIMAL(10,2) NOT NULL,
          student_loan DECIMAL(10,2) NOT NULL,
          other_deductions DECIMAL(10,2) NOT NULL,
          total_hours DECIMAL(8,2) NOT NULL,
          standard_hours DECIMAL(8,2) NOT NULL,
          overtime_hours DECIMAL(8,2) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'generated',
          generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          sent_at TIMESTAMP WITH TIME ZONE,
          acknowledged_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_wage_slips_staff_member ON wage_slips(staff_member_id);
        CREATE INDEX idx_wage_slips_pay_period ON wage_slips(pay_period_start, pay_period_end);
        CREATE TRIGGER update_wage_slips_updated_at 
          BEFORE UPDATE ON wage_slips 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ALTER TABLE wage_slips ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON wage_slips 
          FOR ALL USING (auth.role() = 'authenticated');
        GRANT ALL ON wage_slips TO authenticated;
        
        RAISE NOTICE 'Created wage_slips table';
    ELSE
        RAISE NOTICE 'wage_slips table already exists';
    END IF;
END $$;

-- Insert default wage settings for existing staff members (only if wage_settings is empty)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wage_settings') 
       AND NOT EXISTS (SELECT 1 FROM wage_settings LIMIT 1) THEN
        
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
        FROM staff_members sm;
        
        RAISE NOTICE 'Inserted default wage settings for existing staff members';
    ELSE
        RAISE NOTICE 'Wage settings already exist or staff_members table is empty';
    END IF;
END $$;

-- Insert default tax settings for existing staff members (only if tax_settings is empty)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tax_settings') 
       AND NOT EXISTS (SELECT 1 FROM tax_settings LIMIT 1) THEN
        
        INSERT INTO tax_settings (staff_member_id, tax_code, national_insurance_category)
        SELECT 
          sm.id,
          COALESCE(sm.tax_code, '1257L') as tax_code,
          'A' as national_insurance_category
        FROM staff_members sm;
        
        RAISE NOTICE 'Inserted default tax settings for existing staff members';
    ELSE
        RAISE NOTICE 'Tax settings already exist or staff_members table is empty';
    END IF;
END $$;

-- Final verification
SELECT 'Final wage automation tables:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('wage_settings', 'tax_settings', 'timesheet_entries', 'wage_calculations', 'wage_slips')
ORDER BY table_name;

-- Show counts
SELECT 'Table counts:' as info;
SELECT 'wage_settings:' as table_name, COUNT(*) as count FROM wage_settings
UNION ALL
SELECT 'tax_settings:' as table_name, COUNT(*) as count FROM tax_settings
UNION ALL
SELECT 'timesheet_entries:' as table_name, COUNT(*) as count FROM timesheet_entries
UNION ALL
SELECT 'wage_calculations:' as table_name, COUNT(*) as count FROM wage_calculations
UNION ALL
SELECT 'wage_slips:' as table_name, COUNT(*) as count FROM wage_slips;

SELECT 'Wage automation setup completed successfully!' as status;
