# Plan: Fix UUID Error on Listing Create

## Context

When submitting a new listing on `/listings/create`, the user gets the error: "invalid input syntax for type uuid: '99'".

**Root Cause:** The `transformNumericFields` function in `src/scripts/utils/validators.js` is being called with `location_id` as a "numeric field". This function uses `parseFloat()` to convert values, which corrupts UUID strings:

```javascript
// In create.js line 352:
const transformedData = transformNumericFields(formData, ['price', 'location_id']);

// In validators.js - parseFloat on a UUID:
const parsed = parseFloat(transformed[field]); // "fb71ed9a-..." → NaN or partial number
```

The `price` field should be numeric, but `location_id` is a UUID and should NOT be transformed.

**Database verified:** Both `categories` and `locations` tables have proper UUID primary keys.

## Implementation

### Step 1: Remove `location_id` from numeric fields transformation

In `src/pages/listings/create/create.js`, change line 352:

```javascript
// Before:
const transformedData = transformNumericFields(formData, ['price', 'location_id']);

// After:
const transformedData = transformNumericFields(formData, ['price']);
```

### Step 2: Handle empty location_id before transformation

The original intent of including `location_id` was to convert empty strings to `null`. This is already handled in line 344:

```javascript
location_id: document.getElementById('location_id').value || null,
```

So removing it from `transformNumericFields` is safe.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/listings/create/create.js` | Remove `location_id` from transformNumericFields call |

## Verification

1. Navigate to `/listings/create`
2. Fill in the form with a category and location selected
3. Click "Публикувай" or "Запази чернова"
4. Verify the listing is created successfully without UUID errors
