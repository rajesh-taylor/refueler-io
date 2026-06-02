# Refueler Editorial — Design & Production Specification
*Updated: Session 11 · 29 May 2026*

---

## Article template rules

Every article must have its own `.md` spec file alongside the HTML.
Naming: `[article-slug]-spec.md` in the `editorial/` folder.

Each spec file must include:
- Article title, slug, publish status
- Hero image dimensions and crop spec
- Inline image types used and their dimensions
- Widget list with type (in-column / pop-out / accordion-only)
- Carbon accent colour usage
- Footnote type size ruling
- Drop-cap: yes/no on opening paragraph
- C2C / trademark flags if any copy references the corridor
- Index page deck (one sentence, max 20 words)

---

## Image dimensions — canonical spec

### Hero / article header image
- **Pixels:** 2400 × 900px  |  **Ratio:** ~8:3 panoramic
- **Usage:** Full-width above headline
- **Format:** Progressive JPEG, quality 80–85
- **Caption:** Not required. Alt text mandatory.

### Full-column image
- **Pixels:** 1400 × variable
- **Ratios:** 16:9 landscape · 3:2 editorial portrait · 2:1 architectural
- **Format:** Progressive JPEG, quality 80–85. Caption required.

### Half-column image (float)
- **Pixels:** 700 × variable. Caption required.

### Diagrams / charts / icons
- **Format:** SVG only. Never JPEG for line art. No PNG for photos.

### Caption spec
- Font: `var(--font-heading)` · Size: `0.6875rem` · Colour: `var(--text-tertiary)`
- Top rule: 1px `var(--border)` above caption
- Rule: captions add information the image cannot carry alone.

### Figure component classes
```html
<figure class="article-fig article-fig--full">
<figure class="article-fig article-fig--half-left">
<figure class="article-fig article-fig--half-right">
```

---

## Carbon mode accent colour

Token: `#C8A96E` — aged gold
**This colour has NO connection to any third-party brand or partner.**

### Applied in Carbon mode only:
1. Widget header left-rule (2px `border-left` on all `.widget--*`)
2. Interactive trigger button border + label text ("View full comparison ›")
3. Trigger button hover: `#E0C48A`
4. Modal `border-top` on open panels
5. **Blockquote left-rule** — `border-left-color: #C8A96E` in Carbon
   (restores the structural signal lost on dark backgrounds)

### Never used:
- Body text · Headlines · Icons · Data cells · Paper mode

### Files to update when token is formally implemented:
- `design-system.md` — add `--accent-carbon: #C8A96E`
- `brand-guidelines.md` — aged gold scope as above

---

## Widget specification

### Animation timing — canonical
- Modal open: `300ms cubic-bezier(0.16,1,0.3,1)`
- Scrim fade in: `250ms ease`
- Modal close: `150ms` opacity fade via `.is-closing` class
- Chevron rotate (accordion): `200ms ease`

### Footnote type sizes
- In-column widget footnote: `0.6375rem`
- Modal overlay footnote: `0.6875rem`

### Modal header — row/item count
Include count in eyebrow: e.g. "8 dimensions · Full comparison"

### Widget preview tables — column rule
**Do not use a wide middle description column in preview tables.**
Use 2 columns only (label + applies-when / value). Description detail
belongs in the modal, not the in-column preview. Middle column at 52%+
causes layout collapse when content is uneven.

### Widget types by article

**Article 1 — The App That Earns Your Trust**
| Widget | Type | Preview cols |
|--------|------|-------------|
| Data value per user per year | Pop-out | Category name + £ range |
| ICO Enforcement 2025 | In-column only | N/A stat block |
| Architecture contrast table | Pop-out | Dimension + Refueler column only |

**Article 2 — The Float**
| Widget | Type | Preview cols |
|--------|------|-------------|
| FCA Safeguarding requirements | Pop-out | Requirement + Applies when (2-col) |
| FSCS comparison panel | In-column only | N/A 3-col stat panel |
| Franchise cost/benefit | Pop-out | Item + Refueler column |
| Widget 4 FAQ/JSON-LD | Dev note only | Hidden from readers, HTML comment |

### Widget 4 / dev-only placeholders
Use HTML comment format — never a visible placeholder box:
```html
<!-- DEV NOTE: Widget N — [description]. Build separately. See spec file. -->
```

---

## Template fixes — apply to all articles

1. `overflow: visible` on `.article-body`
2. `transition: border-color 0.3s` on `.article-header`
3. `transition: color 0.3s` on `.article-body`
4. Drop-cap class on opening paragraph
5. Mobile gutter: `:root { --gutter: 1.125rem }` at ≤680px
6. Heading spacing: `h2 { margin-top: 2rem }` at ≤680px

---

## Index page (refueler-editorial-index-v2.html)

### Deck length rule
One sentence per article. Maximum 20 words.
Match register of "The Float": declarative, sharp, no subordinate clauses.

### Current decks
- **The Float:** "Your morning coffee app knows more about you than your bank does. On 7 May 2026, the regulator finally noticed." ← two sentences, consider trimming to one
- **Article 1:** See title options below — deck to be updated when title is locked

### Article differentiation note
Both articles cover the loyalty app industry. To a neutral first-time reader
they may appear similar at index level. Differentiation is clear within each
article but the index eyebrow tags and deck copy must make the distinction
visible: Article 1 = data collection / privacy architecture;
Article 2 = regulatory / FCA / float mechanics.

---

## Article 1 — Title options (locked title TBD)

Current: "The app that earns your trust — and nothing else"
Issue: "earns your trust" conflicts with Bitcoin "don't trust, verify" ethos.

### Three alternatives (dry wit, on-point, Bitcoin-aware):

**Option A:** *"The app that verifies itself"*
— Direct Bitcoin reference. "Don't trust, verify" answered in the title.
Confident. Three words after "the app that" mirror the original rhythm.

**Option B:** *"Nothing to collect. Nothing to hide."*
— Architectural claim as title. Plays on the idiom "nothing to hide"
(used by surveillance apologists) and inverts it. The app with nothing
to hide is the one that collects nothing.

**Option C:** *"Open your browser. Check the cookies. We'll wait."*
— Technical challenge issued directly to the reader. Dry wit.
Implies confidence the reader won't find anything. Unusual for editorial —
that's the point. Works best if the article's subhead is more sober.

### Shortened standfirst options (current: 2 sentences, 32 words)
Current: "Every major coffee-chain ordering app is quietly running a data
operation alongside its coffee business. Most customers have never been told
what it collects, what it is worth, or where it goes."

**Shortened A** (for Options A or B above):
"Every major coffee-chain app is quietly running a data operation.
Most customers don't know what it collects, what it's worth, or where it goes."

**Shortened B** (for Option C above):
"Your morning coffee app knows more about you than you do.
Here is what it collects — and what that's worth to them."

**Single-sentence version** (for index page):
"Every coffee-chain app is quietly running a data operation alongside the coffee business."

---

## Enclavia.io — next session

Full prompt and C-suite brief in conversation history.
Use after widget build and final checks are complete.

New agent to add: **Head of Infrastructure / Enclave Architect**
Files to update: CTO, Bitcoin/Lightning Advisor, Head of Partnerships, CPO/DPO `.md`

---
*Spec owner: Rajesh · Last updated: 29 May 2026*
