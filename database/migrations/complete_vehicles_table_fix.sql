-- COMPLETE VEHICLES TABLE FIX
-- This migration fixes existing data AND adds all missing columns
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Add all missing columns first (without constraints)
-- ============================================
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS fleet_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS make VARCHAR(100),
ADD COLUMN IF NOT EXISTS model VARCHAR(100),
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS type VARCHAR(20),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available',
ADD COLUMN IF NOT EXISTS capacity DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS width DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS height DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS length DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS last_inspection DATE,
ADD COLUMN IF NOT EXISTS next_mot DATE,
ADD COLUMN IF NOT EXISTS next_service DATE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- STEP 2: Fix all existing data to have valid values
-- ============================================

-- Fix type: Set all NULL or invalid values to 'HGV'
UPDATE vehicles 
SET type = 'HGV'
WHERE type IS NULL 
   OR type NOT IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid');

-- Fix status: Set all NULL or invalid values to 'available'
UPDATE vehicles 
SET status = 'available'
WHERE status IS NULL 
   OR status NOT IN ('available', 'in_use', 'maintenance', 'out_of_service');

-- ============================================
-- STEP 3: Drop existing constraints if they exist (to allow recreation)
-- ============================================
DO $$ 
BEGIN
    -- Drop type constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'vehicles' 
        AND constraint_name = 'vehicles_type_check'
    ) THEN
        ALTER TABLE vehicles DROP CONSTRAINT vehicles_type_check;
    END IF;
    
    -- Drop status constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'vehicles' 
        AND constraint_name = 'vehicles_status_check'
    ) THEN
        ALTER TABLE vehicles DROP CONSTRAINT vehicles_status_check;
    END IF;
END $$;

-- ============================================
-- STEP 4: Verify all data is valid before adding constraints
-- ============================================
DO $$ 
DECLARE
    invalid_type_count INTEGER;
    invalid_status_count INTEGER;
BEGIN
    -- Check for invalid type values
    SELECT COUNT(*) INTO invalid_type_count
    FROM vehicles
    WHERE type IS NULL 
       OR type NOT IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid');
    
    -- Check for invalid status values
    SELECT COUNT(*) INTO invalid_status_count
    FROM vehicles
    WHERE status IS NULL 
       OR status NOT IN ('available', 'in_use', 'maintenance', 'out_of_service');
    
    IF invalid_type_count > 0 THEN
        RAISE EXCEPTION 'Cannot proceed: % rows have invalid type values. Please fix them first.', invalid_type_count;
    END IF;
    
    IF invalid_status_count > 0 THEN
        RAISE EXCEPTION 'Cannot proceed: % rows have invalid status values. Please fix them first.', invalid_status_count;
    END IF;
    
    RAISE NOTICE 'All vehicle data is valid. Proceeding with constraints...';
END $$;

-- ============================================
-- STEP 5: Add CHECK constraints
-- ============================================
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_type_check 
CHECK (type IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid'));

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service'));

-- ============================================
-- STEP 6: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_vehicles_fleet_number ON vehicles(fleet_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_capacity ON vehicles(capacity);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_mot ON vehicles(next_mot);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_service ON vehicles(next_service);

-- ============================================
-- STEP 7: Add column comments
-- ============================================
COMMENT ON COLUMN vehicles.fleet_number IS 'Unique fleet identification number';
COMMENT ON COLUMN vehicles.capacity IS 'Vehicle capacity in tons';
COMMENT ON COLUMN vehicles.width IS 'Vehicle width in centimeters';
COMMENT ON COLUMN vehicles.height IS 'Vehicle height in centimeters';
COMMENT ON COLUMN vehicles.length IS 'Vehicle length in centimeters';

-- ============================================
-- STEP 8: Verification query (run this to verify)
-- ============================================
-- Uncomment to see the results:
-- SELECT 
--     COUNT(*) as total_vehicles,
--     COUNT(DISTINCT type) as unique_types,
--     COUNT(DISTINCT status) as unique_statuses
-- FROM vehicles;

