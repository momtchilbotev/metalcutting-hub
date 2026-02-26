# Research: Messaging System — Root Cause of "Грешка при зареждане на съобщенията"

## Summary

The error **"Грешка при зареждане на съобщенията"** is caused by a **column name mismatch** between the frontend code and the database schema. The code references a `read_at` column (TIMESTAMPTZ) that **does not exist** in the `public.messages` table — the actual column is `is_read` (BOOLEAN).

---

## How the Messaging System Works

### Architecture

The messaging system is a simple direct-messaging feature built entirely on client-side Supabase queries (no dedicated backend service or API layer):

- **Page**: `src/pages/messages/messages.js` (class `MessagesPage`)
- **Database**: `public.messages` table with RLS policies
- **Client**: `@supabase/supabase-js` via `src/scripts/utils/supabaseClient.js`

### Entry Points

Users reach the messages page via two paths:

1. **From listing details sidebar** — A static link:
   ```html
   <a href="/messages?to=${listing.user_id}">Изпрати съобщение</a>
   ```
   (in `src/pages/listings/details/details.js`, line 197)

2. **From "Contact Seller" button** — Programmatic navigation:
   ```js
   window.router.navigate(`/messages?to=${this.listing.user_id}&listing=${this.listingId}`);
   ```
   (in `src/pages/listings/details/details.js`, line 347, `contactSeller()` method)

Both produce URLs like:
- `/messages?to=31c439b8-2345-4573-9bf9-e0d7c5e02710`
- `/messages?to=31c439b8-2345-4573-9bf9-e0d7c5e02710&listing=527828ef-0212-49d3-8b52-3ae598489217`

### Route Setup

The `/messages` route is defined in `src/scripts/router.js` with `authGuard`, meaning the user must be logged in. The router parses query params (`to`, `listing`) and passes them to the `MessagesPage` constructor.

### Page Flow (`render()` method)

1. Show a loading spinner
2. Authenticate user via `authService.getUser()`
3. Call `loadConversations()` — **THIS IS WHERE IT FAILS**
4. If `to` param provided and no existing conversation with that user → call `startNewConversation()`
5. Otherwise select the first conversation
6. Render the template and attach event listeners

### Conversation Loading (`loadConversations()`)

Queries all messages where the current user is sender or receiver, groups them by the other user to build a conversation list, and fetches profile data for each conversation partner.

### Message Sending (`sendMessage()`)

Inserts a new row into `public.messages` with `sender_id`, `receiver_id`, `content`, and optionally `listing_id`.

---

## Database Schema

### `public.messages` Table (live database, confirmed via SQL query)

| Column      | Type                     | Nullable | Default              |
|-------------|--------------------------|----------|----------------------|
| id          | uuid                     | NO       | uuid_generate_v4()   |
| listing_id  | uuid                     | YES      | null                 |
| sender_id   | uuid                     | YES      | null                 |
| receiver_id | uuid                     | YES      | null                 |
| content     | text                     | NO       | null                 |
| **is_read** | **boolean**              | YES      | **false**            |
| created_at  | timestamp with time zone | YES      | now()                |

**Key observation: There is NO `read_at` column. The column is `is_read` (BOOLEAN).**

### RLS Policies on `public.messages`

| Policy                                          | Command | Condition                                          |
|-------------------------------------------------|---------|----------------------------------------------------|
| Users can read own messages                     | SELECT  | `auth.uid() = sender_id OR auth.uid() = receiver_id` |
| Users can send messages                         | INSERT  | `auth.uid() = sender_id`                            |
| Users can update read status of received messages| UPDATE  | `auth.uid() = receiver_id`                          |
| Users can delete own sent messages              | DELETE  | `auth.uid() = sender_id`                            |

RLS policies are correct and not the cause of the error.

### Migration Files

- `001_initial_schema.sql` — Creates the table with `is_read BOOLEAN DEFAULT FALSE`
- `002_rls_policies.sql` — Sets up the four RLS policies above
- `004_indexes_functions.sql` — Creates indexes: `idx_messages_receiver(receiver_id, is_read)`, `idx_messages_sender(sender_id)`
- **No migration ever adds a `read_at` column or alters the `is_read` column**

---

## Root Cause Analysis

### Primary Error: Column `read_at` does not exist

The code in `messages.js` references `read_at` in **four places**, but the database column is `is_read` (BOOLEAN):

#### 1. `loadConversations()` — SELECT query (line ~57)
```js
const { data, error } = await supabase
  .from('messages')
  .select(`
    id, sender_id, receiver_id, content,
    created_at,
    read_at,        // ← DOES NOT EXIST — column is "is_read"
    listing_id
  `)
```
PostgREST responds with an error like `"Could not find column 'read_at' in the schema cache"`. This error is thrown, caught by the `try/catch` in `render()`, and `showError()` displays "Грешка при зареждане на съобщенията."

**This is the immediate cause of the error displayed to users.**

#### 2. `loadConversations()` — Unread count logic (line ~80)
```js
if (msg.receiver_id === this.user.id && !msg.read_at) {
  //                                       ^^^^^^^^ should be !msg.is_read
  conversationMap.get(otherUserId).unread_count++;
}
```

#### 3. `selectConversation()` — Mark as read UPDATE (line ~145)
```js
await supabase
  .from('messages')
  .update({ read_at: new Date().toISOString() })
  //        ^^^^^^^^ should be { is_read: true }
  .eq('receiver_id', this.user.id)
  .eq('sender_id', otherUserId)
  .is('read_at', null);
  //   ^^^^^^^^ should be .eq('is_read', false)
```
This also has a **type mismatch**: the code treats `read_at` as a nullable timestamp, but `is_read` is a boolean.

#### 4. `selectConversation()` — Filter for unread (line ~148)
```js
.is('read_at', null);
// ^^^^^^^^ should be .eq('is_read', false)
```

### Error Flow

```
User navigates to /messages?to=...
  → MessagesPage.render()
    → authService.getUser() ✅ (user is logged in)
    → loadConversations()
      → supabase.from('messages').select('... read_at ...') ❌
      → PostgREST returns error: column "read_at" not found
      → throw error
    → catch block in render()
    → showError() → displays "Грешка при зареждане на съобщенията."
```

---

## Additional Observations

1. **Zero messages in database**: The `public.messages` table currently has 0 rows. Even after fixing the column mismatch, there will be no existing conversations. However, the `startNewConversation()` method would work (it queries `profiles`, not `messages`), allowing new conversations to be started.

2. **The sidebar link vs. Contact button inconsistency**: The sidebar link (`/messages?to=${listing.user_id}`) does NOT include the `listing_id` parameter, while the "Contact Seller" button does (`/messages?to=...&listing=...`). This means messages initiated from the sidebar link won't be associated with a listing.

3. **`listing_id` handling**: `listing_id` in `startNewConversation()` is correctly assigned from params, but the `sendMessage()` method reads it from `this.currentConversation.listing_id`. For existing conversations selected via the sidebar, `listing_id` will be taken from the conversation's last message, not the URL param. This could be confusing.

4. **No real-time updates**: The messaging system has no Supabase Realtime subscription. Messages only appear after manual page interaction (selecting a conversation or sending).

5. **Index mismatch with code**: The database index `idx_messages_receiver` references `is_read` (which exists), confirming the column name.

---

## Recommended Fixes

### Fix 1: Update `loadConversations()` SELECT query
Replace `read_at` with `is_read` in the select columns.

### Fix 2: Update unread count logic
Change `!msg.read_at` to `!msg.is_read`.

### Fix 3: Update `selectConversation()` mark-as-read
Change from:
```js
.update({ read_at: new Date().toISOString() })
.is('read_at', null);
```
To:
```js
.update({ is_read: true })
.eq('is_read', false);
```

### Fix 4 (Optional): Add `read_at` column via migration
Alternatively, a migration could add a `read_at TIMESTAMPTZ` column to support timestamp-based read tracking. However, this is more complex and the existing `is_read` boolean approach is sufficient.

---

## Files Involved

| File | Role |
|---|---|
| `src/pages/messages/messages.js` | Messages page — **contains the bugs** |
| `src/pages/messages/messages.html` | Minimal template (just a container div) |
| `src/pages/messages/messages.css` | Styling for message bubbles |
| `src/pages/listings/details/details.js` | Creates links to messages page |
| `src/scripts/router.js` | Routes `/messages` with `authGuard`, parses params |
| `src/scripts/utils/supabaseClient.js` | Supabase client setup |
| `src/scripts/services/auth.js` | Auth service (getUser, authGuard) |
| `supabase/migrations/001_initial_schema.sql` | Defines `messages` table with `is_read` |
| `supabase/migrations/002_rls_policies.sql` | RLS policies for `messages` |
| `supabase/migrations/004_indexes_functions.sql` | Indexes on `messages` |
