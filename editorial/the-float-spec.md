# Article Spec — The Float
*Refueler Editorial · Updated 29 May 2026*

## Title: The float
## HTML file: `the-float.html`

## Standfirst (current, good — two sentences)
"Your coffee app knows more about you than your bank.
And the regulator finally noticed."
Consider trimming to single sentence for index consistency:
"Your morning coffee app knows more about you than your bank. On 7 May 2026, the regulator finally noticed."
Already sharp. Keep as-is unless index alignment requires single sentence.

## Status
- All 3 widgets built and positioned ✓
- Widget 4 (FAQ/JSON-LD): HTML comment dev note — not visible to readers ✓
- Template fixes applied ✓
- Carbon accent `#C8A96E` on widget borders + blockquotes ✓
- FCA preview table: fixed to 2-column layout (Requirement + Applies when) ✓
- Blockquote Carbon accent: ✓ added 29 May 2026

## Widgets
| # | Name | Type | Status |
|---|------|------|--------|
| 1 | FCA Safeguarding requirements | Pop-out + accordion | ✓ |
| 2 | FSCS comparison panel | In-column only | ✓ |
| 3 | Franchise cost/benefit | Pop-out + accordion | ✓ |
| 4 | FAQ / JSON-LD schema | Dev note (HTML comment) | Pending — SEO session TBD |

## FCA preview table layout rule
Two columns only: Requirement (with short sub-description) + Applies when.
Do NOT use a wide middle description column — causes layout collapse.
Full description available in modal (7 requirements · Full table).

## Widget 4 dev note format
```html
<!-- DEV NOTE: Widget 4 — FAQ block with Schema FAQ markup (JSON-LD)
     for Google rich results. Build separately. See spec. -->
```

## Images
None in current build. If added: same dimensions as Article 1 spec.
Suggested: FCA building / regulatory document (editorial, not stock)

## Carbon accent applied to:
- All widget `border-left` → `#C8A96E`
- Trigger buttons border + text → `#C8A96E`
- Blockquote `border-left` → `#C8A96E`
- Modal `border-top` → `#C8A96E`

## FCA accuracy flags
- PS25/12 effective 7 May 2026 — verify on publish
- Refueler: outside FCA perimeter by architecture (no float held)
- FCA pre-application meetings open July 2026 — update if status changes

## Differentiation from Article 1 (index page)
Article 1 = data collection / privacy architecture / what apps collect
Article 2 = FCA regulation / PS25/12 / float mechanics / what regulation means
Index eyebrow tags must make this visible:
- Article 1: Privacy · Data Architecture · Loyalty Apps
- Article 2: Regulation · FCA · PS25/12 · Loyalty Float

## Drop-cap: applied to opening paragraph ✓
## Footnotes: in-column `0.6375rem`, modal `0.6875rem` ✓
