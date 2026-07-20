# claude.md — Refueler Project DNA
> **Version:** 4.8 | **Last updated:** CC-69 · 20 July 2026 | **Status:** Pre-TestFlight / Infrastructure Live — Auth closed, Webhook closed, Demand-Intelligence cron closed, Strategy backlog closed, Numo Phase 1–3 hardening closed, three new open-source repos initialised, repo hygiene pass closed, Block 2 E2E closed
> This file is the single source of truth for Claude session context. Read it in full before any session begins.
> **Operational detail** (DNS, file registry, session history, SMTP config, full schema) lives in `Refueler_MasterContext_CC69.md` — load that file alongside this one every session.

---

## 1. Vision & Mission

Refueler is a Bitcoin-native mobile ordering app for London commuters on the Fenchurch Street line (Shoeburyness → Fenchurch Street). It times pre-orders to the train's arrival so food and drink are ready the moment the commuter walks in — no queue. Payment is settled via the Lightning Network (BOLT11 beta). A loyalty stamp bridge onboards non-Bitcoin users. The broader mission: a parallel payment rail introducing a Bitcoin-native, high-value demographic to merchants who have never had commercial access to them — without touching the payment layer merchants already use.

**Domain:** refueler.io (LIVE) · **GitHub:** `rajesh-taylor/refueler-io` (web/CC/Supabase) and `rajesh-taylor/refueler-app` (React Native mobile app) — **both PUBLIC**. `refueler-app` is nested locally inside the `refueler.io` working directory (`/Users/rajeshtaylor/Documents/refueler.io/refueler-app`) but is its own separate git repo. Claude can read either directly via `raw.githubusercontent.com/<repo>/main/<path>` — no GitHub MCP needed for read access. Manual workflow still applies for any writes/commits. · **Legal:** Refueler (trading name; no registered company)

---

## 2. Brand Tokens — LOCKED

Do not deviate. No new palette colours without a formal session decision.

### Colour
| Token | Hex | Usage |
|---|---|---|
| Carbon | `#1A1A1A` | Default — app/mobile, all screens |
| Paper | `#F5F0E8` | Light mode; homepage + editorial default |
| Orange | **ABOLISHED** | `#F5820A` does not exist in this codebase. Do not use. Do not propose. |
| Warn (Paper) | `#B87333` | Status indicators, warm CTAs |
| Warn (Carbon) | `#C8943A` | Status indicators, warm CTAs |
| Gold | `#C8A96E` | Carbon inset-rule / blockquote / divider / internal tool auth buttons |
| Danger | `#E05252` | Destructive actions only |

**Rules:**
- Carbon default everywhere except public-facing website/editorial (Paper default).
- ETA widget: venue secondary brand colour as accent — e.g. Costa: cream (`#F5F0D0`) on red (`#C8312A`); M&S: gold on green. Orange not dominant on ETA screen.
- Internal tool auth gate buttons: outlined, `#C8A96E` border + text, transparent background.

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
| Mobile app | React Native (Expo Router, bare prebuild) | iOS-first; Android parity in progress. NOT Expo Go, NOT raw RN CLI. |
| Backend / DB | Supabase (`tihgvdokeofnjxjkenmm`) | Schema active |
| Auth | Supabase magic link (email); PKCE for React Native — LIVE, confirmed E2E CC-46–48 | |
| Auth proxy | Cloudflare Worker `refueler-auth-proxy` | Routes `refueler.io/auth/v1/*` → Supabase GoTrue |
| Email | Tuta Business Essential + Resend SMTP | `noreply@` transactional; `hello@`, `privacy@`, `support@` on Tuta |
| Analytics | Cloudflare Analytics Engine | Worker `refueler-analytics` |
| Hosting | Cloudflare Pages ← GitHub main | Static pages only |
| Bitcoin payments | Lightning BOLT11 via Blink (`api.blink.sv/graphql`) | ZBD permanently replaced CC-11. BOLT12 on roadmap only. |
| Ecash (testing) | `refueler-ecash-lab/` — local, private, never pushed | `@cashu/coco-core` installed. Testing ground only — never production. |
| Ecash (production) | `refueler-mint` repo — CDK Rust mint, Orchard GUI | Not live. Two planning sessions (A + B) required before any deployment. |
| Invoice encryption | pgcrypto (`pgp_sym_encrypt`) + Supabase Vault | Key: `bolt11_encryption_key` in Vault. Never in source. |
| Cron jobs | pg_cron — 3 active jobs verified live | jobid 1 sweep_expired_invoices every min; jobid 2 reconcile_orphaned_orders every 5 min; jobid 3 rail-signal-poll every 2 min |
| Webhook security | Svix HMAC — `blink-webhook` v6, confirmed live CC-46 | `verify_jwt: false` explicit on every external-facing deploy |
| Demand intelligence | Darwin (huxley2.unop.uk) + `rail-signal-poll` Edge Function | `car_park_occupancy` confirmed dead — strip from FEEDS array next touch |
| Android POS terminal | Numo fork (`rajesh-taylor/numo-fork`, package `io.refueler.merchant`) | Local: `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork` |
| Darwin bridge | `refueler-darwin-bridge` — Node.js STOMP process, Railway.app | Not live. Gated on Darwin Push Port planning session. |

---

## 4. Architecture Decisions — LOCKED

*Do not relitigate these.*

**4a. Geofencing:** On-device only. Zero location data transmitted.

**4b. Lightning address:** Transient server memory only — never persisted to DB.

**4c. `merchant_orders` isolation:** Merchants never query `orders` directly.

**4d. Payment provider:** Blink only for beta. ZBD permanently struck. BOLT12 on roadmap only.

**4e. Rewards:** Dual-track — sats (Bitcoin-native) and loyalty stamps (non-bitcoiners, with sats nudge). Refueler takes larger commission on stamp track.

**4f. Corridor copy:** "Fenchurch St line" only — NOT "C2C". Eyebrow stays "Limehouse → Fenchurch Street" until CMO session.

**4g. Merchant value prop:** "New foot flow: Bitcoin stackers — high-spending, loyalty-averse, City of London."

**4h. Commission:** Flat 6–10% band. Operator-type split discarded permanently.

**4i. Auth (PKCE):** Fully closed CC-48.

**4j. Data integrity rule:** Never trust a function's own success response. Always verify state directly after any data operation.

**4k. Numo fork package:** `io.refueler.merchant` — NOT `com.cashubtc.numo`.

**4l. Over-documentation rule:** Deliver only requested artifacts. Do not produce unrequested reference documents alongside code deliverables.

**4m. Curl rule:** Always single-line, real key inlined — no backslash continuations ever.

**4n. `verify_jwt` rule:** Must be passed explicitly as `false` on every edge function deploy for external-facing endpoints.

**4o. BLAKE3 / Cashu architectural lock (refueler-share):** BLAKE3 handles internal indexing and chunk verification. Cashu blind signatures handle anonymous authentication. These are distinct layers — must never be conflated in documentation or code.

**4p. Ecash boundary lock:** `refueler-ecash-lab/` is the testing ground — local, private, never pushed. `refueler-mint` is the production path. No external mint ever. Ecash stamps are closed-loop goods/services only — no ecash-to-sats path. `REFUELER_INTERNAL_MINT_URL_PENDING` placeholder — do not populate until internal mint is live.

**4q. Darwin bridge deployment:** `refueler-darwin-bridge` must deploy to Railway.app (always-on). Never a Supabase Edge Function — cold starts are incompatible with a persistent STOMP connection.

**4r. Editorial spec files:** `editorial/EDITORIAL-MASTER.md` and any `*-spec.md` files are internal planning documents — gitignored in `refueler-io`, never on GitHub.

**4s. CDK version pinning rule (refueler-mint):**
All three layers must pin to the same CDK version.

  refueler-mint Cargo.toml    → cdk = "0.17.2", cdk-sqlite = "0.17.2"
  tests/go/ cdk-go harness    → pin to equivalent CDK 0.17.x tag
  cdk-dart TurboModule        → pin to equivalent CDK 0.17.x tag

Mismatched versions break blind signature validation across language
boundaries. Never bump without updating all three simultaneously.
Fortnightly: check cashubtc/cdk-go and cashubtc/cdk-dart for
uniffi-generated API surface changes — new NUTs land without warning.

---

## 5. Open-Source Infrastructure Repos

| Repo | Local path | Licence | Role |
|---|---|---|---|
| `rajesh-taylor/refueler-share` | `/Users/rajeshtaylor/Documents/refueler-share/` | Apache 2.0 | BLAKE3 + Cashu blind-signature anonymous file transfer |
| `rajesh-taylor/refueler-multi-core` | `/Users/rajeshtaylor/Documents/refueler-multi-core/` | MIT | BLAKE3-accelerated esplora-electrs fork, ARM/Raspberry Pi |
| `rajesh-taylor/refueler-mint` | `/Users/rajeshtaylor/Documents/refueler-mint/` | MIT | Closed-loop CDK Rust loyalty stamp mint, Orchard GUI |
| `rajesh-taylor/refueler-darwin-bridge` | `/Users/rajeshtaylor/Documents/refueler-darwin-bridge/` | TBD | Darwin Push Port → Supabase movement bridge (not live) |

**Separation rule:** `refueler-ecash-lab/` (local at `/Users/rajeshtaylor/Documents/refueler-ecash-lab/`) stays private and is never pushed. It is the ecash testing ground. `refueler-mint` is the production path — not live until Session A + Session B planning complete.

`refueler-share` is the fastest path to market and likely R&D funding source.

---

## 6. Numo Fork — Hardening Status

| Phase | Status |
|---|---|
| Phase 1 — EventModeManager (Nostr gate) | ✅ Closed — commit `15bebd0` |
| Phase 2 — EncryptedSharedPreferences | ✅ Closed — confirmed CC-terminal-1 |
| Phase 3 — Svix HMAC-SHA256 webhook | ✅ Closed — `webhook-handler.ts` deployed |

---

## 7. Supabase MCP — Standing Rules

- `apply_migration` for all DDL (never raw `execute_sql` for schema changes)
- `execute_sql` for read-only queries and post-change verification
- `get_publishable_keys` fresh at the start of every session that touches auth or Edge Functions
- `verify_jwt: false` explicit on every Edge Function deploy for external-facing endpoints
- Vault secrets: never in source

---

## 8. File & Repo Map

| Path | Notes |
|---|---|
| `/Users/rajeshtaylor/Documents/refueler.io/` | Root working directory |
| `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` | React Native app (own git repo, `rajesh-taylor/refueler-app`) |
| `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` | Numo Android POS fork (`rajesh-taylor/numo-fork`) |
| `/Users/rajeshtaylor/Documents/refueler-ecash-lab/` | Ecash lab — local only, never pushed, testing ground |
| `/Users/rajeshtaylor/Documents/refueler-share/` | `rajesh-taylor/refueler-share` — public |
| `/Users/rajeshtaylor/Documents/refueler-multi-core/` | `rajesh-taylor/refueler-multi-core` — public |
| `/Users/rajeshtaylor/Documents/refueler-mint/` | `rajesh-taylor/refueler-mint` — public |
| `/Users/rajeshtaylor/Documents/refueler-darwin-bridge/` | `rajesh-taylor/refueler-darwin-bridge` — public. Darwin STOMP bridge. Not live. |

---

## 9. Build Queue — Current Priority Order

| Priority | Item | Status |
|---|---|---|
| 🔴 1 | **Block 3 — Franchise dashboard** — KPI strip, per-venue commission, operator controls | Next |
| 🟡 2 | **Session A — CDK mint architecture** (refueler-mint) | Queued |
| 🟡 3 | **Session B — Stamp lifecycle + FCA compliance check** (refueler-mint) | Queued after Session A |
| 🟡 4 | **refueler-share MVP** — BLAKE3 + Cashu file transfer | Queued |
| 🟡 5 | **Block 5 — Merchant onboarding flow** | Queued |
| 🟡 6 | **Ticketing MVP (CC-70)** | Queued |
| 🟡 7 | **Gate plugin + orange UI (CC-67)** | Queued |
| ⚪ 8 | `car_park_occupancy` strip from FEEDS array | Bundle with next rail-signal-poll touch |
| ⚪ 9 | Darwin Push Port planning session | Dedicated future session — `refueler-darwin-bridge` repo ready |
| ⚪ 10 | `CONTRIBUTING.md` for 3 open-source repos | Deferred — end of August |
| ⚪ 11 | `.well-known/assetlinks.json` SHA256 fingerprint | Replace placeholder at first signed Android build |
| ⚪ 12 | `refueler-darwin-bridge` licence decision | Bundle with Darwin Push Port session |
| ⚪ 13 | CC-60 partnerships outreach (Aaron) | Held pending call |
| ⚪ 14 | `blink-webhook_index.ts` stale file in repo | Delete or replace with v12 source |
| ⚪ 15 | `bsc-dev` Dev Test item in PreOrderScreen | Remove before TestFlight |
| ⚪ 16 | `Costa Coffee HQ` category label fix | `Franchise_hq` → proper display name |
| ⚪ 17 | GitHub Actions red X on commit `9b9655d` | Fix when convenient |

---

## 10. Session History Summary (latest 5)

| Session | Key outcome |
|---|---|
| CC-63 | `order-status.tsx` built. `routing_fee_sats` migration. `formatSats()` fixed. APK on GrapheneOS. |
| CC-64 | Three new repos initialised: `refueler-share`, `refueler-multi-core`, `refueler-mint`. README ecosystem charts corrected. Licences, `.gitignore`, per-repo `CLAUDE.md`/`SESSIONS.md` added. |
| CC-64 hygiene | Full `refueler-io` repo audit. `timer/` removed (pre-pivot artifact). `darwin_bridge/` extracted to own repo (`refueler-darwin-bridge`, pushed). `.env.example` ZBD vars replaced with Blink. `EDITORIAL-MASTER.md` + `the-float-spec.md` removed from GitHub. `.gitignore` updated. |
| CC-68 | Blink API key rotated (`refueler-beta` revoked, `refueler-cc68` active). `blink-webhook` v12 redeployed. PreOrderScreen polling fallback added. |
| CC-69 | Block 2 closed. Settled view inline in PreOrderScreen (NativeTabs routing incompatible with sibling routes). Three-layer settlement detection (Realtime + poll + AppState). Fee:pending rule for zero/null routing fee. BOLT11 display removed. Blink wallet for future tests. |

---

## 11. What This File Is Not

- Not a PRD. Context for Claude sessions only.
- Not a pitch deck. Not a legal document.
- Must be updated at the end of every session. A stale `claude.md` is worse than none.

---

*"Nothing stops this train."*
