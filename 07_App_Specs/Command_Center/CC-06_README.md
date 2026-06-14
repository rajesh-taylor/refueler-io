# CC-06 — merchant_orders Table, Queue Migration & Venue Resolution RLS
Session date: 9 June 2026
Commit: [insert hash after push]
Files modified: merchant-tablet.html
Files added: (migration SQL only — no new HTML)

---

## Context

CC-05 delivered `command-centre.html` as the authenticated routing index.
The `merchant_users` table was applied via Supabase MCP and confirmed live.
CC-06 closes two open build items that were explicitly deferred from CC-05:
1. `merchant_orders` table creation and queue logic migration off `orders`
2. Venue resolution RLS fix on `merchant-tablet.html`

Both are active build items, not documentation placeholders.

---

## New table: merchant_orders (public schema)

Purpose: isolates queue-facing order state from the core `orders` table.
The `orders` table retains payment and fulfilment records; `merchant_orders`
holds only the live operational view a merchant terminal needs.

### Schema

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PRIMARY KEY DEFAULT `gen_random_uuid()` | |
| `order_id` | `uuid` NOT NULL REFERENCES `orders(id)` | FK to source order |
| `venue_id` | `uuid` NOT NULL REFERENCES `venue_partners(id)` | Scoping key for RLS |
| `pseudonym_id` | `uuid` NOT NULL | Mirrors `orders.pseudonym_id` — no direct identity link |
| `items` | `jsonb` NOT NULL | Denormalised item list for queue display |
| `status` | `text` NOT NULL DEFAULT `'pending'` CHECK (`status` IN (`'pending'`, `'preparing'`, `'ready'`, `'collected'`, `'cancelled'`)) | State machine |
| `eta_seconds` | `integer` | Nullable; populated by venue on status transition to `preparing` |
| `created_at` | `timestamptz` NOT NULL DEFAULT `now()` | |
| `updated_at` | `timestamptz` NOT NULL DEFAULT `now()` | Trigger-maintained |

### Indexes
- `(venue_id, status)` — primary queue query pattern
- `(order_id)` — reconciliation joins back to `orders`
- `(created_at DESC)` — recency ordering on queue display

### RLS policy (locked)

```sql
-- Enable RLS
ALTER TABLE merchant_orders ENABLE ROW LEVEL SECURITY;

-- Merchant read: own venue only, via merchant_users lookup
CREATE POLICY "merchant_read_own_venue"
ON merchant_orders
FOR SELECT
USING (
  venue_id IN (
    SELECT venue_id
    FROM merchant_users
    WHERE user_id = auth.uid()
      AND role IN ('merchant', 'franchise_branch')
  )
);

-- Franchise HQ read: own franchise_group_id only
CREATE POLICY "franchise_hq_read_own_group"
ON merchant_orders
FOR SELECT
USING (
  venue_id IN (
    SELECT vp.id
    FROM venue_partners vp
    JOIN merchant_users mu ON mu.user_id = auth.uid()
    WHERE mu.role = 'franchise_hq'
      AND vp.franchise_group_id = (
        SELECT franchise_group_id
        FROM merchant_users
        WHERE user_id = auth.uid()
      )
  )
);

-- Admin read: all rows
CREATE POLICY "admin_read_all"
ON merchant_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM merchant_users
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Status update: merchant may update status on own venue rows only
CREATE POLICY "merchant_update_own_venue_status"
ON merchant_orders
FOR UPDATE
USING (
  venue_id IN (
    SELECT venue_id
    FROM merchant_users
    WHERE user_id = auth.uid()
      AND role IN ('merchant', 'franchise_branch', 'franchise_hq', 'admin')
  )
)
WITH CHECK (
  venue_id IN (
    SELECT venue_id
    FROM merchant_users
    WHERE user_id = auth.uid()
      AND role IN ('merchant', 'franchise_branch', 'franchise_hq', 'admin')
  )
);

-- Insert: service role only (order creation via edge function, not direct client)
-- No INSERT policy granted to authenticated role.
```

### updated_at trigger

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER merchant_orders_updated_at
BEFORE UPDATE ON merchant_orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## Queue logic migration

### What moved

The queue display on `merchant-tablet.html` previously read from `orders`
directly, filtering by `venue_id` resolved from `venue_partners`. That
join was fragile and exposed more of the order record than the merchant
terminal needs.

After CC-06, `merchant-tablet.html` reads exclusively from `merchant_orders`.
The `orders` table is no longer queried by merchant-role clients.

### Population path (unchanged architecture)

Order creation flow (edge function / server-side):
1. `orders` row inserted (existing flow)
2. Edge function immediately inserts a corresponding `merchant_orders` row,
   copying `venue_id`, `pseudonym_id`, `items` from the order payload
3. `merchant_orders.status` starts as `'pending'`
4. Status transitions (`preparing` → `ready` → `collected`) are driven by
   merchant terminal actions against `merchant_orders` only
5. Fulfilment webhook back to `orders` remains on the payment layer — no change

The two tables are reconcilable via `merchant_orders.order_id` FK but are
operationally decoupled. Merchants never touch `orders` directly.

---

## Venue resolution RLS fix — merchant-tablet.html

### Problem (carried from CC-05)

`resolveMerchantVenue()` in `merchant-tablet.html` was querying `venue_partners`
by `contact_email` — matching the logged-in user's email against the venue
record. This worked for the original single-venue proof of concept but had
two failure modes:

1. A `merchant_users` row with `venue_id = null` (e.g. admin, franchise_hq)
   would fall through to an empty result and render an "unknown venue" state.
2. The query bypassed `merchant_users` entirely — a user with a valid
   `venue_partners.contact_email` entry but no `merchant_users` row could
   theoretically reach the queue view.

### Fix (locked)

`resolveMerchantVenue()` now resolves venue from `merchant_users` first,
then joins to `venue_partners` for display metadata.

```javascript
async function resolveMerchantVenue(supabase, userEmail) {
  // 1. Resolve role and venue_id from merchant_users
  const { data: mu, error: muErr } = await supabase
    .from('merchant_users')
    .select('role, venue_id, franchise_group_id')
    .eq('email', userEmail)
    .maybeSingle();

  if (muErr || !mu) return { error: 'access_not_configured' };

  // 2. Admin sees all venues — no venue scoping
  if (mu.role === 'admin') {
    return { role: 'admin', venue_id: null, display_name: 'ALL VENUES' };
  }

  // 3. Franchise HQ — resolve group display name, no single venue_id
  if (mu.role === 'franchise_hq') {
    return {
      role: 'franchise_hq',
      venue_id: null,
      franchise_group_id: mu.franchise_group_id,
      display_name: 'HQ VIEW'   // Overridden in franchise-dashboard.html
    };
  }

  // 4. merchant / franchise_branch — require venue_id
  if (!mu.venue_id) return { error: 'venue_not_assigned' };

  const { data: vp, error: vpErr } = await supabase
    .from('venue_partners')
    .select('id, name, primary_color, secondary_color, venue_type')
    .eq('id', mu.venue_id)
    .maybeSingle();

  if (vpErr || !vp) return { error: 'venue_not_found' };

  return {
    role: mu.role,
    venue_id: vp.id,
    display_name: vp.name,
    primary_color: vp.primary_color,
    secondary_color: vp.secondary_color,
    venue_type: vp.venue_type
  };
}
```

This function is the single resolution path. It is called once on auth,
result cached in a module-level variable for the session lifetime.

---

## Design fix carried from CC-05

`dev-console.html` and `franchise-dashboard.html` auth gate buttons
use orange (`#F5820A`) fill. Per design system, orange is CTAs only —
not on admin/internal tool auth screens.

**Fix applied in this session:** replaced with outlined button using
`--accent-carbon: #C8A96E` border and text, transparent background.
Consistent with internal tool register.

---

## Standing items carried into CC-07

- Replace anon key placeholder in `command-centre.html` before deploy
  (requires Supabase project keys — do not commit live keys to GitHub)
- `mintInterface.ts` JSDoc — add on next touch (wording locked in master context)
- ICO registration — OVERDUE, pre-beta blocker
- Supabase PKCE switch — when React Native build starts
- NUT-28 — pending Minibits P2BK confirmation at Cashu dev call
- Ben Cousins message — send after BOLT12 session closes
