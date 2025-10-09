# Event-Based Availability Migration Guide

## Overview

This migration updates the availability system to support multiple events on the same day. Previously, availability was keyed by `(date, person_id)`, which meant users could only set one availability per day. Now, availability is keyed by `(event_id, person_id)`, allowing separate availability for each event.

## What Changed

### Database Schema

**Before:**
- Availability table had `date` field
- Unique constraint: `(date, person_id)`
- One availability per person per day

**After:**
- Availability table has `event_id` field (references events table)
- Unique constraint: `(event_id, person_id)`
- One availability per person per event
- `date` field is still present for backward compatibility (can be removed later)

### API Changes

**setAvailability Endpoint:**
- **Before:** `POST /api/availability { date, personId, state }`
- **After:** `POST /api/availability { eventId, personId, state }`

**getAvailability Response:**
- **Before:** Returns `{ id, date, person_id, state }`
- **After:** Returns `{ id, event_id, person_id, state, _event: { id, date, title } }`

### TypeScript Types

**AvailabilityRecord:**
```typescript
// Before
interface AvailabilityRecord {
  id?: number;
  date: string;
  person_id: string;
  state: AvailabilityState;
}

// After
interface AvailabilityRecord {
  id?: number;
  event_id: string | number;
  person_id: string;
  state: AvailabilityState;
  _event?: {
    id: number;
    date: string;
    title: string;
  };
}
```

## Migration Steps

### Step 1: Backup Your Data

Before running the migration, backup your database:

```bash
# Using Supabase CLI
supabase db dump > backup-$(date +%Y%m%d).sql

# Or for cross-platform compatibility
supabase db dump > backup-YYYYMMDD.sql  # Replace YYYYMMDD with current date

# Or using PostgreSQL directly
pg_dump -h your-host -U your-user -d your-db > backup.sql
```

### Step 2: Run the Migration SQL

Execute the migration script in your Supabase SQL Editor:

```bash
# The migration script is at: supabase-migration-event-availability.sql
```

The migration will:
1. Add `event_id` column to availability table
2. Migrate existing data (maps availability by date to events)
3. Update unique constraints
4. Create necessary indexes

### Step 3: Verify Migration

After running the migration, verify the data:

```sql
-- Check that all availability records have event_id
SELECT COUNT(*) as total_records,
       COUNT(event_id) as records_with_event_id
FROM availability;

-- Check for any orphaned records
SELECT COUNT(*)
FROM availability a
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.id = a.event_id
);
```

### Step 4: Deploy Frontend Changes

The frontend has been updated with backward compatibility:

1. The `useAvailability` hook accepts both `date` (string) and `eventId` (number)
2. Internally, it converts dates to event IDs when needed
3. All utility functions work with the new `event_id` field

### Step 5: Test Multiple Events on Same Day

Create two events on the same day and verify:

```sql
-- Create test events
INSERT INTO events (date, title, type) VALUES
  ('2025-01-15', 'Morning Rehearsal', 'band-only'),
  ('2025-01-15', 'Evening Service', 'service');

-- Set different availability for each event
-- (Use the UI or API to set availability)
```

## Rollback Procedure

If you need to rollback the migration:

```sql
-- 1. Drop the new constraint
ALTER TABLE availability 
  DROP CONSTRAINT IF EXISTS availability_event_id_person_id_key;

-- 2. Re-add the old constraint (if date field still exists)
ALTER TABLE availability 
  ADD CONSTRAINT availability_date_person_id_key UNIQUE (date, person_id);

-- 3. Drop event_id column (WARNING: This loses the event association)
ALTER TABLE availability DROP COLUMN IF EXISTS event_id;

-- 4. Restore from backup if needed
-- psql -h your-host -U your-user -d your-db < backup.sql
```

## Breaking Changes

### For API Consumers

If you have custom scripts or external tools using the availability API:

1. Update POST requests to use `eventId` instead of `date`
2. Update response parsing to handle `event_id` instead of `date`
3. Use the `_event` field to get date information

### For Custom Queries

If you have custom SQL queries:

```sql
-- Before
SELECT * FROM availability WHERE date = '2025-01-15';

-- After (need to join with events)
SELECT a.*, e.date, e.title
FROM availability a
JOIN events e ON e.id = a.event_id
WHERE e.date = '2025-01-15';
```

## New Capabilities

With this update, you can now:

1. **Multiple Events Per Day:** Set different availability for rehearsals and services on the same day
2. **Event-Specific Responses:** Track which event each availability response is for
3. **Better Reporting:** Generate reports per event rather than per date
4. **Flexible Scheduling:** Support complex scheduling scenarios with multiple events

## Troubleshooting

### Issue: Migration fails with "event_id cannot be NULL"

**Solution:** Some availability records couldn't be mapped to events. Check for:
- Availability records with dates that don't match any event
- Events that were deleted but availability remains

```sql
-- Find unmapped records
SELECT DISTINCT a.date
FROM availability a
WHERE a.event_id IS NULL;
```

### Issue: UI shows wrong availability for events

**Solution:** Clear browser cache and reload. The frontend caches availability data.

### Issue: Multiple availability records for same event/person

**Solution:** The unique constraint should prevent this. If it occurs:

```sql
-- Find duplicates
SELECT event_id, person_id, COUNT(*)
FROM availability
GROUP BY event_id, person_id
HAVING COUNT(*) > 1;

-- Remove duplicates (keeps most recent)
DELETE FROM availability a
WHERE a.id NOT IN (
  SELECT MAX(id)
  FROM availability
  GROUP BY event_id, person_id
);
```

## Support

For questions or issues:
1. Check the GitHub Issues page
2. Review the migration SQL script comments
3. Contact the development team

## Version Compatibility

- **Backend:** Requires post-migration database schema with `event_id` column
- **Frontend:** Compatible with both pre-migration and post-migration schemas (transition period)
- **API:** Post-migration API uses `eventId` parameter (backward compatible during transition)
