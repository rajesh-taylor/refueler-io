# claude.md — Refueler Project DNA
> **Version:** 4.2 | **Last updated:** CC-44 · 25 June 2026 | **Status:** Pre-TestFlight / Infrastructure Live
> This file is the single source of truth for Claude session context. Read it in full before any session begins.
> **Operational detail** (DNS, file registry, session history, SMTP config, full schema) lives in `Refueler_MasterContext_CC44.md` — load that file alongside this one every session.

---

## 1. Vision & Mission

Refueler is a Bitcoin-native mobile ordering app for London commuters on the Fenchurch Street line (Shoeburyness → Fenchurch Street). It times pre-orders to the train's arrival so food and drink are ready the moment the commuter walks in — no queue. Payment is settled via the Lightning Network (BOLT11 beta). A loyalty stamp bridge onboards non-Bitcoin users. The broader mission: a parallel payment rail introducing a Bitcoin-native, high-value demographic to merchants who have never had commercial access to them — without touching the payment layer merchants already use.

**Domain:** refueler.io (LIVE) · **GitHub:** `rajesh-taylor/refueler-io` (PUBLIC since ~CC-44 — Claude can read files directly via `raw.githubusercontent.com` / `codeload.github.com`; manual workflow still applies for any writes/commits) · **Legal:** Refueler (trading name; no registered company)

---

## 2. Brand Tokens — LOCKED

Do not deviate. No new palette colours without a formal session decision.

### Colour
| Token | Hex | Usage |
|---|---|---|
| Carbon | `#1A1A1A` | Default — app/mobile, all screens |
| Paper | `#F5F0E8` | Light mode; homepage + editorial default |
| Orange | **ABOLISHED** | `#F5820A` does not exist in this codebase. Do not use. Do not propose. Purge confirmed complete across 15 source HTML files, commit `c223163` (CC-18). |
| Warn (Paper) | `#B87333` | Status indicators, warm CTAs |
| Warn (Carbon) | `#C8943A` | Status indicators, warm CTAs |
| Gold | `#C8A96E` | Carbon inset-rule / blockquote / divider / internal tool auth buttons |
| Danger | `#E05252` | Destructive actions only |

**Rules:**
- Carbon default everywhere except public-facing website/editorial (Paper default).
- ETA widget: venue secondary brand colour as accent — e.g. Costa: cream (`#F5F0D0`) on red (`#C8312A`); M&S: gold on green. Orange not dominant on ETA screen.
- Internal tool auth gate buttons: outlined, `#C8A96E` border + text, transparent background. Confirmed clean on all four Command Centre pages.
- Pre-auth theme toggle: does not appear on `command-centre.html`.

### Typography
| Role | Value |
|---|---|
| Heading | Satoshi (Google Fonts), 600 |
| Body | DM Sans, 300 default / 400/600 for hierarchy |
| Serif (editorial body, table cells, inset card body) | Source Serif 4, weight 300 |
| Telemetry / financial values | IBM Plex Mono |

### Brand Ethos
> **James Bond, not fintech neon.** Suave. Discreet. Refined. If it feels garish, loud, or startup-frantic, it is wrong.

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile app | React Native (bare/Expo prebuild) | iOS-first; Android parity in progress. NOT Expo Go, NOT raw RN CLI. |
| Backend / DB | Supabase (`tihgvdokeofnjxjkenmm`) | Schema active; PKCE flow in progress for native build |
| Auth | Supabase magic link (email, implicit flow) for web; PKCE for React Native | No Apple Sign-in, no password |
| Email | Tuta Business Essential + Resend SMTP | `noreply@` for transactional; `hello@`, `privacy@`, `support@` on Tuta |
| Analytics | Cloudflare Analytics Engine | Worker `refueler-analytics`, endpoint `analytics.refueler.io/event` |
| Hosting | Cloudflare Pages ← GitHub main | Static pages only |
| Bitcoin payments | Lightning BOLT11 via **Blink** (`api.blink.sv/graphql`) | ZBD permanently replaced CC-11. BOLT12 abandoned CC-07. |
| Ecash (future) | Cashu / Minibits (NUT-18 not yet live) | Behind `mintInterface.ts` abstraction |
| Invoice encryption | pgcrypto (`pgp_sym_encrypt`) + Supabase Vault | Key: `bolt11_encryption_key` in Vault. Never in source. |
| Cron jobs | **pg_cron — LIVE, verified CC-44.** | `cron.job` confirmed: `sweep_expired_invoices()` every minute (jobid 1), `reconcile_orphaned_orders()` every 5 min (jobid 2), both `active=true`. (Corrects stale CC-43 note that deploy was "pending" — it was not.) |
| Webhook security | HMAC-SHA256 (X-Blink-Signature, raw hex, not Svix) | `blink-webhook` v4 — live, verified, settlement re-test passed. **Known risk:** `BLINK_WEBHOOK_SECRET` whsec_ prefix/base64 decode mismatch flagged CC-29, still unresolved — production risk only if real Blink webhooks are used. |
| Demand intelligence (rail, live signals) | Darwin (huxley2.unop.uk) + `rail-signal-poll` Edge Function | Darwin polling live for FST since CC-24, 15s cadence. `rail-signal-poll` v2 (CC-38) polls 5 RDM feeds; 4/5 live (incidents, c2c_loadings, departure_board_staff, stations_data); `car_park_occupancy` 404 — Cloud Armor blocking Supabase egress, deferred CC-39. |
| Demand intelligence (rail, reference data) | RDM Knowledgebase Stations + Passenger Loadings APIs | `rail_reference_stations` table live and verified correct (CC-41, 25/25 c2c stations). `rail_reference_loadings` table rebuilt CC-43 to match real API field names; schema and sync function correct, but table is currently empty — RDM's own Passenger Loading Service backend is timing out (`Execution Timeout Expired`), confirmed not an auth/code issue. **Top priority for CC-44: retry.** |
| Claude tooling | Supabase MCP (`execute_sql`, `apply_migration`, `list_tables`, `get_edge_function`, `deploy_edge_function`, `get_publishable_keys`) | `get_publishable_keys` used to pull the real anon/publishable key directly — see §4k. |

---

## 4. Architecture Decisions — LOCKED

### 4a. Payment Layer
- **Beta:** BOLT11 Lightning invoices via **Blink** (`api.blink.sv/graphql`). ZBD permanently replaced.
- **BOLT12: ABANDONED** — locked CC-07. Do not reopen.
- **`mintInterface.ts`:** Abstraction layer. **JSDoc confirmed present and committed — verified CC-44** by reading the file directly from the now-public repo (`lib/mintInterface_session18.ts`). No further action needed.
- **Invoice encryption:** `bolt11_invoice` stored as pgp_sym_encrypt ciphertext. Decrypted only by `blink-webhook` at settlement. Cleared to NULL after settlement or expiry.

### 4b. Lightning Address — Transient Memory Model
Lightning addresses held in transient server memory only. Never persisted to any database, log, or backup.

**Five column categories permanently prohibited from orders table:**
location data · Lightning address · Cashu proof/token · device identifiers · geofence trigger timing

### 4c. On-Device Geofence — Passive Ambient Awareness
Processed entirely on-device. No location data ever transmitted. GDPR-locked.
Locked public copy: *"Refueler knows your train is moving. Your phone works it out locally. We never see where you are."*

### 4d. Merchant Terminal Two-Track
- Track 1 (Numo-fork APK): independents + events.
- Track 2 (Command Centre API): franchise head offices.

### 4e. Enclavia / Confidential Compute — NOT ON CRITICAL PATH
Trigger conditions unchanged: (a) Product 2 requiring confidential compute; (b) commercial counterparty requiring cryptographic data isolation proof; (c) post-revenue behavioural data monetisation confirmed.

### 4f. Merchant Data Isolation — LOCKED
Merchants read exclusively from `merchant_orders`. They never query `orders` directly.

### 4g. Venue Resolution — LOCKED
`resolveMerchantVenue()` resolves from `merchant_users` first, then joins `venue_partners`. Direct `venue_partners.contact_email` lookup deprecated.

### 4h. Franchise Architecture — LOCKED
- `franchise_groups` table: `id`, `name`, `hq_venue_id`
- `venue_partners.venue_type`: `'independent'` | `'franchise_branch'` | `'franchise_hq'` | `'event'`
- `venue_partners.franchise_group_id`: FK → `franchise_groups.id`
- `merchant_id` (TEXT NOT NULL): unique slug per venue
- `category` (TEXT NOT NULL): venue category

### 4i. React Native / PKCE Track — IN PROGRESS (unchanged since CC-36)
- **Bundle ID (iOS):** `io.refueler.app` — locked CC-33, verified CC-34.
- **Apple Team ID:** `GF23GF53WS` (individual free tier).
- **Custom URL scheme:** `refuelerapp://` — set in `app.json`, confirmed present and propagated to native projects on prebuild.
- **Android `intentFilters`:** added to `app.json` CC-36, confirmed present in generated `AndroidManifest.xml` (`https://refueler.io/*`, `BROWSABLE` + `DEFAULT`).
- **Universal Links web-side files (`apple-app-site-association`, `assetlinks.json`):** live since CC-33. `assetlinks.json` `sha256_cert_fingerprints` is still a placeholder — needs a signed Android build to populate.
- **iOS Associated Domains entitlement:** blocked on the free individual Apple Developer account; requires the paid Apple Developer Program. Rajesh will purchase when ready — **no longer a standing reminder item (removed CC-44 per Rajesh's instruction).**
- **`supabaseClient.native.ts`:** located at `refueler-app/src/lib/supabaseClient.native.ts`. PKCE flow, Keychain storage adapter, `detectSessionInUrl: false` all intact. `SUPABASE_ANON_KEY` still placeholder — needs real key before PKCE can be tested end-to-end.
- **No PKCE/RN work occurred CC-37 through CC-44** (demand-intelligence track kept deliberately separate per standing scope rule).
- Always launch via Xcode/Android Studio build, never Expo Go QR scan, once feature work begins.

### 4j. Demand-Intelligence Data Integrity — LOCKED CC-41, EXTENDED CC-43
- **Never trust an Edge Function's own `"ok": true` without independently verifying the target table.** The stations-sync bug (CC-41) produced a plausible-looking success response (`inserted: 22`) while silently corrupting 3 of 25 records — caught only by querying the table directly via Supabase MCP and cross-checking against known-correct data.
- **Reference-data sync functions (delete+insert pattern) must refuse to write if any natural identity field (e.g. `crs_code`) is duplicated in the parsed result**, rather than silently deduplicating. `rail-reference-stations-sync` v6+ implements this guard — treat it as the template for any future reference-sync function.
- **XML leaf-tag flattening must prefer the first occurrence of a repeated tag name, not the last**, when flattening nested blocks of unknown depth.
- **Never design typed scalar columns against assumed/guessed API field names.** The `rail_reference_loadings` table was built at CC-40 against plausible-sounding fields that simply do not exist in the real RDM Passenger Loading payload — every scalar silently came back `NULL` while the insert reported success. **Standing rule: before writing a sync function or designing a table's typed columns, fetch one real sample response and read the actual field names.**
- **Where a clean natural key is confirmed** (no duplicates across the full dataset), prefer **upsert-on-conflict** over delete+insert. Where duplicates exist or the key is unverified, use delete+insert with the duplicate-refusal safe-mode guard instead.

### 4k. Terminal / curl Invocation Hygiene — LOCKED CC-43
- Rajesh's terminal repeatedly corrupts **multi-line curl commands with `\` line-continuations** on paste. **Always give curl commands as a single unbroken line.**
- **Never give a placeholder for an API key.** Always call Supabase MCP `get_publishable_keys` first and inline the real key directly into the command.

---

## 5. GDPR Position — LOCKED

**Locked public privacy copy:**
> *"Refueler knows your train is moving. Your phone works it out locally. We never see where you are."*

| Element | Position |
|---|---|
| Geofence | On-device only; never transmitted; opt-in; zero data retained |
| Lightning address | Personal data under UK GDPR — Art. 6(1)(b) only; transient server memory |
| bolt11_invoice | Encrypted at rest; cleared on settlement/expiry; never logged |
| Legal basis | Art. 6(1)(b) contract performance |
| ICO registration | Tracked manually by Rajesh. Pre-launch requirement (£40/year). Not a Claude standing item. |
| Loyalty stamp track | Open question — A/B test (Track A: stamps+sats, Track B: sats-only) struck if FCA confirms loyalty stamp = PII. |

---

## 6. Copy & Trademark Rules — LOCKED

- **"Fenchurch St line" only** — NEVER "C2C" (trademark PENDING)
- Hero headline: `"Your order is ready. So is your train."`
- Hero subhead: `"We get your order started at the right time so it's ready when you arrive."`
- Merchant value prop: `"New foot flow: Bitcoin stackers — a high-spending, loyalty-averse demographic concentrated in the City of London."`
- Eyebrow label: "Limehouse → Fenchurch Street" until CMO homepage session updates it to "Shoeburyness → Fenchurch Street."
- Darwin API identities kept out of public/investor materials.
- **Editorial:** Three articles published to date. A fourth is under discussion (proposed angle is transparency about real engineering friction — RDM feed quirks, blocked Apple capability, the CC-41 stations data-corruption bug, and the CC-43 loadings schema-mismatch bug) rather than polished marketing copy. Not yet written or locked. Strategy/editorial discussion session still outstanding.

---

## 7. Investor Stats — LOCKED & SOURCED

| Metric | Figure |
|---|---|
| Annual journeys (Fenchurch St line) | 37.3M (ORR 2025) |
| Daily passengers | ~29,760 |
| UK station ranking | 45th |
| Commission tiers | **Flat 6–10% band — locked CC-29.** Operator-type split permanently discarded. |
| Unit economics | £4.50 AOV × 8% (mid-band) ≈ £0.36/tx |
| Year 1 single-station single-partner revenue | ~£167k (conservative) |

Stat cards marked † = unvalidated. Do not use in investor materials until field-measured.
Investor closer: *"Nothing stops this train."* — Lyn Alden thesis reference, one line, end of document, understated.

---

## 8. Reward Model — LOCKED CC-29

Dual-track: **sats (Bitcoin-native default)** + **loyalty stamp** (non-bitcoiner onboarding, larger commission, nudge toward sats migration). Sats/digital stamp track only — operator-type split permanently discarded.

---

## 9. Command Centre — File Registry

| File | Role | Status |
|---|---|---|
| `command-centre.html` | Auth routing index | Clean |
| `merchant-tablet.html` | Queue view / OPS+QUEUE / Horizon Strip | Clean |
| `merchant-tablet-styles.css` | Styles for merchant tablet | Clean |
| `merchant-tablet-logic.js` | Logic for merchant tablet | Clean — `merchant_orders` migration complete |
| `dev-console.html` | Admin tooling | Clean — orange purge complete, auth buttons gold outlined |
| `franchise-dashboard.html` | Franchise HQ | Clean — stale anon key fixed, auth buttons confirmed gold outlined |
| `refueler-app/src/lib/supabaseClient.native.ts` | PKCE/native Supabase client | Relocated CC-35; header comments stale (low priority cosmetic, no longer separately tracked) |
| `rail-signal-poll` (Edge Function) | Live RDM signal polling | v2, CC-38. 4/5 feeds live. |
| `rail-reference-stations-sync` (Edge Function) | Stations reference data sync | v7, CC-41. Verified correct, safe-mode duplicate guard added. |
| `rail-reference-loadings-sync` (Edge Function) | Loadings reference data sync | v2, CC-43. Schema and field-mapping fully corrected, upsert-on-conflict on verified natural key. Table currently empty — blocked on RDM upstream timeout, not a code issue. |
| `lib/mintInterface_session18.ts` | Payment provider abstraction | JSDoc confirmed present and committed — verified CC-44. |

**Auth gate buttons:** All four Command Centre pages confirmed clean.

---

## 10. Merchant PIN Auth — State

- `merchant_users` has `staff_pin_hash` and `owner_pin_hash` (SHA-256, no salt, `crypto.subtle`)
- Full E2E browser test (magic link → PIN gate → queue) confirmed passing CC-27.

## 11. Test Accounts

| Email | Role | Venue | Staff PIN | Owner PIN | Routes to |
|---|---|---|---|---|---|
| `dev@refueler.io` | `admin` | Costa Fenchurch St | 1234 | 8888 | `dev-console.html` |
| `moniker@rajeshtaylor.com` | `independent_owner` | Moniker Coffee (`venue_id: 063e51ce-f175-4905-90f3-36f7cba2195e`) | 1234 | 8888 | `merchant-tablet.html` |

---

## 12. Standing Items — Current (CC-44)

Trimmed CC-44 — see master context §"Memory Cleanup CC-44" for the full audit. Six items removed (2 resolved-and-verified, 1 removed per Rajesh's instruction, 1 reconciled duplicate, plus collapsing two cosmetic/non-Claude items).

| Item | Priority |
|---|---|
| **Strategy + content discussion session** | 🔴 Outstanding since CC-41 handoff, missed CC-42 and CC-43. Several other items below are blocked on the prioritization decision this session is meant to make. |
| **`rail-reference-loadings-sync` — re-run once RDM stops timing out** | 🔴 Code/schema fully fixed. One curl call + one `execute_sql` verification resolves it either way. |
| **Pull real `SUPABASE_ANON_KEY` into `supabaseClient.native.ts`** | 🔴 Needed before PKCE end-to-end test. Gated on strategy session confirming PKCE/RN is next. |
| **Deep-link handler code** | 🔴 Unblocked since CC-36 — not started. Gated on strategy session. |
| **Wallet/payment screen** | 🔴 Queued behind PKCE work. |
| **4th editorial article** | 🔴 Angle picked (engineering-friction), tone/length/outlet TBD. Gated on strategy session. |
| **Horizon Strip Session B** (UI placement) | 🔴 Blocked on a design decision, not a bug. |
| **Android `assetlinks.json` real cert fingerprint** | 🟡 Needs a locally signed build. |
| **Costa Coffee partnership** | 🟡 Awaiting Rajesh's status update. |
| **`car_park_occupancy` 404** | 🟡 Root-caused (Cloud Armor blocking Supabase egress) — genuinely external, nothing actionable our side. |
| **`BLINK_WEBHOOK_SECRET` whsec_ prefix mismatch** | 🟡 Standing production risk, only bites with real Blink webhooks. |
| **`merchant_users` HQ test row** | 🟡 Blocked on FK → `auth.users`. |
| **M&S `franchise_group_id`** | ⚪ |
| **Minibits/Cashu NUT-18** | ⚪ |
| **ICO registration** | — Tracked manually by Rajesh, not a Claude item. |

---

## 13. Session History Summary

| Session | Key outcome |
|---|---|
| CC-02 → CC-11 | Command Centre built; Supabase tables; magic link auth; BOLT11; ZBD → Blink |
| CC-12 → CC-16 | Webhook security; franchise architecture; Costa/M&S wired |
| CC-17 → CC-20 | Schema verification; Horizon Strip; orange purge; CSS Grid; `merchant_orders` |
| CC-21 | Horizon Strip built; Darwin feed; Beck motif; PIN hash; 62 files committed |
| CC-22 | Security closure: `bolt11_encryption_key` replaced; `blink-webhook` v4 HMAC-SHA256 live |
| CC-23 | E2E auth flow fixed and verified |
| CC-24 | BTC tile: Clark Moody format. Darwin feed integrated. |
| CC-25 | `blink-balance` deployed; `merchant_orders` schema drift resolved |
| CC-26 | `blink-balance` v2 CORS fix; `franchise-dashboard.html` clean |
| CC-27 | Test merchant account created; webhook test row seeded; signed curl test protocol ready |
| CC-28 → CC-30 | Merchant tablet bug fixes; blink-webhook settlement re-test passed; `wrangler.toml` fixed |
| CC-31 | `supabaseClient.native.ts` drafted: Keychain adapter, PKCE flow, `detectSessionInUrl: false` |
| CC-32 | Horizon Strip audit: Darwin polls every 15s; passenger counts mocked; demand-intelligence sourcing planned |
| CC-33 | Universal Links web-side files closed. Bundle ID locked. Apple Team ID retrieved. |
| CC-34 | Expo project `refueler-app` created, built, ran on simulator |
| CC-35 | iOS Associated Domains confirmed blocked on free Apple account. `supabaseClient.native.ts` relocated. |
| CC-36 | Custom URL scheme confirmed live. Android `intentFilters` added, verified. Doc consolidation to v3.0. |
| CC-37/38 | `rail-signal-poll` v2 deployed, polling 5 RDM feeds. 4/5 live. |
| CC-39 | `car_park_occupancy` 404 root-caused to Cloud Armor — deferred. |
| CC-40 | Reference table schemas established. Stations scope-mismatch blocker hit. |
| CC-41 | Scope-mismatch root-caused. Stations sync corrupting 3 records via tag-flattening bug — fixed, verified 25/25. Loadings sync left unresolved/unverified. Doc consolidation to v4.0. |
| CC-42 | *(Strategy/editorial discussion session scoped at CC-41 handoff — did not happen. Still outstanding.)* |
| CC-43 | Loadings sync root-caused: built against assumed API field names that don't exist, producing 17,387 all-NULL rows. Table rebuilt, function redeployed v2 with upsert-on-conflict. curl hygiene fixed and locked. Final blocker: RDM upstream timeout, deferred. Doc consolidation to v4.1. |
| CC-44 | **Memory cleanup session (no code work).** Audited all 30 standing items across both files. Removed: Apple Developer Program purchase reminder (per Rajesh — he'll raise it when ready), ICO registration (confirmed not a Claude item), cosmetic header-comment item (folded into general file hygiene). Reconciled and resolved: pg_cron — verified live via `cron.job` query (2 active jobs), corrects stale "deploy pending" note; JSDoc on `mintInterface.ts` — verified present and committed by reading the file directly from the now-public repo. Trimmed standing items from 18 (with overlapping duplicates against the master context's 19-item table) down to 14, with the Strategy + content session promoted to top priority since multiple other items are gated behind it. Doc consolidation to v4.2. |

---

## 14. What This File Is Not

- Not a PRD. Context for Claude sessions only.
- Not a pitch deck.
- Not a legal document.
- Must be updated at the end of every session. A stale `claude.md` is worse than none.

---

*"Nothing stops this train."*
