# Fix: Images Not Displaying on My Listings Page

**Status:** ✅ Resolved

## Context

The "My Listings" page (`/my-listings`) shows placeholder images instead of the actual listing images, even though the images exist in Supabase Storage and have database records in `listing_images` table.

## Root Cause

The `getListings()` method in `listings.js` fetches `listing_images` from the database but doesn't add the `url` property that the UI expects. Only `getListingById()` has this URL transformation.

## Fix Applied

**File:** `src/scripts/services/listings.js` (lines 89-98)

```javascript
// Add image URLs to listing images
const listingsWithData = data ? data.map(listing => {
  if (listing.listing_images && listing.listing_images.length > 0) {
    listing.listing_images = listing.listing_images.map(img => ({
      ...img,
      url: storageService.getPublicUrl(img.storage_path)
    }));
  }
  return listing;
}) : [];
```

## Why This Works

- `getListingById()` already uses this pattern (lines 131-136) to add URLs to images
- `MyListings.js` expects `listing.listing_images[x].url` to exist (line 168)
- The fix ensures consistency across both methods

## Methods That Benefit

- `getMyListings()` - My Listings page (main fix)
- `getFeaturedListings()` - Homepage featured listings
- `getSimilarListings()` - Listing detail page similar listings
