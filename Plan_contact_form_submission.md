# Contact Form Submissions in Admin/Moderator Dashboards

## Context

The `/contact` page has a complete "Изпратете съобщение" (Send a message) form UI, but the submission is **simulated** - it only logs to console without storing to the database. Users (both authenticated and anonymous) submit contact forms, but these messages never reach the Admin/Moderator dashboards.

**Goal:** Enable contact form submissions to be stored in the database and displayed in Admin/Moderator dashboards for management.

---

## Implementation Plan

### Phase 1: Database Migration

**File:** `supabase/migrations/015_create_contact_submissions.sql`

Create `contact_submissions` table:
- `id` (UUID, primary key)
- `name`, `email`, `phone` (optional), `subject`, `message`
- `user_id` (nullable - links to profiles for authenticated users)
- `status` (new, read, in_progress, resolved, spam)
- `priority`, `admin_notes`, `reviewed_by`, `reviewed_at`
- `created_at`, `updated_at`

**RLS Policies:**
- Anyone can INSERT (including anonymous users)
- Only admins/moderators can SELECT and UPDATE

---

### Phase 2: Contact Service

**File:** `src/scripts/services/contact.js` (NEW)

Create service with methods:
- `submitContactForm(data)` - Submit contact form (works for authenticated + anonymous)
- `getSubmissions(filters)` - Get submissions with pagination (admin/mod only)
- `getNewSubmissionsCount()` - Count of new/unread submissions
- `updateSubmissionStatus(id, status, notes)` - Update status with audit logging
- `markAsRead(id)` - Mark submission as read

---

### Phase 3: Update Contact Page

**File:** `src/pages/contact/contact.js`

Modify `submitContactForm()` method (lines 636-657):
- Replace simulated submission with actual `contactService.submitContactForm()` call
- Import the new contact service

---

### Phase 4: Admin Dashboard Updates

**File:** `src/pages/admin/dashboard/dashboard.js`

1. Add `newContactMessages` property
2. Fetch contact count in `render()` method via `contactService.getNewSubmissionsCount()`
3. Add stat card "Контакт съобщения" with warning indicator when > 0
4. Add quick action button linking to `/admin/contact-messages`

---

### Phase 5: Admin Contact Messages Page

**Files:**
- `src/pages/admin/contact-messages/contact-messages.js` (NEW)
- `src/pages/admin/contact-messages/contact-messages.css` (NEW)
- `src/pages/admin/contact-messages/contact-messages.html` (NEW)

Features:
- Table view of all contact submissions
- Filters: status, subject
- Status badges (Ново, Прочетено, В процес, Решено, Спам)
- View message detail modal
- Actions: Mark as read, Resolve, Mark as spam
- Pagination
- Reply via email link (mailto:)

---

### Phase 6: Moderator Dashboard Updates

**File:** `src/pages/moderator/dashboard/dashboard.js`

Same changes as admin dashboard - add stat card and quick action for contact messages.

---

### Phase 7: Moderator Contact Messages Page

**Files:**
- `src/pages/moderator/contact-messages/contact-messages.js` (NEW)
- `src/pages/moderator/contact-messages/contact-messages.css` (NEW)
- `src/pages/moderator/contact-messages/contact-messages.html` (NEW)

Similar to admin page. May have restricted actions (moderators may not be able to mark as spam).

---

### Phase 8: Router Configuration

**File:** `src/scripts/router.js`

Add routes:
```javascript
'/admin/contact-messages': {
  page: () => import('../pages/admin/contact-messages/contact-messages.js'),
  guard: () => adminGuard('admin')
},
'/moderator/contact-messages': {
  page: () => import('../pages/moderator/contact-messages/contact-messages.js'),
  guard: () => moderatorGuard()
}
```

---

### Phase 9: Formatter Updates

**File:** `src/scripts/utils/formatters.js`

Add helper functions:
- `formatContactSubject(subject)` - Bulgarian labels for subjects
- `formatContactStatus(status)` - Bulgarian labels for statuses
- Update `formatAdminAction()` to include 'update_contact_submission'
- Update `formatTargetType()` to include 'contact_submission'

---

## Critical Files Summary

| File | Action |
|------|--------|
| `supabase/migrations/015_create_contact_submissions.sql` | CREATE |
| `src/scripts/services/contact.js` | CREATE |
| `src/pages/contact/contact.js` | MODIFY |
| `src/pages/admin/dashboard/dashboard.js` | MODIFY |
| `src/pages/admin/contact-messages/*` | CREATE |
| `src/pages/moderator/dashboard/dashboard.js` | MODIFY |
| `src/pages/moderator/contact-messages/*` | CREATE |
| `src/scripts/router.js` | MODIFY |
| `src/scripts/utils/formatters.js` | MODIFY |

---

## Verification

1. **Contact form submission:**
   - Submit form as anonymous user → check database record created
   - Submit form as authenticated user → check `user_id` is linked

2. **Admin dashboard:**
   - Verify "Контакт съобщения" stat card appears
   - Verify count updates when new submissions exist
   - Click quick action → navigate to contact messages page

3. **Contact messages page:**
   - Verify table displays all submissions
   - Test filters (status, subject)
   - Test view modal displays full message
   - Test status updates (mark as read, resolve, spam)
   - Verify pagination works

4. **Moderator access:**
   - Login as moderator → verify access to contact messages
   - Verify same functionality as admin (or restricted if designed)
