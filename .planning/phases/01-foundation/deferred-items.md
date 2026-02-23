# Deferred Items

Items discovered during execution that are out of scope for the current plan.

## Pre-existing Build Errors

### TypeScript Error in src/app/api/bookings/[id]/route.ts:46

**Discovered during:** 01-04, Task 2 build verification
**Error:** `Conversion of type '{ user_id: any; }[]' to type '{ user_id: string; }' may be a mistake`
**Status:** Pre-existing — confirmed present in commit 6273bd5 (before 01-04 changes)
**Scope:** Unrelated to ProviderCard unification
**Recommended fix:** Narrow the type with a `.select('user_id')` single object return or add `.single()` to the query
