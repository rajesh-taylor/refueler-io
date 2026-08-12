# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: CC-83 · 2026-08-12 (Sonnet counted — design-only session, no code written. Merchant terminal nav, horizon strip, order tiles, portrait layout, and product architecture all locked. CC-83b queued for production code.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to CC-83: ~84 counted + uncounted planning sessions.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default, footer stamp, CC-25 banner, sessions query fix | ✅ CC-65 |
| Block 1 | Schema hardening: RLS, opsTogglePause, PIN RLS | ✅ CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ CC-69 |
| Block 4 | Dev console hardening + investor telemetry | ✅ CC-65 |
| Block M | Share migration — `share.refueler.io` → `refueler.io/share/` | ✅ M-3 |
| Block 3 | Franchise dashboard | ✅ CC-81 |
| **Block 5** | Merchant onboarding + simulation discipline | 🔵 In progress — CC-83/83b/84/85 |
| **Block 8** | Fiat → sats rewards | 🟡 Promoted — next after Block 5 |
| Pass-A/B | Pass planning sessions | 🟡 After Block 8 |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred — non-gating |
| Block 7 | Passenger count join | ⚪ Deferred — non-gating |
| Block 10+ | iOS/Android beta prep, Darwin bridge, Ticketing MVP | ⚪ Future |

---

## CSS rationalisation track — complete

| Session | Scope | Status |
|---|---|---|
| CSS-1 through CSS-3 | Design reference, audit, blueprint | ✅ Closed — uncounted |
| CSS-4 | Implement new global.css | ✅ commit 2cbc496 |
| CSS-5 | Full site verification + Legend layout removal | ✅ commits 9f44d3b, 7fb04de, 83c9fa9, 7ed7ac3 |
| CSS-6 | Page CSS rationalisation — `:root` strip, analytics rfTheme, legend tagline | ✅ Closed |
| CSS-7 | Share design — upload complete, download page, progress states | ✅ Closed |
| CSS-7b | Share fixes + nav reorder | ✅ Closed |

---

## Session log

### CC-83 — date: 2026-08-12
**Scope:** Block 5 design session — merchant terminal nav redesign, horizon strip, order tiles, portrait layout, product architecture. Sonnet counted. **No code written this session — all design decisions locked for CC-83b.**

**No commits this session.**

**Supabase security alert (received 09 Aug 2026):** `partners_public_read` policy has `qual: true` — `venue_partners` readable by anyone with project URL. Fix confirmed: drop `partners_public_read`, replace with scoped policy. To be applied in CC-83b Migration 1.

**S-2 update:** `independent_owner` IS already covered by `merchant_select_own_venue` policy (confirmed via `pg_policies` read). The "Loading venue…" bug is a JS fetch/auth issue, not an RLS gap. No new policy needed. Investigate JS token passing in CC-83b.

**refueler-app repo (CC-83 finding):** App screens not pushed to `main` — local only on Rajesh's machine. `dev` branch push attempted but failed — PAT placeholder `YOUR_TOKEN` in remote URL. Fix: `git remote set-url origin https://rajesh-taylor:REAL_TOKEN@github.com/rajesh-taylor/refueler-app.git && git push origin dev`. Run before CC-83b-app Opus session.

**Product architecture confirmed:**
- **Refueler consumer app** (`refueler-app`) — customer-facing. Pre-orders, walk-in orders via app, Legend, Pass. Customer's primary Refueler touchpoint.
- **Merchant terminal** (`refueler-io/src/merchant/`) — counter/kitchen tablet. Receives and manages orders, Darwin, owner controls.
- **NumoPay fork** (`rajesh-taylor/numo-fork`, v1.6 of cashubtc/Numo v1.8) — waiter/floor-staff Android phone app. In-house order taking and payment processing. Lightning/Cashu native. Talks to terminal.
- **Flow:** consumer app places order → merchant terminal receives → NumoPay handles in-venue fulfilment and payment.
- **Mobile terminal:** dropped — too much information to cram. NumoPay fork is the mobile/waiter solution.

**NumoPay fork scope (logged):**
- Original `cashubtc/Numo` v1.8: Lightning/Cashu integration, menu download, webhooks, Minibits wallet compatible.
- Fork `rajesh-taylor/numo-fork` is v1.6 — clean base, no changes made yet.
- Start NumoPay fork session after Block 5 sim-close, when terminal design is locked and API contract is clear.
- BitChat integration research item: bluetooth mesh sync for offline resilience when wifi drops. Log for NumoPay fork planning session.
- `REFUELER-BRIDGE.md` to include `refueler-numo-fork` at next block close.

**Decisions locked — merchant terminal nav:**

- **Nav left — default (no merchant logo):** Refueler wordmark (Satoshi 700, 16px, `#E4E2DC` — matches website exactly) · divider · "MERCHANT TERMINAL" (IBM Plex Mono, 12px, `#C8C9CB`). "Powered by Refueler" dropped — vanity, unreadable at size.
- **Nav left — merchant has logo:** Square logo (32×32px, 5px radius) · divider · "MERCHANT TERMINAL" same spec. Merchant name never appears as text in nav — either it's the logo or it's just Refueler.
- **Logo onboarding spec (for Onboarding-A doc):** PNG or SVG, max 512×512px, max 200KB, transparent background preferred. Renders at 32×32px in nav. If no logo: Refueler wordmark is the default — no upload required at onboarding.
- **Merged pill — QUEUE · OPS · OWNER:** Single pill, 42px tall, 20px horizontal padding per segment, `border-radius: 24px`, border `0.5px solid #4A4D52`. QUEUE/OPS active: `background #35373B`, text `#E4E2DC`. OWNER active: `background rgba(200,169,110,0.14)`, text `#C8A96E`, subtle gold border on segment. All three segments separated by `0.5px solid #35373B`.
- **Separator:** `0.5px solid #4A4D52`, 22px tall, `gap: 20px` on each side between merged pill and theme pill.
- **Theme pill — PAPER · CARBON:** Same 42px height, `border-radius: 24px`, pushed to far right edge. Same style as existing pill. Staff choose theme per shift — not locked to owner.
- **Centre nav:** Empty and clean. No content.

**Decisions locked — horizon strip:**
- Height: 64px (up from 52px) — room for larger text.
- Station name: IBM Plex Mono, 15px, `#E4E2DC` — matches Arrivals font family, high contrast.
- ETA: IBM Plex Mono, 14px, `#C8A96E` (gold).
- "DARWIN · LIVE" label: IBM Plex Mono, 10px, `#5A5751`.
- "ARRIVALS" label: IBM Plex Mono, 10px, `#8A8680`.
- Arrival counts: all `#A8A4A0` — no gold on any count. Urgency via background tint only.
- Window backgrounds: 0–3 min `rgba(255,255,255,0.07)` · 3–7 min `rgba(255,255,255,0.03)` · 7–15 min transparent.
- Window labels: IBM Plex Mono, 10px, `#5A5751`.
- Strip stays `background: #1A1A1A` hardcoded regardless of Paper/Carbon theme — operational instrument, always dark.

**Decisions locked — order tiles:**
- Identifier + items on one line: `[ID] · [items]`. Separator `·` in gold `#C8A96E`.
- Identifier (ID): IBM Plex Mono, 15px, `#E4E2DC`. Can be app ref number (e.g. `246800`), table number (e.g. `Table 4`), or any free text.
- Items: DM Sans, 14px, `#C8C9CB`.
- Status badge: **right side only** — left colour bar dropped (colour-blind concern, staff may not know codes).
- Badge sizing: 10px IBM Plex Mono, `padding: 6px 14px`, `border-radius: 4px`, border + background tint.
- Badge states: PENDING (gold), IN PREP (blue `#7899D4`), READY (green `#3DCA7A`).
- Tile: `background #26282C`, `border 0.5px solid #35373B`, `border-radius: 7px`, `padding: 12px 16px`.

**Decisions locked — portrait layout (CC-84 build):**
- Option 2: sidebar stacks above main content as a horizontally-scrolling card strip.
- Portrait: nav → horizon band → sidebar card strip (horizontal scroll) → stats row → order queue.
- CSS-only, no JS. Media query: `@media (orientation: portrait)` or `max-width: 820px`.
- Mobile terminal: out of scope — NumoPay fork handles mobile/waiter use case.

**Snag list additions:**
- **S-15** — Small text audit: horizon band labels, mono labels, card sub-labels. Targeted pass in CC-83b, continue in CC-84.
- **S-16** — Portrait layout: Option 2 CSS-only sidebar stack. CC-84.
- **S-17** — Landscape/portrait responsive system: single CSS breakpoint architecture for landscape tablet, portrait tablet, NumoPay phone. Design in CC-84, inform NumoPay fork direction.

**Order identifier scope (CC-84 + Onboarding-A):**
- Four origination types: Refueler app pre-order (6–8 digit ref, auto-populated) · walk-in table service (table number) · walk-in counter (staff-assigned) · Lightning wallet direct (TBD).
- Walk-in order entry flow: staff tap "New order", select/type identifier, add items. CC-84.
- Identifier field is free text with suggestions — not a fixed format.
- Lightning direct pay walk-in identifier: research item.
- Sit-down (Table X) vs collection (ref number) distinction relevant for kitchen display — scope in CC-84.

**Onboarding-A doc additions (logged for that session):**
- Venue logo spec: PNG or SVG, max 512×512px, max 200KB, transparent background preferred.
- PIN screen background image spec: portrait-first strip layout (image top 55%, PIN panel solid bottom). Portrait 1080×1200px, max 1MB, subject in upper half.
- Tablet orientation: portrait-first for counter use. Landscape supported. Both designed.
- NumoPay fork for floor/waiter use — Android phone, portrait-only.
- Competitive angle vs Square KDS: no dedicated hardware, no separate subscription, works on existing device. Family-run businesses can afford this.

**Partner-facing materials session additions:**
- Competitive angle vs Square KDS: no dedicated hardware (£599+), no separate KDS subscription. Tablet they already own running Refueler.
- NumoPay fork: in-house order taking, Lightning/Cashu native, waiter floor use.
- Portrait + landscape both supported — one product, any form factor.

**Session queue update:**

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~CC-82~~ | Block 5 pre-work + test env + E2E | Sonnet counted | ✅ Closed |
| ~~Block-5 Review~~ | Recalibrate Block 5 scope | Opus uncounted | ✅ Closed |
| ~~Merchant-Sats-A~~ | Payment architecture | Opus uncounted | ✅ Closed |
| ~~Merchant-Sats-B~~ | Reward flow, stamp lifecycle, commission schema | Opus uncounted | ✅ Closed |
| ~~Merchant-Sats-C~~ | Reward choice UI spec, ADR-MS-19–28 | Opus uncounted | ✅ Closed |
| ~~CC-83~~ | Terminal design decisions — nav, horizon, tiles, portrait | Sonnet counted | ✅ This session — design only |
| **CC-83b** | Block 5 production code — migrations, nav HTML/CSS/JS, S-1/S-6/S-7/S-15 fixes | Sonnet counted | **Next** |
| **CC-83b-app** | Opus — refueler-app `dev` branch review, divergence analysis vs terminal design | Opus uncounted | After app branch pushed |
| **Onboarding-A** | Merchant onboarding flow + printed handover doc (stamp setup, logo, PIN bg) | Opus uncounted | Queued |
| **CC-84** | Block 5 — onboarding flow build, portrait layout (S-16), walk-in order entry, PIN self-service | Sonnet counted | Queued |
| **CC-85** | Block 5 — branded magic link email, first full sim run | Sonnet counted | Queued |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | Queued |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **NumoPay-A** | Fork review — what's usable, API contract with terminal, BitChat research | Opus uncounted | After Block 5 sim-close |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Block 5 |

---

### Merchant-Sats-C — date: 2026-08-11
**Scope:** Reward choice UI spec for consumer app — state machine, sats claim UX, stamp picker, edge cases, Pass Wallet card, Realtime requirements. Opus — uncounted.
**No commits this session.**

*(Full ADR log in MasterContext_IO_CC83.md)*
