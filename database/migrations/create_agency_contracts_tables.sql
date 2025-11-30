-- Migration: Create Agency Contracts Tables
-- This migration creates tables for managing agency contracts and agency staff
-- to fulfill additional staff requirements

-- Agency Contracts Table
-- Stores information about agencies and their contracts
CREATE TABLE IF NOT EXISTS agency_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    agency_name VARCHAR(255) NOT NULL,
    agency_contact_name VARCHAR(255) NOT NULL,
    agency_contact_email VARCHAR(255) NOT NULL,
    agency_contact_phone VARCHAR(50),
    agency_contact_mobile VARCHAR(50),
    
    -- Agency Address
    agency_address_line1 VARCHAR(255) NOT NULL,
    agency_address_line2 VARCHAR(255),
    agency_address_line3 VARCHAR(255),
    agency_town VARCHAR(100),
    agency_city VARCHAR(100) NOT NULL,
    agency_postcode VARCHAR(20) NOT NULL,
    agency_country VARCHAR(100) DEFAULT 'United Kingdom',
    
    -- Bank Details for Payments
    bank_account_name VARCHAR(255) NOT NULL,
    bank_account_number VARCHAR(20) NOT NULL,
    bank_sort_code VARCHAR(10) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    building_society_number VARCHAR(20),
    
    -- Contract Details
    contract_start_date DATE NOT NULL,
    contract_end_date DATE,
    contract_status VARCHAR(20) DEFAULT 'active' CHECK (contract_status IN ('active', 'inactive', 'expired', 'terminated')),
    
    -- Standard Rates (per hour)
    standard_hourly_rate DECIMAL(10, 2) NOT NULL,
    overtime_hourly_rate DECIMAL(10, 2) NOT NULL,
    
    -- Standard Working Hours (for overtime calculation)
    standard_start_time TIME DEFAULT '08:00:00',
    standard_end_time TIME DEFAULT '17:00:00',
    standard_hours_per_week INTEGER DEFAULT 40,
    
    -- Additional Information
    notes TEXT,
    terms_and_conditions TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Agency Staff Table
-- Stores information about individual agency staff members
CREATE TABLE IF NOT EXISTS agency_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_contract_id UUID NOT NULL REFERENCES agency_contracts(id) ON DELETE CASCADE,
    
    -- Staff Identification
    staff_reference_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    family_name VARCHAR(100) NOT NULL,
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_line3 VARCHAR(255),
    town VARCHAR(100),
    city VARCHAR(100),
    postcode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United Kingdom',
    
    -- Staff Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unavailable', 'terminated')),
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- Qualifications (stored as JSON array)
    qualifications JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"name": "HGV License", "issuing_body": "DVLA", "issue_date": "2020-01-01", "expiry_date": "2025-01-01", "document_url": "..."}]
    
    -- Licenses (stored as JSON array)
    licenses JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"type": "Category C+E", "number": "ABC123456", "issuing_body": "DVLA", "issue_date": "2020-01-01", "expiry_date": "2025-01-01", "document_url": "..."}]
    
    -- Additional Information
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Ensure unique staff reference per agency
    UNIQUE(agency_contract_id, staff_reference_number)
);

-- Agency Timesheets Table
-- Tracks hours worked by agency staff
CREATE TABLE IF NOT EXISTS agency_timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_staff_id UUID NOT NULL REFERENCES agency_staff(id) ON DELETE CASCADE,
    agency_contract_id UUID NOT NULL REFERENCES agency_contracts(id) ON DELETE CASCADE,
    
    -- Timesheet Period
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    -- Hours Breakdown
    total_hours DECIMAL(10, 2) DEFAULT 0,
    standard_hours DECIMAL(10, 2) DEFAULT 0,
    overtime_hours DECIMAL(10, 2) DEFAULT 0,
    
    -- Rates Applied (snapshot at time of timesheet)
    standard_hourly_rate DECIMAL(10, 2) NOT NULL,
    overtime_hourly_rate DECIMAL(10, 2) NOT NULL,
    
    -- Payment Calculation
    standard_pay DECIMAL(10, 2) DEFAULT 0,
    overtime_pay DECIMAL(10, 2) DEFAULT 0,
    total_pay DECIMAL(10, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'paid', 'rejected')),
    
    -- Approval Workflow
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT,
    
    -- Additional Information
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Ensure one timesheet per staff member per week
    UNIQUE(agency_staff_id, week_start_date)
);

-- Agency Timesheet Entries Table
-- Individual day entries within a timesheet
CREATE TABLE IF NOT EXISTS agency_timesheet_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_timesheet_id UUID NOT NULL REFERENCES agency_timesheets(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),
    
    -- Entry Date and Times
    entry_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 0, -- minutes
    lunch_duration INTEGER DEFAULT 0, -- minutes
    
    -- Calculated Hours
    total_minutes INTEGER NOT NULL,
    standard_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    
    -- Pay Calculation
    standard_hours DECIMAL(10, 2) DEFAULT 0,
    overtime_hours DECIMAL(10, 2) DEFAULT 0,
    standard_pay DECIMAL(10, 2) DEFAULT 0,
    overtime_pay DECIMAL(10, 2) DEFAULT 0,
    total_pay DECIMAL(10, 2) DEFAULT 0,
    
    -- Additional Information
    description TEXT,
    job_reference VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_agency_contracts_status ON agency_contracts(contract_status);
CREATE INDEX IF NOT EXISTS idx_agency_contracts_contract_number ON agency_contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_agency_staff_contract_id ON agency_staff(agency_contract_id);
CREATE INDEX IF NOT EXISTS idx_agency_staff_status ON agency_staff(status);
CREATE INDEX IF NOT EXISTS idx_agency_timesheets_staff_id ON agency_timesheets(agency_staff_id);
CREATE INDEX IF NOT EXISTS idx_agency_timesheets_contract_id ON agency_timesheets(agency_contract_id);
CREATE INDEX IF NOT EXISTS idx_agency_timesheets_week_start ON agency_timesheets(week_start_date);
CREATE INDEX IF NOT EXISTS idx_agency_timesheets_status ON agency_timesheets(status);
CREATE INDEX IF NOT EXISTS idx_agency_timesheet_entries_timesheet_id ON agency_timesheet_entries(agency_timesheet_id);
CREATE INDEX IF NOT EXISTS idx_agency_timesheet_entries_date ON agency_timesheet_entries(entry_date);

-- Create Function to Update updated_at Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for updated_at
CREATE TRIGGER update_agency_contracts_updated_at BEFORE UPDATE ON agency_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_staff_updated_at BEFORE UPDATE ON agency_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_timesheets_updated_at BEFORE UPDATE ON agency_timesheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_timesheet_entries_updated_at BEFORE UPDATE ON agency_timesheet_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Function to Auto-generate Contract Number
CREATE OR REPLACE FUNCTION generate_agency_contract_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix VARCHAR(4);
    month_prefix VARCHAR(2);
    contract_count INTEGER;
    new_contract_number VARCHAR(50);
BEGIN
    -- Generate format: AGY-YYYY-MM-###
    year_prefix := TO_CHAR(NOW(), 'YYYY');
    month_prefix := TO_CHAR(NOW(), 'MM');
    
    -- Count existing contracts for this month
    SELECT COUNT(*) INTO contract_count
    FROM agency_contracts
    WHERE contract_number LIKE 'AGY-' || year_prefix || '-' || month_prefix || '-%';
    
    -- Generate new contract number
    new_contract_number := 'AGY-' || year_prefix || '-' || month_prefix || '-' || LPAD((contract_count + 1)::TEXT, 3, '0');
    
    NEW.contract_number := new_contract_number;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Trigger for Auto-generating Contract Number
CREATE TRIGGER generate_agency_contract_number_trigger
    BEFORE INSERT ON agency_contracts
    FOR EACH ROW
    WHEN (NEW.contract_number IS NULL OR NEW.contract_number = '')
    EXECUTE FUNCTION generate_agency_contract_number();

-- Add Comments for Documentation
COMMENT ON TABLE agency_contracts IS 'Stores agency contract information including contact details, bank details, and hourly rates';
COMMENT ON TABLE agency_staff IS 'Stores individual agency staff members with their qualifications and licenses';
COMMENT ON TABLE agency_timesheets IS 'Tracks weekly timesheets for agency staff with hours and pay calculations';
COMMENT ON TABLE agency_timesheet_entries IS 'Individual day entries within agency timesheets';

