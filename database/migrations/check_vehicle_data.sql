-- Diagnostic Query: Check existing vehicle data
-- Run this FIRST to see what values exist before running the migration

-- Check what type values exist
SELECT 
    type,
    COUNT(*) as count
FROM vehicles
GROUP BY type
ORDER BY count DESC;

-- Check what status values exist (if status column exists)
SELECT 
    status,
    COUNT(*) as count
FROM vehicles
GROUP BY status
ORDER BY count DESC;

-- Show all vehicles with their current type and status
SELECT 
    id,
    registration,
    type,
    status
FROM vehicles
ORDER BY registration;

