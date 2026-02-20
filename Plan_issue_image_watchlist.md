# Plan: Fix Image Display on Watchlist Page

## Context

On the Watchlist page (`/watchlist`), listing images are not displaying. Users see broken or placeholder images instead of the actual listing images.

**Root Cause:** The watchlist page incorrectly tries to access `listingService.storage?.getPublicUrl?.()` which doesn't exist. Other pages (like my-listings.js and ListingCard.js) correctly use `storageService.getPublicUrl()` directly.

## Problem Code

In `src/pages/user/watchlist/watchlist.js` (lines 56-66):
```javascript
listing.listing_images = listing.listing_images.map(img => ({
  ...img,
  url: listingService.storage?.getPublicUrl?.(img.storage_path) ||
        `/api/storage/${img.storage_path}`
}));
```

The `listingService.storage` property doesn't exist, so this falls back to `/api/storage/...` which is incorrect.

## Implementation

### Step 1: Import storageService

Add import for `storageService` at the top of the file:
```javascript
import { storageService } from '../../../scripts/services/storage.js';
```

### Step 2: Fix the image URL construction

Replace the incorrect image processing with the correct approach using `storageService`:
```javascript
listing.listing_images = listing.listing_images.map(img => ({
  ...img,
  url: storageService.getPublicUrl(img.storage_path)
}));
```

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/user/watchlist/watchlist.js` | Import storageService and fix image URL construction |

## Verification

1. Navigate to `/watchlist`
2. Verify listing images display correctly
3. Check browser console for no errors related to image loading
4. Verify the image URLs are correctly formed Supabase Storage URLs
