-- Restore availability data from backup in correct event-based format
-- Run this in Supabase SQL Editor after the nuclear reset

-- First, let's check what we have in the backup
SELECT 
    COUNT(*) as total_backup_records,
    COUNT(DISTINCT event_id) as unique_events,
    COUNT(DISTINCT person_id) as unique_people,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM availability_full_backup;

-- Check if we have valid event_ids in the backup that still exist in events table
SELECT 
    COUNT(*) as valid_event_records,
    COUNT(DISTINCT afb.event_id) as valid_events
FROM availability_full_backup afb
JOIN events e ON afb.event_id = e.id;

-- Now restore the data - insert from backup into the clean availability table
INSERT INTO availability (event_id, person_id, state, created_at)
SELECT 
    afb.event_id,
    afb.person_id,
    afb.state,
    afb.created_at
FROM availability_full_backup afb
JOIN events e ON afb.event_id = e.id  -- Only restore for events that still exist
JOIN members m ON afb.person_id = m.id  -- Only restore for members that still exist
ON CONFLICT (event_id, person_id) DO UPDATE SET
    state = EXCLUDED.state,
    created_at = EXCLUDED.created_at;

-- Verification: Check the restored data
SELECT 
    COUNT(*) as restored_records,
    COUNT(DISTINCT event_id) as events_with_availability,
    COUNT(DISTINCT person_id) as people_with_availability
FROM availability;

-- Check availability by event to ensure proper separation
SELECT 
    e.date,
    e.title,
    COUNT(a.id) as availability_responses
FROM events e
LEFT JOIN availability a ON e.id = a.event_id
GROUP BY e.id, e.date, e.title
ORDER BY e.date DESC;

-- Final verification: Show sample of restored data
SELECT 
    e.date,
    e.title,
    m.name as member_name,
    a.state,
    a.created_at
FROM availability a
JOIN events e ON a.event_id = e.id
JOIN members m ON a.person_id = m.id
ORDER BY e.date DESC, m.name
LIMIT 20;