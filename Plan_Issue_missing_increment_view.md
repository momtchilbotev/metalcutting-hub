# Fix: Missing increment_views RPC Function

## Context

After successfully creating a listing, the user gets:
1. Success toast message
2. Error: `POST .../rpc/increment_views 404 (Not Found)`
3. Page shows: "Обявата не е намерена или е изтекла." (Listing not found or expired)

### Root Cause

The code calls `supabase.rpc('increment_views', { listing_id: id })` in:
- `src/scripts/services/listings.js` line 302 (`ListingService.incrementViews()` method)
- Called from line 128 in `getListingById()` after fetching a listing

However, this RPC function **does not exist** in the database. The `listings` table has a `views_count` column (integer, default 0), but there's no RPC function to increment it.

## Implementation Plan

### 1. Create the Missing RPC Function

Using the Supabase MCP `apply_migration` tool, create a new migration:

**Migration name**: `add_increment_views_rpc`

**SQL**:
```sql
-- RPC function to increment views_count for a listing
CREATE OR REPLACE FUNCTION increment_views(listing_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_views(uuid) TO authenticated;
```

**Why `SECURITY DEFINER`**: Allows the function to update the `views_count` column even if the calling user doesn't have direct UPDATE permissions on the listings table. The RLS (Row Level Security) will still be in effect.

**Why `COALESCE`**: Handles edge case where `views_count` might be NULL (though it has a default of 0).

### 2. Verify the Fix

After applying the migration:
1. Check that the RPC function exists using `mcp__supabase__list_migrations`
2. Test by creating a new listing and verifying no 404 error occurs
3. Verify the views_count increments when viewing a listing

## Files/Tools to Use

| Tool/Action | Details |
|-------------|---------|
| `mcp__supabase__apply_migration` | Create new migration with the SQL above |
| Migration name | `add_increment_views_rpc` |

## Verification Steps

1. **Apply the migration** using Supabase MCP tool
2. **Create a new listing** with empty price (verifies previous fix also works)
3. **View the created listing** - should redirect successfully without 404 error
4. **Check views_count** in database - should be 1 after first view
5. **Refresh the page** - views_count should increment to 2
