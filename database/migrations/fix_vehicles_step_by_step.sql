-- Step-by-step fix for vehicles table
-- Run each section separately if needed

-- STEP 1: Check what type values actually exist
SELECT 
    type,
    COUNT(*) as count
FROM vehicles
WHERE type IS NOT NULL
GROUP BY type
ORDER BY count DESC;

-- STEP 2: Check if type column exists, if not, add it first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'type'
    ) THEN
        ALTER TABLE vehicles ADD COLUMN type VARCHAR(20);
    END IF;
END $$;

-- STEP 3: Set all NULL or invalid type values to 'HGV'
UPDATE vehicles 
SET type = 'HGV'
WHERE type IS NULL 
   OR type NOT IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid');

-- STEP 4: Verify all types are now valid
SELECT 
    type,
    COUNT(*) as count
FROM vehicles
GROUP BY type
ORDER BY count DESC;

-- STEP 5: Now add the constraint (only if all values are valid)
DO $$ 
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM vehicles
    WHERE type IS NULL 
       OR type NOT IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid');
    
    IF invalid_count = 0 THEN
        -- Drop existing constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'vehicles' 
            AND constraint_name = 'vehicles_type_check'
        ) THEN
            ALTER TABLE vehicles DROP CONSTRAINT vehicles_type_check;
        END IF;
        
        -- Add constraint
        ALTER TABLE vehicles 
        ADD CONSTRAINT vehicles_type_check 
        CHECK (type IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid'));
        
        RAISE NOTICE 'Type constraint added successfully';
    ELSE
        RAISE EXCEPTION 'Cannot add constraint: % rows still have invalid type values', invalid_count;
    END IF;
END $$;

