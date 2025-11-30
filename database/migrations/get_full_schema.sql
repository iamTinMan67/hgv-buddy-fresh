-- Get Complete Schema Information
-- Run this to see all columns (not just constraints)

-- Get all columns for each table
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
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

