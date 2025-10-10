-- Final database cleanup: Remove backup table
-- Run this in Supabase SQL Editor to complete the cleanup process

-- Verify current system is working
SELECT 
    'Current availability system status:' as info,
    COUNT(*) as total_records,
    COUNT(DISTINCT event_id) as unique_events,
    COUNT(DISTINCT person_id) as unique_people
FROM availability;

-- Show what will be dropped
SELECT 'The following backup table will be removed:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'availability_full_backup';

-- Final cleanup: Drop the backup table
DROP TABLE IF EXISTS availability_full_backup CASCADE;

-- Verification: Confirm only the main availability table remains
SELECT 'Remaining availability tables after cleanup:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%availability%'
ORDER BY table_name;

-- Success message
SELECT 'Database cleanup completed! Only event-based availability system remains.' as result;