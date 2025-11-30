-- Schema Audit Query
-- Run this in Supabase SQL Editor to see actual table structures
-- Compare results with TypeScript types in src/lib/supabase.ts

SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'vehicles',
        'jobs', 
        'users',
        'drivers',
        'client_contacts',
        'delivery_addresses',
        'routes',
        'trailer_plot_allocations'
    )
ORDER BY table_name, ordinal_position;

-- Also check for constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name IN (
        'vehicles',
        'jobs',
        'users',
        'drivers',
        'client_contacts',
        'delivery_addresses'
    )
ORDER BY tc.table_name, tc.constraint_type;

