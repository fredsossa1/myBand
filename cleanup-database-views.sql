-- Cleanup unused database views and objects
-- Run this in Supabase SQL Editor to remove obsolete database objects

-- Drop the availability_by_date view (no longer needed)
DROP VIEW IF EXISTS availability_by_date CASCADE;

-- Verify the view is gone
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%availability%';

-- Show remaining tables (should only show 'availability' table)
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%availability%';