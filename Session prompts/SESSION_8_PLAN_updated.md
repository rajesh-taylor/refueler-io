# REFUELER — Session 8 Planning Document
**Status:** Pre-session. Open after Session 7 is complete.
**Version:** v1.1
**Focus:** FIFA World Cup 2026 travel vertical. Duffel API (flights + car hire). Roadtrippers excursion integration. England skin. Stadium geofences. O2 + TfL expansion.
**Updated:** 2026-05-19

---

## ⚡ Time Sensitivity — CRITICAL

FIFA World Cup 2026 runs **June 11 – July 19, 2026**.
**Today is May 20, 2026. That is 22 days until the tournament starts.**

The commercial window for a Duffel pitch is **this week** — not after Session 8 is built.
England fans are booking travel right now. Duffel needs to be approached before kick-off.

**Action required before Session 8 build:**
- Send Duffel pitch email this week (see `DUFFEL_PITCH.md` — create if not exists)
- Create Duffel developer account: https://duffel.com/developers (free, instant access)
- Register Football Data API: https://football-data.org (confirm England group stage fixtures)
- England group stage draw is finalised — check FIFA.com for confirmed venues

---

## Session 8 Objective

Build the travel vertical. England fans travelling to the World Cup use Refueler to manage their inter-city journey: flights and car hire via Duffel, excursion planning via Roadtrippers, stadium car park geofencing, and pre-order of food and drinks near the venue. The England skin activates automatically when the user is near a World Cup venue or England are playing.

---

## The England Fan Journey — Product Flow

```
Fan has 3 England group stage tickets (e.g. Miami, New York, Atlanta)

Before departure:
Refueler + Duffel: book flights between cities, car hire at each destination
Roadtrippers: curated excursion itinerary for days between matches

Match day (in-app):
England skin activates (St George's Cross theme)
Match countdown in app header
Stadium geofence detected on arrival
        ↓
Car park geofencing: nearest EV charging bays + car parks near stadium
Pre-order food/drinks from surrounding restaurants (not inside venue)
NFC/QR handover on collection
Sats reward on each purchase
        ↓
Post-match:
Return journey notification — Roadtrippers suggestion for evening
Next match countdown begins
        ↓
Inter-match days:
Roadtrippers itinerary for the region
Refueler ordering active at any partner location the user visits
Sats accumulate across the trip
```

---

## Duffel API Integration

**What Duffel covers:**
- Flights (search, book, manage) — all major airlines
- Car hire (added 2024) — major rental companies
- Ancillaries: seat selection, bags, travel insurance

**Duffel is London-based.** Developer account is free. API is well-documented.

**Sats on bookings:**
A £400 flight at 1% = £4 → ~17,000 sats. This is the largest single sats-earning event in the Refueler ecosystem. Meaningful accumulation, not a rounding error.

---

## Roadtrippers Integration

**Partnership model:** Affiliate. Refueler sends qualified World Cup travellers with specific inter-match day windows. Roadtrippers returns curated itineraries. Refueler earns affiliate commission on bookings.

**Roadtrippers contact:** Partnership team at Harvest Hosts (parent company).

---

## England Skin — Technical Implementation

**Activation triggers (any one of):**
- User's device location is within 50km of a World Cup venue
- A fixture involving England is within 6 hours of kick-off
- User manually activates from settings

**Visual design:**
- Background: deep England red `#CE1124`
- Accent: white `#FFFFFF`
- Secondary: navy `#012169`
- Match countdown replaces session timer: "England vs [Opponent] — 2h 14m"

**Deactivation:** Automatically reverts to Carbon 48 hours after tournament final (July 21, 2026).

---

## Stadium Geofences — England's Likely US Venues

Confirm when draw is finalised (check FIFA.com):

| City | Stadium | Capacity |
|---|---|---|
| Miami | Hard Rock Stadium | 65,326 |
| New York/NJ | MetLife Stadium | 82,500 |
| Atlanta | Mercedes-Benz Stadium | 71,000 |
| Boston | Gillette Stadium | 65,878 |

---

## O2 Greenwich — TfL Expansion

- Car park: approach NCP (operator), not AEG
- Catering: approach Levy Restaurants, not AEG
- DLR trigger: Cutty Sark → North Greenwich (~8 min) — same predictive model as C2C

---

## Supabase Schema Addition (Session 8)

```sql
CREATE TABLE world_cup_fixtures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id text UNIQUE,
  home_team text,
  away_team text,
  venue_name text,
  venue_city text,
  venue_lat numeric(9,6),
  venue_lng numeric(9,6),
  kickoff_at timestamptz,
  group_stage bool DEFAULT true,
  england_playing bool DEFAULT false,
  skin_active bool DEFAULT false
);

CREATE TABLE travel_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  booking_type text NOT NULL, -- 'flight' | 'car_hire' | 'activity' | 'hotel'
  provider text, -- 'duffel' | 'roadtrippers' | 'other'
  provider_ref text,
  value_gbp numeric(10,2),
  commission_gbp numeric(8,2),
  commission_sats bigint,
  sats_rate numeric(12,2),
  destination_city text,
  travel_date date,
  created_at timestamptz DEFAULT now()
);
```

---

## Revenue Model — Session 8 Verticals

> **Note:** Duffel revenue is now modelled in the Session 9 financial model (`refueler_financial_model.xlsx`, Tab 2 Rail 4). Update 1_Assumptions!B16–B19 when Duffel live booking data is available.

| Vertical | Revenue mechanism | Estimated per transaction |
|---|---|---|
| Duffel flights | Developer margin + airline commission | £8–£25 per booking |
| Duffel car hire | Developer margin + rental commission | £5–£15 per booking |
| Roadtrippers | Affiliate commission | £2–£8 per activity |
| Stadium pre-orders | 15% commission | £0.60–£2.00 per order |

50 active users at the tournament = **£2,500–£7,500 commission from one tournament**.

---

## Pre-session actions (MUST complete before Session 8 build)

1. **Duffel pitch sent** — this week, not after build
2. **Duffel developer account created:** https://duffel.com/developers
3. **Roadtrippers affiliate account created**
4. **Football Data API registered:** https://football-data.org
5. **PlugShare API registered:** https://api.plugshare.com
6. **England group stage venues confirmed** from FIFA.com (draw finalised)
7. **Session 7 complete** — bulk verification built and tested

---

## Session 8 Build Checklist

- [ ] Duffel developer account + API key
- [ ] Roadtrippers affiliate account
- [ ] Supabase: `world_cup_fixtures`, `travel_bookings` tables
- [ ] England skin (CSS theme, activation logic)
- [ ] Fixture data seeded from Football Data API
- [ ] Duffel flight search + booking UI
- [ ] Duffel car hire UI
- [ ] Roadtrippers itinerary card
- [ ] Stadium geofences for England's group stage venues
- [ ] US EV charging data (PlugShare API)
- [ ] Restaurant pre-order zone (500m outside exclusivity perimeter)
- [ ] TfL DLR integration for O2 (Arrivals API)
- [ ] O2 area vendor pre-order (North Greenwich station trigger)
- [ ] Command Centre: Travel Bookings revenue tiles

---

## Version history
| Version | Date | Notes |
|---|---|---|
| v1.0 | 2026-05-17 | Initial plan |
| v1.1 | 2026-05-19 | World Cup countdown updated (23 days). Duffel pitch urgency escalated. Pre-session actions tightened. |
