-- Simple fix: Update ALL vehicles to have valid type and status
-- This will fix all existing rows before adding constraints

-- First, ensure type column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'type'
    ) THEN
        ALTER TABLE vehicles ADD COLUMN type VARCHAR(20);
    END IF;
END $$;

-- Ensure status column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'status'
    ) THEN
        ALTER TABLE vehicles ADD COLUMN status VARCHAR(20) DEFAULT 'available';
    END IF;
END $$;

-- Fix ALL type values - set to 'HGV' if invalid or NULL
UPDATE vehicles 
SET type = 'HGV'
WHERE type IS NULL 
   OR type NOT IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid');

-- Fix ALL status values - set to 'available' if invalid or NULL
UPDATE vehicles 
SET status = 'available'
WHERE status IS NULL 
   OR status NOT IN ('available', 'in_use', 'maintenance', 'out_of_service');

-- Verify all rows are now valid
SELECT 
    'Type values:' as check_type,
    type,
    COUNT(*) as count
FROM vehicles
GROUP BY type
UNION ALL
SELECT 
    'Status values:' as check_type,
    status,
    COUNT(*) as count
FROM vehicles
GROUP BY status;

