# Metalcutting Hub MVP - Security Audit Report

**Date:** 2025-02-16
**Application:** Metalcutting Hub
**Type:** Web Application (SPA with Supabase backend)
**Scope:** Full security audit of all application pages and functionality
**Audit Team:** 6 security testing agents working in parallel

---

## Executive Summary

This report documents the security vulnerabilities and malfunctions found during a comprehensive security audit of the Metalcutting Hub MVP. The audit was conducted by a team of security specialists analyzing authentication, listings, user profiles, messaging, admin panel, and backend API security.

### Vulnerability Summary

| Area | Critical | High | Medium | Low | Total |
|------|----------|------|--------|-----|-------|
| Authentication | 0 | 3 | 6 | 5 | 14 |
| Home Page | 0 | 4 | 5 | 3 | 12 |
| Listings | 2 | 5 | 4 | 1 | 12 |
| User Profiles | 1 | 1 | 3 | 1 | 6 |
| Messages | 1 | 1 | 2 | 0 | 4 |
| Admin Panel | 3 | 5 | 8 | 1 | 17 |
| API/RLS | 2 | 1 | 2 | 1 | 6 |
| **TOTAL** | **9** | **20** | **30** | **12** | **71** |

### Severity Breakdown
- **CRITICAL (9):** RLS disabled, broken authentication, PII exposure, privilege escalation
- **HIGH (20):** Open redirect, IDOR, XSS, storage security, admin bypass
- **MEDIUM (30):** No rate limiting, missing CSRF, account enumeration, message injection
- **LOW (12):** Code quality, incomplete features, minor issues

### Risk Assessment

The application has **9 CRITICAL** and **20 HIGH** severity vulnerabilities that represent significant security risks. These issues should be addressed before production deployment.

---

## CRITICAL Vulnerabilities (Immediate Action Required)

### AUTH/BACKEND: RLS Disabled on Public Tables
- **Severity:** CRITICAL
- **CWE:** CWE-285, CWE-732
- **Location:** Database tables `categories` and `locations`
- **Description:** Row Level Security (RLS) is NOT enabled on `categories` and `locations` tables, even though RLS policies exist.
- **Impact:** Unauthorized modification/deletion of categories and locations data
- **Fix:**
```sql
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
```

### MESSAGES: Broken Authentication - Hardcoded User ID
- **Severity:** CRITICAL
- **Location:** `src/scripts/pages/messages/Messages.js:401-404`
- **Description:** `getUserFromSomewhere()` returns hardcoded `'current-user-id'` instead of actual user
- **Impact:** Messages display incorrectly, authorization broken, potential data leakage
- **Fix:** Replace with `await authService.getUser()`

### USER PROFILES: PII Phone Number Exposure
- **Severity:** CRITICAL
- **Location:** `src/scripts/services/listings.js:112`, `ListingDetails.js:190-192`
- **Description:** Phone numbers exposed to ALL visitors (including unauthenticated) via listing details
- **Impact:** Spam, harassment, privacy violations
- **Fix:** Implement phone visibility controls and authentication requirement

### LISTINGS: IDOR - Draft/Expired Listing Access
- **Severity:** CRITICAL
- **Location:** `src/scripts/services/listings.js:106-143`
- **Description:** `getListingById()` doesn't validate status - anyone can access draft/expired listings by ID
- **Impact:** Unauthorized access to unpublished listings
- **Fix:** Add status validation before returning listing data

### LISTINGS: Client-Side Authorization Bypass
- **Severity:** CRITICAL
- **Location:** `src/scripts/pages/listings/ListingEdit.js:62-68`
- **Description:** Ownership check only on client-side; server-side check happens after query
- **Impact:** Inconsistent security posture
- **Fix:** Ensure RLS policies enforce ownership at database level

### ADMIN: Client-Side Authorization Bypass
- **Severity:** CRITICAL
- **Location:** `src/scripts/router.js:70-94`, All admin pages
- **Description:** Admin routes rely entirely on client-side `adminGuard()` checks
- **Impact:** Attackers can bypass by modifying JavaScript or direct API calls
- **Fix:** Move admin operations to Supabase Edge Functions with server-side auth

### ADMIN: Privilege Escalation Vulnerability
- **Severity:** CRITICAL
- **Location:** `src/scripts/services/admin.js:252-268`
- **Description:** `updateUserRole()` only checks authentication, not admin privileges
- **Impact:** Users can self-promote to admin role
- **Fix:** Fix RLS policy to only allow admins to change `role` column

### ADMIN: Missing CSRF Protection
- **Severity:** CRITICAL
- **Location:** All admin action forms
- **Description:** All admin actions lack CSRF token validation
- **Impact:** Attackers can trick admins into performing unwanted actions
- **Fix:** Implement CSRF tokens for all state-changing operations

### BACKEND: Leaked Password Protection Disabled
- **Severity:** CRITICAL
- **Location:** Supabase Auth configuration
- **Description:** HaveIBeenPwned.org password checking is disabled
- **Impact:** Users can set compromised passwords
- **Fix:** Enable leaked password protection in Supabase Auth settings

---

## 1. Authentication Pages

**Status:** ✓ Complete

### HIGH Severity (3)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| AUTH-H1 | Open Redirect | `Login.js:188-191` | Unvalidated redirect parameter allows phishing |
| AUTH-H2 | Weak Password Policy | `validators.js:26-32` | Only 6 character minimum, no strength check |
| AUTH-H3 | XSS via Error Messages | `helpers.js:509` | Error messages not properly sanitized |

### MEDIUM Severity (6)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| AUTH-M1 | No Rate Limiting | `Login.js:162-197` | Unlimited login attempts possible |
| AUTH-M2 | Account Enumeration | `helpers.js:500` | Error messages reveal account existence |
| AUTH-M3 | No CSRF Protection | Forms | CSRF tokens missing on forms |
| AUTH-M4 | OAuth Redirect Issue | `auth.js:85` | Loses intended destination after OAuth |
| AUTH-M5 | No Password Meter | `Register.js:54-68` | No strength feedback to users |
| AUTH-M6 | Session Management | `auth.js` | Session regeneration not verified |

### LOW Severity (5)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| AUTH-L1 | Unused Sanitization | `sanitizeInput()` never used |
| AUTH-L2 | Console Logging | Errors logged in production |
| AUTH-L3 | No Request Timeout | Auth requests can hang |
| AUTH-L4 | Remember Me Incomplete | Checkbox exists but not implemented |
| AUTH-L5 | Phone Validation | Permissive regex allows malformed numbers |

---

## 2. Home Page

**Status:** ✓ Complete

### HIGH Severity (4)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| HOME-H1 | Search Input XSS | `Home.js:276-282` | No sanitization before router navigation |
| HOME-H2 | Phone Number Exposure | `listings.js:112` | PII exposed via getListingById() |
| HOME-H3 | Missing CSP Headers | HTML | No Content Security Policy |
| HOME-H4 | Data Exposure | API responses | User profile data without privacy controls |

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

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| LIST-C1 | IDOR - Listing Access | `listings.js:106-143` | Draft/expired listings accessible by ID |
| LIST-C2 | Client-Side Auth Bypass | `ListingEdit.js:62-68` | Ownership check only client-side |

### HIGH Severity (5)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| LIST-H1 | Stored XSS via Title/Description | Forms | Data stored without sanitization |
| LIST-H2 | Stored XSS via Category/Location | API | Admin-controlled data attack vector |
| LIST-H3 | Image MIME Type Bypass | `storage.js` | Only checks file.type string |
| LIST-H4 | Path Traversal in Listing ID | File paths | No UUID validation before file paths |
| LIST-H5 | Price Manipulation | `ListingCreate.js` | Client-side validation bypassable |

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

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| PROF-C1 | PII Phone Exposure | `listings.js:112` | Phone visible to all users |

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

**Status:** ✓ Complete

### CRITICAL Severity (1)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| MSG-C1 | Hardcoded User ID | `Messages.js:401-404` | `getUserFromSomewhere()` fake ID |

### HIGH Severity (1)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| MSG-H1 | IDOR Potential | `Messages.js:93-126` | Complex OR logic manipulation |

### MEDIUM Severity (2)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| MSG-M1 | Message Injection | `Messages.js:315-352` | Can send to arbitrary users |
| MSG-M2 | No Input Validation | `Messages.js:316-318` | No length/content validation |

---

## 6. Admin Panel

**Status:** ✓ Complete

### CRITICAL Severity (3)

| ID | Vulnerability | Location | Description |
|----|---------------|----------|-------------|
| ADMIN-C1 | Client-Side Auth Bypass | `router.js:70-94` | All admin checks client-side |
| ADMIN-C2 | Privilege Escalation | `admin.js:252-268` | Users can self-promote |
| ADMIN-C3 | Missing CSRF Protection | All admin forms | No CSRF tokens |

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

**Important Note:** Admin protection relies entirely on client-side checks. Security depends on RLS policies and Supabase Auth properly validating JWT tokens.

---

## 7. API Security & RLS Policies

**Status:** ✓ Complete

### CRITICAL Severity (2)

| ID | Vulnerability | Table | Description |
|----|---------------|-------|-------------|
| API-C1 | RLS Disabled | `categories` | Policies exist but RLS not enabled |
| API-C2 | RLS Disabled | `locations` | Policies exist but RLS not enabled |
| API-C3 | Password Breach Protection | Auth | HaveIBeenPwned check disabled |

### HIGH Severity (1)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| API-H1 | Insecure Storage Policy | `listing-images` | Public bucket, no ownership verification |

### MEDIUM Severity (2)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| API-M1 | Mutable search_path | `update_updated_at_column()` function |
| API-M2 | Extension in Public | `pg_trgm` in public schema |

### LOW Severity (1)

| ID | Vulnerability | Description |
|----|---------------|-------------|
| API-L1 | Anon Key Exposure | Expected for Supabase |

### Table RLS Status

| Table | RLS Enabled | Status |
|-------|-------------|--------|
| profiles | ✅ Yes | Secure (needs privacy enhancement) |
| listings | ✅ Yes | Secure |
| listing_images | ✅ Yes | Secure |
| messages | ✅ Yes | Secure |
| watchlist | ✅ Yes | Secure |
| reviews | ✅ Yes | Secure |
| admin_audit_log | ✅ Yes | Secure |
| **categories** | ❌ **No** | **VULNERABLE** |
| **locations** | ❌ **No** | **VULNERABLE** |

---

## 8. Additional Findings

### Code Quality Issues

1. **Inconsistent Error Handling** - Some functions throw, others return null
2. **Missing JSDoc Comments** - Many functions lack documentation
3. **Hardcoded Values** - Magic numbers throughout code
4. **Duplicate Code** - Similar patterns repeated
5. **Unused Functions** - `sanitizeInput()`, `getImageDimensions()` not called

### Functional Issues (Malfunctions)

1. **Broken Authentication** - `getUserFromSomewhere()` returns fake ID (CRITICAL BUG)
2. **"Report Listing" Not Implemented** - Shows toast but does nothing
3. **Forgot Password Route Missing** - Link exists but no page
4. **No Image Preview** - Users can't see images before uploading
5. **Random Count Display** - Fake numbers for category counts

---

## Testing Methodology

1. **Static code analysis** - Manual review of all source files
2. **OWASP Top 10** - Checklist for common vulnerabilities
3. **Database security scan** - Supabase security advisors
4. **Authorization testing** - Role-based access control
5. **Input validation testing** - Form and API inputs

---

## Prioritized Recommendations

### IMMEDIATE (Critical - Block Production)

1. **Enable RLS on categories and locations**
2. **Fix hardcoded user ID in Messages.js** (`getUserFromSomewhere()`)
3. **Implement phone number privacy controls**
4. **Fix privilege escalation in admin role changes**
5. **Move admin operations to Edge Functions** with server-side auth
6. **Enable HaveIBeenPwned password protection**

### HIGH PRIORITY (This Sprint)

1. Fix open redirect vulnerability
2. Strengthen password policy (12+ characters)
3. Add CSRF tokens to all forms
4. Implement rate limiting on auth endpoints
5. Fix client-side admin role checks
6. Add upper bound validation for price
7. Implement message recipient validation
8. Add profile privacy tiers

### MEDIUM PRIORITY (Next Sprint)

1. Standardize error messages
2. Fix OAuth redirect flow
3. Add password strength meter
4. Implement MFA for admin actions
5. Add server-side file upload validation
6. Implement content security policy headers
7. Add X-Frame-Options/CSP frame-ancestors

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
3. ✅ `escapeHtml()` function implemented and used
4. ✅ RLS enabled on sensitive tables (except categories/locations)
5. ✅ TLS enforced by Supabase
6. ✅ Admin actions logged to audit table
7. ✅ Proper autocomplete attributes
8. ✅ File size limits enforced
9. ✅ Parameterized queries prevent SQL injection

---

## Conclusion

The Metalcutting Hub MVP has **9 CRITICAL** and **20 HIGH** severity vulnerabilities that must be addressed before production deployment.

### Key Issues

1. **RLS disabled on public tables** - Data tampering risk
2. **Broken authentication in messages** - Malfunction + security
3. **Client-side admin checks** - Relies on RLS (needs verification)
4. **PII phone exposure** - Privacy violation
5. **Privilege escalation** - Users can become admins
6. **Missing CSRF** - Multiple attack vectors

**Recommended Action:** Address all CRITICAL and HIGH severity issues before production launch. The application has a reasonable security baseline with Supabase Auth and RLS, but several critical gaps need immediate attention.

---

*Report prepared by the Metalcutting Hub Security Audit Team*
*Date: 2025-02-16*
*Total vulnerabilities found: 71 (9 Critical, 20 High, 30 Medium, 12 Low)*
