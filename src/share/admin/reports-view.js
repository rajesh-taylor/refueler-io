/* ─── reports-view.js — Navy Office → Reports (OSA-Tools-3 · 22 Oct 2026) ─────
 * The report route's staff tools: look up a link, take it down for a case, the register
 * (list, New report, Close), templates A/B/C with Copy, and (admin) export.
 * Design: private docs/OSA-Tools-plan-v1.md §7 "Reports section". Worker answers:
 * refueler-share worker/src/handlers/reports.js. Terminal twins: private strategy/osa/tools/.
 *
 * Rules:
 *   • a pasted link is cut at the # before anything else runs, so the key part after the #
 *     is never in a field, a request, storage or this page
 *   • the transfer ID (UUID) travels only in X-Transfer-UUID; the register keeps uuid8 only
 *   • admin and helper keys both reach this section; the Worker enforces the helper's limits
 *     (CSEA/terrorism cases only, no export) — the page explains them, it doesn't decide them
 *   • strict CSP, as navy-office.js: no inline handlers, no style=; every Worker value in an
 *     HTML string passes esc(); times in London time
 * ─────────────────────────────────────────────────────────────────────────── */
'use strict';

const NavyReports = (() => {
  const S = { worker: '', key: '', role: '', look: null, rows: [], selected: null, tookDown: null };

  // ── Fixed choices (the database's lists; register.sh offers the same) ─────
  const CATEGORY = {
    csea: 'CSEA — child sexual abuse', terrorism: 'Terrorism', iia: 'Intimate image abuse',
    extreme_porn: 'Extreme pornography', fraud: 'Fraud', other_illegal: 'Other illegal content',
    terms: 'Breaks our terms', complaint: 'Complaint', appeal: 'Appeal', no_link: 'No link given',
  };
  const ROUTE    = { 'report@': 'report@', 'support@': 'support@', 'privacy@': 'privacy@', signal: 'Signal', other: 'Other' };
  const DECISION = { open: 'Open', removed: 'Removed', not_removed: 'Not removed', already_gone: 'Already gone', manifestly_unfounded: 'Manifestly unfounded' };
  const TOLD     = { y: 'Yes', n: 'No', no_contact: 'No contact given' };
  const TIER     = { free: 'Pro Bono', max: 'Citizen', api: 'Chartered (API)' };
  const short = (c) => (CATEGORY[c] ?? c).split(' — ')[0];
  const HELPER_CATEGORIES = ['csea', 'terrorism'];
  const ONLY_RAJESH = 'Only Rajesh can take this down. It can wait for him.';

  const UUID_RE = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const FORBIDDEN = /@|#|http/i;
  const SHARE = 'https://share.refueler.io/?uuid=';

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const say = (id, text) => { $(id).textContent = text ?? ''; };

  // ── London time ───────────────────────────────────────────────────────────
  const fmt = (opts) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour12: false, ...opts });
  const F_FULL  = fmt({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const F_SHORT = fmt({ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const F_CLOCK = fmt({ hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const F_DAY   = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
  const F_LONG  = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
  const t = (f, s) => (Number.isFinite(s) && s > 0 ? f.format(new Date(s * 1000)) : '—');

  // ── The # cut ─────────────────────────────────────────────────────────────
  // Paste and drop are taken over: only the part before the # is ever put in the field.
  // Typing a # (or an autofill) cuts the field at once on the input event.
  function cutAtHash(s) { const i = s.indexOf('#'); return (i < 0 ? s : s.slice(0, i)).trim(); }
  function guard(input, after) {
    const put = (text) => { input.value = cutAtHash(text); after?.(); };
    input.addEventListener('paste', (e) => { e.preventDefault(); put(e.clipboardData?.getData('text') ?? ''); });
    input.addEventListener('drop', (e) => { e.preventDefault(); put(e.dataTransfer?.getData('text/plain') ?? ''); });
    input.addEventListener('input', () => { if (input.value.includes('#')) input.value = cutAtHash(input.value); });
  }
  const uuidIn = (s) => (UUID_RE.exec(cutAtHash(s)) ?? [])[1]?.toLowerCase() ?? null;

  // ── Worker ────────────────────────────────────────────────────────────────
  async function api(method, route, { uuid, body } = {}) {
    const headers = { 'X-Admin-Key': S.key };
    if (uuid) headers['X-Transfer-UUID'] = uuid;
    if (body) headers['Content-Type'] = 'application/json';
    try {
      const res = await fetch(`${S.worker}${route}`, { method, headers, cache: 'no-store', body: body ? JSON.stringify(body) : undefined });
      let data = {};
      try { data = await res.json(); } catch { /* not JSON */ }
      return { status: res.status, data };
    } catch { return { status: 0, data: {} }; }
  }
  // The answers every route can give (the scripts' common_error, in the same words).
  function common(status) {
    if (status === 0)   return 'Could not reach Share (network, or Mullvad?). Nothing was done.';
    if (status === 401) return 'The key was not accepted (or it is not allowed to do this). Nothing was done.';
    if (status === 429) return 'Too many requests. Wait a minute and try again. Nothing was done.';
    if (status === 503) return 'The register is not answering. Try again in a few minutes. Nothing was done.';
    if (status >= 500)  return `Share answered with an error (${status}). Nothing was done; try again shortly.`;
    return null;
  }
  const REFUSAL = {
    reason_forbidden:       'The register refused it: no email addresses, # or links in the reason. Nothing was saved.',
    refused_by_database:    'The register refused it: one of its checks failed (no email addresses, # or links; an NCA reference is letters, digits and - only). Nothing was saved.',
    bad_reason:             'The reason is too long (500 characters at most). Nothing was saved.',
    bad_nca_ref:            'An NCA reference is letters, digits and - only. Nothing was saved.',
    bad_uuid8:              'That is not a Share link or transfer ID (UUID). Nothing was saved.',
    helper_category:        'Only Rajesh can change this case. It can wait for him.',
    helper_category_change: 'Only Rajesh can change a category.',
    not_found:              'No such case in the register.',
  };
  const refusal = (r) => common(r.status) ?? REFUSAL[r.data.error] ?? `The register refused it (${r.data.error ?? r.status}). Nothing was saved.`;

  // ── Look up ───────────────────────────────────────────────────────────────
  async function lookUp() {
    const uuid = uuidIn($('rp-link').value);
    if (!uuid) {
      $('rp-result').hidden = true;
      S.look = null;
      say('rp-lookup-msg', 'That is not a Share link or transfer ID (UUID). Nothing was looked up.');
      return;
    }
    $('rp-link').value = SHARE + uuid;   // the field shows only the transfer ID part, whatever came with it
    if (S.look?.uuid !== uuid) { say('rp-td-msg', ''); S.tookDown = null; }
    say('rp-lookup-msg', 'Looking up…');
    const r = await api('GET', '/admin/reports/lookup', { uuid });
    if (r.status !== 200) {
      say('rp-lookup-msg', common(r.status) ?? `Unexpected answer (${r.status}). Nothing was done.`);
      return;
    }
    S.look = { uuid, ...r.data, at: Math.floor(Date.now() / 1000) };
    say('rp-lookup-msg', '');
    renderCard();
    await loadRegister();   // every time: a case opened elsewhere (the scripts, a helper) must show
    renderTakedown();
    $('rp-result').hidden = false;
  }

  const STATE = {
    live:      ['Live', ''],
    expired:   ['Time ran out — parts not yet cleared', 'It can still be taken down.'],
    gone:      ['Gone', 'Deleted after download, its time ran out, or deleted by its owner.'],
    removed:   ['Removed after a report', ''],
    not_found: ['No such link', 'It never existed, or its record was cleared after 30 days.'],
  };
  const row = (k, v) => `<div class="rp-dl-row"><span class="rp-dl-k">${esc(k)}</span><span class="rp-dl-v">${v}</span></div>`;

  function renderCard() {
    const L = S.look;
    const [word, sub] = STATE[L.state] ?? [L.state, ''];
    const rows = [
      row('Transfer ID', `<span class="rp-u8">${esc(L.uuid.slice(0, 8))}</span>${esc(L.uuid.slice(8))}`),
      row('State', `<strong>${esc(word)}</strong>${sub ? `<span class="rp-sub">${esc(sub)}</span>` : ''}`),
    ];
    if (L.state === 'live' || L.state === 'expired') {
      rows.push(
        row('Tier', esc(TIER[L.tier] ? `${TIER[L.tier]} (${L.tier})` : (L.tier ?? '—'))),
        row('Created', esc(t(F_FULL, L.created_at))),
        row('Expires', esc(t(F_FULL, L.expires_at))),
        row('Upload complete', L.upload_complete ? 'Yes' : 'No — still uploading'),
        row('Downloaded and closed', L.consumed ? 'Yes' : 'No'),
      );
    }
    $('rp-card').innerHTML = `<div class="rp-card-title">Link</div>${rows.join('')}` +
      `<p class="rp-hint">Read from the live record at ${esc(t(F_CLOCK, L.at))}.</p>`;
  }

  // ── Take down ─────────────────────────────────────────────────────────────
  const openCasesFor = (u8) => S.rows.filter((r) => r.uuid8 === u8 && r.decision === 'open');

  function renderTakedown() {
    const L = S.look;
    if (!L) return;
    const u8 = L.uuid.slice(0, 8);
    const form = $('rp-td-form'), sel = $('rp-td-case');
    // Nothing to take down → the box folds away; the reason goes on one line under the card.
    const shut = (note) => { form.hidden = true; $('rp-td').hidden = true; $('rp-result').classList.add('rp-single'); say('rp-td-after', note); };
    $('rp-td').hidden = false; $('rp-result').classList.remove('rp-single'); say('rp-td-after', '');
    if (L.state === 'removed' && S.tookDown === L.uuid) return shut('');
    if (L.state === 'removed')   return shut('Nothing to take down: it was removed after a report. A second report about this link: close that case as Removed and name the first case in the reason.');
    if (L.state === 'gone')      return shut('Nothing to take down: it is already gone. Close the case as "Already gone".');
    if (L.state === 'not_found') return shut('Nothing to take down: no such link. Check the link with the reporter.');
    const cases = openCasesFor(u8);
    if (!cases.length) return shut(`No open case for this link (${u8}). Open one in the register first — New report fills the link in from here.`);
    form.hidden = false;
    const keep = cases.some((c) => c.case_ref === sel.value) ? sel.value
      : cases.some((c) => c.case_ref === S.selected) ? S.selected : cases[0].case_ref;
    sel.replaceChildren(...cases.map((c) => new Option(
      `${c.case_ref} · ${short(c.category)}${c.training ? ' · TRAINING' : ''}`, c.case_ref)));
    sel.value = keep;
    updateTakedownButton();
  }

  function updateTakedownButton() {
    const L = S.look;
    const c = S.rows.find((r) => r.case_ref === $('rp-td-case').value);
    const refused = S.role === 'helper' && c && !HELPER_CATEGORIES.includes(c.category);
    $('rp-td-confirm').disabled = refused;
    say('rp-td-note', refused ? ONLY_RAJESH : '');
    $('rp-td-btn').disabled = refused || !c || $('rp-td-confirm').value.trim().toLowerCase() !== L.uuid.slice(0, 8);
  }

  async function takeDown() {
    const L = S.look, caseRef = $('rp-td-case').value, confirm = $('rp-td-confirm').value.trim().toLowerCase();
    const btn = $('rp-td-btn');
    btn.disabled = true; btn.textContent = 'Taking down…';
    const r = await api('POST', '/admin/reports/takedown', { uuid: L.uuid, body: { case_ref: caseRef, confirm } });
    btn.textContent = 'Take down';
    const d = r.data, at = d.removed_at;
    let msg, rerun = false;
    if (r.status === 200 && d.already_removed) {
      msg = `Already removed (at ${t(F_CLOCK, at)} London). Nothing changed. If this is a second report about the same link, close it as Removed and name the first case.`;
      rerun = true;
    } else if (r.status === 200 && d.register_updated) {
      msg = `Taken down at ${t(F_CLOCK, at)} (London). Recorded in the register against ${caseRef}. Open the full link in Safari: it should say “This file is no longer available.”`;
      rerun = true;
    } else if (r.status === 200) {
      msg = `Taken down at ${t(F_CLOCK, at)} (London) — but the register did NOT record it. Write the time in by hand, in the reason when you close the case:${t(F_CLOCK, at)} (London), ${t(F_DAY, at)}.`;
      rerun = true;
    } else if (r.status === 202) {
      msg = `Part-way: ${d.remaining ?? 'some'} part(s) are still there. Press Take down again — it carries on where it stopped.`;
    } else if (r.status === 400 && d.error === 'confirm_mismatch') {
      msg = 'Those 8 characters don’t match. Nothing was taken down.';
    } else if (r.status === 403) {
      msg = `${ONLY_RAJESH} Nothing was taken down.`;
    } else if (r.status === 404) {
      msg = 'No such link. Nothing was taken down.';
    } else if (r.status === 409) {
      msg = { no_such_case: `There is no case ${caseRef} in the register. Open it first (New report). Nothing was taken down.`,
              other_link:   `Case ${caseRef} is about a different link. Check the case. Nothing was taken down.`,
              case_closed:  `Case ${caseRef} is already closed. Nothing was taken down.` }[d.why]
        ?? 'The case doesn’t match this link. Nothing was taken down.';
    } else if (r.status === 410) {
      msg = 'Already gone (deleted after download, or its time ran out). Nothing to take down — close the case as "Already gone".';
    } else {
      msg = common(r.status) ?? `Share refused the request (${d.error ?? r.status}). Look it up again before trying again.`;
    }
    $('rp-td-confirm').value = '';
    if (rerun) { S.tookDown = L.uuid; await loadRegister(); await lookUp(); }
    else updateTakedownButton();
    say('rp-td-msg', msg);
  }

  // ── Register ──────────────────────────────────────────────────────────────
  async function loadRegister() {
    const r = await api('GET', '/admin/reports/register');
    if (r.status !== 200) {
      say('rp-register-msg', common(r.status) ?? `Unexpected answer (${r.status}).`);
      return;
    }
    S.rows = Array.isArray(r.data.rows) ? r.data.rows : [];
    renderRegister();
    selectCase(S.selected);   // a case gone from the register (training rows deleted) closes its panel
  }

  function renderRegister() {
    const tb = $('rp-tbody');
    if (!S.rows.length) { tb.innerHTML = '<tr><td colspan="6" class="dock-empty">The register is empty.</td></tr>'; return; }
    tb.innerHTML = S.rows.map((r) => {
      const td = r.takedown_at ? `${esc(t(F_SHORT, r.takedown_at))} · ${esc(r.takedown_by ?? '')}` : '—';
      return `<tr data-case="${esc(r.case_ref)}" tabindex="0"${r.case_ref === S.selected ? ' class="rp-selected"' : ''}>
        <td class="dock-uuid">${esc(r.case_ref)}${r.training ? ' <span class="rp-tag">TRAINING</span>' : ''}</td>
        <td>${esc(t(F_SHORT, r.received_at))}</td>
        <td>${esc(short(r.category))}</td>
        <td>${esc(r.uuid8 ?? '—')}</td>
        <td>${esc(DECISION[r.decision] ?? r.decision)}</td>
        <td>${td}</td>
      </tr>`;
    }).join('');
  }

  // ── New report ────────────────────────────────────────────────────────────
  function openNew() {
    const f = $('rp-new');
    f.reset();
    if (S.look) $('rp-new-link').value = S.look.uuid;
    say('rp-new-msg', '');
    f.hidden = false;
    $('rp-new-training').focus();
  }

  async function submitNew(e) {
    e.preventDefault();
    const linkText = $('rp-new-link').value.trim();
    const uuid = linkText ? uuidIn(linkText) : null;
    if (linkText && !uuid) return say('rp-new-msg', 'That is not a Share link or transfer ID (UUID). Nothing was saved.');
    const reason = $('rp-new-reason').value.trim();
    if (FORBIDDEN.test(reason)) return say('rp-new-msg', 'No email addresses, # or links in the note. Nothing was saved.');
    const training = $('rp-new-training').value === 'yes';
    const body = {
      training, route: $('rp-new-route').value, category: $('rp-new-category').value,
      uuid8: uuid ? uuid.slice(0, 8) : null, reason: reason || null,
    };
    say('rp-new-msg', 'Opening…');
    const r = await api('POST', '/admin/reports/open', { body });
    if (r.status !== 200) return say('rp-new-msg', refusal(r));
    $('rp-new').hidden = true;
    S.selected = r.data.case_ref;
    await loadRegister();
    renderTakedown();
    say('rp-register-msg', `Opened ${r.data.case_ref}${training ? ' (TRAINING)' : ''}. Use this reference in every email to the reporter (template A onwards).`);
  }

  // ── A case: close + templates ─────────────────────────────────────────────
  function selectCase(ref) {
    const c = S.rows.find((r) => r.case_ref === ref);
    if (!c) { S.selected = null; $('rp-case').hidden = true; return; }
    if (S.selected !== ref) { say('rp-close-msg', ''); $('rp-close').reset(); }
    S.selected = ref;
    for (const tr of $('rp-tbody').rows) tr.classList.toggle('rp-selected', tr.dataset.case === ref);
    say('rp-case-title', `${c.case_ref}${c.training ? ' · TRAINING' : ''} · ${CATEGORY[c.category] ?? c.category} · ${DECISION[c.decision] ?? c.decision}`);
    const bits = [`Received ${t(F_FULL, c.received_at)} by ${ROUTE[c.route] ?? c.route}`,
                  c.uuid8 ? `link ${c.uuid8}` : 'no link given', `opened by ${c.opened_by}`];
    if (c.takedown_at) bits.push(`taken down ${t(F_FULL, c.takedown_at)} by ${c.takedown_by}`);
    if (c.decision !== 'open') {
      bits.push(`closed ${t(F_FULL, c.closed_at)}`);
      if (c.reporter_told) bits.push(`reporter told: ${TOLD[c.reporter_told] ?? c.reporter_told}`);
      if (c.nca_ref) bits.push(`NCA ${c.nca_ref}`);
      if (c.key_removed) bits.push('key part removed from the mailbox');
    }
    say('rp-case-summary', `${bits.join(' · ')}.${c.reason ? ` Note: ${c.reason}` : ''}`);
    const open = c.decision === 'open';
    $('rp-close').hidden = !open;
    const refused = open && S.role === 'helper' && !HELPER_CATEGORIES.includes(c.category);
    for (const el of $('rp-close').elements) el.disabled = refused;
    say('rp-close-note', refused ? 'Only Rajesh can close this case. It can wait for him.' : '');
    renderTemplates(c);
    $('rp-case').hidden = false;
  }

  async function submitClose(e) {
    e.preventDefault();
    const ref = S.selected;
    const reason = $('rp-close-reason').value.trim();
    if (FORBIDDEN.test(reason)) return say('rp-close-msg', 'No email addresses, # or links in the reason. Nothing was saved.');
    const nca = $('rp-close-nca').value.trim();
    if (!/^[A-Za-z0-9-]{0,64}$/.test(nca)) return say('rp-close-msg', REFUSAL.bad_nca_ref);
    const decision = $('rp-close-decision').value;
    const body = { case_ref: ref, decision, reason: reason || null, reporter_told: $('rp-close-told').value,
                   nca_ref: nca || null, key_removed: $('rp-close-key').value === 'yes' };
    say('rp-close-msg', 'Closing…');
    const r = await api('POST', '/admin/reports/update', { body });
    if (r.status !== 200) return say('rp-close-msg', refusal(r));
    await loadRegister();
    renderTakedown();
    say('rp-register-msg', `Closed ${ref} as ${DECISION[decision] ?? decision}.` +
      (S.role === 'admin' ? ' Then export the register (Export here, or export-register.sh on the Mac).' : ' Rajesh exports the register.'));
  }

  // Templates: route §9 text, the case reference on top, signed "Refueler Share" (drill 1, change 1).
  // [ ] marks what is still to fill in. The link is the part before the # — known only once the
  // link has been looked up here (the register keeps the first 8 characters, not the transfer ID).
  function renderTemplates(c) {
    const looked = S.look && c.uuid8 && S.look.uuid.startsWith(c.uuid8);
    const link = looked ? SHARE + S.look.uuid : '[link up to #]';
    const head = `Reference: ${c.case_ref}\n\n`, sign = '\n\nRefueler Share';
    const urgent = HELPER_CATEGORIES.includes(c.category);
    const a = `Thank you. We have your report about ${link} and will look at it ${urgent ? 'today' : 'within two working days'}. ` +
      'We cannot see the contents of files on Share, so anything you can tell us about what you saw helps. ' +
      'Please don’t send us the file itself.';
    let outcome;
    if (c.category === 'csea' && c.decision !== 'not_removed') outcome = 'We have acted on it.';
    else if (c.decision === 'removed' || c.decision === 'already_gone') outcome = 'We have removed the link.';
    else if (c.decision === 'not_removed') outcome = 'We have not removed the link because [reason].';
    else outcome = 'We have [removed the link / not removed the link because …].';
    const b = `We have looked at your report about ${link}. ${outcome} If you disagree, reply to this email.`;
    const took = S.rows.find((r) => r.uuid8 && r.uuid8 === c.uuid8 && r.takedown_at);
    const cText = `We have looked again at the link we removed on ${took ? t(F_LONG, took.takedown_at) : '[date]'}. ` +
      '[We stand by the decision because … / We were wrong, and we’re sorry.] ' +
      'Files we remove are deleted and cannot be restored, because we never hold the key.';
    $('rp-tpl-a').value = head + a + sign;
    $('rp-tpl-b').value = head + b + sign;
    $('rp-tpl-c').value = head + cText + sign;
    say('rp-tpl-hint', looked ? 'Edit the [ ] parts before copying. The link is the part before the #.'
      : 'Edit the [ ] parts before copying. To fill in the link, look it up above.');
  }

  function showTab(k) {
    for (const x of ['a', 'b', 'c']) {
      $(`rp-tab-${x}`).setAttribute('aria-selected', String(x === k));
      $(`rp-tpl-${x}`).hidden = x !== k;
    }
  }
  async function copy(btn) {
    const k = ['a', 'b', 'c'].find((x) => !$(`rp-tpl-${x}`).hidden);
    const ta = $(`rp-tpl-${k}`);
    try {
      await navigator.clipboard.writeText(ta.value);
      btn.textContent = /\[[^\]]*\]/.test(ta.value) ? 'Copied — [ ] still to fill' : 'Copied';
    } catch { btn.textContent = 'Copy failed — select and copy'; }
    setTimeout(() => { btn.textContent = 'Copy'; }, 2500);
  }

  // ── Export (admin) — the same JSON as export-register.sh (jq --sort-keys .) ─
  const sortKeys = (v) => Array.isArray(v) ? v.map(sortKeys)
    : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v;

  async function exportRegister(training) {
    const name = training ? 'training-export.json' : 'report-register.json';
    say('rp-register-msg', 'Exporting…');
    const r = await api('GET', training ? '/admin/reports/export-training' : '/admin/reports/export');
    if (r.status !== 200 || !Array.isArray(r.data.rows)) {
      return say('rp-register-msg', common(r.status) ?? `Unexpected answer (${r.status}). Nothing was saved.`);
    }
    const blob = new Blob([JSON.stringify(sortKeys(r.data), null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    say('rp-register-msg', `Downloaded ${name} (${r.data.rows.length} row${r.data.rows.length === 1 ? '' : 's'}). ` +
      'The copy in the private repo comes from export-register.sh on the Mac.');
  }

  function askDeleteTraining() {
    const n = S.rows.filter((r) => r.training).length;
    say('rp-delete-confirm-text', n ? `Delete ${n} training (T-) row${n === 1 ? '' : 's'}? Real rows can never be deleted.`
      : 'There are no training rows to delete.');
    $('rp-delete-yes').hidden = !n;
    $('rp-delete-confirm').hidden = false;
  }
  async function deleteTraining() {
    $('rp-delete-confirm').hidden = true;
    const r = await api('POST', '/admin/reports/delete-training');
    if (r.status !== 200) return say('rp-register-msg', common(r.status) ?? `Unexpected answer (${r.status}). Nothing was deleted.`);
    await loadRegister();
    if (S.look) renderTakedown();
    say('rp-register-msg', `Deleted ${r.data.deleted ?? 0} training row(s).`);
  }

  // ── Mount ─────────────────────────────────────────────────────────────────
  function fill(id, map, placeholder) {
    const sel = $(id);
    const opts = Object.entries(map).map(([v, label]) => new Option(label, v));
    if (placeholder) opts.unshift(new Option(placeholder, ''));
    sel.replaceChildren(...opts);
  }

  let wired = false;
  function mount({ worker, key, role }) {
    Object.assign(S, { worker, key, role });
    if (!wired) {
      wired = true;
      fill('rp-new-training', { no: 'A real report (R-)', yes: 'Training — a drill (T-)' }, 'Choose…');
      fill('rp-new-route', ROUTE, 'Choose…');
      fill('rp-new-category', CATEGORY, 'Choose…');
      fill('rp-close-decision', Object.fromEntries(Object.entries(DECISION).filter(([k]) => k !== 'open')), 'Choose…');
      fill('rp-close-told', TOLD, 'Choose…');
      fill('rp-close-key', { no: 'No (or no full link was sent)', yes: 'Yes — removed from the mailbox thread' });

      guard($('rp-link'), lookUp);
      guard($('rp-new-link'));
      $('rp-link').addEventListener('keydown', (e) => { if (e.key === 'Enter') lookUp(); });
      $('rp-lookup-btn').addEventListener('click', lookUp);
      $('rp-td-case').addEventListener('change', updateTakedownButton);
      $('rp-td-confirm').addEventListener('input', updateTakedownButton);
      $('rp-td-btn').addEventListener('click', takeDown);
      $('rp-new-btn').addEventListener('click', openNew);
      $('rp-new-cancel').addEventListener('click', () => { $('rp-new').hidden = true; });
      $('rp-new').addEventListener('submit', submitNew);
      $('rp-close').addEventListener('submit', submitClose);
      $('rp-reload-btn').addEventListener('click', async () => { say('rp-register-msg', ''); await loadRegister(); if (S.look) renderTakedown(); });
      $('rp-export-btn').addEventListener('click', () => exportRegister(false));
      $('rp-export-training-btn').addEventListener('click', () => exportRegister(true));
      $('rp-delete-training-btn').addEventListener('click', askDeleteTraining);
      $('rp-delete-yes').addEventListener('click', deleteTraining);
      $('rp-delete-no').addEventListener('click', () => { $('rp-delete-confirm').hidden = true; });
      $('rp-tbody').addEventListener('click', (e) => { const tr = e.target.closest('tr[data-case]'); if (tr) selectCase(tr.dataset.case); });
      $('rp-tbody').addEventListener('keydown', (e) => {
        const tr = e.target.closest?.('tr[data-case]');
        if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectCase(tr.dataset.case); }
      });
      $('rp-case').addEventListener('click', (e) => { const b = e.target.closest('[data-tpl]'); if (b) showTab(b.dataset.tpl); });
      $('rp-tpl-copy').addEventListener('click', (e) => copy(e.currentTarget));
    }
    loadRegister();
  }

  return { mount };
})();
