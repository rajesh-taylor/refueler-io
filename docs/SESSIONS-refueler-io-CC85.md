# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: CC-85 · 2026-08-14 (Sonnet counted. Branded magic link email via Resend SMTP. First full sim run passed. OPS sign-out red button. Redirect URLs cleaned. Commits 17ecb40, 306a587.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to CC-85: ~86 counted + uncounted planning sessions.

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
| **Block 5** | Merchant onboarding + simulation discipline | 🔵 In progress — Onboarding-A next |
| **Block 8** | Fiat → sats rewards | 🟡 Promoted — next after Block 5 |
| Pass-A/B | Pass planning sessions | 🟡 After Events × Pass × Merchant scoping session |
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
| CSS-6 | Page CSS rationalisation | ✅ Closed |
| CSS-7 | Share design — upload complete, download page, progress states | ✅ Closed |
| CSS-7b | Share fixes + nav reorder | ✅ Closed |

---

## Session log

### CC-85 — date: 2026-08-14
**Scope:** Block 5 continued. Branded magic link email. First full simulation run. OPS sign-out button. Redirect URL cleanup. Sonnet counted.

**Commits:** `17ecb40` (S-19 Cancel button — previous session push), `306a587` (S-21 OPS sign-out)

**Magic link email (S-9 closed):**
- Resend SMTP configured in Supabase Auth Settings: `smtp.resend.com:465`, username `resend`, sender `Refueler <noreply@refueler.io>`
- Template v3 iterated through three versions: copy changes, button de-golded (body colour match), footer breathing room increased (80px margin above hairline, 12.5px `#6A6560` text)
- Delivered and confirmed in Apple Mail. Subject: `Your sign-in link — Refueler`
- Remaining email snag: fallback link block could drop one more line (S-22, low priority)
- Future upgrade: Route B (Auth Hook Edge Function) when Supabase Pro activated

**First full simulation run — PASSED:**
- Flow: email → Resend delivery → magic link → `refueler.io/merchant/` → staff PIN → queue → New Order overlay → walk-in submit → queue update → OPS + Owner views
- Paper and Carbon confirmed across all three views
- Portrait/resized browser confirmed (no physical iPad — Apple Store visit still pending)
- Darwin showing SIGNAL LOST / AWAITING DARWIN FEED — expected (rail-signal-poll not active in test context)

**OPS sign-out button (S-21 closed):**
- Changed from `btn-dismiss` (faint, generic) to `btn-owner-signout` (red border + red text, fills red on hover)
- Consistent with Owner View sign-out button — both views now clearly signed out via red button

**Redirect URLs (S-20 closed):**
- Removed: `https://refueler.io/merchant-tablet.html`, `https://refueler.io/command-centre.html`
- Added: `https://refueler.io/merchant/`
- Remaining 5 entries: `localhost:*`, `refuelerapp://login-callback`, `/auth/callback`, `?mobileAuth=1`, `/merchant/`

**Supabase quota check:**
- DB 19 MB / 500 MB (4%). Egress current cycle <1%. Grace period from previous cycle breach expires 23 Aug. Safe — no action needed. Upgrade to Pro when first live merchant goes live.

**Cancel button (S-19 closed, commit 17ecb40):**
- `owner-pin-cancel`: 10px → 13px, `--text-tertiary` → `--text-secondary`, hover → `--fg-muted`

**New Order overlay observation (logged):**
- Free-text approach retained over pre-programmed item grid. KDS incumbents use button grids for fixed menus; our approach suits independent operators better. Iterate only on merchant request.

**Snags closed this session:** S-9 (magic link email), S-19 (Cancel button), S-20 (redirect URLs), S-21 (OPS sign-out)
**Snags added:** S-22 (email fallback spacing, low), S-23 (staff no sign-out from queue, medium)

---

### CC-84 — date: 2026-08-13
**Scope:** Block 5 continued. Portrait layout (S-16), walk-in order overlay, New Order bar, S-15 sub-label audit, S-17 breakpoint architecture. Sonnet counted.
**Commit:** `d0defcc` — 3 files changed, 534 insertions(+), 11 deletions(-)
*(Full notes in MasterContext_IO_CC85.md)*

---

### CC-83b — date: 2026-08-12
**Scope:** Block 5 production code. Sonnet counted.
*(Full notes in MasterContext_IO_CC85.md)*

---

### CC-83 — date: 2026-08-12
**Scope:** Block 5 design session. Design-only, no code.
*(Full notes in MasterContext_IO_CC85.md)*

---

## Session queue — forward plan

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~CC-85~~ | Branded magic link email, first full sim run | Sonnet counted | ✅ Closed |
| **Onboarding-A** | Merchant onboarding flow + printed handover doc | Opus uncounted | **Next** |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | After Onboarding-A |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **PIN upgrade** | SHA-256 → bcrypt/argon2, migrate existing hashes | Sonnet counted | Before first live merchant |
| **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, privacy pitch, credential design, Madeira angle | Opus uncounted, extended thinking | Before Pass-A |
| **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After Block 5 sim-close |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Block 5 |
| **Events intelligence layer** | Football fixtures sidebar card, Darwin toggle, owner-selectable horizon strips | Sonnet counted | After Onboarding-A |
| **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| **AD-2** | Share admin dashboard | Sonnet counted | Queued |

---

## Onboarding-A opening prompt

Onboarding-A open. Block 5 continued — merchant onboarding flow and printed handover document. Opus uncounted.

This is a planning and document session. No code unless a specific gap is discovered that requires a quick fix. The output is a complete, print-ready merchant onboarding document that describes the tested flow.

Read these files in full before doing anything else:
- `docs/MasterContext_IO_CC85.md` (live: https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/docs/MasterContext_IO_CC85.md)
- `docs/SESSIONS-refueler-io-CC85.md` (live: https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/docs/SESSIONS-refueler-io-CC85.md)

Session scope:
1. Design the merchant onboarding flow end-to-end — what happens from "Rajesh agrees to onboard a merchant" through to "merchant is live and taking orders". Map every step, every decision point, every piece of information exchanged.
2. Produce the printed handover document — a single A4-printable document given to the merchant at or before go-live. Must describe: what Refueler is, what the terminal does, how to sign in (magic link), staff PIN, owner PIN, how to open/close the venue, how to use the New Order overlay, what Darwin shows, how to contact support. Tone: suave, professional, brief — James Bond not fintech neon.
3. Identify any gaps in the current terminal that would block a real merchant from going live (beyond the known snag list).

Standing rules:
- Read live file state before any edits
- Full plan before any document production — wait for confirmation
- No unrequested documentation

Test account: steakhouse@rajeshtaylor.com — independent_owner — Raj's Steakhouse — venue_id c476df85 — staff PIN 1234 — owner PIN 8888.

MasterContext + SESSIONS + BRIDGE updated at session close. Increment MasterContext to Onboarding-A (no CC increment — uncounted session).
