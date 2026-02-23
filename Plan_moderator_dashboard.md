# Moderator Dashboard Implementation Plan

## Context

Create a Moderator Dashboard at `/moderator` that:
- Looks similar to the Admin Dashboard
- Provides access only to: listings, categories, and reports management
- Restricts moderators from accessing `/admin` routes (admin-only)
- Shows "Moderator" link in navbar for moderator users (not "Admin")

## Current State Analysis

### Role System (`src/scripts/services/admin.js`)
- Three roles with hierarchy: `user` (0) → `moderator` (1) → `admin` (2)
- `hasRole(requiredRole)` checks if user role >= required role
- `adminGuard('admin')` already restricts `/admin/*` to admin-only (moderators denied)
- `isAdmin()` currently returns `true` for both admin AND moderator

### Navbar (`src/scripts/components/Navbar.js`)
- Uses `isAdmin()` to show "Admin" link
- Currently shows "Admin" link to both admins and moderators
- Need to differentiate: show "Admin" to admins, "Moderator" to moderators

### Admin Pages (to reuse for moderator)
- `src/pages/admin/listings/listings.js` - 311 lines
- `src/pages/admin/categories/categories.js` - 519 lines
- `src/pages/admin/reports/reports.js` - 322 lines

---

## Implementation Plan

### Step 1: Create Moderator Service
**File:** `src/scripts/services/moderator.js` (NEW)

```javascript
import { supabase } from '../utils/supabaseClient.js';

// Check if user is exactly moderator (not admin)
export async function isModeratorOnly() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'moderator';
}

// Check if user is moderator OR admin
export async function isModerator() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'moderator' || profile?.role === 'admin';
}

// Route guard - allows moderator access, blocks regular users
export async function moderatorGuard() {
  const hasAccess = await isModerator();
  if (!hasAccess) {
    window.router.navigate('/');
    window.showToast('Нямате достъп до тази страница.', 'error');
    return false;
  }
  return true;
}
```

### Step 2: Update Navbar Component
**File:** `src/scripts/components/Navbar.js`

Changes:
1. Import `isModeratorOnly` from moderator service
2. Add `isModeratorUser` property
3. Modify `getAuthenticatedLinks()`:
   - If `role === 'admin'`: show "Admin" link → `/admin`
   - If `role === 'moderator'`: show "Moderator" link → `/moderator`

### Step 3: Add Moderator Routes
**File:** `src/scripts/router.js`

Add routes:
```javascript
import { moderatorGuard } from './services/moderator.js';

'/moderator': {
  page: () => import('../pages/moderator/dashboard/dashboard.js'),
  title: 'Moderator Panel - Metalcutting Hub',
  template: '/pages/moderator/dashboard/dashboard.html',
  guard: () => moderatorGuard()
},
'/moderator/listings': { ... },
'/moderator/categories': { ... },
'/moderator/reports': { ... }
```

### Step 4: Create Moderator Directory Structure
**New Files:**
```
src/pages/moderator/
├── dashboard/
│   ├── dashboard.html
│   ├── dashboard.js
│   └── dashboard.css
├── listings/
│   ├── listings.html
│   └── listings.js
├── categories/
│   ├── categories.html
│   └── categories.js
└── reports/
    ├── reports.html
    └── reports.js
```

### Step 5: Create Moderator Dashboard
**File:** `src/pages/moderator/dashboard/dashboard.js`

- Similar to admin dashboard but limited sections
- Stats cards: Active Listings, Sold Listings, Categories, Pending Reports
- Quick actions: Listings, Categories, Reports (no Users, no Audit)
- Links point to `/moderator/*` routes

### Step 6: Create Moderator Sub-Pages
**Approach:** Create wrapper classes that reuse admin page logic but with modified navigation.

Each moderator page will:
- Import and extend the corresponding admin page class
- Override navigation links from `/admin/*` to `/moderator/*`
- Reuse all data fetching and UI logic via `adminService`

---

## Access Control Matrix

| Route | User | Moderator | Admin |
|-------|------|-----------|-------|
| `/admin/*` | No | No | Yes |
| `/moderator/*` | No | Yes | No* |

*Admins use their own `/admin` dashboard with full access.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/scripts/services/moderator.js` | Moderator service and guard |
| `src/pages/moderator/dashboard/dashboard.html` | Dashboard template |
| `src/pages/moderator/dashboard/dashboard.js` | Dashboard logic |
| `src/pages/moderator/dashboard/dashboard.css` | Dashboard styles |
| `src/pages/moderator/listings/listings.html` | Listings template |
| `src/pages/moderator/listings/listings.js` | Listings page (wraps admin) |
| `src/pages/moderator/categories/categories.html` | Categories template |
| `src/pages/moderator/categories/categories.js` | Categories page (wraps admin) |
| `src/pages/moderator/reports/reports.html` | Reports template |
| `src/pages/moderator/reports/reports.js` | Reports page (wraps admin) |

## Files to Modify

| File | Changes |
|------|---------|
| `src/scripts/router.js` | Add 4 moderator routes with `moderatorGuard` |
| `src/scripts/components/Navbar.js` | Add moderator link logic, differentiate admin/moderator |

---

## Verification

1. **Test moderator access:**
   - Login as moderator user
   - Verify "Moderator" link appears in navbar
   - Navigate to `/moderator` - should load dashboard
   - Test `/moderator/listings`, `/moderator/categories`, `/moderator/reports`
   - Try accessing `/admin` - should be redirected to home

2. **Test admin access:**
   - Login as admin user
   - Verify "Admin" link appears in navbar (not "Moderator")
   - Navigate to `/admin` - should work
   - Navigate to `/moderator` - should work but admins prefer `/admin`

3. **Test regular user:**
   - Login as regular user
   - No admin/moderator links in navbar
   - Cannot access `/admin` or `/moderator`
