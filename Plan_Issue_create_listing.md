# Fix: Invalid Numeric Input Syntax When Creating/Updating Listings

## Context

When creating a new listing or making it a draft, users encounter error:
```
{code: '22P02', message: 'invalid input syntax for type numeric: ""'}
```

This PostgreSQL error occurs because an empty string `""` is being sent to the `price` column, which is defined as `numeric` (DECIMAL) type in the database. Numeric columns only accept numbers or `NULL`, not empty strings.

### Root Cause
1. In `ListingCreate.js` line 338: `price: document.getElementById('listing-price').value`
2. When price input is empty, this returns `""`
3. The empty string passes validation (price is optional) but fails at database insert
4. Same issue exists in `ListingEdit.js` line 342

## Implementation Plan

### 1. Add Data Transformation Utility in `validators.js`

**File**: `src/scripts/utils/validators.js`

Add a new utility function to transform empty numeric fields to `null`:

```javascript
/**
 * Transform empty string values to null for numeric fields
 * @param {Object} data - Form data object
 * @param {string[]} numericFields - Array of field names that should be numeric
 * @returns {Object} - Transformed data with null instead of empty strings
 */
export function transformNumericFields(data, numericFields = ['price']) {
  const transformed = { ...data };
  for (const field of numericFields) {
    if (transformed[field] === '') {
      transformed[field] = null;
    } else if (transformed[field] !== null && transformed[field] !== undefined) {
      // Parse to number to ensure it's a valid numeric value
      const parsed = parseFloat(transformed[field]);
      transformed[field] = isNaN(parsed) ? null : parsed;
    }
  }
  return transformed;
}
```

### 2. Apply Transformation in `ListingCreate.js`

**File**: `src/scripts/pages/listings/ListingCreate.js` (around line 346)

Import the new function and apply it before validation:

```javascript
import { validateListingForm, transformNumericFields } from '../../utils/validators.js';

// In submitForm method, after gathering formData:
const formData = {
  title: document.getElementById('listing-title').value,
  // ... other fields
};

// Transform empty numeric fields to null
const processedData = transformNumericFields(formData, ['price']);

// Validate form with processed data
const validation = validateListingForm(processedData);
if (!validation.isValid) {
  this.showErrors(validation.errors);
  return;
}

// Use processedData for API call
const listing = await listingService.createListing(processedData, imageFiles);
```

### 3. Apply Transformation in `ListingEdit.js`

**File**: `src/scripts/pages/listings/ListingEdit.js` (around line 347)

Same changes as ListingCreate.js - import and apply `transformNumericFields`.

### 4. (Optional Defense) Add Transform in Service Layer

**File**: `src/scripts/services/listings.js` (around line 159)

Add defensive transformation in `createListing` method:

```javascript
// Before insert, transform empty numeric fields
const dataToInsert = {
  ...listingData,
  price: listingData.price === '' ? null : listingData.price,
};
```

Apply same to `updateListing` method around line 232.

## Files to Modify

| File | Line(s) | Change |
|------|---------|--------|
| `src/scripts/utils/validators.js` | After existing functions | Add `transformNumericFields` function |
| `src/scripts/pages/listings/ListingCreate.js` | ~1 (imports), ~346 (usage) | Import and use `transformNumericFields` |
| `src/scripts/pages/listings/ListingEdit.js` | ~1 (imports), ~347 (usage) | Import and use `transformNumericFields` |

## Verification

1. **Create listing with empty price**: Should save successfully with `price: null`
2. **Create listing with price "0"**: Should save with `price: 0`
3. **Create listing with price "100.50"**: Should save with `price: 100.50`
4. **Update existing listing**: Setting price to empty should set it to `null`
5. **Draft status**: Creating draft with empty price should work

### Test Steps
1. Navigate to "Create Listing" page
2. Fill required fields (title, description, category, condition)
3. Leave price field empty
4. Submit as "Draft" or "Publish"
5. Verify listing is created successfully (no 400 error)
6. Check database to confirm `price` is `NULL`
