# Fix Image Upload Issue in Listing Edit

## Context

When users edit a listing from `/my-listings` and upload new images, after clicking "Запази промените" (Save changes), the images are not saved and don't persist. The root cause is that **image handling was never implemented** in the edit functionality - there's a TODO comment at line 394 in `edit.js` that was never completed.

## Problem Analysis

In `src/pages/listings/edit/edit.js`:
- Line 18-20: Class properties track `existingImages`, `selectedImages`, and `imagesToDelete`
- Line 246-251: `markImageForDeletion()` adds images to `imagesToDelete` array
- Line 306-324: `handleImageSelect()` adds new images to `selectedImages` array
- Line 394: **TODO comment** - image updates are never processed
- The `handleSubmit()` method only updates listing metadata, ignoring image changes

The `listingService.updateListing()` method (lines 264-304 in `listings.js`) only updates the `listings` table - it doesn't handle images.

## Solution

Implement the image handling logic in `edit.js` that was marked as TODO. The fix involves:

### 1. Add helper methods to `ListingEditPage` class

**`handleImageUpdates()`** - New method to process image changes:
- Upload new images from `this.selectedImages` to storage
- Insert new image records to `listing_images` table
- Delete images marked in `this.imagesToDelete` from storage and database
- Handle primary image assignment

**`deleteListingImage(imageId, storagePath)`** - Delete a single image:
- Delete from `listing_images` table
- Delete from Supabase Storage

### 2. Modify `handleSubmit()` method

After updating the listing metadata (line 392), replace the TODO with a call to `handleImageUpdates()`.

## Files to Modify

- **`src/pages/listings/edit/edit.js`** - Add image update handling logic

## Implementation Details

### New method: `handleImageUpdates()`

```javascript
async handleImageUpdates() {
  // 1. Delete images marked for deletion
  for (const imageId of this.imagesToDelete) {
    const image = this.listing.listing_images.find(img => img.id === imageId);
    if (image) {
      // Delete from database
      await supabase.from('listing_images').delete().eq('id', imageId);
      // Delete from storage
      await storageService.deleteImage(image.storage_path);
    }
  }

  // 2. Upload new images
  if (this.selectedImages.length > 0) {
    const uploadedImages = await storageService.uploadListingImages(
      this.selectedImages,
      this.listingId
    );

    // 3. Insert new image records
    if (uploadedImages.length > 0) {
      // Calculate starting order_index based on existing images (minus deleted ones)
      const startingIndex = this.existingImages.length;

      await supabase.from('listing_images').insert(
        uploadedImages.map((img, i) => ({
          listing_id: this.listingId,
          storage_path: img.path,
          order_index: startingIndex + i,
          is_primary: startingIndex === 0 && i === 0 // First image is primary if no existing images
        }))
      );
    }
  }
}
```

### Modified `handleSubmit()` (around line 390-405)

```javascript
try {
  // Update listing metadata
  await listingService.updateListing(this.listingId, transformedData);

  // Handle image updates (upload new, delete removed)
  await this.handleImageUpdates();

  Toast.success('Промените са запазени!');
  window.router.navigate('/my-listings');
} catch (error) {
  // ... error handling
}
```

## Verification

1. Go to `/my-listings`
2. Click edit on a listing
3. Upload a new image
4. Click "Запази промените"
5. Verify the image appears on the listing
6. Refresh the page and verify image persists
7. Test deleting an existing image and verify it's removed
8. Test uploading multiple images (up to 5 total)
