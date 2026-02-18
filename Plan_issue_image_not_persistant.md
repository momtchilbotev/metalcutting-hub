# Fix: Image Upload Issue - Database Records Not Created

## Context

Users report that image uploads appear successful (frontend shows success message) but images don't appear when viewing the listing. Investigation revealed that images are uploaded to Supabase Storage successfully, but the corresponding database records in `listing_images` table are never created.

## Root Cause

**File:** `src/scripts/pages/listings/ListingEdit.js` (lines 403-415)

The `submitForm` method uses **placeholder API endpoints** that don't exist:

```javascript
async deleteImageFromDB(imageId) {
  await fetch('/api/listing-images/' + imageId, { method: 'DELETE' });
  // This would normally go through the API
}

async saveImageToDB(imageData) {
  await fetch('/api/listing-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imageData)
  });
  // This would normally go through the API
}
```

**Flow breakdown:**
1. Image uploads to Supabase Storage ✅ (status 200)
2. Code tries to POST to `/api/listing-images` ❌ (endpoint doesn't exist)
3. Database record is never created ❌
4. User sees success toast but no images appear

The application uses Supabase client directly, not a REST API layer.

## Implementation Plan

### 1. Fix `ListingEdit.js` - Replace placeholder API calls with Supabase client

**Location:** `src/scripts/pages/listings/ListingEdit.js`

**Actions:**
- Import `supabase` client from `utils/supabaseClient.js`
- Replace `deleteImageFromDB()` to use Supabase DELETE
- Replace `saveImageToDB()` to use Supabase INSERT
- Update `submitForm()` to use the Supabase client for database operations

**Code changes:**

```javascript
// Add import at top
import { supabase } from '../../utils/supabaseClient.js';

// Replace deleteImageFromDB method (lines 403-406)
async deleteImageFromDB(imageId) {
  const { error } = await supabase
    .from('listing_images')
    .delete()
    .eq('id', imageId);
  if (error) throw error;
}

// Replace saveImageToDB method (lines 408-415)
async saveImageToDB(imageData) {
  const { data, error } = await supabase
    .from('listing_images')
    .insert([imageData])
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

### 2. Verify `ListingCreate.js` uses correct flow

**Location:** `src/scripts/pages/listings/ListingCreate.js`

The create flow already uses `listingService.createListing()` which correctly uses the Supabase client for both storage upload and database insertion. **No changes needed.**

### 3. Verify RLS policies allow INSERT

**Location:** Database (verify existing policies)

The `listing_images` table has an INSERT policy:
```sql
CREATE POLICY "Users can upload images for own listings"
ON listing_images FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM listings
  WHERE listings.id = listing_images.listing_id
  AND listings.user_id = auth.uid()
));
```

This policy should work correctly since the user just created/owns the listing.

## Critical Files to Modify

1. **`src/scripts/pages/listings/ListingEdit.js`** - Fix database operations

## Verification

1. **Test edit flow:**
   - Create a new listing (should work)
   - Edit the listing and add images
   - Verify images appear in Supabase Storage
   - Verify records appear in `listing_images` table
   - View the listing detail page to confirm images display

2. **Test with browser DevTools:**
   - Check Network tab - should see Supabase REST calls to `/rest/v1/listing_images`
   - No calls to `/api/listing-images` (which would fail)

3. **Verify database:**
   ```sql
   SELECT * FROM listing_images WHERE listing_id = '<test-listing-id>';
   ```
