# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: Design-A · 2026-08-15 (Opus uncounted. Merchant handover documents built and committed. Two standalone HTML files: User Guide (6pp) + Venue Keys (1pp). Commit f0157ef.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to Design-A: ~86 counted + uncounted planning sessions.

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
| **Block 5** | Merchant onboarding + simulation discipline | 🔵 In progress — Block-5 Close next |
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

### Design-A — date: 2026-08-15
**Scope:** Block 5 continued. Merchant handover documents — layout + styled HTML. Opus uncounted.

**Commit:** `f0157ef` — 2 files created, 821 insertions(+)

**Outputs:**
- `docs/merchant-onboarding-v1.html` — User Guide, 6 A4 pages, print-ready
- `docs/merchant-venue-keys-v1.html` — Venue Keys card, 1 A4 page, print-ready

**Design decisions locked:**
- Layout: "The Manual" — single column, gold hairlines above each h2 (CSS design lock: article h2 dividers)
- Two standalone files, not one file with a page-break switch. Each prints as its own PDF.
- Gold used only on h2 top-borders (guide) and warn-banner left-border (keys) — no other uses
- Arrivals strip: IBM Plex Mono, single line, no wrapping — eyebrow 7pt, arrivals 9.5pt
- Warning banner on Venue Keys sits above the card at full width, not inside it
- Version number in body (masthead__version), not footer
- Print footer removed from last page of each doc — no browser date/URL decoration attempted (CSS cannot suppress Safari; note added for Chrome in control bar)
- Page 6 of User Guide: venue details box + Get in Touch only — no other content
- "Nothing stops this train." removed from merchant-facing docs — internal signature only
- Colophon: incorporation stamp reserved line only (no version line on final page)

**Page break structure (User Guide):**
- p.1: masthead + What Refueler is + What the terminal does
- p.2: Signing in + Your two PINs (sec--newpage)
- p.3: Opening your venue + End of day (sec--newpage)
- p.4: Taking a walk-in order + The arrivals strip (sec--newpage)
- p.5: The three views + Signing out + Support (sec--newpage)
- p.6: Venue details box + Get in Touch + incorporation stamp (sec--newpage)

**Per-merchant swap points (User Guide):** venue name (×3), owner email (×1), date (×2)
**Per-merchant swap points (Venue Keys):** venue name (×2), date (×1)
All sensitive values (Owner PIN, wallet addresses, Staff PIN) are handwritten at handover — never typed.

**Docs ↔ UI sync rule:** active. At close of every block touching merchant terminal UI, confirm handover doc currency.

**Logged for future sessions:**
- S-23 dependency: Signing Out section states sign-out in Queue + OPS views — if S-23 slips before first real handover, trim to OPS-only
- Owner tab document tiles: amber dot (new version available) → green (downloaded). Two tiles: User Guide + Venue Keys. To build post Sim-Close.
- Changelog panel in Owner tab (post Block-5 Close)
- Design-A2: terminal screenshots in User Guide (Queue, OPS, Owner, New Order overlay) — after TDP-B settles the visual design. ~3–4 weeks.
- Status page on refueler.io housing all product signals (post Block 8)
- Account Manager briefing note update: first visit includes showing Owner tab download location and guiding owner to write PINs on tear strip

---

### Onboarding-A — date: 2026-08-15
**Scope:** Block 5 continued. Merchant onboarding flow end-to-end. Handover document copy v3. Opus uncounted.

**Outputs:** Copy v3 signed off → `docs/merchant-onboarding-copy-v3-final.md`. Internal AM briefing notes drafted.

**Flow confirmed (Stages 0–7):** Gates → data capture (Lightning/on-chain/SP addresses) → coord verification → provisioning → pre-flight 21-sat test payment → physical handover (tear strip separated) → go-live → staged rollout.

**Key decisions:** Support: support@refueler.io, 2-hour SLA, Mon–Fri 7am–6pm. Tear strip: Owner PIN + 3 wallet addresses (never digital). Staff PIN in body. Sign-out in Queue + OPS (S-23 assumed). Bookmark tip → S-24. TDP-A/B/C track established after Sim-Close. Owner-away policy logged. Docs ↔ UI sync rule active.

**Snags:** S-23 → High (Queue view sign-out). S-24 added (apple-touch-icon + favicon).
**Schema pending:** `lightning_address`, `onchain_address`, `silent_payment_address`, `mapbox_place_id` on `venue_partners`.

---

### CC-85 — date: 2026-08-14
**Scope:** Block 5 continued. Branded magic link email. First full simulation run. OPS sign-out button. Redirect URL cleanup. Sonnet counted.

**Commits:** `17ecb40` (S-19 Cancel button), `306a587` (S-21 OPS sign-out)

**Snags closed:** S-9, S-19, S-20, S-21
**Snags added:** S-22 (email fallback spacing, low), S-23 (staff no sign-out from queue — promoted to High in Onboarding-A)

---

### CC-84 — date: 2026-08-13
**Scope:** Block 5 continued. Portrait layout (S-16), walk-in order overlay, New Order bar, S-15 sub-label audit, S-17 breakpoint architecture. Sonnet counted.
**Commit:** `d0defcc`

---

### CC-83b — date: 2026-08-12
**Scope:** Block 5 production code. Sonnet counted.

---

### CC-83 — date: 2026-08-12
**Scope:** Block 5 design session. Design-only, no code.

---

## Session queue — forward plan

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~CC-85~~ | Branded magic link email, first full sim run | Sonnet counted | ✅ Closed |
| ~~Onboarding-A~~ | Merchant onboarding flow + printed handover doc | Opus uncounted | ✅ Closed |
| ~~Design-A~~ | Merchant handover document — layout + styled HTML | Opus uncounted | ✅ Closed — commit f0157ef |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | **Next** |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Sim-Close |
| **TDP-B** | Terminal redesign — absorbs menu, events, NumoPay | Opus uncounted | After TDP-A |
| **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| **S-23** | Queue view sign-out button | Sonnet counted | High — pre-go-live |
| **Privacy page update** | Sections 7, 8, 10 + merchant section + Legend free-tier | Sonnet counted | Queued |
| **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| **PIN upgrade** | SHA-256 → bcrypt/argon2, migrate existing hashes | Sonnet counted | Before first live merchant |
| **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, privacy pitch, credential design, Madeira angle | Opus uncounted, extended thinking | Before Pass-A |
| **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After Block 5 sim-close |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Block 5 |
| **Events intelligence layer** | Football fixtures sidebar card, Darwin toggle, owner-selectable horizon strips | Sonnet counted | After Block-5 Close |
| **Owner tab doc tiles** | Amber/green download indicator for User Guide + Venue Keys | Sonnet counted | Post Sim-Close |
| **Changelog panel** | Reverse-chronological change list in Owner tab | Sonnet counted | Post Block-5 Close |
| **Design-A2** | Terminal screenshots in User Guide (post TDP-B) | Opus uncounted | ~3–4 weeks |
| **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| **AD-2** | Share admin dashboard | Sonnet counted | Queued |

---

## Design-A — CLOSED

Session closed 2026-08-15. Two handover docs committed at f0157ef.
Next session: **Block-5 Close** — Block 5 review and recalibration. Opus uncounted.
