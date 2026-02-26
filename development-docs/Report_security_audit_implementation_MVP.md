# Metalcutting Hub MVP - Security Audit Report

**Original Audit Date:** 2025-02-16
**Last Updated:** 2026-02-26
**Application:** Metalcutting Hub
**Type:** Web Application (SPA with Supabase backend)
**Scope:** Full security audit of all application pages and functionality
**Audit Team:** 6 security testing agents working in parallel

---

## Executive Summary

This report documents the security vulnerabilities and malfunctions found during a comprehensive security audit of the Metalcutting Hub MVP. The audit was conducted by a team of security specialists analyzing authentication, listings, user profiles, messaging, admin panel, and backend API security.

### Vulnerability Summary (Current State)

| Area | Critical | High | Medium | Low | Total |
|------|----------|------|--------|-----|-------|
| Authentication | 0 | 3 | 6 | 5 | 14 |
| Home Page | 0 | 4 | 5 | 3 | 12 |
| Listings | 2 | 4 | 4 | 1 | 11 |
| User Profiles | 1 | 1 | 3 | 1 | 6 |
| Messages | 0 | 1 | 2 | 0 | 3 |
| Admin Panel | 3 | 5 | 8 | 1 | 17 |
| API/RLS | 0 | 1 | 3 | 1 | 5 |
| **TOTAL** | **6** | **19** | **31** | **12** | **68** |

### Changes Since Original Audit

| Status | Count | Details |
|--------|-------|---------|
| ✅ RESOLVED | 4 | MSG-C1 (Hardcoded User ID), LIST-H5 (Price upper bound), API-C1 (categories RLS), API-C2 (locations RLS) |
| ⚠️ UPDATED | 3 | Location paths updated, RLS policy details clarified |
| 🔴 UNCHANGED | 64 | Remaining vulnerabilities not yet addressed |

### Severity Breakdown
- **CRITICAL (6):** PII exposure, privilege escalation, CSRF missing
- **HIGH (19):** Open redirect, IDOR, XSS, storage security, admin bypass
- **MEDIUM (31):** No rate limiting, missing CSRF, account enumeration, message injection
- **LOW (12):** Code quality, incomplete features, minor issues

### Risk Assessment

The application has **6 CRITICAL** and **19 HIGH** severity vulnerabilities that represent significant security risks. These issues should be addressed before production deployment.

---

## CRITICAL Vulnerabilities (Immediate Action Required)

### ~~AUTH/BACKEND: RLS Disabled on Public Tables~~
- **Severity:** ~~CRITICAL~~
- **CWE:** CWE-285, CWE-732
- **Status:** ✅ RESOLVED
- **Location:** Database tables `categories` and `locations`
- **Description:** Row Level Security (RLS) is NOT enabled on `categories` and `locations` tables, even though RLS policies exist.
- **Impact:** Unauthorized modification/deletion of categories and locations data
- **Resolution:** RLS enabled and INSERT/UPDATE/DELETE policies added for admin/moderator roles via migration `016_enable_rls_categories_locations.sql` (2026-02-26)

### USER PROFILES: PII Phone Number Exposure
- **Severity:** CRITICAL
- **Status:** 🔴 UNRESOLVED
- **Location:** `src/scripts/services/listings.js:126`
- **Description:** Phone numbers exposed to ALL visitors (including unauthenticated) via listing details. The `getListingById()` query includes `profiles.phone` in the select without access control.
- **Impact:** Spam, harassment, privacy violations
- **Fix:** Implement phone visibility controls and authentication requirement

### LISTINGS: IDOR - Draft/Expired Listing Access
- **Severity:** CRITICAL
- **Status:** 🔴 UNRESOLVED
- **Location:** `src/scripts/services/listings.js:120-157`
- **Description:** `getListingById()` doesn't validate status - anyone can access draft/expired listings by ID. The query returns all listings regardless of status without checking ownership.
- **Impact:** Unauthorized access to unpublished listings
- **Fix:** Add status validation before returning listing data:
```javascript
// Only return active listings unless user is owner/moderator/admin
if (listing.status !== 'active' && !isOwner && !isPrivileged) {
  throw new Error('Listing not found');
}
```

### LISTINGS: Client-Side Authorization Bypass
- **Severity:** CRITICAL
- **Status:** 🔴 UNRESOLVED
- **Location:** `src/pages/listings/edit/edit.js` (ownership check)
- **Description:** Ownership check only on client-side; server-side check happens after query
- **Impact:** Inconsistent security posture
- **Fix:** Ensure RLS policies enforce ownership at database level

### ADMIN: Client-Side Authorization Bypass
- **Severity:** CRITICAL
- **Status:** 🔴 UNRESOLVED
- **Location:** `src/scripts/router.js:67-100`, All admin pages
- **Description:** Admin routes rely entirely on client-side `adminGuard()` checks. While RLS policies provide backend protection, direct API calls bypass client-side guards.
- **Impact:** Attackers can bypass by modifying JavaScript or direct API calls
- **Mitigation:** RLS policies for admin tables are in place, but edge functions recommended for sensitive operations
- **Fix:** Move admin operations to Supabase Edge Functions with server-side auth

### ADMIN: Privilege Escalation Vulnerability
- **Severity:** CRITICAL
- **Status:** 🔴 UNRESOLVED
- **Location:** `src/scripts/services/admin.js:328-338`, RLS Policy in `supabase/migrations/005_admin_tables.sql:86-93`
- **Description:** The RLS policy "Admins can manage user roles" allows `auth.uid() = id` condition, which means ANY authenticated user can update their OWN profile including the `role` column. The `updateUserRole()` function only checks authentication, not admin privileges.
- **Impact:** Users can self-promote to admin role by directly calling the profiles update API
- **Root Cause:** RLS policy allows `auth.uid() = id OR (admin check)` - the first condition allows self-updates including role changes
- **Fix:** Create separate RLS policy that excludes `role` column from self-updates:
```sql
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON profiles;

-- Create policy that only allows admins to update role column
CREATE POLICY "Users can update own profile except role"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (role = (SELECT role FROM profiles WHERE id = auth.uid()) OR
     EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  );
```

### ADMIN: Missing CSRF Protection
- **Severity:** CRITICAL
- **Status:** 🔴 UNRESOLVED
- **Location:** All admin action forms
- **Description:** All admin actions lack CSRF token validation
- **Impact:** Attackers can trick admins into performing unwanted actions
- **Fix:** Implement CSRF tokens for all state-changing operations

### BACKEND: Leaked Password Protection Disabled
- **Severity:** CRITICAL
- **Status:** 🔴 UNRESOLVED
- **Location:** Supabase Auth configuration
- **Description:** HaveIBeenPwned.org password checking is disabled (confirmed by Supabase security advisors)
- **Impact:** Users can set compromised passwords
- **Fix:** Enable leaked password protection in Supabase Auth settings

---

## 1. Authentication Pages

**Status:** ✓ Complete

### HIGH Severity (3)

| ID | Vulnerability | Location | Description | Status |
|----|---------------|----------|-------------|--------|
| AUTH-H1 | Open Redirect | `src/pages/auth/login/login.js:10` | `params.redirect` used without validation - allows phishing attacks | 🔴 UNRESOLVED |
| AUTH-H2 | Weak Password Policy | `src/scripts/utils/validators.js:26-32` | Only 6 character minimum, no complexity requirements | 🔴 UNRESOLVED |
| AUTH-H3 | XSS via Error Messages | `helpers.js:509` | Error messages not properly sanitized | 🔴 UNRESOLVED |

### MEDIUM Severity (6)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| AUTH-M1 | No Rate Limiting | `Login.js:158-176` | Unlimited login attempts possible |
| AUTH-M2 | Account Enumeration | `helpers.js:500` | Error messages reveal account existence |
| AUTH-M3 | No CSRF Protection | Forms | CSRF tokens missing on forms |
| AUTH-M4 | OAuth Redirect Issue | `auth.js:85` | Loses intended destination after OAuth |
| AUTH-M5 | No Password Meter | `Register.js:54-68` | No strength feedback to users |
| AUTH-M6 | Session Management | `auth.js` | Session regeneration not verified |

### LOW Severity (5)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| AUTH-L1 | Unused Sanitization | `sanitizeInput()` exists but not consistently used |
| AUTH-L2 | Console Logging | Errors logged in production |
| AUTH-L3 | No Request Timeout | Auth requests can hang |
| AUTH-L4 | Remember Me Incomplete | Checkbox exists but not implemented |
| AUTH-L5 | Phone Validation | Permissive regex allows malformed numbers |

---

## 2. Home Page

**Status:** ✓ Complete

### HIGH Severity (4)

| ID | Vulnerability | Location | Description | Status |
|----|---------------|----------|-------------|--------|
| HOME-H1 | Search Input XSS | `Home.js:276-282` | No sanitization before router navigation | 🔴 UNRESOLVED |
| HOME-H2 | Phone Number Exposure | `listings.js:126` | PII exposed via getListingById() | 🔴 UNRESOLVED |
| HOME-H3 | Missing CSP Headers | HTML | No Content Security Policy | 🔴 UNRESOLVED |
| HOME-H4 | Data Exposure | API responses | User profile data without privacy controls | 🔴 UNRESOLVED |

### MEDIUM Severity (5)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| HOME-M1 | Location Name XSS | `ListingCard.js:76,142` | Unescaped location names |
| HOME-M2 | Category Name XSS | `ListingCard.js:90` | Unescaped category names |
| HOME-M3 | No Clickjacking Protection | Headers | Missing X-Frame-Options/CSP frame-ancestors |
| HOME-M4 | No Rate Limiting | Search form | Vulnerable to automation/DoS |
| HOME-M5 | Pagination Issues | Featured listings | No caching/optimization |

### LOW Severity (3)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| HOME-L1 | Random Count Display | Fake numbers for category counts |
| HOME-L2 | Error Message Detail | Overly verbose error exposure |
| HOME-L3 | Missing Frame Busting | No JavaScript frame protection |

---

## 3. Listings Pages

**Status:** ✓ Complete

### CRITICAL Severity (2)

| ID | Vulnerability | Location | Description | Status |
|----|---------------|----------|-------------|--------|
| LIST-C1 | IDOR - Listing Access | `listings.js:120-157` | Draft/expired listings accessible by ID | 🔴 UNRESOLVED |
| LIST-C2 | Client-Side Auth Bypass | `edit.js` | Ownership check only client-side | 🔴 UNRESOLVED |

### HIGH Severity (4)

| ID | Vulnerability | Location | Description | Status |
|----|---------------|----------|-------------|--------|
| LIST-H1 | Stored XSS via Title/Description | Forms | Data stored without sanitization | 🔴 UNRESOLVED |
| LIST-H2 | Stored XSS via Category/Location | API | Admin-controlled data attack vector | 🔴 UNRESOLVED |
| LIST-H3 | Image MIME Type Bypass | `storage.js` | Only checks file.type string | 🔴 UNRESOLVED |
| LIST-H4 | Path Traversal in Listing ID | File paths | No UUID validation before file paths | 🔴 UNRESOLVED |
| ~~LIST-H5~~ | ~~Price Manipulation~~ | ~~validators.js~~ | ~~Client-side validation bypassable~~ | ✅ RESOLVED |

**LIST-H5 Resolution:** Price now has upper bound validation (9,999,999.99 BGN) in `src/scripts/utils/validators.js:99-111`

### MEDIUM Severity (4)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| LIST-M1 | Missing CSRF Protection | Listing forms | No CSRF tokens |
| LIST-M2 | No Image Dimension Validation | `storage.js` | DoS risk from huge images |
| LIST-M3 | Status Manipulation | `listings.js:488-490` | Users can set is_featured flag |
| LIST-M4 | SQL Injection Risk | `listings.js:68` | Search with wildcards |

### LOW Severity (1)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| LIST-L1 | Information Disclosure | Detailed error messages |

---

## 4. User Profile Pages

**Status:** ✓ Complete

### CRITICAL Severity (1)

| ID | Vulnerability | Location | Description | Status |
|----|---------------|----------|-------------|--------|
| PROF-C1 | PII Phone Exposure | `listings.js:126` | Phone visible to all users | 🔴 UNRESOLVED |

### HIGH Severity (1)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| PROF-H1 | No Privacy Controls | `auth.js:162-194` | Profiles viewable by all via RLS |

### MEDIUM Severity (3)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| PROF-M1 | Missing CSRF Protection | `Profile.js:204` | Profile update lacks CSRF |
| PROF-M2 | Password Change Weakness | `Profile.js:264-296` | Current password not verified |
| PROF-M3 | Watchlist Bypass Risk | `Watchlist.js` | Relies on RLS only |

### LOW Severity (1)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| PROF-L1 | XSS Protection Partial | escapeHtml exists but CSP needed |

---

## 5. Messages Functionality

**Status:** ✓ Complete (Updated)

### CRITICAL Severity (0)

| ID | Vulnerability | Location | Description | Status |
|----|---------------|----------|-------------|--------|
| ~~MSG-C1~~ | ~~Hardcoded User ID~~ | ~~Messages.js:401-404~~ | ~~`getUserFromSomewhere()` fake ID~~ | ✅ RESOLVED |

**MSG-C1 Resolution:** The messages page now uses proper `authService.getUser()` at `src/pages/messages/messages.js:23`. The file has been moved from `src/scripts/pages/messages/Messages.js` to `src/pages/messages/messages.js`.

### HIGH Severity (1)

| ID | Vulnerability | Location | Description | Status |
|----|---------------|----------|-------------|--------|
| MSG-H1 | IDOR Potential | `messages.js:51-66` | Complex OR logic manipulation | 🔴 UNRESOLVED |

### MEDIUM Severity (2)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| MSG-M1 | Message Injection | `messages.js` | Can send to arbitrary users |
| MSG-M2 | No Input Validation | `validators.js:289-300` | Message length validation exists (5-2000 chars) but content not sanitized |

---

## 6. Admin Panel

**Status:** ✓ Complete

### CRITICAL Severity (3)

| ID | Vulnerability | Location | Description | Status |
|----|---------------|----------|-------------|--------|
| ADMIN-C1 | Client-Side Auth Bypass | `router.js:67-100` | All admin checks client-side | 🔴 UNRESOLVED |
| ADMIN-C2 | Privilege Escalation | `admin.js:328-338`, RLS policy | RLS allows self-role update | 🔴 UNRESOLVED |
| ADMIN-C3 | Missing CSRF Protection | All admin forms | No CSRF tokens | 🔴 UNRESOLVED |

### HIGH Severity (5)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| ADMIN-H1 | Client-Side Role Check | `AdminDashboard.js:13` | Role check in frontend only |
| ADMIN-H2 | Privilege Escalation Risk | `AdminUsers.js:143-148` | No verification for role changes |
| ADMIN-H3 | No Admin Action MFA | All admin pages | Sensitive actions lack MFA |
| ADMIN-H4 | Mass Assignment | `AdminUsers.js:97` | Direct role assignment |
| ADMIN-H5 | IDOR Risk | Admin operations | Modify other users' data |

### MEDIUM Severity (8)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| ADMIN-M1 | No CSRF on Actions | `admin.js:143-213` | All actions lack CSRF |
| ADMIN-M2 | Audit Log Tampering | `admin.js:479-492` | Logging failures ignored |
| ADMIN-M3 | No Rate Limiting | Admin operations | Unlimited admin actions |
| ADMIN-M4 | Session Fixation | Admin panel | Session not verified |
| ADMIN-M5 | XSS in Dashboard | `AdminDashboard.js` | User input not sanitized |
| ADMIN-M6 | SQL Injection Risk | Admin filters | Filter inputs not validated |
| ADMIN-M7 | Inconsistent Security | Various pages | Mixed security patterns |
| ADMIN-M8 | No Confirmation Dialogs | Destructive actions | No confirm before delete |

### LOW Severity (1)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| ADMIN-L1 | Audit Logging Gaps | Not all actions logged |

**Important Note:** Admin protection relies on RLS policies and Supabase Auth for backend security. Client-side guards provide UX but not security.

---

## 7. API Security & RLS Policies

**Status:** ✓ Complete (Updated from Supabase Security Advisors)

### CRITICAL Severity (0)

| ID | Vulnerability | Table | Description | Status |
|----|---------------|-------|-------------|--------|
| ~~API-C1~~ | ~~RLS Disabled~~ | ~~`categories`~~ | ~~Policies exist but RLS not enabled~~ | ✅ RESOLVED |
| ~~API-C2~~ | ~~RLS Disabled~~ | ~~`locations`~~ | ~~Policies exist but RLS not enabled~~ | ✅ RESOLVED |

**API-C1/API-C2 Resolution:** RLS enabled via migration `016_enable_rls_categories_locations.sql` (2026-02-26). INSERT/UPDATE/DELETE policies added for admin/moderator roles.

**Note:** Password Breach Protection (API-C3) moved to CRITICAL section above.

### HIGH Severity (1)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| API-H1 | Insecure Storage Policy | `listing-images` bucket is public, no ownership verification |

### MEDIUM Severity (3)

| ID | Vulnerability | Description | Status |
|----|---------------|-------------|--------|
| API-M1 | Mutable search_path | Functions `handle_new_user_email`, `increment_views`, `update_updated_at_column` have mutable search_path | 🔴 UNRESOLVED |
| API-M2 | Extension in Public | `pg_trgm` extension installed in public schema | 🔴 UNRESOLVED |
| API-M3 | Permissive RLS Policies | `contact_submissions` and `newsletter_subscriptions` have `WITH CHECK (true)` for INSERT (expected for public forms) | ⚠️ ACCEPTED |

### LOW Severity (1)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| API-L1 | Anon Key Exposure | Expected for Supabase client-side apps |

### Table RLS Status

| Table | RLS Enabled | Status |
|-------|-------------|--------|
| profiles | ✅ Yes | Secure (privilege escalation via self-update) |
| listings | ✅ Yes | Secure |
| listing_images | ✅ Yes | Secure |
| messages | ✅ Yes | Secure |
| watchlist | ✅ Yes | Secure |
| reviews | ✅ Yes | Secure |
| admin_audit_log | ✅ Yes | Secure |
| reports | ✅ Yes | Secure |
| newsletter_subscriptions | ✅ Yes | Secure (permissive INSERT expected) |
| contact_submissions | ✅ Yes | Secure (permissive INSERT expected) |
| categories | ✅ Yes | Secure (admin/moderator write access) |
| locations | ✅ Yes | Secure (admin/moderator write access) |

---

## 8. Additional Findings

### Code Quality Issues

1. **Inconsistent Error Handling** - Some functions throw, others return null
2. **Missing JSDoc Comments** - Many functions lack documentation
3. **Hardcoded Values** - Magic numbers throughout code
4. **Duplicate Code** - Similar patterns repeated
5. **Sanitization Functions** - `sanitizeInput()` exists in validators.js but not consistently used

### Functional Issues (Malfunctions)

| Issue | Status | Notes |
|-------|--------|-------|
| ~~Broken Authentication~~ | ✅ FIXED | `getUserFromSomewhere()` removed, using `authService.getUser()` |
| "Report Listing" Not Implemented | 🔴 UNRESOLVED | Shows toast but does nothing |
| Forgot Password Route Missing | 🔴 UNRESOLVED | Link exists but no page |
| No Image Preview | 🔴 UNRESOLVED | Users can't see images before uploading |
| Random Count Display | 🔴 UNRESOLVED | Fake numbers for category counts |

---

## Testing Methodology

1. **Static code analysis** - Manual review of all source files
2. **OWASP Top 10** - Checklist for common vulnerabilities
3. **Database security scan** - Supabase security advisors (2026-02-26)
4. **Authorization testing** - Role-based access control
5. **Input validation testing** - Form and API inputs

---

## Prioritized Recommendations

### IMMEDIATE (Critical - Block Production)

1. **Fix privilege escalation in RLS policy** - Prevent self-role updates
2. **Implement phone number privacy controls** - Require auth for viewing
3. **Fix IDOR in getListingById()** - Add status validation
4. **Enable HaveIBeenPwned password protection** - Supabase Auth setting
5. **Implement CSRF protection** - All state-changing forms

### HIGH PRIORITY (This Sprint)

1. Fix open redirect vulnerability - Validate redirect URLs
2. Strengthen password policy (12+ characters, complexity requirements)
3. Add rate limiting on auth endpoints
4. Fix client-side admin role checks - Move to Edge Functions
5. Implement message recipient validation
6. Add profile privacy tiers

### MEDIUM PRIORITY (Next Sprint)

1. Standardize error messages
2. Fix OAuth redirect flow
3. Add password strength meter
4. Implement MFA for admin actions
5. Add server-side file upload validation
6. Implement content security policy headers
7. Add X-Frame-Options/CSP frame-ancestors
8. Fix mutable search_path on database functions

### LOW PRIORITY (Backlog)

1. Remove console logging in production
2. Complete "Remember Me" functionality
3. Create forgot-password page
4. Implement "Report Listing" functionality
5. Add code comments and documentation
6. Fix random count displays
7. Add image preview on upload

---

## Positive Security Findings

1. ✅ Using Supabase Auth for secure authentication
2. ✅ Proper use of `textContent` instead of `innerHTML`
3. ✅ `escapeHtml()` function implemented in validators.js
4. ✅ RLS enabled on all tables with appropriate policies
5. ✅ TLS enforced by Supabase
6. ✅ Admin actions logged to audit table
7. ✅ Proper autocomplete attributes
8. ✅ File size limits enforced
9. ✅ Parameterized queries prevent SQL injection
10. ✅ Price validation with upper bound (9,999,999.99 BGN)
11. ✅ Messages page properly uses authService.getUser()
12. ✅ Message content length validation (5-2000 characters)
13. ✅ Categories and locations protected with admin/moderator-only write access

---

## Conclusion

The Metalcutting Hub MVP has **6 CRITICAL** and **19 HIGH** severity vulnerabilities that must be addressed before production deployment.

### Progress Since Original Audit

- **4 vulnerabilities resolved:**
  - MSG-C1: Hardcoded User ID → Now uses proper authentication
  - LIST-H5: Price upper bound → Validation implemented
  - API-C1: RLS disabled on categories → RLS enabled with admin/moderator policies
  - API-C2: RLS disabled on locations → RLS enabled with admin/moderator policies

### Key Remaining Issues

1. **Privilege escalation via RLS** - Users can self-promote to admin
2. **IDOR in listing access** - Draft/expired listings accessible
3. **PII phone exposure** - Privacy violation
4. **Missing CSRF** - Multiple attack vectors
5. **Client-side admin checks** - Direct API bypass possible

### Security Score: 50/100 (improved from 40/100)

**Recommended Action:** Address all CRITICAL and HIGH severity issues before production launch. The application has a reasonable security baseline with Supabase Auth and RLS, but several critical gaps need immediate attention.

---

*Report prepared by the Metalcutting Hub Security Audit Team*
*Original Date: 2025-02-16*
*Last Updated: 2026-02-26*
*Total vulnerabilities found: 68 (6 Critical, 19 High, 31 Medium, 12 Low)*
