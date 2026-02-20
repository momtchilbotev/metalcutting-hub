# Plan: Restructure Pages to Self-Contained Folders

## Context

Reorganize the project's page structure so each page folder contains its HTML, JS, and CSS files together (co-located), following the reference image pattern.

**Current Structure:**
```
src/
├── pages/                    # HTML only
│   ├── admin/admin-*.html
│   ├── auth/login.html, register.html
│   ├── home/home.html
│   ├── listings/listing-*.html
│   ├── messages/messages.html
│   └── user/*.html
├── scripts/
│   ├── pages/               # JS only (mirrors pages)
│   │   ├── admin/Admin*.js
│   │   ├── auth/Login.js, Register.js
│   │   └── ...
│   ├── services/
│   ├── components/
│   └── utils/
└── styles/main.css
```

**Desired Structure:**
```
src/pages/
├── admin/
│   ├── audit/
│   │   ├── audit.html
│   │   ├── audit.js
│   │   └── audit.css
│   └── dashboard/
│       ├── dashboard.html
│       ├── dashboard.js
│       └── dashboard.css
├── auth/
│   ├── login/
│   │   ├── login.html
│   │   ├── login.js
│   │   └── login.css
│   └── register/
│       └── (same pattern)
├── home/
│   ├── home.html
│   ├── home.js
│   └── home.css
└── ...
```

## Implementation Steps

### Step 1: Create new folders and move files

| Old HTML | Old JS | New Folder |
|----------|--------|------------|
| `pages/admin/admin-audit.html` | `scripts/pages/admin/AdminAudit.js` | `pages/admin/audit/` |
| `pages/admin/admin-categories.html` | `scripts/pages/admin/AdminCategories.js` | `pages/admin/categories/` |
| `pages/admin/admin-dashboard.html` | `scripts/pages/admin/AdminDashboard.js` | `pages/admin/dashboard/` |
| `pages/admin/admin-listings.html` | `scripts/pages/admin/AdminListings.js` | `pages/admin/listings/` |
| `pages/admin/admin-users.html` | `scripts/pages/admin/AdminUsers.js` | `pages/admin/users/` |
| `pages/auth/login.html` | `scripts/pages/auth/Login.js` | `pages/auth/login/` |
| `pages/auth/register.html` | `scripts/pages/auth/Register.js` | `pages/auth/register/` |
| `pages/home/home.html` | `scripts/pages/home/Home.js` | `pages/home/` |
| `pages/listings/listing-create.html` | `scripts/pages/listings/ListingCreate.js` | `pages/listings/create/` |
| `pages/listings/listing-details.html` | `scripts/pages/listings/ListingDetails.js` | `pages/listings/details/` |
| `pages/listings/listing-edit.html` | `scripts/pages/listings/ListingEdit.js` | `pages/listings/edit/` |
| `pages/listings/listing-list.html` | `scripts/pages/listings/ListingList.js` | `pages/listings/list/` |
| `pages/messages/messages.html` | `scripts/pages/messages/Messages.js` | `pages/messages/` |
| `pages/user/my-listings.html` | `scripts/pages/user/MyListings.js` | `pages/user/my-listings/` |
| `pages/user/profile.html` | `scripts/pages/user/Profile.js` | `pages/user/profile/` |
| `pages/user/watchlist.html` | `scripts/pages/user/Watchlist.js` | `pages/user/watchlist/` |

### Step 2: Update import paths in all JS files

**Current** (from `scripts/pages/auth/Login.js`):
```js
import { authService } from '../../services/auth.js';
```

**New** (from `pages/auth/login/login.js`):
```js
import { authService } from '../../../scripts/services/auth.js';
```

Path changes needed:
- `../../services/` → `../../../scripts/services/`
- `../../components/` → `../../../scripts/components/`
- `../../utils/` → `../../../scripts/utils/`

### Step 3: Update router (`scripts/router.js`)

**Current:**
```js
'/': {
  page: () => import('./pages/home/Home.js'),
  template: '/pages/home/home.html'
}
```

**New:**
```js
'/': {
  page: () => import('../pages/home/home.js'),
  template: '/pages/home/home.html'
}
```

All 16 routes need updating.

### Step 4: Extract page-specific CSS from main.css

**Styles to extract from `main.css` into individual page CSS files:**

| Page | CSS File | Styles to Extract |
|------|----------|-------------------|
| `home/` | `home.css` | `.hero-section` (lines 139-141) + responsive (426-433, 457-459) |
| `listings/create/` & `listings/edit/` | `listing-form.css` | `#drop-zone`, `.thumbnail` (lines 347-366) |
| `admin/dashboard/` | `dashboard.css` | `.admin-stat-card` (lines 376-382) |
| `messages/` | `messages.css` | `#messages-container`, `.message-bubble` (lines 385-404) |
| `user/watchlist/` | `watchlist.css` | `.bi-heart`, `.btn-watchlist` (lines 407-413) |

**Note:** Most styles in `main.css` are shared (navbar, cards, forms, buttons, footer, tables, etc.) and will remain there. Only clearly page-specific styles will be extracted.

Add CSS import to each JS file:
```js
import './home.css';
```

### Step 5: Clean up

- Delete `src/scripts/pages/` directory
- Delete old HTML subfolders

## Files to Modify

| File | Changes |
|------|---------|
| `src/scripts/router.js` | Update 16 route import paths + template paths |
| 16 JS files | Move + update imports + add CSS import |
| 16 HTML files | Move to new locations |
| 5 CSS files with styles | Extract from main.css (home, listing-form, dashboard, messages, watchlist) |
| 11 CSS files empty | Create for pages without specific styles |
| `src/styles/main.css` | Remove extracted styles |

## Verification

1. `npm run dev` - no build errors
2. Navigate to all routes
3. Check browser console for errors
4. Verify functionality works
