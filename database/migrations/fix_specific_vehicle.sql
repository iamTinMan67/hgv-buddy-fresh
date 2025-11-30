-- Fix specific vehicle by ID
-- Replace the UUID below with the actual vehicle ID

-- Check the current state of the vehicle
SELECT 
    id,
    registration,
    type,
    status,
    make,
    model,
    year
FROM vehicles
WHERE id = 'ca79e128-571a-4a4b-bbf2-4849162e5fb6';

-- Fix the type if it's invalid
UPDATE vehicles 
SET type = 'HGV'
WHERE id = 'ca79e128-571a-4a4b-bbf2-4849162e5fb6'
  AND (type IS NULL OR type NOT IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid'));

-- Fix the status if it's invalid
UPDATE vehicles 
SET status = 'available'
WHERE id = 'ca79e128-571a-4a4b-bbf2-4849162e5fb6'
  AND (status IS NULL OR status NOT IN ('available', 'in_use', 'maintenance', 'out_of_service'));

-- Verify the fix
SELECT 
    id,
    registration,
    type,
    status
FROM vehicles
WHERE id = 'ca79e128-571a-4a4b-bbf2-4849162e5fb6';

