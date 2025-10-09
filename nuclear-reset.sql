-- NUCLEAR OPTION: Complete availability reset for clean event-based system
-- This will drop and recreate the availability table with proper event-based structure
-- WARNING: This will delete ALL existing availability data

-- Step 1: Backup existing availability (just in case)
CREATE TABLE availability_full_backup AS 
SELECT 
    a.*,
    e.date as event_date,
    e.title as event_title
FROM availability a
JOIN events e ON a.event_id = e.id;

-- Step 2: Drop all availability-related objects
DROP VIEW IF EXISTS availability_by_date CASCADE;
DROP TABLE IF EXISTS availability CASCADE;

-- Step 3: Recreate availability table with clean event-based structure
CREATE TABLE availability (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('A', 'U', '?')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, person_id)
);

-- Step 4: Create indexes
CREATE INDEX idx_availability_event_id ON availability(event_id);
CREATE INDEX idx_availability_person_id ON availability(person_id);

-- Step 5: Recreate compatibility view
CREATE OR REPLACE VIEW availability_by_date AS
SELECT 
    a.id,
    e.date,
    a.person_id,
    a.state,
    a.event_id,
    a.created_at
FROM availability a
JOIN events e ON a.event_id = e.id;

-- Step 6: Update RLS policies
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on availability" ON availability FOR ALL USING (true);

-- Step 7: Verification
DO $$
DECLARE
    table_count INTEGER;
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count FROM availability;
    SELECT COUNT(*) INTO backup_count FROM availability_full_backup;
    
    RAISE NOTICE '✅ Availability table recreated successfully';
    RAISE NOTICE 'Current availability records: %', table_count;
    RAISE NOTICE 'Backed up records: %', backup_count;
    RAISE NOTICE 'All events now start with clean availability';
    RAISE NOTICE 'Members need to re-submit their availability responses';
END $$;

-- Optional: If you want to restore some specific data, uncomment and modify:
/*
-- Restore availability for specific recent events (adjust the date as needed)
INSERT INTO availability (event_id, person_id, state, created_at)
SELECT 
    a.event_id,
    a.person_id,
    a.state,
    a.created_at
FROM availability_full_backup a
JOIN events e ON a.event_id = e.id
WHERE e.date >= '2025-10-01'  -- Adjust this date
ON CONFLICT (event_id, person_id) DO NOTHING;
*/