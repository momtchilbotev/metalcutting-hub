# Plan: Fix Category Icon Update Issue

## Context

When editing a category and selecting a new icon, the icon doesn't persist after saving. The user reports:
1. Old icon gets deleted from storage
2. New icon uploads correctly
3. But after saving and reopening the edit form, the old icon still shows
4. Home page also shows the old icon

## Root Cause

In `categories.js` `saveCategory()` method (lines 419-462), the flow has a race condition:

1. **First save** (line 437): Saves category with OLD `icon_url` from hidden input
2. **Upload** (line 443): Uploads new icon, deletes old one from storage
3. **Second save** (lines 445-449): Tries to update with NEW `icon_url`

The issue: When editing an existing category (`categoryId` exists), the first save overwrites the database with the old icon_url. Even though the second save should fix it, there may be timing issues or the response isn't properly awaited.

**Additional issue**: The hidden `icon_url` input is never updated when a new file is selected - it keeps the old URL value throughout.

## Solution

Refactor `saveCategory()` to only save once with the correct icon URL:

1. **Upload new icon FIRST** (if selected) before any database save
2. **Determine final icon_url** before saving:
   - If new file selected → use new upload URL
   - If editing and no new file → keep existing URL
   - If creating new → use null
3. **Single database save** with the correct icon_url

## Implementation

### File: `src/pages/admin/categories/categories.js`

Modify the `saveCategory()` method:

```javascript
async saveCategory() {
  const categoryId = document.getElementById('category_id').value || null;
  const existingIconUrl = document.getElementById('icon_url').value.trim() || null;

  const formData = {
    id: categoryId,
    name_bg: document.getElementById('name_bg').value.trim(),
    name_en: document.getElementById('name_en').value.trim(),
    slug: document.getElementById('slug').value.trim(),
    sort_order: parseInt(document.getElementById('sort_order').value) || 0,
    icon_url: existingIconUrl
  };

  if (!formData.name_bg || !formData.slug) {
    Toast.error('Моля, попълнете задължителните полета.');
    return;
  }

  try {
    // Upload icon FIRST if a new file was selected
    let finalIconUrl = existingIconUrl;

    if (this.selectedIconFile && categoryId) {
      // Editing existing category with new icon
      const iconUrl = await storageService.uploadCategoryIcon(this.selectedIconFile, categoryId);
      finalIconUrl = iconUrl;
      formData.icon_url = iconUrl;
    } else if (this.selectedIconFile && !categoryId) {
      // New category - need to save first to get ID, then upload
      const savedCategory = await adminService.saveCategory(formData);
      const newCategoryId = savedCategory?.id;

      if (newCategoryId) {
        const iconUrl = await storageService.uploadCategoryIcon(this.selectedIconFile, newCategoryId);
        await adminService.saveCategory({
          ...formData,
          id: newCategoryId,
          icon_url: iconUrl
        });
      }

      Toast.success('Категорията е създадена!');
      this.hideForm();
      await this.render();
      return;
    }

    // Single save with final icon URL
    await adminService.saveCategory(formData);

    Toast.success(categoryId ? 'Категорията е обновена!' : 'Категорията е създадена!');
    this.hideForm();
    await this.render();
  } catch (error) {
    Toast.error(error.message || 'Грешка при запазване.');
  }
}
```

## Key Changes

1. **For existing categories**: Upload new icon BEFORE saving to database
2. **Single save call** for existing categories with the correct icon_url
3. **New categories**: Keep the two-step process (create → upload → update) since we need the ID first
4. **Clear separation** of edit vs create flows

## Verification

1. Open admin categories page at `/admin/categories`
2. Click edit on an existing category
3. Select a new icon file
4. Save and verify success message
5. Reopen edit form and confirm new icon shows
6. Navigate to home page and confirm new icon displays in category grid
7. Test creating a new category with an icon
8. Test editing a category without changing the icon (should keep existing)
