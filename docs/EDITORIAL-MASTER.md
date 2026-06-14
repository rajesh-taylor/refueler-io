# Refueler Editorial — Master Specification
*Replaces: `EDITORIAL-SPEC.md` + `PROMPT_editorial-page-scope.md`*
*Version: 2.0 · Updated: Session 34 · 5 June 2026*
*Owner: Rajesh (Founder) · Design authority: Head of Design*

---

## 1. Section identity

The editorial section is called **Editorial** — not Blog, not Insights. This applies to:
- Navigation label: `Editorial`
- URL convention: `refueler.io/editorial/` (index) · `refueler.io/editorial/[slug].html` (article)
- Page headers, breadcrumbs, footer references — everywhere

---

## 2. Design tokens — LOCKED

These must match `nothing-to-collect-nothing-to-hide.html` exactly. Do not use the old `--fg` / `--fg-muted` / `--fg-subtle` system.

```css
:root {
  --paper:          #F7F4EF;
  --carbon:         #1E1F22;
  --carbon-soft:    #26282C;
  --carbon-mid:     #2E3035;
  --ink:            #3D3A36;
  --ink-secondary:  #5A5751;
  --ink-tertiary:   #9A948D;
  --rule:           #D6D1C8;
  --blockquote-rule:#8A8680;

  --bg:             var(--paper);
  --text-primary:   var(--ink);
  --text-secondary: var(--ink-secondary);
  --text-tertiary:  var(--ink-tertiary);
  --border:         var(--rule);

  --font-heading:   'Satoshi', 'DM Sans', sans-serif;
  --font-serif:     'Source Serif 4', Georgia, serif;
  --font-sans:      'DM Sans', system-ui, sans-serif;

  --body-font:      var(--font-serif);
  --body-size-d:    18px;
  --body-size-m:    17px;
  --body-lh-d:      1.8;
  --body-lh-m:      1.75;
  --para-spacing:   1.5em;

  --article-max:    68ch;
  --article-max-m:  48ch;

  --max-w:          1200px;
  --gutter:         clamp(1.25rem, 4vw, 3rem);
}

[data-theme="carbon"] {
  --bg:             var(--carbon);
  --text-primary:   #E4E2DC;
  --text-secondary: #8A8680;
  --text-tertiary:  #5A5751;
  --border:         #35373B;
  --blockquote-rule:#C8A96E;   /* Gold left-rule in Carbon only */
}

@media (max-width: 680px) { :root { --gutter: 1.125rem; } }
```

**Gold accent `#C8A96E`:**
- Carbon mode blockquote `border-left` only
- Widget `border-left` in Carbon mode only
- Modal `border-top` in Carbon mode only
- Never in body text, headlines, icons, Paper mode

**Orange `#F5820A`:** Banned from all editorial surfaces — body, headers, widgets, footer.

---

## 3. Typography

| Role | Spec |
|---|---|
| Body | Source Serif 4, weight 300, 18px desktop / 17px mobile |
| Body line-height | 1.8 desktop / 1.75 mobile |
| Body measure | 68ch desktop / 48ch mobile (set on `.article-body`) |
| Paragraph spacing | 1.5em |
| Headings | Satoshi 600 |
| h1 | `clamp(2rem, 4.5vw, 3.25rem)` · line-height 1.08 · tracking −0.025em |
| h2 | 1.0625rem · weight 600 · tracking −0.01em · `border-top: 1px solid var(--border)` · `padding-top: 2.5rem` · `margin-top: 3rem` (2rem mobile) |
| Standfirst | Source Serif 4, 1.0625rem, line-height 1.65, `--text-secondary` |
| Eyebrow | Satoshi 500, 0.6375rem, 0.1em tracking, uppercase, `--text-tertiary` |
| Dateline | Satoshi, 0.6375rem, `--text-tertiary` |
| Blockquote | Source Serif 4 italic · `border-left: 2px solid var(--blockquote-rule)` · `padding-left: 1.5rem` · `font-size: 1.0625em` · line-height 1.65 · `--text-secondary` |
| Footnote / sources | Satoshi, 0.6375rem–0.75rem, `--text-tertiary` |
| Caption | Satoshi, 0.6375rem, `--text-tertiary`, border-top rule above |
| Widget footnote | Satoshi, 0.6rem, `--text-tertiary` |

**Drop cap: REMOVED.** Do not use `.drop-cap` or `::first-letter` on any article. Decision locked Session 34.

**No bullet lists in article body.** Prose only.

**Blockquotes = pull quotes only.** Not block citations.

---

## 4. Site header — canonical pattern

```html
<header class="site-header">
  <div class="header-inner">
    <a href="/editorial/" class="wordmark">
      Refueler
      <span class="wordmark-divider">/</span>
      <span class="wordmark-section">Editorial</span>
    </a>
    <nav>
      <a href="/">App</a>
      <a href="/editorial/" class="active">Editorial</a>
      <a href="/privacy/">Privacy</a>
      <button class="theme-pill" onclick="toggleTheme()" id="theme-btn">Paper / Carbon</button>
    </nav>
  </div>
</header>
```

- Height: 56px · sticky · `background: var(--bg)` · `border-bottom: 1px solid var(--border)`
- `max-width: var(--max-w)` on `.header-inner`
- Theme pill: outlined, 100px border-radius, no fill — not a toggle active-state
- `localStorage` key: `rfTheme` · Paper default on editorial · Carbon default in app

---

## 5. Article page structure — canonical HTML

```html
<div class="article-wrap">                     <!-- max-width: var(--max-w) -->

  <p class="breadcrumb">                        <!-- padding-top: 1.75rem -->
    <a href="/editorial/">Editorial</a>
    <span class="breadcrumb-sep">/</span>
    Category · Subcategory
  </p>

  <header class="article-header">              <!-- max-width: var(--article-max) -->
    <div class="article-eyebrow">…</div>       <!-- dot separators -->
    <h1 class="article-title">…</h1>
    <p class="article-standfirst">…</p>
    <div class="article-dateline">…</div>      <!-- Month Year · N min read · URL -->
  </header>

  <article class="article-body">              <!-- max-width: var(--article-max) -->
    <p>Opening paragraph — no drop cap.</p>
    …body…
  </article>

  <div class="sources">                        <!-- max-width: var(--article-max) -->
    <p class="sources-label">Sources</p>
    <ul class="sources-list">…</ul>
  </div>

</div>

<footer class="site-footer">
  <div class="footer-inner">                  <!-- max-width: var(--max-w) -->
    <span class="footer-note">© 2026 Refueler · refueler.io/editorial/[slug]</span>
    <div class="footer-links">
      <a href="/editorial/">← Editorial</a>
      <a href="/editorial/[next].html">Article N →</a>
      <a href="/privacy/">Privacy</a>
    </div>
  </div>
</footer>
```

**Column alignment:** `.article-header` and `.article-body` are `max-width: 68ch`, left-aligned inside the `1200px` container. They do not centre — the column sits left.

---

## 6. Image dimensions

| Type | Pixels | Ratio | Format |
|---|---|---|---|
| Hero / article header | 2400 × 900px | ~8:3 | Progressive JPEG 80–85, alt text mandatory |
| Full-column | 1400 × variable | 16:9 / 3:2 / 2:1 | Progressive JPEG 80–85, caption required |
| Half-column (float) | 700 × variable | — | Progressive JPEG 80–85, caption required |
| Diagrams / charts | — | — | SVG only — never JPEG for line art |

No faces in editorial imagery (privacy principle extends to photography).

---

## 7. Widget specification

### Types
- **In-column only:** No trigger button. Renders inline within `.article-body`. Use for single-stat or 3-stat callout blocks.
- **Pop-out modal:** Trigger button in-column → full overlay on click. Use for dense comparison tables (5+ rows).
- **Accordion (in-column):** Expandable rows without overlay. Use for FAQ / structured pairs.

### Animation — canonical
```
Modal open:  300ms cubic-bezier(0.16,1,0.3,1)
Scrim fade:  250ms ease
Modal close: 150ms opacity fade via .is-closing class
Accordion:   200ms ease
```

### Widget border — Carbon mode
```css
[data-theme="carbon"] .widget--* { border-left-color: #C8A96E; }
[data-theme="carbon"] .modal-panel { border-top-color: #C8A96E; }
```

### Dev-only placeholders
Use HTML comment — never a visible box:
```html
<!-- DEV NOTE: Widget N — [description]. Build separately. -->
```

### Widget footnote sizing
- In-column footnote: `0.6rem` Satoshi `--text-tertiary`
- Modal overlay footnote: `0.6875rem` Satoshi `--text-tertiary`

---

## 8. Widget inventory by article

| Article | Widget | Type |
|---|---|---|
| 1 — Nothing to Collect | Data value per user/yr | Pop-out |
| 1 — Nothing to Collect | ICO Enforcement 2025 | In-column |
| 1 — Nothing to Collect | Architecture contrast table | Pop-out |
| 2 — The Float | FCA Safeguarding requirements | Pop-out |
| 2 — The Float | FSCS comparison panel | In-column |
| 2 — The Float | Franchise cost/benefit | Pop-out |
| 3 — The City Worker | LTV / frequency callout | In-column (3-stat) |

---

## 9. Copy rules — carry into every session

- **"Fenchurch St line"** — never "C2C" (trademark PENDING)
- **Limehouse** = backend/technical language only — never user-facing
- **Refueler named only from Section 4 onward** in analytical articles — not promotional before that
- **No specific trigger station named** in user-facing copy; use "Refueler knows when to start your order"
- **No orange** anywhere in editorial surfaces
- **Prose only** in article body — no bullet lists
- **Blockquotes** = pull quotes, never block citations
- **All statistics footnoted** — no unsourced figures in body
- **Register:** FT / Economist / Bloomberg Businessweek — observed, analytical, not promotional
- **"Nothing stops this train."** — investor doc closer only, not on editorial

---

## 10. Theme persistence — canonical script

```html
<script>
  const THEME_KEY = 'rfTheme';
  function applyTheme(theme) {
    const root = document.documentElement;
    const pill = document.getElementById('theme-btn');
    if (theme === 'carbon') {
      root.setAttribute('data-theme', 'carbon');
      if (pill) pill.textContent = 'Carbon / Paper';
    } else {
      root.removeAttribute('data-theme');
      if (pill) pill.textContent = 'Paper / Carbon';
    }
  }
  function toggleTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'paper';
    const next = current === 'paper' ? 'carbon' : 'paper';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }
  (function () { applyTheme(localStorage.getItem(THEME_KEY) || 'paper'); })();
</script>
```

---

## 11. Index page rules

- **Deck length:** One sentence per article. Maximum 20 words. Declarative register.
- **Section label:** "Editorial" not "Blog"
- **Card hierarchy:** Eyebrow tags → Title → Standfirst (one line) → Date → Read time
- **Layout:** Single column (FT default — avoids content-farm feel)
- **No hero images on index cards** — typography does the work
- **Paper default** — Carbon toggle top-right

### Current article decks (locked)
| Article | Deck |
|---|---|
| 1 — Nothing to Collect | "Every coffee-chain app is quietly running a data operation alongside the coffee business." |
| 2 — The Float | "On 7 May 2026, the FCA noticed that loyalty apps were holding customer money. The float is now regulated." |
| 3 — The City Worker | "The City worker is Britain's biggest coffee spender and its least loyal customer — until sats." |

---

## 12. Per-article spec template

Every article must have a completed spec block. Copy and fill this for each article:

```
Article title:
Slug:
Publish status:
Hero image: [dimensions / concept / no faces]
Inline images: [none / describe]
Widgets: [list with type]
Drop cap: NO (locked Session 34)
Carbon accent usage: [blockquote left-rule / widget border / modal border-top]
C2C trademark flags: [NONE / describe]
Footnote type size: 0.6rem (widget) / 0.6375rem (sources)
Index deck (≤20 words):
```

### Article 3 — The City Worker (completed)
```
Article title:   The Least Loyal Customer in Britain
Slug:            the-city-worker.html
Publish status:  v5 draft — Session 34
Sections:        Opening · A peculiar kind of spending · The stamp card was always a data operation · Enter the Corridor · The demographic that was already there
Hero image:      2400×900px · Fenchurch Street platform or queue geometry · no faces
Inline images:   None
Widgets:         LTV / frequency callout — in-column 3-stat block
Drop cap:        NO
Carbon accent:   Blockquote left-rule · Widget border-left
C2C trademark:   NONE
Footnote size:   0.6rem (widget) / 0.6375rem (sources)
Index deck:      "The City worker isn't disloyal through distraction. They're disloyal through knowledge — and the Corridor was built for them."
Key editorial strand: City workers hold Bitcoin self-custody. The stamp card was read as a data operation. The Corridor is the anti-data-establishment merchant alliance.
"The Corridor" = named alliance of Fenchurch St catchment merchants on shared sats pre-order rail.
Closing line locked: "It turns out the least loyal customer in Britain was loyal to something all along. Just not to anything that offered stamps."
```

---

## 13. Files superseded by this document

- `EDITORIAL-SPEC.md` — archived, do not use
- `PROMPT_editorial-page-scope.md` — archived, do not use

Session prompts should load:
1. `claude.md` (project DNA)
2. `EDITORIAL-MASTER.md` (this file)
3. The relevant `Article[N]_MasterContext.md`
4. The working HTML draft

---

*"Nothing stops this train."*
