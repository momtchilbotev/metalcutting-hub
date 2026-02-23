# Plan: Listing Approval Workflow Implementation

## Context

The user wants to implement a listing approval workflow where:
1. When a user with role "Потребител" (user) creates a new listing, it does NOT appear automatically in the public listings
2. A moderator or admin must approve the listing first
3. After approval, the listing becomes visible in the public listings
4. If rejected, the moderator/admin must send a message to the user explaining the reason

## Current State Analysis

### What Already Exists
- **Listings table** has a `status` field with values: `active`, `draft`, `sold`, `expired`
- **Public listing queries** already filter to only show `status: 'active'` by default (listings.js line 34)
- **Admin/Moderator dashboards** already exist with approve/reject functionality
- **Messages system** exists for user-to-user messaging (messages table)
- **Audit logging** tracks admin actions
- **Role hierarchy**: user < moderator < admin

### What Needs to Change
1. **New listing creation**: Currently creates listings with `status: 'active'` by default (create.js line 247), should create as `draft` for regular users
2. **New status value**: Add `pending` status for listings awaiting approval (clearer than `draft`)
3. **Rejection messaging**: Currently `rejectListing()` logs reason but doesn't send message to user
4. **UI updates**: Show pending listings prominently, add rejection reason input

---

## Implementation Plan

### Phase 1: Database Schema Update

**File:** `supabase/migrations/011_add_pending_status.sql` (new)

1. Add `pending` and `rejected` to the status enum in listings table:
   ```sql
   ALTER TABLE listings DROP CONSTRAINT listings_status_check;
   ALTER TABLE listings ADD CONSTRAINT listings_status_check
     CHECK (status IN ('active', 'draft', 'sold', 'expired', 'pending', 'rejected'));
   ```

2. Add `rejection_reason` column to listings table:
   ```sql
   ALTER TABLE listings ADD COLUMN rejection_reason TEXT;
   ```

3. Add `reviewed_by` and `reviewed_at` columns for tracking:
   ```sql
   ALTER TABLE listings ADD COLUMN reviewed_by UUID REFERENCES profiles(id);
   ALTER TABLE listings ADD COLUMN reviewed_at TIMESTAMPTZ;
   ```

---

### Phase 2: Update Listing Service

**File:** `src/scripts/services/listings.js`

1. Modify `createListing()` method:
   - Check user role before setting status
   - If role is 'user' (Потребител), set status to 'pending'
   - If role is 'moderator' or 'admin', allow 'active' status (auto-approve)
   - Line ~179: Change default status logic to check role

2. Add helper method `getUserRole()` to fetch current user's role

---

### Phase 3: Update Admin Service

**File:** `src/scripts/services/admin.js`

1. Update `approveListing()` method:
   - Add `reviewed_by` and `reviewed_at` fields when approving

2. Update `rejectListing()` method:
   - Require rejection reason (make it mandatory parameter)
   - Store `rejection_reason`, `reviewed_by`, `reviewed_at`
   - Set status to 'rejected' (new status) instead of 'expired'

3. Add new method `sendRejectionMessage(listingId, listingOwnerId, listingTitle, reason)`:
   - Uses existing messages table
   - Sends from the current admin/moderator to the listing owner
   - Message format: "Вашата обява '[title]' беше отхвърлена. Причина: [reason]"
   - This ensures user gets a notification in their messages inbox

---

### Phase 4: Update Admin/Moderator Listings UI

**Files:**
- `src/pages/admin/listings/listings.js`
- `src/pages/moderator/listings/listings.js`

1. Update status filter to include "Pending" and "Rejected" options

2. Add pending count badge in dashboard header

3. Modify rejection flow:
   - Replace simple confirm dialog with a modal
   - Modal includes textarea for rejection reason (required)
   - On submit, call `rejectListing(listingId, reason)` and `sendRejectionMessage()`

4. Update status badge colors:
   - pending: warning (yellow/amber)
   - rejected: danger (red)
   - Update `getStatusBadgeClass()` method

5. Show rejection reason column in table for rejected listings

---

### Phase 5: Update Create Listing Page

**File:** `src/pages/listings/create/create.js`

1. Update success message based on user role:
   - Regular users: "Вашата обява е изпратена за одобрение!" (Your listing is sent for approval)
   - Admins/Moderators: "Обявата е публикувана!" (Listing published)

2. Remove "Публикувай" (Publish) button for regular users, keep only "Запази чернова" (Save draft) or change to "Изпрати за одобрение" (Send for approval)

---

### Phase 6: Update User's My Listings Page

**File:** `src/pages/user/my-listings/my-listings.js`

1. Add 'rejected' status display with danger badge
2. Show pending status with warning badge
3. Display rejection reason prominently when listing is rejected
4. Add "Edit & Resubmit" button for rejected listings:
   - Opens edit form (can reuse create form with pre-populated data)
   - On submit, changes status to 'pending' and clears rejection_reason
5. Add visual indicators for listing status:
   - Pending: "Чакаща одобрение" badge (warning)
   - Rejected: "Отхвърлена" badge (danger) with reason shown

---

### Phase 7: Add Status Formatter Update

**File:** `src/scripts/utils/formatters.js`

1. Update `formatStatus()` to include Bulgarian translations:
   ```javascript
   case 'pending': return 'Чакаща одобрение';
   case 'rejected': return 'Отхвърлена';
   ```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/011_add_pending_status.sql` | New migration: add pending/rejected status, rejection_reason, reviewed_by/at columns |
| `src/scripts/services/listings.js` | Modify createListing() for role-based status, add resubmit method |
| `src/scripts/services/admin.js` | Update approve/reject methods, add sendRejectionMessage() |
| `src/pages/admin/listings/listings.js` | Add rejection modal with reason input, update status filters |
| `src/pages/moderator/listings/listings.js` | Add rejection modal with reason input, update status filters |
| `src/pages/listings/create/create.js` | Update success messages based on role |
| `src/pages/user/my-listings/my-listings.js` | Show pending/rejected status, rejection reason, resubmit button |
| `src/scripts/utils/formatters.js` | Add pending/rejected status translations |

---

## Key Implementation Details

### Rejection Modal (Admin/Moderator UI)
```html
<!-- Add Bootstrap modal for rejection -->
<div class="modal" id="rejectModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5>Отхвърляне на обява</h5>
      </div>
      <div class="modal-body">
        <textarea id="rejection-reason" required
          placeholder="Моля, посочете причината за отхвърляне..."></textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отказ</button>
        <button type="button" class="btn btn-danger" id="confirm-reject">Отхвърли</button>
      </div>
    </div>
  </div>
</div>
```

### User My-Listings Rejection Display
- Show alert box with rejection reason when listing is rejected
- Add "Редактирай и изпрати повторно" button
- On click, navigate to edit page with listing data pre-populated

---

## Verification Plan

1. **Database migration**:
   - Run `supabase migration up` or apply via Supabase MCP
   - Verify new columns exist: `rejection_reason`, `reviewed_by`, `reviewed_at`
   - Verify status constraint includes 'pending' and 'rejected'

2. **Regular user creates listing**:
   - Login as user with role 'user'
   - Create new listing
   - Verify status is 'pending' (not 'active')
   - Verify listing does NOT appear in public listings

3. **Admin approves listing**:
   - Login as admin
   - Go to /admin/listings
   - Filter by 'pending' status
   - Approve a pending listing
   - Verify status changes to 'active'
   - Verify listing now appears in public listings

4. **Admin rejects listing with reason**:
   - Login as admin
   - Reject a pending listing
   - Enter rejection reason in modal
   - Verify status changes to 'rejected'
   - Verify rejection_reason is stored
   - Verify user receives private message

5. **User sees rejection and resubmits**:
   - Login as listing owner
   - Go to /my-listings
   - Verify rejected listing shows with reason
   - Click "Edit & Resubmit"
   - Edit and submit
   - Verify status changes to 'pending'

6. **Moderator workflow**:
   - Login as moderator
   - Verify can access /moderator/listings
   - Verify can approve/reject listings

---

## Confirmed Requirements

1. **Auto-approve for admins/moderators:** ✅ Staff can publish listings directly without approval
2. **Rejection notification method:** ✅ Both private message AND display on "My Listings" page
3. **Resubmission:** ✅ Users can edit and resubmit rejected listings (status → pending)
