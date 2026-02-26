# Plan: Enable RLS on Categories and Locations Tables

## Context

The security audit identified that Row Level Security (RLS) is **not enabled** on the `categories` and `locations` tables, even though SELECT policies exist. This is a **CRITICAL** vulnerability (API-C1, API-C2) that allows unauthorized modification/deletion of reference data.

**Current State:**
- RLS is disabled on both tables (`rowsecurity = false`)
- Only SELECT policies exist (public read for everyone)
- No INSERT, UPDATE, DELETE policies for admin/moderator roles
- Admin service (`src/scripts/services/admin.js`) already has methods to manage categories

**Requirements:**
- Everyone (authenticated and unauthenticated) can READ categories and locations
- Only admin and moderator roles can CREATE, UPDATE, DELETE

---

## Implementation Steps

### Step 1: Create Database Migration

Create a new migration file to:
1. Enable RLS on both tables
2. Add INSERT, UPDATE, DELETE policies for admin/moderator roles

**File:** New migration via Supabase MCP

```sql
-- Enable RLS on categories and locations tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Categories: Admins and moderators can insert
CREATE POLICY "Admins and moderators can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Categories: Admins and moderators can update
CREATE POLICY "Admins and moderators can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Categories: Admins and moderators can delete
CREATE POLICY "Admins and moderators can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Locations: Admins and moderators can insert
CREATE POLICY "Admins and moderators can insert locations"
  ON locations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Locations: Admins and moderators can update
CREATE POLICY "Admins and moderators can update locations"
  ON locations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );

-- Locations: Admins and moderators can delete
CREATE POLICY "Admins and moderators can delete locations"
  ON locations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['moderator'::user_role, 'admin'::user_role])
    )
  );
```

### Step 2: Save Migration SQL to Codebase

Save a copy of the migration SQL to `supabase/migrations/` for documentation purposes (following project convention).

---

## Verification Plan (Using Chrome DevTools MCP)

### Test 1: Unauthenticated User Access
1. Navigate to the application without logging in
2. Verify categories and locations are visible on home page (SELECT works)
3. Verify direct API calls to INSERT/UPDATE/DELETE fail

### Test 2: Regular User Access
1. Login as regular user: `demo@demo.demo` / `1234567890`
2. Verify categories and locations are visible (SELECT works)
3. Navigate to admin categories page - should be denied
4. Verify direct API calls to INSERT/UPDATE/DELETE fail

### Test 3: Moderator Access
1. Login as moderator: `moderator@moderator.moderator` / `1234512345`
2. Navigate to admin categories page
3. Verify can view, create, edit, delete categories
4. Verify all operations succeed

### Test 4: Admin Access
1. Login as admin: `admin@admin.admin` / `1234512345`
2. Navigate to admin categories page
3. Verify can view, create, edit, delete categories
4. Verify all operations succeed

### Test 5: Verify RLS Status in Database
Run SQL query to confirm RLS is enabled:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('categories', 'locations') AND schemaname = 'public';
```

---

## Files Modified

| File | Change |
|------|--------|
| `supabase/migrations/016_enable_rls_categories_locations.sql` | New migration file (documentation) |
| Database | Migration applied via Supabase MCP |

---

## Expected Outcome

- RLS enabled on `categories` and `locations` tables
- Public SELECT access preserved for all users
- Only admin/moderator roles can modify data
- Resolves CRITICAL vulnerabilities API-C1 and API-C2 from security audit
