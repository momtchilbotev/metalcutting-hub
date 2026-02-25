# Research: Subscription Implementation in Footer

## Overview

This document details the implementation of the email subscription feature located in the bottom-right section of the footer, under the "Новини" (News) heading.

---

## 1. Frontend Component

### Location
**File:** `src/scripts/components/Footer.js`

### UI Structure
The subscription form consists of:
- **Heading:** "Новини" (News)
- **Email Input:** Placeholder text "Вашият имейл" (Your email)
- **Submit Button:** Text "Абониране" (Subscribe)
- **Form ID:** `footer-subscribe`

### Code Implementation

```javascript
const subscribeForm = document.getElementById('footer-subscribe');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = subscribeForm.querySelector('input[type="email"]').value;
    window.showToast('Успешна абонация за новини!', 'success');
    subscribeForm.reset();
  });
}
```

### Current Behavior
1. User enters email address
2. On form submission:
   - Prevents default form submission
   - Extracts email value from input field
   - Displays success toast notification: "Успешна абонация за новини!" (Successful newsletter subscription!)
   - Resets the form fields

---

## 2. Backend Integration

### Current State: **NOT IMPLEMENTED**

The subscription feature currently has **no backend integration**:

| Component | Status |
|-----------|--------|
| API Endpoint | ❌ Missing |
| Database Table | ❌ Missing |
| Email Service | ❌ Missing |
| Email Verification | ❌ Missing |
| Admin Management | ❌ Missing |

### What Happens to Submitted Emails?
**Nothing.** The email is extracted from the form but:
- Not sent to any API
- Not stored in any database
- Not validated beyond HTML5 required attribute
- Only shown as a success message (fake confirmation)

---

## 3. Database Schema

### Existing Related Tables
The `profiles` table (migration `008_add_email_to_profiles.sql`) includes an email field, but this is for **registered user accounts**, not newsletter subscriptions.

### Missing Table
A dedicated `newsletter_subscriptions` table does not exist. A proper implementation would require:

```sql
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  ip_address VARCHAR(45),
  user_agent TEXT
);
```

---

## 4. Service Layer

### Current State
- **No service file** exists for subscription operations
- The `src/scripts/services/` directory contains:
  - `auth.js` - Authentication
  - `admin.js` - Admin operations
  - `supabase-client.js` - Supabase client

### Missing Service Methods
A complete implementation would need:
- `subscribe(email)` - Add new subscription
- `unsubscribe(email)` - Remove subscription
- `verifyEmail(token)` - Confirm email ownership
- `getSubscriptions()` - List all subscriptions (admin)

---

## 5. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CURRENT STATE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [Footer.js]                                                │
│       │                                                      │
│       ├── Form submit event                                  │
│       │                                                      │
│       ├── Extract email value                                │
│       │                                                      │
│       ├── Show toast notification ←───────── ┐               │
│       │                                      │ FAKE          │
│       └── Reset form                         │ SUCCESS       │
│                                              │               │
│   [NO API CALL] ─────────────────────────────┘               │
│   [NO DATABASE STORAGE]                                       │
│   [NO EMAIL VERIFICATION]                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      REQUIRED IMPLEMENTATION                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [Footer.js]                                                │
│       │                                                      │
│       ├── Form submit event                                  │
│       │                                                      │
│       └── POST /api/subscribe                                │
│               │                                              │
│               ▼                                              │
│       [API Route Handler]                                    │
│               │                                              │
│               ├── Validate email                             │
│               ├── Check for duplicates                       │
│               ├── Store in database                          │
│               │       │                                      │
│               │       ▼                                      │
│               │   [newsletter_subscriptions table]           │
│               │                                              │
│               └── Send verification email                    │
│                       │                                      │
│                       ▼                                      │
│               [Email Service: SendGrid/Mailgun/etc.]         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Checklist

To make this feature functional, the following needs to be implemented:

### Database
- [ ] Create `newsletter_subscriptions` table via migration
- [ ] Add RLS policies for security

### API Layer
- [ ] Create `POST /api/subscribe` endpoint
- [ ] Create `POST /api/unsubscribe` endpoint
- [ ] Create `GET /api/subscriptions` endpoint (admin only)
- [ ] Create `POST /api/verify-subscription` endpoint

### Service Layer
- [ ] Create `subscription.js` service file
- [ ] Implement CRUD operations for subscriptions
- [ ] Add email validation logic

### Frontend Updates
- [ ] Update `Footer.js` to call API instead of showing fake success
- [ ] Add loading state during API call
- [ ] Add proper error handling
- [ ] Show verification message (check your email)

### Email Integration
- [ ] Integrate with email service provider
- [ ] Create verification email template
- [ ] Create newsletter email templates

### Admin Panel
- [ ] Add subscription management section
- [ ] Allow viewing/exporting subscribers
- [ ] Allow sending newsletters

---

## 7. Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **UI Component** | ✅ Complete | Clean form in footer |
| **Form Handling** | ⚠️ Partial | Only frontend, no API call |
| **User Feedback** | ✅ Complete | Toast notification works |
| **API Endpoint** | ❌ Missing | No backend route exists |
| **Database Storage** | ❌ Missing | No table for subscriptions |
| **Email Verification** | ❌ Missing | No verification flow |
| **Admin Management** | ❌ Missing | No way to manage subscribers |

**Conclusion:** The subscription feature is a **frontend-only mock** that provides a good user experience but does not actually collect or store any subscription data. It needs full backend implementation to become functional.
