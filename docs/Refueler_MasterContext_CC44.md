# Refueler Master Context — CC-44
*Updated: 2026-06-25 (CC-44)*
*Supersedes: `Refueler_MasterContext_CC43.md`*

---

## Project overview

Refueler is a Bitcoin-native mobile pre-order platform for commuters on the Fenchurch St line (Shoeburyness → Fenchurch Street corridor), targeting independent cafés and franchise venues near stations.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`
**GitHub:** `rajesh-taylor/refueler-io` — **PUBLIC** (made public ~CC-44). Claude can read files directly via `raw.githubusercontent.com/rajesh-taylor/refueler-io/main/<path>` or `codeload.github.com` tarball pulls — no GitHub MCP or manual paste needed for read access. Manual workflow still applies for any writes/commits.
**Claude tooling note:** Supabase MCP tools (`execute_sql`, `apply_migration`, `list_tables`, `get_edge_function`, `deploy_edge_function`, `get_publishable_keys`) are directly available and load via `tool_search` at session start. Terminal round-trips are still required only for *invoking* edge functions (sandbox cannot reach `supabase.co` or `api1.raildata.org.uk` directly — egress allowlist is npm/pip/github only, `pg_net` not enabled on this project).

---

## CC-44 — Memory cleanup session (no code/build work)

Pure triage session: audited every standing item across `claude_v4_1.md` §12 (18 items) and the CC-43 master context standing-items table (19 items, substantially overlapping). Goal was to trim to only what's genuinely still open, verify two ambiguous/conflicting items against live state, and remove items per Rajesh's direction.

### Removed outright

- **Apple Developer Program purchase decision.** Per Rajesh: he will make the purchase when ready; this is no longer a Claude standing reminder. Still documented as a known blocker on iOS Universal Links/Associated Domains in `claude_v4_1.md` §4i, just no longer carried as an action item.
- **ICO registration.** Already flagged in both docs as "tracked manually by Rajesh, not a Claude item" — redundant to carry as a Claude-facing standing item. Removed from the standing list; GDPR position note in §5 retained for context.
- **Cosmetic: stale header comments in `supabaseClient.native.ts`.** Doesn't block anything and isn't a decision point. Folded into general file hygiene rather than tracked separately.

### Verified and resolved (were ambiguous/conflicting across the two docs)

- **pg_cron deployment.** `claude_v4_1.md`'s tech-stack table said "migration written, deploy pending"; separately-derived context said "migrations applied." Checked live via `execute_sql` against `cron.job`:
  ```
  jobid 1 | * * * * *   | SELECT public.sweep_expired_invoices();      | active=true
  jobid 2 | */5 * * * * | SELECT public.reconcile_orphaned_orders();   | active=true
  ```
  **Confirmed live and active.** The "deploy pending" note was stale. Removed from standing items; tech-stack table corrected.

- **JSDoc on `mintInterface.ts`.** Two conflicting entries existed — one said "draft locked, add on next touch" (implying not yet done), the other said "confirm tidied + committed" (implying it might already be done). Resolved by reading the file directly from the now-public repo (cloned via `codeload.github.com` tarball, found at `lib/mintInterface_session18.ts`). **First lines of the file confirmed the exact locked JSDoc block is present and committed.** Removed from standing items — no action needed.

### Standing items: before / after

| | Count |
|---|---|
| Before (raw, with cross-doc duplication) | ~18–19 unique items across two tables |
| Removed (resolved-and-verified, removed-per-instruction, or folded) | 6 |
| Remaining | 14 |
| Of which promoted to top priority | 1 (**Strategy + content discussion session** — three other items are gated on the prioritization decision it's meant to make) |

Full current list lives in `claude_v4_1.md` (now v4.2) §12 — this file no longer duplicates the standing-items table to avoid the exact cross-doc drift that caused the pg_cron/JSDoc ambiguity in the first place. **Going forward: standing items are tracked in `claude.md` only. This master context file tracks session history, schema, and architecture detail.**

---

## Payment architecture (unchanged, locked)

- **Provider:** Blink / BOLT11 only (`api.blink.sv/graphql`)
- ZBD: permanently replaced CC-11 — do not reopen
- BOLT12: abandoned for beta — do not reopen
- Webhook security: HMAC-SHA256 (X-Blink-Signature) — live, verified
- **Known risk, unresolved:** `BLINK_WEBHOOK_SECRET` whsec_ prefix/base64 decode mismatch (flagged CC-29) — only a production risk if real Blink webhooks are used.

---

## Commission & rewards (locked CC-29)

- Commission tiers: flat 6–10% band. Operator-type split discarded permanently — do not revisit.
- Reward model: sats / digital stamp track only.

---

## React Native / PKCE track status — unchanged since CC-36

No PKCE/RN work occurred CC-37 through CC-44 (demand-intelligence track kept deliberately separate per standing scope rule). See `claude_v4_1.md` §4i for current locked state.

---

## Session history (addendum)

| Session | Key outcome |
|---|---|
| CC-37/38 | `rail-signal-poll` Edge Function (v2) deployed polling all 5 RDM feeds. 4/5 confirmed live; `car_park_occupancy` 404 isolated. |
| CC-39 | `car_park_occupancy` 404 root-caused to Cloud Armor blocking Supabase egress IP — deferred. |
| CC-40 | `rail_reference_stations` / `rail_reference_loadings` schema established. Stations scope-mismatch blocker hit. |
| CC-41 | TOC scope-mismatch root-caused. Stations sync found corrupting 3 station codes via tag-flattening bug — fixed, verified clean (25/25). Loadings sync left unresolved/unverified by explicit deferral. |
| CC-42 | *Strategy/editorial discussion session scoped here at CC-41 handoff — not reflected in this thread's history. Still outstanding.* |
| CC-43 | Loadings sync root-caused: table/function built against assumed API field names that don't exist in the real payload, producing 17,387 all-NULL rows that looked like a clean success. Table rebuilt, function redeployed v2 with upsert-on-conflict + safe-mode guard. Curl invocation failures fixed and locked as a standing rule. Final blocker is upstream-only: RDM's Passenger Loading backend timing out, deferred to CC-44. |
| CC-44 | **Memory cleanup, no code work.** Audited 18–19 cross-doc standing items down to 14. Removed Apple Dev Program purchase reminder (per Rajesh), ICO registration (not a Claude item), cosmetic header-comment item. Verified and resolved two ambiguous items: pg_cron confirmed live via direct `cron.job` query (2 active jobs); `mintInterface.ts` JSDoc confirmed present and committed via direct repo read. Promoted "Strategy + content discussion session" to top priority. Consolidated standing-items tracking into `claude.md` only, going forward, to prevent the cross-doc drift that caused this session's ambiguities. |

---

## Handoff note for CC-45

**Top priority, in order:**

1. **Strategy + content session** — outstanding since CC-41, missed twice. Not a build session. Covers: priority sequencing across PKCE/RN vs. demand-intelligence vs. merchant pipeline; an honest fragility review (loadings/car-park feeds, Cashu/ecash track, terminal hardening); and the 4th editorial article (engineering-friction angle, tone/length/outlet TBD). Several other standing items are blocked on the sequencing decision this session makes — holding it unblocks real throughput.
2. **Loadings retry** — quick check, not a build task. Run the single-line curl command (fresh key via `get_publishable_keys`) against `rail-reference-loadings-sync`. If RDM has stopped timing out, verify directly via `execute_sql` (row count, spot-check non-null scalars, no constraint violations) — don't trust the function's own response. If it still times out, note it and move on.
3. **Standing items now live in `claude.md` (v4.2) §12 only** — this master context file will track session history and architecture going forward, not a duplicate standing-items table, to avoid repeating the pg_cron/JSDoc drift this session had to clean up.

---

*"Nothing stops this train."*
