-- Supabase table setup for band availability app
-- Run these commands in your Supabase SQL editor

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Service',
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'service',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability table (event-based)
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('A', 'U', '?')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, person_id)
);

-- Migration: Add event_id column and migrate existing date-based data
DO $$ 
BEGIN
    -- Check if we need to migrate from date-based to event-based availability
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'availability' AND column_name = 'date') THEN
        -- Add event_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'availability' AND column_name = 'event_id') THEN
            ALTER TABLE availability ADD COLUMN event_id INTEGER;
        END IF;
        
        -- Migrate existing availability data to use event_id
        -- For each availability record, find the corresponding event by date
        UPDATE availability 
        SET event_id = events.id 
        FROM events 
        WHERE availability.date = events.date 
        AND availability.event_id IS NULL;
        
        -- Remove records that couldn't be migrated (no matching event)
        DELETE FROM availability WHERE event_id IS NULL;
        
        -- Drop the old date column and unique constraint
        ALTER TABLE availability DROP CONSTRAINT IF EXISTS availability_date_person_id_key;
        ALTER TABLE availability DROP COLUMN IF EXISTS date;
        
        -- Add foreign key constraint and new unique constraint
        ALTER TABLE availability ADD CONSTRAINT availability_event_id_fkey 
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
        ALTER TABLE availability ADD CONSTRAINT availability_event_id_person_id_key 
            UNIQUE(event_id, person_id);
    END IF;
END $$;

-- Create backward compatibility view for date-based queries
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

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin password
INSERT INTO settings (key, value) VALUES ('adminPassword', 'band2025')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Migration: Remove UNIQUE constraint on events.date (if it exists)
-- This allows multiple events on the same date
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'events_date_key' 
        AND table_name = 'events'
    ) THEN
        ALTER TABLE events DROP CONSTRAINT events_date_key;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_availability_event_id ON availability(event_id);
CREATE INDEX IF NOT EXISTS idx_availability_person ON availability(person_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for demo purposes)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations on members" ON members FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations on availability" ON availability FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true);
