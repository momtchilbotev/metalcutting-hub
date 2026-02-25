# Implementation Plan: Newsletter Subscription with Resend

## Context
The subscription form in the footer (`src/scripts/components/Footer.js`) currently shows a fake success message without storing emails or sending confirmations. This plan implements a complete subscription system using Supabase for storage and Resend for email delivery.

## User Preferences
- **Resend API Key**: User already has one ✓
- **Verification Flow**: Email verification required (user clicks link to confirm)
- **Sender Email**: `onboarding@resend.dev` (Resend test domain - only sends to verified emails)

## Architecture
```
[Footer.js] ──► [SubscriptionService] ──► [Supabase DB]
                                            │
                                            ▼
                               [Edge Function: send-confirmation]
                                            │
                                            ▼
                                    [Resend API] ──► User's Email
```

---

## Implementation Steps

### Step 1: Database Migration
**File:** `supabase/migrations/011_create_newsletter_subscriptions.sql`

Create table:
```sql
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_token UUID DEFAULT uuid_generate_v4(),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

-- RLS: Allow anonymous inserts (for subscriptions)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
  FOR INSERT WITH (true);

-- RLS: Allow updates via verification token
CREATE POLICY "Can verify with token" ON newsletter_subscriptions
  FOR UPDATE USING (true);
```

**Tool:** Use `mcp__supabase__apply_migration` after approval.

---

### Step 2: Subscription Service
**File:** `src/scripts/services/subscription.js`

Create service following `auth.js` pattern:
- `subscribe(email)` - Insert email, trigger Edge Function
- `verifyEmail(token)` - Mark email as verified
- `unsubscribe(email)` - Mark as unsubscribed

Key method:
```javascript
async subscribe(email) {
  // 1. Insert into newsletter_subscriptions
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .insert([{ email }])
    .select()
    .single();

  // 2. Call Edge Function to send confirmation email
  await fetch(`${SUPABASE_URL}/functions/v1/send-confirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token: data.verification_token })
  });

  return data;
}
```

---

### Step 3: Edge Function for Resend
**File:** `supabase/functions/send-confirmation/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req) => {
  const { email, token } = await req.json();

  // Call Resend API
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Metalcutting Hub <onboarding@resend.dev>',
      to: email,
      subject: 'Потвърждение на абонамент',
      html: `
        <h1>Благодарим за абонамента!</h1>
        <p>Моля, потвърдете имейла си като кликнете тук:</p>
        <a href="${BASE_URL}/verify-subscription?token=${token}">Потвърди</a>
      `,
    }),
  });

  return new Response(JSON.stringify({ success: true }));
});
```

**Tool:** Use `mcp__supabase__deploy_edge_function` to deploy.

---

### Step 4: Update Footer Component
**File:** `src/scripts/components/Footer.js`

Modify `attachEventListeners()`:
```javascript
// Import at top
import { subscriptionService } from '../services/subscription.js';

// In attachEventListeners()
subscribeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = subscribeForm.querySelector('input[type="email"]').value;

  try {
    await subscriptionService.subscribe(email);
    window.showToast('Проверете имейла си за потвърждение!', 'success');
    subscribeForm.reset();
  } catch (error) {
    if (error.code === '23505') {
      window.showToast('Този имейл вече е абониран!', 'warning');
    } else {
      window.showToast('Грешка при абониране. Опитайте пак.', 'error');
    }
  }
});
```

---

### Step 5: Verification Page
**File:** `src/scripts/pages/VerifySubscriptionPage.js`

Simple page to handle `/verify-subscription?token=xxx`:
- Call `subscriptionService.verifyEmail(token)`
- Show success/error message
- Redirect to home after 3 seconds

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/011_create_newsletter_subscriptions.sql` | Create |
| `src/scripts/services/subscription.js` | Create |
| `supabase/functions/send-confirmation/index.ts` | Create |
| `src/scripts/components/Footer.js` | Modify |
| `src/scripts/pages/VerifySubscriptionPage.js` | Create |
| `src/scripts/router.js` | Modify (add verification route) |

---

## Environment Variables Required

Add to Supabase Edge Functions secrets:
- `RESEND_API_KEY` - API key from resend.com

---

## Verification Plan

1. **Database**: Check table exists via `mcp__supabase__list_tables`
2. **Subscription**: Submit email in footer, verify row appears in DB
3. **Email**: Check Resend dashboard for sent email
4. **Verification**: Click link in email, verify `verified_at` is set in DB

---

## Notes

- **Resend Free Tier**: 3,000 emails/month (sufficient for starting)
- **Test Domain Limitation**: `onboarding@resend.dev` only sends to the email address associated with your Resend account. For production, you'll need to verify your own domain in Resend.
- **Production Migration**: When ready for production, change sender email to your verified domain (e.g., `noreply@metalcutting.com`)
