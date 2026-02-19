# Fix: My-Listings Page Not Showing Sold/Draft Listings

## Context

The "My Listings" page at `/my-listings` has tabs for filtering by status (Всички, Активни, Продадени, Чернови), but the "Продадени" (Sold) and "Чернови" (Draft) tabs show 0 items even though the database contains listings with these statuses.

**Root Cause:** The `getListings()` method in the service layer defaults to `status = 'active'` when no status filter is provided. This means only active listings are fetched from the database, so sold/draft listings are never retrieved for client-side filtering.

## Files to Modify

1. **src/scripts/services/listings.js** - Modify `getListings()` to support fetching all statuses
2. **src/scripts/pages/user/MyListings.js** - Update `getMyListings()` call to fetch all statuses

## Implementation Plan

### Step 1: Modify `getListings()` in listings.js

**Location:** `src/scripts/services/listings.js`, lines 28-32

**Current code:**
```javascript
if (filters.status) {
  query = query.eq('status', filters.status);
} else {
  query = query.eq('status', 'active'); // Default to active only
}
```

**Change to:**
```javascript
if (filters.status) {
  if (filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  // If status === 'all', don't apply any status filter (fetch all)
} else {
  query = query.eq('status', 'active'); // Default to active only for public queries
}
```

This allows passing `status: 'all'` to fetch listings regardless of status.

### Step 2: Modify `getMyListings()` in listings.js

**Location:** `src/scripts/services/listings.js`, lines 339-349

**Current code:**
```javascript
async getMyListings(filters = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  return await this.getListings({
    ...filters,
    user_id: user.id
  });
}
```

**Change to:**
```javascript
async getMyListings(filters = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  return await this.getListings({
    ...filters,
    user_id: user.id,
    status: filters.status || 'all' // Default to 'all' for own listings
  });
}
```

This changes the default for `getMyListings` from implicitly 'active' to explicitly 'all', so users see all their listings regardless of status.

### Step 3: Update MyListings.js to use the new default

**Location:** `src/scripts/pages/user/MyListings.js`, line 33

**Current code:**
```javascript
async loadListings() {
  const result = await listingService.getMyListings({ status: undefined });
  this.listings = result.listings;
}
```

**Change to:**
```javascript
async loadListings() {
  const result = await listingService.getMyListings(); // Remove status parameter - defaults to 'all'
  this.listings = result.listings;
}
```

## Verification

1. Navigate to https://metalcutting-hub.vercel.app/my-listings
2. Verify that the stats cards show correct counts for "Продадени" and "Чернови"
3. Click on "Продадени" tab - verify sold listings appear
4. Click on "Чернови" tab - verify draft listings appear
5. Click on "Всички" tab - verify all listings appear

## Notes

- The client-side filtering logic in `MyListings.js` (lines 151-153) is already correct and doesn't need changes
- The change only affects `getMyListings()` - public listing queries still default to 'active' status as expected
- The RLS policies already allow users to see their own listings regardless of status
