# Event-Based Availability System - Implementation Summary

## Problem Statement

The band availability system had a fundamental limitation: users could only set one availability per day. This caused conflicts when multiple events (e.g., a rehearsal and a service) occurred on the same day, as the system couldn't differentiate which event the availability was for.

## Solution

We've implemented event-specific availability, allowing users to set separate availability for each event, even if multiple events occur on the same day.

## Key Changes

### 1. Database Schema Updates

**File:** `supabase-setup.sql`, `supabase-migration-event-availability.sql`

- Changed availability table primary key from `(date, person_id)` to `(event_id, person_id)`
- Added `event_id` column with foreign key to events table
- Created migration script to convert existing date-based records to event-based records
- Maintained `date` column temporarily for backward compatibility

### 2. TypeScript Type Definitions

**File:** `next-frontend/lib/types.ts`

- Updated `AvailabilityRecord` interface to use `event_id` instead of `date`
- Added optional `_event` field for convenience (populated by queries with JOIN)
- Created `AvailabilityByEvent` interface for event-based grouping
- Updated `BulkAvailabilityUpdate` to use `eventIds` instead of `dates`
- Updated `PendingChange` and `UndoAction` to use `eventId`

### 3. Database Functions

**Files:** `next-frontend/lib/db.ts`, `server/db.js`

- `setAvailability()`: Now accepts `eventId` instead of `date`
- `getAvailability()`: Returns records with JOIN to events table, including event info
- Validates that both person and event exist before setting availability

### 4. API Endpoints

**File:** `next-frontend/app/api/availability/route.ts`

- POST endpoint now expects `{ eventId, personId, state }` instead of `{ date, personId, state }`
- Added validation for `eventId`
- Returns appropriate error messages for missing event

### 5. Frontend Utilities

**File:** `next-frontend/lib/utils.ts`

New functions:
- `groupAvailabilityByEvent()`: Groups by event ID
- `getAvailabilityForEvent()`: Filters by event ID
- `getMemberAvailabilityStateForEvent()`: Gets state for specific event
- `calculateEventCoverageByEvent()`: Calculates coverage using event ID
- `calculateRoleCoverageForEvent()`: Calculates role coverage using event ID

Updated functions:
- `groupAvailabilityByDate()`: Now uses `_event` field or events parameter
- `getAvailabilityForDate()`: Uses `_event?.date` comparison
- `getMemberAvailabilityState()`: Uses `_event?.date` comparison
- All validation functions updated to use `event_id`

### 6. React Hooks

**Files:** `next-frontend/hooks/use-availability.ts`, `next-frontend/lib/api-hooks.ts`

- `useSetAvailability`: Now uses `eventId` parameter
- `useAvailability`: **Backward compatible** - accepts both date (string) and eventId (number)
  - Automatically converts dates to event IDs when needed
  - Updated pending changes to use `eventId`
  - Updated undo functionality to use `eventId`
  - Bulk operations support both dates and event IDs

### 7. API Client

**File:** `next-frontend/lib/api.ts`

- `BandApi.setAvailability()`: Updated signature to use `eventId`
- `BandApi.setBulkAvailability()`: Updated to use `eventIds` array
- Proper type conversion between string and number event IDs

### 8. UI Components

**Files:** `next-frontend/app/availability/page.tsx`, etc.

- Updated to use raw `availability` records from hook
- Changed pending change checks to use `eventId` comparison
- Updated all components to access date via `_event?.date` or event lookup
- Maintained user experience - no visible changes to end users

## Backward Compatibility

The implementation maintains backward compatibility during the transition:

1. **Hooks**: Accept both `date` (string) and `eventId` (number) as parameters
2. **Database**: Keeps `date` field for reference (can be removed in future)
3. **Frontend**: Automatically converts between dates and event IDs
4. **API Response**: Includes event information via JOIN for easy access

## Testing Checklist

Complete these tasks to verify the migration:

### Database Migration
- Run migration script on test database
- Verify all availability records have `event_id`
- Check no orphaned records exist
- Confirm unique constraint works

### API Testing
- POST availability with `eventId` - success
- POST availability with invalid `eventId` - error
- GET availability returns `_event` data
- Bulk operations work with event IDs

### Frontend Testing
- Create two events on same day
- Set different availability for each event
- Verify availability displays correctly per event
- Test pending changes for multiple events
- Verify undo functionality
- Test bulk availability setting

### UI Validation
- Events on same day show separately
- Availability badges show per event
- Coverage calculation correct per event
- Stats page shows correct data
- Dashboard shows recent activity correctly

## Migration Instructions

1. **Backup database** before migration
2. **Run migration SQL** in Supabase dashboard
3. **Verify data integrity** with provided SQL queries
4. **Deploy frontend** with updated code
5. **Test thoroughly** with multiple events on same day
6. **Monitor** for any issues

See `MIGRATION-EVENT-AVAILABILITY.md` for detailed migration steps.

## Benefits

1. ✅ **Accurate Scheduling**: Set different availability for rehearsal vs. service on same day
2. ✅ **Better Data Integrity**: Availability directly linked to specific events
3. ✅ **Flexible Planning**: Support complex multi-event days
4. ✅ **Improved Reporting**: Event-specific analytics and coverage
5. ✅ **Future Ready**: Foundation for more advanced scheduling features

## Files Modified

### Database
- `supabase-setup.sql` - Updated schema
- `supabase-migration-event-availability.sql` - New migration script

### TypeScript/JavaScript
- `next-frontend/lib/types.ts` - Type definitions
- `next-frontend/lib/db.ts` - Database functions
- `next-frontend/lib/api.ts` - API client
- `next-frontend/lib/utils.ts` - Utility functions
- `next-frontend/lib/api-hooks.ts` - React hooks
- `next-frontend/lib/validation.ts` - Validation functions
- `next-frontend/lib/validation-clean.ts` - Validation functions
- `next-frontend/lib/stats-service.ts` - Stats calculations
- `next-frontend/lib/examples.ts` - Example data
- `next-frontend/hooks/use-availability.ts` - Main availability hook
- `next-frontend/app/api/availability/route.ts` - API endpoint
- `next-frontend/app/availability/page.tsx` - Availability page
- `next-frontend/app/stats/page.tsx` - Stats page
- `next-frontend/components/dashboard.tsx` - Dashboard component
- `next-frontend/components/component-showcase.tsx` - Showcase component
- `next-frontend/components/advanced-hooks-demo.tsx` - Demo component

## Notes

- The system now correctly handles edge cases like:
  - Multiple events on the same day
  - Events with different requirements on the same day
  - Historical data migration from date-based to event-based
  
- Future improvements could include:
  - Remove `date` field from availability table (after confirming stability)
  - Add event type filtering for availability
  - Implement availability templates per event type
  - Add notification system for availability conflicts

## Support

For questions or issues during migration:
1. Review `MIGRATION-EVENT-AVAILABILITY.md`
2. Check migration script comments
3. Open a GitHub issue with details
