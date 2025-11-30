-- Comprehensive Vehicles Table Migration
-- This adds ALL missing columns that the application expects
-- Run this AFTER running get_full_schema.sql to verify what already exists

-- Add all missing columns to vehicles table
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

-- First, check what type values actually exist (for debugging)
-- Uncomment to see what values are in the database:
-- SELECT DISTINCT type FROM vehicles WHERE type IS NOT NULL;

-- Update ALL existing rows to ensure type is valid
-- Set default 'HGV' for any invalid or NULL values
UPDATE vehicles 
SET type = COALESCE(
    CASE 
        WHEN LOWER(type) IN ('truck', 'hgv', 'rigid') THEN 'HGV'
        WHEN LOWER(type) = 'articulated' THEN 'Articulated'
        WHEN LOWER(type) = 'van' THEN 'Van'
        WHEN LOWER(type) IN ('pcv', 'psv') THEN UPPER(type)
        WHEN LOWER(type) = 'car' THEN 'Car'
        WHEN type IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid') THEN type
        ELSE 'HGV'  -- Default for any unrecognized values
    END,
    'HGV'  -- Default for NULL
)
WHERE type IS NULL 
   OR type NOT IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid');

-- Update ALL existing rows to ensure status is valid
UPDATE vehicles 
SET status = COALESCE(
    CASE 
        WHEN LOWER(status) = 'active' THEN 'available'
        WHEN LOWER(status) = 'retired' THEN 'out_of_service'
        WHEN LOWER(status) IN ('maintenance', 'in_use', 'out_of_service') THEN LOWER(status)
        WHEN status IN ('available', 'in_use', 'maintenance', 'out_of_service') THEN status
        ELSE 'available'  -- Default for any unrecognized values
    END,
    'available'  -- Default for NULL
)
WHERE status IS NULL 
   OR status NOT IN ('available', 'in_use', 'maintenance', 'out_of_service');

-- Verify all rows are valid before adding constraint
DO $$ 
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Check for invalid type values
    SELECT COUNT(*) INTO invalid_count
    FROM vehicles
    WHERE type IS NULL 
       OR type NOT IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid');
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % rows with invalid type values. Please fix them first.', invalid_count;
    END IF;
    
    -- Check for invalid status values
    SELECT COUNT(*) INTO invalid_count
    FROM vehicles
    WHERE status IS NULL 
       OR status NOT IN ('available', 'in_use', 'maintenance', 'out_of_service');
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % rows with invalid status values. Please fix them first.', invalid_count;
    END IF;
END $$;

-- Now add CHECK constraints for type and status
DO $$ 
BEGIN
    -- Drop existing constraint if it exists (to allow recreation)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'vehicles' 
        AND constraint_name = 'vehicles_type_check'
    ) THEN
        ALTER TABLE vehicles DROP CONSTRAINT vehicles_type_check;
    END IF;
    
    -- Add type constraint
    ALTER TABLE vehicles 
    ADD CONSTRAINT vehicles_type_check 
    CHECK (type IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid'));

    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'vehicles' 
        AND constraint_name = 'vehicles_status_check'
    ) THEN
        ALTER TABLE vehicles DROP CONSTRAINT vehicles_status_check;
    END IF;
    
    -- Add status constraint
    ALTER TABLE vehicles 
    ADD CONSTRAINT vehicles_status_check 
    CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service'));
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_fleet_number ON vehicles(fleet_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_capacity ON vehicles(capacity);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_mot ON vehicles(next_mot);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_service ON vehicles(next_service);

-- Add comments
COMMENT ON COLUMN vehicles.fleet_number IS 'Unique fleet identification number';
COMMENT ON COLUMN vehicles.capacity IS 'Vehicle capacity in tons';
COMMENT ON COLUMN vehicles.width IS 'Vehicle width in centimeters';
COMMENT ON COLUMN vehicles.height IS 'Vehicle height in centimeters';
COMMENT ON COLUMN vehicles.length IS 'Vehicle length in centimeters';

