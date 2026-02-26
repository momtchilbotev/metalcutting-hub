# Report: Contact Form Submission RLS Issue

## Issue Summary

Anonymous users were unable to submit contact forms, receiving a `401 Unauthorized` error with the message:
```
new row violates row-level security policy for table "contact_submissions"
```

## Root Cause Analysis

### The Problem

The issue was **NOT** with the INSERT RLS policy itself. The INSERT policy was correctly configured to allow anonymous inserts:

```sql
CREATE POLICY "Anyone can submit contact forms" ON contact_submissions
  FOR INSERT
  WITH CHECK (true);
```

### The Real Cause

The problem was in the **JavaScript code** that called `.select().single()` after the insert:

```javascript
// PROBLEMATIC CODE
const { data: submission, error } = await supabase
  .from('contact_submissions')
  .insert([submissionData])
  .select()    // <-- This requires SELECT permission!
  .single();
```

When using `.select()` after an insert in Supabase/PostgREST:
1. The INSERT operation completes successfully
2. PostgREST then attempts to SELECT the inserted row(s) to return them
3. **The SELECT operation fails** because anonymous users don't have SELECT permission on the table

This is why the error message said "row-level security policy" - it was the SELECT part that violated RLS, not the INSERT.

### Why Newsletter Subscriptions Worked

The newsletter subscription code also used `.select().single()`, but it worked because the newsletter_subscriptions table had a SELECT policy allowing public access:

```sql
CREATE POLICY "Can check subscription" ON newsletter_subscriptions
  FOR SELECT
  USING (true);  -- Allows anyone to SELECT
```

The contact_submissions table only had SELECT permission for admins/moderators:

```sql
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  ));
```

## Solution

Remove the `.select().single()` call from anonymous insert operations:

```javascript
// FIXED CODE
const { error } = await supabase
  .from('contact_submissions')
  .insert([submissionData]);
// No .select() - we don't need to read back the inserted row

if (error) throw error;

return { success: true };
```

## Lessons Learned

1. **`.select()` after insert requires SELECT permission** - Even though you're selecting your own inserted row, PostgREST still applies RLS SELECT policies.

2. **Check the full operation chain** - The error was about RLS, but the INSERT policy was fine. The issue was the subsequent SELECT.

3. **Compare with working examples carefully** - Newsletter worked not because of different INSERT policies, but because it had a permissive SELECT policy.

4. **For anonymous inserts, avoid returning data** - If you need to confirm the insert, rely on the error variable being null rather than reading back the row.

## Alternative Solutions Considered

### Option 1: Add SELECT policy for anonymous users (NOT RECOMMENDED)
```sql
-- This would work but is a security risk
CREATE POLICY "Can read own submissions" ON contact_submissions
  FOR SELECT
  USING (true);  -- Too permissive!
```

### Option 2: Use a stored procedure
Create a PostgreSQL function that inserts and returns data, then grant execute permission. More complex but provides better control.

### Option 3: Remove .select() (CHOSEN)
Simplest and most appropriate solution - anonymous users don't need to read back their submission.

## Files Modified

- `src/scripts/services/contact.js` - Removed `.select().single()` from submitContactForm method

## Verification

After the fix:
1. Anonymous users can submit contact forms ✅
2. Form data is stored in the database ✅
3. Admin/moderator can view submissions ✅
4. No security compromises ✅
