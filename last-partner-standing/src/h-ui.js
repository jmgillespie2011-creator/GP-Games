/* ===================== UI ===================== */
const $app = document.getElementById('app');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtK = v => (v < 0 ? '−£' : '£') + Math.abs(v).toFixed(1) + 'k';
const signK = v => (v > 0 ? '+' : v < 0 ? '−' : '') + '£' + Math.abs(v).toFixed(1) + 'k';
const pct = v => Math.round(v * 100) + '%';
let UI = { screen: 'title', pickPractice: 'town', nameDraft: '', overlay: null };

const BRIEF = [
  'The QOF year starts today. Everything resets to zero except the overdraft.',
  'Spring. Hay fever season, and a lot of "while I\'m here".',
  'Summer is coming, and so is everyone\'s annual leave request.',
  'July. The GP Patient Survey lands and the locums go on holiday.',
  'August. School holidays and the quietest month you will get. Plan for winter now.',
  'September. Flu vaccines arrive, schools go back, coughs follow.',
  'October. Flu clinics, clocks go back, demand starts climbing.',
  'November. Winter is here. Add capacity now or regret it in January.',
  'December. Christmas, norovirus and the hospital\'s festive discharge spree.',
  'January. The busiest month of the year. Everyone is ill, including your staff.',
  'February. Six weeks to QOF year end.',
  'March. The last month of the QOF year. Accounts, QOF and next year\'s contract.'
];

function badge(key) {
  const c = CAST[key] || CAST.you;
  const name = key === 'paper' ? P().paper : c.name;
  const m = c.m.length > 2 ? `<span style="font-size:${c.m.length > 3 ? 11 : 13}px">${esc(c.m)}</span>` : esc(c.m);
  return `<div class="who"><div class="mono-badge" style="background:${c.c}" aria-hidden="true">${m}</div><div><b>${esc(name)}</b><small>${esc(c.role)}</small></div>`;
}

/* ---------- HUD ---------- */
function meterClass(k, v) { if (k === 'cash') return v < -20 ? 'crit' : v < 5 ? 'low' : ''; return v <= 20 ? 'crit' : v <= 35 ? 'low' : ''; }
function hudHTML() {
  const months = MONTHS.map((_, i) => `<i class="${i < S.month ? 'done' : i === S.month ? 'now' : ''}" title="${MONTHS[i]}"></i>`).join('');
  const meters = STAT_KEYS.map(k => {
    const v = Math.round(S.st[k]);
    return `<div class="meter ${meterClass(k, v)}" data-meter="${k}" title="${STAT_LABEL[k]}: ${v}/100"><span class="hint"></span>${ICON[k]}<div class="lab"><span>${STAT_LABEL[k]}</span><span class="val">${v}</span></div><div class="bar"><b style="width:${v}%"></b></div></div>`;
  }).join('');
  const cw = clamp((S.cash - OVERDRAFT) / (120 - OVERDRAFT) * 100);
  const cashM = `<div class="meter ${meterClass('cash', S.cash)}" data-meter="cash" title="Practice bank balance. The bank pulls the plug below ${fmtK(OVERDRAFT)}."><span class="hint"></span>${ICON.cash}<div class="lab"><span>Bank</span><span class="val">${fmtK(S.cash)}</span></div><div class="bar"><b style="width:${cw}%"></b></div></div>`;
  const others = Object.keys(S.partners).filter(id => isActive(id)).map(id => PARTNERS0[id].short);
  const ib = S.inbox > 700 ? 'badv' : S.inbox > 400 ? 'warnv' : '';
  return `<header class="hud"><div class="wrap">
    <div class="hud-top">
      <div><div class="hud-name">${esc(P().surgery)}</div><div class="hud-sub">Dr ${esc(S.name)}, partner · ${esc(P().place)}</div></div>
      <div class="month-label">${MONTHS[Math.min(S.month, 11)]} · month ${Math.min(S.month, 11) + 1} of 12</div>
      <div class="months" aria-hidden="true">${months}</div>
      <button class="icon-btn" data-act="menu" aria-label="Menu" title="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
    <div class="meters">${meters}${cashM}</div>
    <div class="ledger">
      <span>QOF <b>${Math.round(S.qof)}%</b></span>
      <span>Inbox <b class="${ib}">${Math.round(S.inbox)}</b></span>
      <span>List <b>${S.list.toLocaleString('en-GB')}</b></span>
      <span>Partners <b>You${others.length ? ', ' + others.join(', ') : ' alone'}</b></span>
    </div>
  </div></header>`;
}

/* ---------- title ---------- */
function renderTitle() {
  const saved = loadSave();
  const best = loadBest();
  const pc = Object.values(PRACTICES).map(p => `<button class="pcard" data-act="pick" data-arg="${p.key}" aria-pressed="${UI.pickPractice === p.key}">
      <b>${esc(p.surgery)}</b><span class="diff">${p.diff}</span>
      <span class="d">${esc(p.label)}. ${esc(p.blurb)}</span>
      <span class="facts">${p.list.toLocaleString('en-GB')} patients · bank ${fmtK(p.cash)} · ${Object.values(p.staff).reduce((a, b) => a + b, 0) + 3} staff</span></button>`).join('');
  $app.innerHTML = `<main class="title-screen"><div class="wrap title-grid">
    <section>
      <div class="eyebrow">A general practice survival game</div>
      <h1 class="logo" style="margin-top:12px">Last<br>Partner<span class="rx">Rx</span><br><span class="under">Standing</span></h1>
      <p class="tagline">One QOF year. Twelve months. Five things to keep alive, including you.</p>
      <div class="memo"><b>Your year as a new GP partner</b>
        <ul>
          <li>Each month, set your week, your cover, your team and one project.</li>
          <li>Then deal with what lands on your desk: patients, staff, the ICB, CQC, the roof.</li>
          <li>If Patients, Team, You or Safety hits zero, or the bank goes past ${fmtK(OVERDRAFT)}, it's over.</li>
          <li>Survive to 31st March and the accountant tells you what it was all worth.</li>
        </ul>
      </div>
    </section>
    <section class="setup" aria-label="New game">
      <label class="field" for="docname">Your name
        <div class="name-row"><span>Dr</span><input id="docname" maxlength="24" autocomplete="off" placeholder="Surname" value="${esc(UI.nameDraft)}"></div>
      </label>
      <div class="field" style="display:grid;gap:8px"><b>Choose your practice</b><div class="pcards">${pc}</div></div>
      <div class="setup-actions">
        <button class="btn primary" data-act="start">Sign the partnership agreement</button>
        ${saved ? `<button class="btn" data-act="continue">Continue: ${esc(PRACTICES[saved.practiceKey].surgery)}, ${MONTHS[Math.min(saved.month, 11)]}</button>` : ''}
      </div>
      ${best.length ? `<div class="best"><div class="eyebrow">Your best years</div><ol style="margin:6px 0 0;padding-left:1.2em">${best.map(b => `<li>${b.score} · ${esc(b.t)} · ${esc(b.p)}</li>`).join('')}</ol></div>` : ''}
    </section>
  </div></main>`;
  const inp = document.getElementById('docname');
  if (inp) inp.addEventListener('input', () => { UI.nameDraft = inp.value; });
}

/* ---------- planning ---------- */
function stepper(act, v, minusOff, plusOff, label) {
  return `<div class="stepper" role="group" aria-label="${esc(label)}"><button data-act="${act}" data-arg="-1" ${minusOff ? 'disabled' : ''} aria-label="Fewer">−</button><output>${v}</output><button data-act="${act}" data-arg="1" ${plusOff ? 'disabled' : ''} aria-label="More">+</button></div>`;
}
function renderPlan() {
  const pl = S.plan, c = calc(), f = forecast(c);
  const total = pl.clin + pl.admin + pl.mgmt;
  const bar = [];
  for (let i = 0; i < pl.clin; i++) bar.push('c');
  for (let i = 0; i < pl.admin; i++) bar.push('a');
  for (let i = 0; i < pl.mgmt; i++) bar.push('m');
  const sessBar = bar.map((t, i) => `<i class="${t}${i >= 9 ? ' over' : ''}"></i>`).join('');
  const leaveLeft = 6 - S.leaveUsed;
  const projs = PROJECTS.filter(x => !x.need || S.flags[x.need]).map(x => {
    const done = x.once && S.flags['proj_' + x.id];
    return `<button class="proj" data-act="proj" data-arg="${x.id}" aria-pressed="${pl.project === x.id}" ${done ? 'disabled' : ''}><b>${esc(x.name)}${done ? ' (done)' : ''}</b><small>${esc(x.desc)}</small></button>`;
  }).join('');
  const roles = ROLE_ORDER.map(r => {
    const R = ROLES[r], n = S.staff[r], vac = S.vac[r] || 0;
    const arrsFull = R.arrs && arrsCount() >= ARRS_CAP;
    const costTxt = R.arrs ? 'PCN-funded' : `£${R.cost.toFixed(1)}k/mo each`;
    return `<div class="role"><div class="l"><b>${esc(R.name)}</b>${R.arrs ? '<span class="tag arrs">ARRS</span>' : ''}${vac ? `<span class="tag vac">${vac} advertised</span>` : ''}<small>${esc(R.desc)} ${costTxt}.</small></div>
      <span class="n" aria-label="${n} in post">${n}</span>
      <div class="acts">${vac ? `<button data-act="unvac" data-arg="${r}">Withdraw ad</button>` : ''}<button data-act="hire" data-arg="${r}" ${arrsFull ? 'disabled title="PCN ARRS budget is fully used"' : ''}>Recruit</button><button data-act="fire" data-arg="${r}" ${n ? '' : 'disabled'}>Let go</button></div></div>`;
  }).join('');
  const ratio = c.ratio;
  const gcls = ratio >= 0.94 ? '' : ratio >= 0.85 ? 'warn' : 'bad';
  const ratioWord = ratio >= 1.05 ? 'Comfortable' : ratio >= 0.97 ? 'Just about' : ratio >= 0.9 ? 'Stretched' : ratio >= 0.8 ? 'Overwhelmed' : 'Collapse';
  const inboxCls = f.inboxEnd > 700 ? 'bad-t' : f.inboxEnd > 400 ? 'warn-t' : 'good-t';
  const net = c.net;
  const drift = STAT_KEYS.map(k => { const d = f.d[k]; return `<span class="chip">${ICON[k]}<span class="${d > 0 ? 'good-t' : d < 0 ? 'bad-t' : ''}">${d > 0 ? '+' : ''}${d}</span></span>`; }).join('');
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap">
    <div class="plan-head"><div><div class="eyebrow">Month plan</div><h1>${MONTHS[S.month]}</h1></div><p class="brief">${esc(BRIEF[S.month])} ${S.queue.length} things will land on your desk this month.</p></div>
    <div class="plan-grid">
      <div class="col">
        <section class="panel" aria-labelledby="h-week">
          <h3 id="h-week">Your week <small>${total} sessions. Eight is a full week; past nine you'll feel it.</small></h3>
          <div class="sessbar" aria-hidden="true">${sessBar}</div>
          <div class="legend"><span style="--c:var(--accent)">Clinical: ${pl.clin * 14} appointments</span><span style="--c:var(--hilite)">Admin: clears inbox</span><span style="--c:var(--stamp)">Management: QOF and safety</span></div>
          <div class="steps">
            <div class="step"><div class="l"><b>Clinical sessions</b><small>Surgeries, triage, visits. 14 appointments each.</small></div>${stepper('clin', pl.clin, pl.clin <= 0, total >= 12, 'Clinical sessions')}</div>
            <div class="step"><div class="l"><b>Admin sessions</b><small>Results, letters, scripts. About 55 items each.</small></div>${stepper('admin', pl.admin, pl.admin <= 0, total >= 12, 'Admin sessions')}</div>
            <div class="step"><div class="l"><b>Management sessions</b><small>Running the business: QOF, CQC readiness, governance.</small></div>${stepper('mgmt', pl.mgmt, pl.mgmt <= 0, total >= 12, 'Management sessions')}</div>
          </div>
          <label class="toggle" for="leave"><input type="checkbox" id="leave" ${pl.leave ? 'checked' : ''} ${leaveLeft <= 0 && !pl.leave ? 'disabled' : ''}> Take a week of annual leave this month <span class="muted">(${leaveLeft} of 6 weeks left)</span></label>
          <div class="step" style="border:0"><div class="l"><b>Partners' drawings</b><small>What every partner takes home each month, on account.</small></div>
            <div class="seg" role="group" aria-label="Drawings">${['low', 'std', 'high'].map(k => `<button data-act="draw" data-arg="${k}" aria-pressed="${pl.draw === k}">${k === 'low' ? 'Lean' : k === 'std' ? 'Standard' : 'Generous'} £${DRAW[k]}k</button>`).join('')}</div></div>
        </section>
        <section class="panel" aria-labelledby="h-locum">
          <h3 id="h-locum">Locum cover <small>£460 a session. They see patients. They do not do paperwork.</small></h3>
          <div class="step" style="border:0"><div class="l"><b>Locum sessions per week</b><small>${pl.locum ? `${pl.locum * 14} extra appointments, about ${fmtK(pl.locum * WEEKS * 0.46)} this month` : 'None booked'}</small></div>${stepper('locum', pl.locum, pl.locum <= 0, pl.locum >= 8, 'Locum sessions')}</div>
        </section>
        <section class="panel" aria-labelledby="h-proj">
          <h3 id="h-proj">This month's project <small>Pick one.</small></h3>
          <div class="projects">${projs}</div>
        </section>
        <section class="panel" aria-labelledby="h-team">
          <h3 id="h-team">Team <small>ARRS ${arrsCount()}/${ARRS_CAP} · rooms ${c.rNeed}/${c.rAvail} used · reception needs ${c.recepNeed}</small></h3>
          <p class="fc-note">Recruiting opens an advert; results come at month end. ARRS roles cost the practice almost nothing but need a room, and clinicians need your supervision.</p>
          <div class="roles">${roles}</div>
        </section>
      </div>
      <aside class="panel forecast" aria-labelledby="h-fc">
        <h3 id="h-fc">Forecast <small>before whatever happens this month</small></h3>
        <div class="fc-row"><div class="top"><span>Appointments per week</span><b>${c.cap} / ${c.demand}</b></div>
          <div class="gauge ${gcls}"><b style="width:${Math.min(100, ratio * 80)}%"></b><i style="left:80%"></i></div>
          <div class="fc-note"><span class="${gcls === 'bad' ? 'bad-t' : gcls === 'warn' ? 'warn-t' : 'good-t'}"><b>${ratioWord}</b></span>: offering ${pct(ratio)} of what patients will ask for. The line marks 100%.</div></div>
        <div class="fc-row"><div class="top"><span>Inbox</span><b>${Math.round(S.inbox)} → <span class="${inboxCls}">${f.inboxEnd}</span></b></div>
          <div class="fc-note">${c.inflow} in and ${c.clear} cleared each week. Over 400 it starts to hurt; over 700 it gets dangerous.</div></div>
        <div class="fc-row"><div class="top"><span>Cash this month</span><b class="${net >= 0 ? 'good-t' : 'bad-t'}">${signK(net)}</b></div>
          <div class="fc-note">Income ${fmtK(c.incTot + Math.max(0, c.modCash))} · staff ${fmtK(c.cost.staff)} · locums ${fmtK(c.cost.locum)} · premises ${fmtK(c.cost.premises)} · drawings ${fmtK(c.cost.draw)}${c.modCash < 0 ? ' · schemes ' + fmtK(c.modCash) : ''}</div></div>
        <div class="fc-row"><div class="top"><span>QOF</span><b>${Math.round(S.qof)}% → ${Math.round(Math.min(100, S.qof + c.qofGain))}%</b></div>
          <div class="fc-note">Nurses, HCAs, pharmacists, care coordinators and your management time all push QOF. You need to be near 90% by March.</div></div>
        <div class="fc-row"><div class="top"><span>Drift by month end</span></div><div class="chips">${drift}</div></div>
        ${c.roomsOver ? `<p class="fc-note bad-t">${c.roomsOver} more clinician${c.roomsOver > 1 ? 's' : ''} than rooms. Capacity and morale will suffer.</p>` : ''}
        ${c.recepShort ? `<p class="fc-note bad-t">Reception is ${c.recepShort} short for a list this size.</p>` : ''}
        <button class="btn primary" data-act="begin" style="justify-self:start">Start ${MONTHS[S.month]} →</button>
      </aside>
    </div>
  </div></main>`;
  const lv = document.getElementById('leave');
  if (lv) lv.addEventListener('change', () => { S.plan.leave = lv.checked; save(); keepScroll(renderPlan); });
}
function keepScroll(fn) { const y = window.scrollY; fn(); window.scrollTo(0, y); }

/* ---------- event cards ---------- */
function hintFor(c) {
  const out = {};
  const add = fx => {
    if (!fx) return;
    try { fx = val(fx); } catch (e) { return; }
    if (!fx) return;
    for (const k of STAT_KEYS) if (fx[k]) out[k] = Math.max(out[k] || 0, Math.abs(fx[k]));
    if (fx.cash) out.cash = Math.max(out.cash || 0, Math.abs(fx.cash) * 1.2);
    if (fx.qof) out.qof = Math.max(out.qof || 0, Math.abs(fx.qof));
    if (fx.inbox) out.inbox = Math.max(out.inbox || 0, Math.abs(fx.inbox) / 10);
  };
  add(c.fx); if (c.alt) add(c.alt.fx);
  return out;
}
function chipsFor(c) {
  if (c.play) return `<div class="chips"><span class="chip">Mini-game: your skill decides the effect</span></div>`;
  const h = hintFor(c);
  const parts = [];
  for (const k of ['patients', 'team', 'you', 'safety', 'cash']) if (h[k]) parts.push(`<span class="chip" title="Affects ${STAT_LABEL[k]}">${ICON[k]}<span class="dot${h[k] >= 6 ? ' big' : ''}"></span></span>`);
  if (h.qof) parts.push(`<span class="chip">QOF<span class="dot${h.qof >= 6 ? ' big' : ''}"></span></span>`);
  if (h.inbox) parts.push(`<span class="chip">Inbox<span class="dot${h.inbox >= 6 ? ' big' : ''}"></span></span>`);
  if (c.alt) parts.push(`<span class="chip risk" title="The outcome is uncertain">Gamble</span>`);
  if (!parts.length && c.run) parts.push(`<span class="chip">Consequences to follow</span>`);
  return parts.length ? `<div class="chips">${parts.join('')}</div>` : '';
}
function renderEvent() {
  const e = currentEvent();
  if (!e) { advanceEvent(); return render(); }
  const n = S.qi + 1, tot = S.queue.length;
  const choices = e.choices.map((c, i) => {
    let ok = true; try { ok = !c.need || c.need(); } catch (err) { ok = false; }
    const h = JSON.stringify(hintFor(c));
    return `<button class="choice" data-act="choose" data-arg="${i}" data-hint='${esc(h)}' ${ok ? '' : 'disabled'}><span class="t"><span class="kbd">${i + 1}</span> ${esc(fill(c.t))}</span>${ok ? chipsFor(c) : `<span class="why">${esc(c.why || 'Not available')}</span>`}</button>`;
  }).join('');
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap">
    <article class="card" aria-live="polite">${badge(e.who)}<span class="stampno">${MON3[S.month]} · ${Math.min(n, tot)}/${tot}</span></div>
      <h2>${esc(fill(e.title))}</h2>
      <div class="text"><p>${esc(fill(val(e.text)))}</p></div>
      <div class="choices">${choices}</div>
    </article></div></main>`;
}
function deltaChips(ds) {
  if (!ds || !ds.length) return '<p class="muted" style="margin-top:14px;font-size:14px">No immediate effect.</p>';
  return `<div class="deltas">${ds.map(d => `<span class="delta ${d.neutral ? 'neutral' : d.good ? 'up' : 'down'}">${esc(d.label)} ${esc(d.txt)}</span>`).join('')}</div>`;
}
function renderOutcome() {
  const e = EVMAP[S.cur.id] || {};
  const over = checkOver();
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap">
    <article class="card outcome">${badge(e.who || 'you')}<span class="stampno">${S.cur.alt ? 'Gamble lost' : 'Outcome'}</span></div>
      <h2>${esc(fill(e.title || ''))}</h2>
      <div class="text"><p>${esc(S.cur.o)}</p></div>
      ${S.cur.html || ''}
      ${deltaChips(S.cur.deltas)}
      <div class="card-foot"><span class="muted">Press Enter to continue</span><button class="btn primary" data-act="cont" autofocus>${over ? 'Uh oh…' : S.soldOut ? 'Sign the papers' : 'Continue'}</button></div>
    </article></div></main>`;
  pulse(S.cur.deltas);
}
function pulse(ds) {
  (ds || []).forEach(d => {
    const m = document.querySelector(`[data-meter="${d.k}"]`);
    if (m) { m.classList.add(d.good ? 'pulse-up' : 'pulse-down'); setTimeout(() => m.classList.remove('pulse-up', 'pulse-down'), 1400); }
  });
}

/* ---------- month report ---------- */
function statLines(extra) {
  return `<div class="statlines">${STAT_KEYS.map(k => {
    const v = Math.round(S.st[k]); const d = extra ? extra[k] : null;
    return `<div class="statline">${ICON[k]}<span>${STAT_LABEL[k]}</span><div class="bar"><b style="width:${v}%;${v <= 20 ? 'background:var(--bad)' : v <= 35 ? 'background:var(--warn)' : ''}"></b></div><span class="d">${v}${d != null ? ` <span class="${d > 0 ? 'good-t' : d < 0 ? 'bad-t' : 'muted'}">${d > 0 ? '+' : ''}${d}</span>` : ''}</span></div>`;
  }).join('')}</div>`;
}
function renderReport() {
  const R = S.report, c = R.c;
  const dmap = {}; R.deltas.forEach(d => { dmap[d.k] = d.d; });
  const last = S.month >= 11;
  const notes = R.hires.concat(R.notes);
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap report">
    <div class="clip"><div class="masthead"><span>${esc(P().paper)}</span><span>${MONTHS[R.month]} edition</span></div>
      <h2>${esc(R.headline)}</h2><p>${c.cap} appointments offered a week against ${c.demand} requested (${pct(c.ratio)}).</p></div>
    <div class="rgrid">
      <section class="panel"><h3>The month in numbers</h3>
        <dl class="kv">
          <dt>Appointments offered / week</dt><dd>${c.cap}</dd>
          <dt>Appointments requested / week</dt><dd>${c.demand}</dd>
          <dt>Inbox: start → end</dt><dd>${R.inboxStart} → ${R.inboxEnd}</dd>
          <dt>QOF achievement</dt><dd>${Math.round(S.qof)}%</dd>
          <dt>List size</dt><dd>${S.list.toLocaleString('en-GB')}</dd>
        </dl>
        <h3 style="margin-top:6px">How everyone's feeling</h3>
        ${statLines(dmap)}
      </section>
      <section class="panel"><h3>The money</h3>
        <dl class="kv">
          <dt>Global sum</dt><dd>${fmtK(c.inc.gs)}</dd>
          <dt>QOF aspiration payment</dt><dd>${fmtK(c.inc.qof)}</dd>
          <dt>Enhanced services</dt><dd>${fmtK(c.inc.es)}</dd>
          <dt>Private and other income</dt><dd>${fmtK(c.inc.other)}</dd>
          ${c.modCash ? `<dt>Schemes, leases and extras</dt><dd>${signK(c.modCash)}</dd>` : ''}
          <dt>Staff</dt><dd>−${fmtK(c.cost.staff)}</dd>
          ${c.cost.locum ? `<dt>Locums</dt><dd>−${fmtK(c.cost.locum)}</dd>` : ''}
          <dt>Premises and running costs</dt><dd>−${fmtK(c.cost.premises)}</dd>
          <dt>Partners' drawings (${c.partnersN})</dt><dd>−${fmtK(c.cost.draw)}</dd>
          <dt class="sum">Net from running the practice</dt><dd class="sum">${signK(c.net)}</dd>
          <dt>Bank balance now</dt><dd>${fmtK(S.cash)}</dd>
        </dl>
        ${notes.length ? `<h3 style="margin-top:6px">Notes</h3><ul class="notes">${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      </section>
    </div>
    <div class="plan-go"><button class="btn primary" data-act="next" autofocus>${checkOver() ? 'Uh oh…' : last ? 'See the year-end accounts →' : `On to ${MONTHS[S.month + 1]} →`}</button></div>
  </div></main>`;
}

/* ---------- endings ---------- */
function chartSVG() {
  const H = S.history; if (H.length < 2) return '';
  const W = 640, Ht = 220, L = 34, Rr = 76, T = 12, B = 28;
  const x = i => L + (W - L - Rr) * (i / 11), y = v => T + (Ht - T - B) * (1 - v / 100);
  const cols = { patients: 'var(--s1)', team: 'var(--s2)', you: 'var(--s3)', safety: 'var(--s4)' };
  let g = '';
  [0, 25, 50, 75, 100].forEach(v => { g += `<line x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width="1"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--ink-2)" font-family="IBM Plex Mono, monospace">${v}</text>`; });
  MON3.forEach((m, i) => { if (i % 2 === 0) g += `<text x="${x(i)}" y="${Ht - 8}" text-anchor="middle" font-size="11" fill="var(--ink-2)" font-family="IBM Plex Mono, monospace">${m}</text>`; });
  const labelsY = [];
  STAT_KEYS.forEach(k => {
    const pts = H.map(h => `${x(h.m).toFixed(1)},${y(h[k]).toFixed(1)}`).join(' ');
    const lastH = H[H.length - 1];
    g += `<polyline points="${pts}" fill="none" stroke="${cols[k]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(lastH.m)}" cy="${y(lastH[k])}" r="4" fill="${cols[k]}"/>`;
    let ly = y(lastH[k]) + 4; while (labelsY.some(v => Math.abs(v - ly) < 13)) ly += 13; labelsY.push(ly);
    g += `<text x="${x(lastH.m) + 9}" y="${ly}" font-size="12" font-weight="700" fill="${cols[k]}" font-family="Atkinson Hyperlegible, sans-serif">${STAT_LABEL[k]}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Patients, team, you and safety across the year">${g}</svg>`;
}
function shareText() {
  const E = S.end;
  return `I survived a year as a GP partner at ${P().surgery} (${P().label.toLowerCase()}): "${E.arche.t}". QOF ${Math.round(S.qof)}%, CQC ${S.cqc ? RATE_NAME[S.cqc.overall] : 'not inspected'}, take-home £${Math.round(E.takeHome)}k, wellbeing ${Math.round(S.st.you)}/100. Score ${E.score}. Last Partner Standing.`;
}
function renderEnd() {
  const E = S.end;
  const best = loadBest();
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap ending">
    <section class="verdict"><div class="eyebrow">${E.sold ? MONTHS[S.month] : '31st March'} · ${esc(P().surgery)}</div><span class="bigstamp">${esc(E.arche.s)}</span>
      <h1>${esc(E.arche.t)}</h1><p class="lede">${esc(E.arche.d)}</p>
      <div class="score"><span>Score <b>${E.score}</b></span><span>Take-home <b>£${Math.round(E.takeHome)}k</b></span><span>QOF <b>${Math.round(S.qof)}%</b></span><span>CQC <b>${S.cqc ? RATE_NAME[S.cqc.overall] : '—'}</b></span></div>
    </section>
    <div class="rgrid">
      <section class="panel"><h3>The accounts</h3>
        <dl class="kv">
          <dt>Your drawings through the year</dt><dd>${fmtK(S.drawTotal)}</dd>
          <dt>QOF earned (${Math.round(S.qof)}% achieved)</dt><dd>${fmtK(E.earned)}</dd>
          <dt>QOF aspiration already paid</dt><dd>−${fmtK(S.aspPaid)}</dd>
          <dt>QOF balancing payment</dt><dd class="${E.balancing < 0 ? 'bad-t' : 'good-t'}">${signK(E.balancing)}</dd>
          <dt>Bank after balancing</dt><dd>${fmtK(E.cashFinal)}</dd>
          <dt>Kept back as working capital</dt><dd>−${fmtK(RESERVE)}</dd>
          <dt>Your share of what's left (÷${E.partnersN})</dt><dd class="${E.share < 0 ? 'bad-t' : ''}">${signK(E.share)}${E.sold ? ' incl. Apex payout' : ''}</dd>
          <dt class="sum">Your pre-tax income for the year</dt><dd class="sum">£${E.takeHome.toFixed(1)}k</dd>
        </dl>
        ${E.share < 0 ? '<p class="fc-note bad-t">The partnership ended the year short. You pay your share back in, personally.</p>' : ''}
      </section>
      <section class="panel"><h3>The practice</h3>
        ${statLines(null)}
        ${S.cqc ? `<div class="cqc-card">${Object.keys(S.cqc.rates).map(k => `<div class="row"><span>${k}</span><span class="rate ${S.cqc.rates[k]}">${RATE_NAME[S.cqc.rates[k]]}</span></div>`).join('')}<div class="row overall"><span>Overall</span><span class="rate">${RATE_NAME[S.cqc.overall]}</span></div></div>` : '<p class="fc-note">CQC never came. Enjoy it while it lasts.</p>'}
      </section>
    </div>
    <section class="panel"><h3>Your year</h3>${chartSVG()}</section>
    <div class="end-actions"><button class="btn primary" data-act="again">Another year</button><button class="btn" data-act="share">Copy my result</button><button class="btn ghost" data-act="home">Title screen</button></div>
    ${best.length ? `<div class="best"><div class="eyebrow">Your best years</div><ol style="margin:6px 0 0;padding-left:1.2em">${best.map(b => `<li>${b.score} · ${esc(b.t)} · ${esc(b.p)}</li>`).join('')}</ol></div>` : ''}
  </div></main>`;
}
function renderOver() {
  const O = OVER[S.over.k];
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap ending">
    <section class="verdict over"><div class="eyebrow">${MONTHS[S.over.month]} · ${esc(P().surgery)}</div><span class="bigstamp">${esc(O.stamp)}</span>
      <h1>${esc(O.title)}</h1><p class="lede">${esc(O.text())}</p>
      <div class="score"><span>You lasted <b>${S.over.month + 1}</b> of 12 months</span></div></section>
    <section class="panel"><h3>Where it ended</h3>${statLines(null)}<p class="fc-note">Bank ${fmtK(S.cash)} · QOF ${Math.round(S.qof)}% · Inbox ${Math.round(S.inbox)}</p></section>
    ${S.history.length > 1 ? `<section class="panel"><h3>How it went</h3>${chartSVG()}</section>` : ''}
    <div class="end-actions"><button class="btn primary" data-act="again">Try again</button><button class="btn ghost" data-act="home">Title screen</button></div>
  </div></main>`;
}

/* ---------- overlays ---------- */
function openOverlay(html) { closeOverlay(); const d = document.createElement('div'); d.className = 'overlay'; d.id = 'overlay'; d.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">${html}</div>`; document.body.appendChild(d); const b = d.querySelector('button'); if (b) b.focus(); }
function closeOverlay() { const o = document.getElementById('overlay'); if (o) o.remove(); }
function howHTML() {
  return `<h2>How it works</h2><ul>
    <li><b>Four meters and a bank balance.</b> Patients, Team, You and Safety run from 0 to 100. If any hits zero, or the bank drops below ${fmtK(OVERDRAFT)}, the game ends.</li>
    <li><b>Plan each month.</b> Your sessions set capacity, the inbox and your own wellbeing. Locums add appointments but cost money and do no paperwork. Recruit or let staff go. Pick one project.</li>
    <li><b>Demand is seasonal.</b> Winter is brutal. Recruitment takes time and can fail, so plan in the summer.</li>
    <li><b>Decisions.</b> Dots under each choice show which meters it touches and roughly how much, but not which way. "Gamble" choices can go wrong.</li>
    <li><b>QOF.</b> You're paid 70% of expected QOF monthly. At year end, what you achieved is reconciled against it. Under-achieve and you pay it back.</li>
    <li><b>Keyboard.</b> 1, 2, 3 to choose. Enter to continue. The mini-games use number keys too.</li>
  </ul><div class="row-actions"><button class="btn primary" data-act="close">Got it</button></div>`;
}
function menuHTML() {
  return `<h2>Menu</h2><p class="muted">Your game saves automatically after every decision, in this browser only.</p>
  <div class="row-actions" style="justify-content:flex-start"><button class="btn" data-act="how">How it works</button><button class="btn" data-act="theme">Switch light/dark</button><button class="btn" data-act="restart-ask">Resign from the partnership</button><button class="btn primary" data-act="close">Back to work</button></div>`;
}
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

/* ---------- render ---------- */
function render() {
  if (!S || UI.screen === 'title') { renderTitle(); return; }
  switch (S.phase) {
    case 'plan': return renderPlan();
    case 'event': return renderEvent();
    case 'outcome': return renderOutcome();
    case 'mini': return renderMini();
    case 'report': return renderReport();
    case 'end': return renderEnd();
    case 'over': return renderOver();
  }
}
function go(fn) { fn(); render(); window.scrollTo(0, 0); }

/* ---------- input ---------- */
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act, arg = b.dataset.arg;
  if (ev.target.classList && ev.target.classList.contains('overlay')) return;
  switch (a) {
    case 'pick': UI.pickPractice = arg; keepScroll(renderTitle); break;
    case 'start': { const nm = (UI.nameDraft || '').trim().replace(/^dr\.?\s+/i, '') || 'Jones'; UI.screen = 'game'; go(() => newGame(UI.pickPractice, nm)); break; }
    case 'continue': { const s = loadSave(); if (s) { S = s; UI.screen = 'game'; go(() => { }); } break; }
    case 'menu': openOverlay(menuHTML()); break;
    case 'how': openOverlay(howHTML()); break;
    case 'close': closeOverlay(); break;
    case 'theme': { const r = document.documentElement; const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; r.dataset.theme = dark ? 'light' : 'dark'; closeOverlay(); break; }
    case 'restart-ask': openOverlay(`<h2>Resign?</h2><p>This ends the current year. Your progress will be lost.</p><div class="row-actions"><button class="btn" data-act="close">Stay</button><button class="btn primary" data-act="restart">Resign</button></div>`); break;
    case 'restart': closeOverlay(); clearSave(); S = null; UI.screen = 'title'; go(() => { }); break;
    case 'clin': case 'admin': case 'mgmt': {
      const d = +arg, pl = S.plan, tot = pl.clin + pl.admin + pl.mgmt;
      if (d > 0 && tot >= 12) break; if (d < 0 && pl[a] <= 0) break;
      pl[a] += d; save(); keepScroll(renderPlan); break;
    }
    case 'locum': S.plan.locum = clamp(S.plan.locum + +arg, 0, 8); save(); keepScroll(renderPlan); break;
    case 'draw': S.plan.draw = arg; save(); keepScroll(renderPlan); break;
    case 'proj': S.plan.project = arg; save(); keepScroll(renderPlan); break;
    case 'hire': {
      const R = ROLES[arg]; if (R.arrs && arrsCount() >= ARRS_CAP) break;
      const cost = arg === 'salaried' ? 1.5 : arg === 'nurse' ? 0.8 : R.arrs ? 0 : 0.4;
      S.vac[arg] = (S.vac[arg] || 0) + 1; S.cash = r1(S.cash - cost); save(); keepScroll(renderPlan);
      toast(`${R.name} advertised${cost ? ` (${fmtK(cost)})` : ''}. Results at month end.`); break;
    }
    case 'unvac': if (S.vac[arg]) { S.vac[arg]--; if (!S.vac[arg]) delete S.vac[arg]; save(); keepScroll(renderPlan); } break;
    case 'fire': {
      if (!S.staff[arg]) break;
      S.staff[arg]--; const big = ['salaried', 'nurse'].includes(arg);
      S.st.team = clamp(S.st.team - (big ? 6 : 3)); save(); keepScroll(renderPlan);
      toast(`${ROLES[arg].name} let go. Team morale ${big ? '−6' : '−3'}.`); break;
    }
    case 'begin': go(beginMonth); break;
    case 'choose': chooseAt(+arg); break;
    case 'cont': go(continueOutcome); break;
    case 'next': go(nextMonth); break;
    case 'again': { const k = S.practiceKey, n = S.name; go(() => newGame(k, n)); break; }
    case 'home': S = null; UI.screen = 'title'; go(() => { }); break;
    case 'share': {
      const txt = shareText();
      const done = () => toast('Copied. Go and humblebrag in the practice WhatsApp.');
      const fallback = () => openOverlay(`<h2>Your result</h2><textarea id="sharebox" rows="5" style="width:100%;font-family:var(--mono);font-size:13px;padding:8px;border-radius:8px;border:1.5px solid var(--rule);background:var(--sheet-2)">${esc(txt)}</textarea><div class="row-actions"><button class="btn primary" data-act="close">Done</button></div>`);
      try { navigator.clipboard.writeText(txt).then(done, () => { fallback(); const t = document.getElementById('sharebox'); if (t) t.select(); }); } catch (e) { fallback(); }
      break;
    }
    default: if (typeof miniAction === 'function') miniAction(a, arg);
  }
});
document.addEventListener('click', ev => { if (ev.target.id === 'overlay') closeOverlay(); });
function chooseAt(i) {
  const e = currentEvent(); if (!e) return;
  const c = e.choices[i]; if (!c) return;
  try { if (c.need && !c.need()) return; } catch (err) { return; }
  if (c.play) { startMini(e.game, i); return; }
  go(() => resolveChoice(i));
}
document.addEventListener('mouseover', ev => {
  const b = ev.target.closest('.choice'); if (!b) return;
  let h = {}; try { h = JSON.parse(b.dataset.hint || '{}'); } catch (e) { }
  document.querySelectorAll('.meter').forEach(m => { const k = m.dataset.meter, dot = m.querySelector('.hint'); if (!dot) return; dot.classList.toggle('on', !!h[k]); dot.classList.toggle('big', (h[k] || 0) >= 6); });
});
document.addEventListener('mouseout', ev => { if (ev.target.closest('.choice')) document.querySelectorAll('.meter .hint').forEach(d => d.classList.remove('on', 'big')); });
document.addEventListener('keydown', ev => {
  if (document.getElementById('overlay')) { if (ev.key === 'Escape') closeOverlay(); return; }
  if (!S || UI.screen === 'title') return;
  if (ev.target && /input|textarea/i.test(ev.target.tagName)) return;
  if (S.phase === 'mini') { if (typeof miniKey === 'function') miniKey(ev); return; }
  if (S.phase === 'event' && /^[1-4]$/.test(ev.key)) { ev.preventDefault(); chooseAt(+ev.key - 1); }
  else if (ev.key === 'Enter' && !(ev.target && ev.target.closest && ev.target.closest('button'))) {
    if (S.phase === 'outcome') go(continueOutcome); else if (S.phase === 'report') go(nextMonth);
  }
});
