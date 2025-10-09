-- Migration: Add event_id to availability table and update constraint
-- This migration allows availabilities to be set per event rather than per date

-- Step 1: Add event_id column (nullable initially)
ALTER TABLE availability 
ADD COLUMN IF NOT EXISTS event_id INTEGER REFERENCES events(id) ON DELETE CASCADE;

-- Step 2: Migrate existing data
-- For each existing availability record, find the matching event by date
UPDATE availability a
SET event_id = e.id
FROM events e
WHERE a.event_id IS NULL 
  AND e.date = a.date
  AND e.id = (
    -- In case of multiple events on same date, pick the first one (lowest ID)
    SELECT MIN(id) FROM events WHERE date = a.date
  );

-- Step 3: Remove records that couldn't be migrated (shouldn't happen in normal cases)
DELETE FROM availability WHERE event_id IS NULL;

-- Step 4: Make event_id NOT NULL
ALTER TABLE availability 
ALTER COLUMN event_id SET NOT NULL;

-- Step 5: Drop the old unique constraint on (date, person_id)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'availability_date_person_id_key' 
        AND table_name = 'availability'
    ) THEN
        ALTER TABLE availability DROP CONSTRAINT availability_date_person_id_key;
    END IF;
END $$;

-- Step 6: Add new unique constraint on (event_id, person_id)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'availability_event_id_person_id_key' 
        AND table_name = 'availability'
    ) THEN
        ALTER TABLE availability ADD CONSTRAINT availability_event_id_person_id_key UNIQUE (event_id, person_id);
    END IF;
END $$;

-- Step 7: Drop the date column (it's now redundant since we have event_id)
-- Note: Keeping it for now for backwards compatibility, can be removed later if needed
-- ALTER TABLE availability DROP COLUMN IF EXISTS date;

-- Step 8: Create index on event_id for better query performance
CREATE INDEX IF NOT EXISTS idx_availability_event ON availability(event_id);

-- Step 9: Drop old date index if it exists
DROP INDEX IF EXISTS idx_availability_date;

-- Verify migration
-- This should return the count of availability records with valid event_id
SELECT COUNT(*) as migrated_records FROM availability WHERE event_id IS NOT NULL;
