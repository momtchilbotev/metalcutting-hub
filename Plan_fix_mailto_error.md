# Fix: Router intercepting mailto: links causing SecurityError

## Context

On the `/contact-messages` page (admin and moderator), clicking the light blue "Отговори" (Reply) button throws a `SecurityError`. The error occurs because the router's `handleLinkClick` method intercepts the `mailto:` link and tries to use `pushState` to navigate to it, which browsers don't allow for cross-origin URLs like `mailto:`.

The button inside the "Детайли на съобщението" popup works correctly because it uses `onclick` with `window.location.href`, bypassing the router's click interception entirely.

## Root Cause

**File:** `src/scripts/router.js`
**Method:** `handleLinkClick` (lines 340-376)

The router excludes certain link types from interception:
- `http`, `//`, `javascript:`, `#`, `target="_blank"`, `download` attribute

But `mailto:` links are NOT excluded, so they get intercepted and the router tries to call:
```javascript
window.history.pushState({ path }, '', 'mailto:user@example.com?subject=...');
```

This throws `SecurityError` because `pushState` cannot be used with URLs that have a different origin.

## Solution

Add `mailto:` to the exclusion list in `handleLinkClick`. For robustness, also add `tel:` (phone links) since they would have the same issue.

### Change Required

**File:** `src/scripts/router.js`
**Line:** 351

Add `href.startsWith('mailto:')` and `href.startsWith('tel:')` to the exclusion condition.

**Before:**
```javascript
if (
  href.startsWith('http') ||
  href.startsWith('//') ||
  href.startsWith('javascript:') ||
  href.startsWith('#') ||
  // ...
```

**After:**
```javascript
if (
  href.startsWith('http') ||
  href.startsWith('//') ||
  href.startsWith('javascript:') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:') ||
  href.startsWith('#') ||
  // ...
```

## Verification

1. Start the development server (`npm run dev` or equivalent)
2. Log in as admin or moderator
3. Navigate to `/admin/contact-messages` or `/moderator/contact-messages`
4. Click the light blue "Отговори" button in the table
5. **Expected:** The default email client opens without console errors
6. Also verify clicking the popup "Отговори" button still works
