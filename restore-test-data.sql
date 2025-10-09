-- Quick restore of backed up availability data for testing
-- This will restore the availability data so we can test the event-specific behavior

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

-- Verify what we restored
SELECT 
    COUNT(*) as total_restored,
    COUNT(DISTINCT event_id) as events_with_availability,
    COUNT(DISTINCT person_id) as people_with_availability
FROM availability;

-- Check events 11 and 20 specifically
SELECT 
    e.id,
    e.title,
    e.date,
    COUNT(a.id) as availability_responses
FROM events e
LEFT JOIN availability a ON e.id = a.event_id
WHERE e.id IN (11, 20)
GROUP BY e.id, e.title, e.date
ORDER BY e.id;