# Plan: Add Renew Button for Sold Listings

## Context

On the "My Listings" page (`/my-listings`), users can manage their listings. Currently:
- **Active** listings show: Edit, Mark as Sold, Delete buttons
- **Draft** listings show: Edit, Renew, Delete buttons
- **Expired** listings show: Edit, Renew, Delete buttons
- **Sold** listings show: Edit, Delete buttons (missing Renew)

**Problem:** Sold listings ("продадено") cannot be renewed/relisted. Users need the ability to renew a sold listing to make it active again (e.g., if the sale fell through or they have another identical item).

## Implementation

### Step 1: Update the renew button condition

In `src/pages/user/my-listings/my-listings.js`, modify the template condition in `getListTemplate()` method (around line 199):

```javascript
// Before:
${listing.status === 'expired' || listing.status === 'draft' ? `
  <button class="btn btn-outline-info btn-renew" data-id="${listing.id}" title="Поднови">
    <i class="bi bi-arrow-clockwise"></i>
  </button>
` : ''}

// After:
${listing.status === 'expired' || listing.status === 'draft' || listing.status === 'sold' ? `
  <button class="btn btn-outline-info btn-renew" data-id="${listing.id}" title="Поднови">
    <i class="bi bi-arrow-clockwise"></i>
  </button>
` : ''}
```

The `renewListing()` service method already handles this correctly - it sets status to `active` and extends the expiration date.

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/user/my-listings/my-listings.js` | Add `sold` status to renew button condition |

## Verification

1. Navigate to `/my-listings`
2. Verify sold listings now show a "Поднови" button with refresh icon
3. Click the renew button on a sold listing
4. Verify the listing status changes from "Продадена" to "Активна"
5. Verify the expiration date is extended by 30 days
