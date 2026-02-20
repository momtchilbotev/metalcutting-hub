# Plan: Fix Missing Checkboxes on Listing Create Page

## Context

During the page restructuring, the `/listings/create` page lost the "Препоръчано" (Featured) and "Спешно" (Urgent) checkbox options. These need to be restored.

**Problem:** The `src/pages/listings/create/create.js` file is missing the featured/urgent checkboxes that existed in the original file.

## Implementation

### Step 1: Add checkboxes to the template

In `src/pages/listings/create/create.js`, add before the Submit Buttons section (around line 154):

```javascript
<!-- Options -->
<div class="mb-4">
  <div class="form-check mb-2">
    <input class="form-check-input" type="checkbox" id="listing-featured"
      name="is_featured">
    <label class="form-check-label" for="listing-featured">
      <i class="bi bi-star-fill text-warning me-1"></i>
      Препоръчана обява
    </label>
    <div class="form-text">Платена опция за по-добра видимост.</div>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" id="listing-urgent"
      name="is_urgent">
    <label class="form-check-label" for="listing-urgent">
      <i class="bi bi-exclamation-triangle-fill text-danger me-1"></i>
      Спешна обява
    </label>
    <div class="form-text">Забележи, че продавате спешно.</div>
  </div>
</div>
```

### Step 2: Update handleSubmit to include the checkbox values

In the `handleSubmit` method, add to formData:

```javascript
is_featured: document.getElementById('listing-featured')?.checked || false,
is_urgent: document.getElementById('listing-urgent')?.checked || false,
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/listings/create/create.js` | Add checkboxes to template + update handleSubmit |

## Verification

1. Navigate to `/listings/create`
2. Verify "Препоръчана обява" and "Спешна обява" checkboxes are visible
3. Create a listing with these options checked
4. Verify the listing shows the featured/urgent badges
