/* ===================== UI 1: helpers, HUD, title, planner, cards ===================== */
const $app = document.getElementById('app');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtK = v => (v < 0 ? '−£' : '£') + Math.abs(v).toFixed(1) + 'k';
const signK = v => (v > 0 ? '+' : v < 0 ? '−' : '') + '£' + Math.abs(v).toFixed(1) + 'k';
const gbp = v => (v < 0 ? '−£' : '£') + Math.round(Math.abs(v)).toLocaleString('en-GB');
const pct = v => Math.round(v * 100) + '%';
let UI = { screen: 'title', pickPractice: 'town', nameDraft: '' };
const narrow = () => { try { return matchMedia('(max-width:640px)').matches; } catch (e) { return false; } };

const BRIEF = [
  'The QOF year starts today. Everything resets to zero except the overdraft.',
  'Spring. Hay fever season, and a lot of "while I\'m here".',
  'Summer is coming, and so is everyone\'s annual leave request.',
  'July. The GP Patient Survey lands and the locums go on holiday.',
  'August. School holidays and the quietest month you\'ll get. Plan for winter now.',
  'September. Flu vaccines arrive, schools go back, coughs follow.',
  'October. Flu clinics, clocks go back, demand starts climbing.',
  'November. Winter is here. Add capacity now or regret it in January.',
  'December. Christmas, norovirus and the hospital\'s festive discharge spree.',
  'January. The busiest month of the year. Everyone is ill, including your staff.',
  'February. Six weeks to QOF year end.',
  'March. The last month of the QOF year. Accounts, QOF and next year\'s contract.'
];
const TAG_LABEL = { real: 'Real figures', rule: 'Real rule', story: 'Fiction', speculative: 'Speculative' };

/* expandable explainer: native details/summary, works with keyboard and screen readers */
function explain(label, body, cls) {
  return `<details class="explain${cls ? ' ' + cls : ''}"><summary>${esc(label)}</summary><div class="explain-body">${body}</div></details>`;
}
function srcLinks(ids) {
  const list = (ids || []).filter(id => SOURCES[id]);
  if (!list.length) return '';
  return `<ul class="srcs">${list.map(id => `<li><a href="${esc(SOURCES[id][1])}" target="_blank" rel="noopener">${esc(SOURCES[id][0])}</a> <span class="grade g${SOURCES[id][2]}" title="Confidence grade">${SOURCES[id][2]}</span></li>`).join('')}</ul>`;
}
function badge(key) {
  const c = CAST[key] || CAST.you;
  const name = key === 'paper' ? prac().paper : c.name;
  const m = c.m.length > 2 ? `<span style="font-size:${c.m.length > 3 ? 11 : 13}px">${esc(c.m)}</span>` : esc(c.m);
  return `<div class="who"><div class="mono-badge" style="background:${c.c}" aria-hidden="true">${m}</div><div><b>${esc(name)}</b><small>${esc(c.role)}</small></div>`;
}
const relWord = v => v >= 70 ? 'excellent' : v >= 55 ? 'good' : v >= 40 ? 'strained' : v >= 25 ? 'poor' : 'broken';

/* ---------- HUD ---------- */
function meterClass(k, v) { if (k === 'cash') return v < S.overdraft / 2 ? 'crit' : v < 0 ? 'low' : ''; return v <= 20 ? 'crit' : v <= 35 ? 'low' : ''; }
function hudHTML() {
  const months = MONTHS.map((_, i) => `<i class="${i < S.month ? 'done' : i === S.month ? 'now' : ''}" title="${MONTHS[i]}"></i>`).join('');
  const meters = STAT_KEYS.map(k => {
    const v = Math.round(S.st[k]);
    return `<div class="meter ${meterClass(k, v)}" data-meter="${k}" title="${STAT_LABEL[k]}: ${v}/100"><span class="hint"></span>${ICON[k]}<div class="lab"><span>${STAT_LABEL[k]}</span><span class="val">${v}</span></div><div class="bar"><b style="width:${v}%"></b></div></div>`;
  }).join('');
  const cw = clamp((S.cash - S.overdraft) / (150 - S.overdraft) * 100);
  const cashM = `<div class="meter ${meterClass('cash', S.cash)}" data-meter="cash" title="Practice bank balance. Overdraft limit ${fmtK(S.overdraft)}."><span class="hint"></span>${ICON.cash}<div class="lab"><span>Bank</span><span class="val">${fmtK(S.cash)}</span></div><div class="bar"><b style="width:${cw}%"></b></div></div>`;
  const others = Object.keys(S.partners).filter(id => isActive(id)).map(id => PARTNERS0[id].short);
  const ib = S.inbox > 700 ? 'badv' : S.inbox > 400 ? 'warnv' : '';
  return `<header class="hud"><div class="wrap">
    <div class="hud-top">
      <div><div class="hud-name">${esc(prac().surgery)}</div><div class="hud-sub">Dr ${esc(S.name)}, partner · ${esc(prac().place)}</div></div>
      <div class="month-label">${MONTHS[Math.min(S.month, 11)]} ${CAL_YEAR[Math.min(S.month, 11)]} · month ${Math.min(S.month, 11) + 1} of 12</div>
      <div class="months" aria-hidden="true">${months}</div>
      <button class="icon-btn" data-act="menu" aria-label="Menu" title="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
    <div class="meters">${meters}${cashM}</div>
    <div class="ledger">
      <span>QOF <b>${Math.round(S.qof)}%</b></span>
      <span>Inbox <b class="${ib}">${Math.round(S.inbox)}</b></span>
      <span>List <b>${S.list.toLocaleString('en-GB')}</b></span>
      <span>Partners <b>You${others.length ? ', ' + others.join(', ') : ' alone'}</b></span>
      ${S.goal && GOALS[S.goal] ? `<span>Goal <b>${esc(GOALS[S.goal].t)}</b>${S.week ? ` · <b>Weekly challenge</b>` : ''}</span>` : ''}
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
      <span class="facts">${p.list.toLocaleString('en-GB')} patients · bank ${fmtK(p.cash)} · overdraft limit ${fmtK(p.overdraft)}</span></button>`).join('');
  $app.innerHTML = `<main class="title-screen"><div class="wrap title-grid">
    <section>
      <div class="eyebrow">A general practice survival game</div>
      <h1 class="logo" style="margin-top:12px">Last<br>Partner<span class="rx">Rx</span><br><span class="under">Standing</span></h1>
      <p class="tagline">One financial year on England's 2026/27 GP contract. Five things to keep alive, including you.</p>
      <div class="memo"><b>Your year as a new GP partner</b>
        <ul>
          <li>Each month, set your week, your cover, your team and one project.</li>
          <li>Then deal with what lands on your desk: patients, staff, the ICB, CQC, the roof.</li>
          <li>Meters drift toward wherever your practice's situation is taking them. Decisions come back to you, sometimes months later.</li>
          <li>Survive to 31st March 2027 and the accountant tells you what it was all worth, after tax.</li>
        </ul>
        ${explain('About the numbers', `<p>The money runs on real 2026/27 figures for England: the £130.07 global sum, QOF at £227.95 a point, 15% employer NI, 14.38% employer pension, locum rates and partner tax. Cards marked <b>Real figures</b> or <b>Real rule</b> show their sources.</p><p>It's a simplified model of a GMS practice, not financial, tax or medical advice. The practices, people and companies are fictional. Not affiliated with the NHS, the BMA or any government body.</p>`)}
        ${explain('Privacy', `<p>Your game is saved only in this browser. Nothing about you is sent anywhere unless you post a score to the leaderboard. That stores the name you choose, your score, your practice and your year's results, publicly, with no email or other details. Use a nickname if you like.</p><p>The page loads its fonts from Google Fonts, and the website's host keeps standard access logs. There are no adverts, analytics or tracking cookies.</p>`)}
      </div>
    </section>
    <section class="setup" aria-label="New game">
      <label class="field" for="docname">Your name
        <div class="name-row"><span>Dr</span><input id="docname" maxlength="24" autocomplete="off" placeholder="Surname" value="${esc(UI.nameDraft)}"></div>
      </label>
      <div class="field" style="display:grid;gap:8px"><b>Choose your practice</b><div class="pcards">${pc}</div></div>
      <div class="setup-actions">
        <button class="btn primary" data-act="start">Sign the partnership deed</button>
        ${boardOn() ? '<button class="btn ghost" data-act="board">Leaderboard</button>' : ''}
        ${saved ? `<button class="btn" data-act="continue">Continue: ${esc(PRACTICES[saved.practiceKey].surgery)}, ${MONTHS[Math.min(saved.month, 11)]}</button>` : ''}
      </div>
      ${(() => { const w = weeklyChallenge(); return `<div class="weekly"><div class="eyebrow">Weekly challenge · ${w.week}</div><p>The brutal one: <b>${esc(PRACTICES[w.practice].surgery)}</b>. Everyone gets the same goal, the same twist and the same luck this week. Compare scores on the leaderboard.</p><button class="btn" data-act="weekly">Play this week's challenge</button></div>`; })()}
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
function whyList(why) {
  if (!why.length) return '<p class="fc-note">Nothing unusual. It sits near its natural level.</p>';
  return `<ul class="why">${why.map(([d, l]) => `<li><span class="${d > 0 ? 'good-t' : 'bad-t'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</span> ${esc(l)}</li>`).join('')}</ul>`;
}
function headingHTML(c) {
  return STAT_KEYS.map(k => {
    const now = Math.round(S.st[k]), T = c.T[k].v, next = Math.round(S.st[k] + (T - S.st[k]) * DRIFT[k]);
    const dir = T > now + 1 ? 'up' : T < now - 1 ? 'down' : 'flat';
    return `<details class="explain heading"><summary><span class="hd-ic">${ICON[k]}</span><span class="hd-l">${STAT_LABEL[k]}</span><span class="hd-v mono">${now} → <b class="${dir === 'up' ? 'good-t' : dir === 'down' ? 'bad-t' : ''}">${next}</b></span><span class="hd-t mono" title="Where it settles if nothing changes">settles at ${T}</span></summary><div class="explain-body">${whyList(c.T[k].why)}</div></details>`;
  }).join('');
}
function renderPlan() {
  const pl = S.plan, c = calc(), p = prac();
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
    const arrsFull = (R.arrs && arrsCount() >= ARRS_CAP) || (r === 'salaried' && gpHeadroom() < 6);
    const costTxt = (R.arrs ? 'PCN-funded' : `£${(R.cost * 12).toFixed(1)}k a year each, all in`) + (R.room ? `, ${R.room} room sessions a week` : r === 'recep' ? ', no clinic room' : '');
    return `<div class="role"><div class="l"><b>${esc(R.name)}</b>${R.arrs ? '<span class="tag arrs">ARRS</span>' : ''}${vac ? `<span class="tag vac">${vac} advertised</span>` : ''}<small>${esc(R.desc)} ${costTxt}.</small></div>
      <span class="n" aria-label="${n} in post">${n}</span>
      <div class="acts">${vac ? `<button data-act="unvac" data-arg="${r}">Withdraw ad</button>` : ''}<button data-act="hire" data-arg="${r}" ${arrsFull ? `disabled title="${r === 'salaried' ? 'No GPs are applying in this area' : 'The PCN\'s additional-roles budget is fully used'}"` : ''}>Recruit</button><button data-act="fire" data-arg="${r}" ${n ? '' : 'disabled'}>Let go</button></div></div>`;
  }).join('');
  const ratio = c.ratio;
  const gcls = ratio >= 0.94 ? '' : ratio >= 0.85 ? 'warn' : 'bad';
  const ratioWord = ratio >= 1.05 ? 'Comfortable' : ratio >= 0.97 ? 'Just about' : ratio >= 0.9 ? 'Stretched' : ratio >= 0.8 ? 'Overwhelmed' : 'Collapse';
  const inboxCls = c.inboxEnd > 700 ? 'bad-t' : c.inboxEnd > 400 ? 'warn-t' : 'good-t';
  const w = weightedList(), qof100 = qofValueK(100);
  const moneyRows = [
    ['Global sum', c.inc.gs, `${Math.round(w).toLocaleString('en-GB')} weighted patients × £${P.gs} × (1 − 4.7% out-of-hours opt-out) ÷ 12`],
    ['QOF aspiration', c.inc.qof, `80% of last year's QOF (${p.lastQof}%) ÷ 12`],
    ['Network participation', c.inc.npp, `£${P.npp} × weighted list ÷ 12`],
    ['Vaccinations', c.inc.vacc, FLU_MONTHS.includes(S.month) ? 'Flu season: September to January' : 'Childhood and routine immunisations'],
    ['Enhanced services', c.inc.es, c.serviceF < 0.98 ? `Only ${pct(c.serviceF)} claimed: not enough appointments to deliver them all` : 'Local and national enhanced services'],
    ['PCN', c.inc.pcn, 'Your share of PCN funding'],
    ['Private fees', c.inc.priv, 'Reports, medicals and letters'],
    ...(c.modCash ? [['Schemes, leases and extras', c.modCash, 'From earlier decisions']] : []),
    ['Staff', -c.cost.staff, 'Salaries plus 15% employer NI above £5,000 and 14.38% employer pension'],
    ...(c.cost.locum ? [['Locums and overtime', -c.cost.locum, [pl.locum ? `${pl.locum} locum sessions a week × £${Math.round(LOCUM_SESSION * 1000)}` : '', pl.extra ? `${pl.extra} overtime clinics a week × £${Math.round(OT_SESSION * 1000)}` : ''].filter(Boolean).join(', ') + ' × 4.33 weeks']] : []),
    ...(c.cost.cover ? [['Sickness cover and incidents', -c.cost.cover, 'Low morale means sickness and cover. Unsafe care means incidents to investigate.']] : []),
    ['Running costs and premises', -c.cost.running, 'Office, IT, insurance, CQC fee, supplies, unreimbursed premises costs'],
    ['Partners\' drawings', -c.out.draw, `${c.partnersN} × £${DRAW[pl.draw]}k`],
    ['Partners\' pension contributions', -c.out.pension, `${Math.round(pensionRate(c.estShare * 0.95) * 1000) / 10}% of pensionable profit, paid monthly`]
  ];
  const moneyTable = `<dl class="kv small">${moneyRows.map(([l, v, how]) => `<dt>${esc(l)}<small>${esc(how)}</small></dt><dd class="${v < 0 ? '' : 'good-t'}">${v < 0 ? '−' : '+'}${fmtK(Math.abs(v))}</dd>`).join('')}<dt class="sum">Net this month</dt><dd class="sum">${signK(c.net)}</dd></dl>`;
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap">
    <div class="plan-head"><div><div class="eyebrow">Month plan</div><h1>${MONTHS[S.month]}</h1></div><p class="brief">${esc(BRIEF[S.month])} ${S.queue.length} things will land on your desk this month.${S.month === 0 ? (S.practiceKey === 'city' ? ' Nobody is going to tell you what to do here. Set your clinical sessions and pick a project; everything else can wait.' : ' New here? Set your clinical sessions and pick a project, or let Bev suggest a plan. Everything else can wait.') : ''}</p>${S.practiceKey === 'city' ? '' : '<button class="btn small" data-act="suggest" title="Sets sessions, cover, drawings and project for this month">Suggest a plan</button>'}</div>
    <div class="plan-grid">
      ${(() => { const Ty = c.T.you.v; const winterAhead = S.month >= 6 && S.month <= 9; if (!(winterAhead && Ty < 42) && !(S.st.you < 30)) return ''; return `<div class="warnbox" role="note"><b>${winterAhead ? 'Winter is coming for you.' : 'You are running on empty.'}</b> ${winterAhead ? 'January and February are when most partners burn out, and' : ''} your You meter is at ${Math.round(S.st.you)} and heading for ${Ty}. Book a week of leave, drop a clinical session, or add cover now, before the winter peak.</div>`; })()}
      <div class="col">
        <section class="panel" aria-labelledby="h-week">
          <h3 id="h-week">Your week <small>${total} sessions, about ${Math.round(c.hours)} hours once everything's counted</small></h3>
          <div class="sessbar" aria-hidden="true">${sessBar}</div>
          <div class="legend"><span style="--c:var(--accent)">Clinical: ${pl.clin * 14} appointments</span><span style="--c:var(--hilite)">Admin: clears inbox</span><span style="--c:var(--stamp)">Management: QOF and safety</span></div>
          <div class="steps">
            <div class="step"><div class="l"><b>Clinical sessions</b><small>Surgeries, triage, visits. 14 appointments each.</small></div>${stepper('clin', pl.clin, pl.clin <= 0, total >= 12, 'Clinical sessions')}</div>
            <div class="step"><div class="l"><b>Admin sessions</b><small>Results, letters, scripts. About 55 items each.</small></div>${stepper('admin', pl.admin, pl.admin <= 0, total >= 12, 'Admin sessions')}</div>
            <div class="step"><div class="l"><b>Management sessions</b><small>Running the business: QOF, CQC readiness, governance.</small></div>${stepper('mgmt', pl.mgmt, pl.mgmt <= 0, total >= 12, 'Management sessions')}</div>
          </div>
          <label class="toggle" for="leave"><input type="checkbox" id="leave" ${pl.leave ? 'checked' : ''} ${leaveLeft <= 0 && !pl.leave ? 'disabled' : ''}> Take a week of annual leave this month <span class="muted">(${leaveLeft} of 6 weeks left)</span></label>
          ${explain('What a session really costs you', `<p>A session is nominally 4 hours 10 minutes. Once the results, letters and phone calls that spill over are counted, partners work about ${P.realHours} hours per session: seven or eight sessions is roughly a 46-hour week.</p><p>Your total hours set where the <b>You</b> meter settles. Evening inbox work, demand running ahead of capacity, supervising ARRS clinicians and being short of partners all add hours.</p><p>BMA safe-working guidance suggests 25 patient contacts per GP per day.</p>${srcLinks(['S36', 'S38'])}`)}
          <div class="step" style="border:0"><div class="l"><b>Partners' drawings</b><small>What each partner takes home each month, on account.</small></div>
            <div class="seg" role="group" aria-label="Drawings">${['low', 'std', 'high'].map(k => `<button data-act="draw" data-arg="${k}" aria-pressed="${pl.draw === k}">${k === 'low' ? 'Lean' : k === 'std' ? 'Standard' : 'Generous'} £${DRAW[k]}k</button>`).join('')}</div></div>
          ${explain('Drawings, pension and the tax bill', `<p>Drawings are payments on account of profit. On top, the practice pays each partner's NHS pension contributions: the member rate, up to 12.5%, plus the 14.38% employer share. Drawings aren't profits. At year end the accountant works out each partner's real share, and if drawings ran ahead, partners pay the difference back.</p><p>Income tax and Class 4 NI come later, through Self Assessment on 31 January and 31 July. A new partner's first bill can arrive about 22 months after joining, all at once.</p><p>Lean drawings protect the bank but weigh on you and on Nadia.</p>${srcLinks(['S21', 'S22', 'S23'])}`)}
        </section>
        <section class="panel" aria-labelledby="h-proj">
          <h3 id="h-proj">This month's project <small>Pick one.</small></h3>
          <div class="projects">${projs}</div>
          ${explain('How projects work', '<p>Effects land at the end of the month. Most are one-off boosts that fade as meters drift back toward where the practice\'s situation is taking them. A few change the situation itself: a mock CQC inspection leaves lasting improvements, and cloud telephony keeps patients happier for good.</p><p>Chasing unclaimed income finds less each time you do it.</p>')}
        </section>
        <details class="more-opts"${S.month < 2 ? '' : ' open'}><summary>More options: extra capacity and your team</summary>
        <section class="panel" aria-labelledby="h-locum">
          <h3 id="h-locum">Extra capacity <small>Locums at £${Math.round(LOCUM_SESSION * 1000)} a session, or your own staff on overtime at about £${Math.round(OT_SESSION * 1000)}.</small></h3>
          <div class="step" style="border:0"><div class="l"><b>Locum sessions per week</b><small>${pl.locum ? `${pl.locum * 14} extra appointments, about ${fmtK(c.cost.locum)} this month` : 'None booked'}</small></div>${stepper('locum', pl.locum, pl.locum <= 0, pl.locum >= locumMax(), 'Locum sessions')}</div>
          <div class="step" style="border:0"><div class="l"><b>Evening and Saturday clinics</b><small>${pl.extra ? `${pl.extra * OT_APPTS} extra appointments from your own staff on overtime, about ${fmtK(pl.extra * WEEKS * OT_SESSION)} this month` : 'None this month'}</small></div>${stepper('extra', pl.extra || 0, !(pl.extra > 0), (pl.extra || 0) >= OT_MAX, 'Evening and Saturday clinics')}</div>
          ${explain('Overtime clinics or locums?', `<p>An evening or Saturday clinic is run by your own salaried GPs and nurses on overtime, with a receptionist. At sessional rates plus employer NI and pension, that's about £${Math.round(OT_SESSION * 1000)} for ${OT_APPTS} appointments, much cheaper than a locum, and they know your patients and do their own paperwork.</p><p>They run outside core hours, so they don't take up a consulting room. The cost is tiredness: each weekly overtime session pulls Team down. Up to ${OT_MAX} a week.</p>`)}
          ${explain('What a locum costs', `<p>Typical in-hours GP locum rates in 2026 are £85 to £105 an hour, and agencies keep 15 to 25%. A 4h10m session at £100 an hour, plus 14.38% employer pension on NHS locum work, comes to about £${Math.round(LOCUM_SESSION * 1000)}.</p><p>Locums add appointments straight away, with no recruitment wait. They don't do results or letters, so each session adds a few items to your inbox.</p>${srcLinks(['S28', 'S22'])}`)}
        </section>
        <section class="panel" aria-labelledby="h-team">
          <h3 id="h-team">Team <small>ARRS ${arrsCount()}/${ARRS_CAP} · room sessions ${c.rNeed} of ${c.rAvail} booked · receptionists ${S.staff.recep} of ${c.recepNeed} needed</small></h3>
          ${explain('Staff costs, ARRS and recruitment', `<p>Every salary carries 15% employer NI above £5,000. GP practices can't claim the Employment Allowance that offsets NI for most small employers. Staff in the NHS Pension Scheme also cost 14.38% employer pension.</p><p>ARRS roles (pharmacists, physios, paramedics and others) are reimbursed through the PCN up to a cap for each role, so they cost the practice little. Clinicians still need somewhere to see patients, and supervising more than two adds to your hours.</p><p><b>Rooms are booked by the session.</b> Your ${S.rooms + activeMods().reduce((a, m) => a + (m.rooms || 0), 0)} consulting and treatment rooms give about ${ROOM_SESSIONS} bookable sessions a week each: ten core half-days, Monday to Friday mornings and afternoons, less one lost to double-bookings, cleaning and practice meetings. Evening and Saturday clinics are outside core hours, so they don't count. A meeting room can be turned into a clinic room as a project. A GP books a room for each clinical session. A nurse books about 8 a week, a pharmacist or paramedic about 4 (the rest is phone work or home visits). Receptionists work on headsets at the front desk, and care coordinators, social prescribers and GP assistants don't need a clinic room.</p><p>Recruiting opens an advert. Results come at month end and can fail. Low morale and a poor local reputation make it harder. Letting someone go hurts morale.</p>${srcLinks(['S19', 'S20', 'S22', 'S4'])}`)}
          ${explain('How you compare with England', `<dl class="kv small">${benchmark().map(([l, you, nat, how]) => `<dt>${esc(l)}${how ? `<small>${esc(how)}</small>` : ''}</dt><dd><b class="${you < nat * 0.85 ? 'warn-t' : ''}">${you.toFixed(1)}</b> <span class="muted">vs ${nat.toFixed(1)}</span></dd>`).join('')}</dl><p>England averages for ${S.list.toLocaleString('en-GB')} patients, from the August 2026 workforce figures: about 4.6 fully qualified GPs, 2.6 nurses, 2.9 other clinical staff and 12.3 admin and reception staff per 10,000 patients. That's about ${Math.round(BENCH.patients / BENCH.gp).toLocaleString('en-GB')} patients per full-time GP. Averages aren't targets: an older or poorer list needs more.</p>${srcLinks(['S58', 'S59'])}`)}
          ${p.gpCap ? `<div class="fc-note"><p class="${gpHeadroom() < 6 ? 'bad-t' : ''}"><b>GPs are hard to find here.</b> Practices like yours can't recruit past about one GP per ${p.gpCap.toLocaleString('en-GB')} patients, against ${Math.round(BENCH.patients / BENCH.gp).toLocaleString('en-GB')} nationally. ${gpHeadroom() < 6 ? 'Nobody will apply for a salaried GP post unless your GP numbers fall below that.' : 'There\'s room for one more salaried GP.'} Locums are scarce too: at most ${locumMax()} sessions a week.</p>${explain('Why', `<p>GP numbers vary a lot by area. The worst-covered ICB, North West London, had one full-time GP for every 2,746 patients in late 2025, against about 2,200 nationally. Parts of Kent and Medway are worse: about 38 GPs per 100,000 people against 60 nationally, with some practices far beyond that. Deprived areas usually have the most patients per GP and the hardest time recruiting.</p>${srcLinks(['S66', 'S67', 'S59'])}`)}</div>` : ''}
          <details class="rolebox"${narrow() ? '' : ' open'}><summary>Staff, vacancies and recruitment</summary><div class="roles">${roles}</div></details>
        </section>
        </details>
      </div>
      <aside class="panel forecast" aria-labelledby="h-fc">
        <h3 id="h-fc">Forecast <small>before whatever happens this month</small></h3>
        <div class="fc-row"><div class="top"><span>Appointments per week</span><b>${c.cap} / ${c.demand}</b></div>
          <div class="gauge ${gcls}"><b style="width:${Math.min(100, ratio * 80)}%"></b><i style="left:80%"></i></div>
          <div class="fc-note"><span class="${gcls === 'bad' ? 'bad-t' : gcls === 'warn' ? 'warn-t' : 'good-t'}"><b>${ratioWord}</b></span>: offering ${pct(ratio)} of what patients will ask for. The line marks 100%.</div>
          ${explain('How demand is worked out', `<p>Your ${S.list.toLocaleString('en-GB')} patients generate about ${(p.demandRate * 52).toFixed(1)} contacts each a year, more in winter. Since 2026/27 practices can't cap online requests: urgent needs the same day, non-urgent by the end of the next working day.</p><p>Capacity comes from you, the other partners, salaried GPs, nurses, HCAs, ARRS clinicians and locums. It's reduced when reception or rooms are short, or when morale is low.</p>${srcLinks(['S1'])}`)}</div>
        <div class="fc-row"><div class="top"><span>Inbox</span><b>${Math.round(S.inbox)} → <span class="${inboxCls}">${c.inboxEnd}</span></b></div>
          <div class="fc-note">${c.inflow} in and ${c.clear} cleared each week. Over 400 costs you evenings and safety; over 700 it gets dangerous.</div></div>
        <div class="fc-row"><div class="top"><span>Cash this month</span><b class="${c.net >= 0 ? 'good-t' : 'bad-t'}">${signK(c.net)}</b></div>
          ${explain('Where the money comes from and goes', moneyTable + srcLinks(['S3', 'S4', 'S9', 'S19', 'S22']))}</div>
        <div class="fc-row"><div class="top"><span>QOF</span><b>${Math.round(S.qof)}% → ${Math.round(Math.min(100, S.qof + c.qofGain * clamp((100 - S.qof) / 35, 0.2, 1)))}%</b></div>
          ${explain('How QOF pays', `<p>582 points at £227.95 each for an average-sized practice, scaled for your list and prevalence: 100% is worth about ${fmtK(qof100)} to this practice. You're paid 80% of last year's value monthly (${fmtK(S.qofAsp)} a month). The balance for what you achieve by 31 March is due by the end of next June. Fall short, and some comes back.</p><p>Nurses, HCAs, pharmacists, care coordinators and your management time push QOF up. Gains get harder near the top.</p>${srcLinks(['S3', 'S13'])}`)}</div>
        <div class="fc-row"><div class="top"><span>Where things are heading</span></div>
          <div class="headings">${headingHTML(c)}</div>
          ${explain('How the meters move', '<p>Each month, every meter moves part of the way toward where your practice\'s situation is taking it: capacity against demand, the inbox, staffing, pay, rooms, your hours and your reputation. Open a meter above to see why.</p><p>Decisions give one-off jolts that fade, unless they change the situation. Hiring, pay, policies, rooms and hours change where things settle. Some decisions come back months later.</p>')}</div>
        ${c.roomsOver ? `<p class="fc-note bad-t">${c.rNeed - c.rAvail} clinic sessions a week have no room. Capacity and morale will suffer.</p>` : ''}
        ${c.recepShort ? `<p class="fc-note bad-t">Reception is ${c.recepShort} short for a list this size.</p>` : ''}
        <button class="btn primary" data-act="begin" style="justify-self:start">Start ${MONTHS[S.month]} →</button>
      </aside>
    </div>
  </div></main>
  <div class="mgo"><span><b class="${gcls === 'bad' ? 'bad-t' : gcls === 'warn' ? 'warn-t' : 'good-t'}">${ratioWord}</b> · cash <b class="${c.net >= 0 ? 'good-t' : 'bad-t'}">${signK(c.net)}</b></span><button class="btn primary" data-act="begin">Start ${MONTHS[S.month]} →</button></div>`;
  const lv = document.getElementById('leave');
  if (lv) lv.addEventListener('change', () => { S.plan.leave = lv.checked; save(); keepScroll(renderPlan); });
}
function keepScroll(fn) { const y = window.scrollY; const open = [...document.querySelectorAll('details[open] > summary')].map(s => s.textContent); fn(); document.querySelectorAll('details > summary').forEach(s => { if (open.includes(s.textContent)) s.parentElement.open = true; }); window.scrollTo(0, y); }

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
    if (fx.aim || fx.mod) out.lasting = 1;
    if (fx.later || fx.sched) out.later = 1;
  };
  add(c.fx); if (c.alt) add(c.alt.fx);
  if (c.later) out.later = 1;
  return out;
}
function chipsFor(c) {
  if (c.play) return `<div class="chips"><span class="chip">Mini-game: your skill decides the effect</span></div>`;
  const h = hintFor(c);
  const parts = [];
  for (const k of ['patients', 'team', 'you', 'safety', 'cash']) if (h[k]) parts.push(`<span class="chip" title="Affects ${STAT_LABEL[k]}">${ICON[k]}<span class="dot${h[k] >= 6 ? ' big' : ''}"></span></span>`);
  if (h.qof) parts.push(`<span class="chip">QOF<span class="dot${h.qof >= 6 ? ' big' : ''}"></span></span>`);
  if (h.inbox) parts.push(`<span class="chip">Inbox<span class="dot${h.inbox >= 6 ? ' big' : ''}"></span></span>`);
  if (h.lasting) parts.push(`<span class="chip lasting" title="Changes where a meter settles, not just today">Lasting</span>`);
  if (h.later) parts.push(`<span class="chip later" title="Something from this may come back in a later month">Comes back later</span>`);
  if (c.alt) parts.push(`<span class="chip risk" title="The outcome is uncertain">Gamble</span>`);
  if (!parts.length && c.run) parts.push(`<span class="chip">Consequences to follow</span>`);
  return parts.length ? `<div class="chips">${parts.join('')}</div>` : '';
}
function tagPill(e) { const t = e.tag || 'story'; return `<span class="tagpill t-${t}">${TAG_LABEL[t] || 'Fiction'}</span>`; }
function renderEvent() {
  const e = currentEvent();
  if (!e) { advanceEvent(); return render(); }
  const n = S.qi + 1, tot = S.queue.length;
  const choices = e.choices.map((c, i) => {
    let ok = true; try { ok = !c.need || c.need(); } catch (err) { ok = false; }
    const h = JSON.stringify(hintFor(c));
    return `<button class="choice" data-act="choose" data-arg="${i}" data-hint='${esc(h)}' ${ok ? '' : 'disabled'}><span class="t"><span class="kbd">${i + 1}</span> ${esc(fill(val(c.t)))}</span>${ok ? chipsFor(c) : `<span class="why">${esc(c.why || 'Not available')}</span>`}</button>`;
  }).join('');
  const info = e.info ? explain(e.tag === 'speculative' ? 'What\'s invented here?' : 'What\'s real here?', `<p>${esc(fill(e.info))}</p>${srcLinks(e.src)}`, 'real') : '';
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap">
    <article class="card" aria-live="polite">${badge(e.who)}<span class="stampno">${MON3[S.month]} · ${Math.min(n, tot)}/${tot}</span></div>
      <div class="card-title-row"><h2>${esc(fill(e.title))}</h2>${tagPill(e)}</div>
      <div class="text"><p>${esc(fill(val(e.text)))}</p></div>
      ${info}
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
  const notes = [];
  if (S.cur.lasting) notes.push('This changes where things settle, not just today.');
  if (S.cur.echoes) notes.push('Something from this decision may come back in a later month.');
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap">
    <article class="card outcome">${badge(e.who || 'you')}<span class="stampno">${S.cur.alt ? 'Gamble lost' : 'Outcome'}</span></div>
      <div class="card-title-row"><h2>${esc(fill(e.title || ''))}</h2>${tagPill(e)}</div>
      <div class="text"><p>${esc(S.cur.o)}</p></div>
      ${S.cur.html || ''}
      ${deltaChips(S.cur.deltas)}
      ${notes.length ? `<p class="echo">${notes.map(esc).join(' ')}</p>` : ''}
      <div class="card-foot"><span class="muted kbd-only">Press Enter to continue</span><button class="btn primary" data-act="cont">${S.exit ? 'Sign the papers' : over ? 'Uh oh…' : 'Continue'}</button></div>
    </article></div></main>`;
  pulse(S.cur.deltas);
}
function pulse(ds) {
  (ds || []).forEach(d => {
    const m = document.querySelector(`[data-meter="${d.k}"]`);
    if (m) { m.classList.add(d.good ? 'pulse-up' : 'pulse-down'); setTimeout(() => m.classList.remove('pulse-up', 'pulse-down'), 1400); }
  });
}
