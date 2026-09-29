/* ===================== UI 1: helpers, HUD, title, planner, cards ===================== */
const $app = document.getElementById('app');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtK = v => (v < 0 ? '−£' : '£') + Math.abs(v).toFixed(1) + 'k';
const signK = v => (v > 0 ? '+' : v < 0 ? '−' : '') + '£' + Math.abs(v).toFixed(1) + 'k';
const gbp = v => (v < 0 ? '−£' : '£') + Math.round(Math.abs(v)).toLocaleString('en-GB');
const pct = v => Math.round(v * 100) + '%';
let UI = { screen: 'title', pickPractice: 'town', nameDraft: '', look: { s: 0, c: 0 } };
// settings kept in this browser; the 45-second card timer is off by default
// The maker's own product, shown as a clearly labelled panel on the title and year-end screens (there after the
// practice's figures), never inside cards. Website only: hidden inside the Claude Artifact (framed) and while `url` is empty.
const SPONSOR = { name: 'Datim-QI', line: 'An AI quality improvement analyst to support GP practice management.', url: 'https://datim-qi.uk' };
function sponsorHTML() {
  if (!SPONSOR.url) return '';
  let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (framed) return '';
  return `<aside class="sponsor" aria-label="From the maker of this game"><div class="eyebrow">From the maker of this game</div><div class="sp-body"><b class="sp-name">${esc(SPONSOR.name)}</b><p>${esc(SPONSOR.line)}</p></div><a class="btn primary" href="${esc(SPONSOR.url)}" target="_blank" rel="noopener sponsored">Visit ${esc(SPONSOR.url.replace(/^https?:\/\//, ''))} →</a></aside>`;
}
// At the end of every game, a signpost to a charity for health workers' mental health. It isn't an advert or a
// partner: the charity has nothing to do with the game, and the panel says so. Shown everywhere, the Artifact included.
const SUPPORT = { name: 'Doctors in Distress', url: 'https://doctors-in-distress.org.uk/' };
function supportHTML() {
  return `<aside class="support" aria-label="Support for doctors and health workers"><h3>If the real job is weighing on you</h3><p><b>${esc(SUPPORT.name)}</b> is a UK charity that supports the mental health of doctors and other healthcare workers and works to reduce burnout. It runs facilitated peer support groups, webinars and workshops.</p><a href="${esc(SUPPORT.url)}" target="_blank" rel="noopener">doctors-in-distress.org.uk</a><p class="fc-note">Doctors in Distress isn't involved with this game or website.</p></aside>`;
}
const SETTINGS_KEY = 'lps-settings-v1', CARD_SECONDS = 45;
function loadSettings() { try { return Object.assign({ timer: false, quick: true, teach: true }, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch (e) { return { timer: false, quick: true, teach: true }; } }
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(UI.settings)); } catch (e) { } }
UI.settings = loadSettings();
function timeUp(id, qi) {
  if (!S || S.phase !== 'event' || S.qi !== qi || S.queue[qi] !== id) return;
  const e = currentEvent(); if (!e) return;
  const ok = e.choices.map((c, i) => i).filter(i => { const c = e.choices[i]; try { return !c.play && (!c.need || c.need()) && !String(c.run || '').includes('S.exit'); } catch (err) { return false; } });
  if (!ok.length) return;
  const i = ok[Math.floor(_rand() * ok.length)];
  go(() => { resolveChoice(i, { fx: { you: -2, team: -1, patients: -1 } }); S.cur.o = `Time's up. You didn't decide, so it got decided for you: "${fill(val(e.choices[i].t))}". ` + S.cur.o; S.cur.timeout = 1; });
}
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
  const ring = key === 'you' ? playerColour() : c.c;
  const nm = key === 'you' ? 'Dr ' + S.name : name;
  return `<div class="who"><div class="portrait" style="--ring:${ring}">${portraitSVG(key, 52)}</div><div><b>${esc(nm)}</b><small>${esc(key === 'you' ? 'You' : c.role)}</small></div>`;
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
      <div class="month-label">${MONTHS[Math.min(S.month, 11)]} ${calY(S.month)} · ${S.yr ? `year ${S.yr + 1}, ` : ''}month ${Math.min(S.month, 11) + 1} of 12</div>
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
  // first-time players see a shorter title screen: the look picker, options and the weekly challenge fold away
  const first = !saved && !loadPlaques().length;
  const pc = Object.values(PRACTICES).map(p => `<button class="pcard" data-act="pick" data-arg="${p.key}" aria-pressed="${UI.pickPractice === p.key}">
      <b>${esc(p.surgery)}</b><span class="diff">${p.diff}</span>
      <span class="d">${esc(p.label)}. ${esc(p.blurb)}</span>
      <span class="facts">${p.list.toLocaleString('en-GB')} patients · bank ${fmtK(p.cash)} · overdraft limit ${fmtK(p.overdraft)}</span></button>`).join('');
  $app.innerHTML = `<main class="title-screen"><div class="wrap title-grid">
    <section>
      <div class="eyebrow">A general practice survival game</div>
      <h1 class="logo" style="margin-top:12px">Last<br>Partner<span class="rx">Rx</span><br><span class="under">Standing</span></h1>
      <p class="tagline">A year on England's 2026/27 GP contract, then as many more as you can survive. Five things to keep alive, including you.</p>
      ${avgLineHTML()}
      <div class="memo"><b>Your year as a new GP partner</b>
        <ul>
          <li>Each month, set your week, your cover, your team and one project.</li>
          <li>Then deal with what lands on your desk: patients, staff, the ICB, CQC, the roof.</li>
          <li>Meters drift toward wherever your practice's situation is taking them. Decisions come back to you, sometimes months later.</li>
          <li>Survive to 31st March 2027 and the accountant tells you what it was all worth, after tax. Then carry on, for as long as you can last.</li>
        </ul>
        ${explain('About the numbers', `<p>The money runs on real 2026/27 figures for England: the £130.07 global sum, QOF at £227.95 a point, 15% employer NI, 14.38% employer pension, locum rates and partner tax. Cards marked <b>Real figures</b> or <b>Real rule</b> show their sources.</p><p>It's a simplified model of a GMS practice, not financial, tax or medical advice. The practices, people and companies are fictional. Not affiliated with the NHS, the BMA or any government body.</p>`)}
        ${explain('Privacy', `<p>Your game is saved only in this browser. If you post a score to the leaderboard, it stores the name you choose, your score, your practice and your year's results, publicly, with no email or other details. Use a nickname if you like.</p><p>On the website, the game also counts games, without names: when one starts, is picked up again, finishes a year, carries on, ends or is taken over, with the practice, the year, how long it has lasted, how it went (the year's title and score, or what ended it) and the game's version. Each game is known only by a random number made when it starts, so nothing links the counts to you or to the leaderboard, and only the game's maker can read them.</p><p>Vercel Web Analytics counts visits: which page, the site that sent you, your country, and your type of device, browser and operating system. It uses no cookies and stores nothing on your device, and each visitor is known only by a code that is discarded after 24 hours. The page also loads its fonts from Google Fonts, and the hosts of the website and the database keep standard access logs. There are no adverts or tracking cookies.</p>`)}
      </div>
    </section>
    <section class="setup" aria-label="New game">
      <div class="field maker-field"><b>You, the new partner</b>
        <div class="maker">
          <div class="portrait big" style="--ring:${playerColour()}">${portraitSVG('player', 96)}</div>
          ${first ? `<details class="explain maker-more" ${UI.lookOpen ? 'open' : ''}><summary>Change how you look</summary>` : ''}
          <div class="maker-picks">
            <div class="looks" role="group" aria-label="Choose your silhouette">${PLAYER_LOOKS.map((l, i) => `<button class="look" data-act="look" data-arg="${i}" aria-pressed="${UI.look.s === i}" aria-label="Silhouette ${i + 1}"><svg viewBox="0 0 64 64" width="40" height="40"><rect width="64" height="64" rx="10" fill="${SIL_TILE}"/><g transform="translate(3.2 6.4) scale(0.9)">${silLook(l)}</g></svg></button>`).join('')}</div>
            <div class="swatches" role="group" aria-label="Choose your colour">${PLAYER_COLOURS.map((c, i) => `<button class="swatch" data-act="lookc" data-arg="${i}" aria-pressed="${UI.look.c === i}" aria-label="Colour ${i + 1}" style="--sw:${c}"></button>`).join('')}</div>
          </div>
          ${first ? '</details>' : ''}
        </div>
        <label class="name-row" for="docname"><span>Dr</span><input id="docname" maxlength="24" autocomplete="off" placeholder="Surname" value="${esc(UI.nameDraft)}"><button class="dice" data-act="dice" type="button" aria-label="Roll a random name" title="Roll a random name"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor"/></svg></button></label>
      </div>
      <div class="field" style="display:grid;gap:8px"><b>Choose your practice</b><div class="pcards">${pc}</div></div>
      <details class="explain opts"><summary>Options${UI.settings.timer ? ': the 8am pace is on' : ''}</summary>
        <label class="toggle"><input type="checkbox" data-act="timer" ${UI.settings.timer ? 'checked' : ''}> <span><b>The 8am pace</b>: ${CARD_SECONDS} seconds to decide each card, or it gets decided for you. Off by default.</span></label>
        <label class="toggle"><input type="checkbox" data-act="quick" ${UI.settings.quick ? 'checked' : ''}> <span><b>Skip quiet months</b>: when nothing new happened, go straight to the next plan and show last month in a short panel. On by default.</span></label>
        <label class="toggle"><input type="checkbox" data-act="teach" ${UI.settings.teach ? 'checked' : ''}> <span><b>Explain the contract as you go</b>: in the leafy suburb and the market town, someone asks how the money works and you explain it with your practice's own figures. Six cards through year one. On by default.</span></label>
      </details>
      <div class="setup-actions">
        <button class="btn primary" data-act="start">Sign the partnership deed</button>
        ${boardOn() ? '<button class="btn ghost" data-act="board">Leaderboard</button>' : ''}
        ${saved ? `<button class="btn" data-act="continue">Continue: ${esc(PRACTICES[saved.practiceKey].surgery)}, ${saved.phase === 'end' ? 'year end' : MONTHS[Math.min(saved.month, 11)]}${saved.yr ? `, year ${saved.yr + 1}` : ''}</button>` : ''}
      </div>
      ${(() => { const w = weeklyChallenge(); return `${first ? '<details class="explain"><summary>Weekly challenge</summary>' : ''}<div class="weekly"><div class="eyebrow">Weekly challenge · ${w.week}</div><p>The brutal one: <b>${esc(PRACTICES[w.practice].surgery)}</b>. Everyone gets the same goal, the same twist and the same luck this week. Compare scores on the leaderboard.</p><button class="btn" data-act="weekly">Play this week's challenge</button></div>${first ? '</details>' : ''}`; })()}
      ${sponsorHTML()}
      ${loadPlaques().length ? partnersBoardHTML(5) + (loadPlaques().length > 5 ? '<button class="btn ghost" data-act="honours">The whole board</button>' : '') : ''}
    </section>
  </div></main>`;
  const inp = document.getElementById('docname');
  if (inp) inp.addEventListener('input', () => { UI.nameDraft = inp.value; });
}

/* ---------- planning ---------- */
// which roles the practice is short of, and why (highlighted in the staff list)
function hireNeeds(c) {
  const need = new Set(); need.why = [];
  if (c.recepShort > 0.05) { need.add('recep'); need.why.push(`Reception is ${fteTxt(c.recepShort)} full-time ${c.recepShort > 1.05 ? 'posts' : 'post'} short`); }
  if (c.ratio < 0.95) { ['salaried', 'anp', 'nurse', 'pharm', 'physio', 'para'].forEach(r => need.add(r)); need.why.push('You\'re short of appointments'); }
  if (c.roomsOver) need.why.push('No free clinic rooms: new clinicians will need room sessions');
  return need;
}
// Recruit places one advert, on the hours chosen above it. Once one is out the button says so, and a second takes a deliberate "one more".
function hireBtns(k, desc, via) {
  const ac = advertCost(k), cost = !ac ? 'PCN budget' : ac >= 1 ? `£${ac}k` : `£${Math.round(ac * 1000)}`;
  const lbl = via ? ` ${via}` : '', ads = adsOf(k);
  if (!ads.length) return `<button class="hire" data-act="hire" data-arg="${k}" ${desc ? `aria-describedby="${desc}"` : ''}>Recruit${lbl} <small>${cost}</small></button>`;
  return `<span class="advert">${ads.length} advert${ads.length > 1 ? 's' : ''} out${lbl} <small>${ads.map(u => hrsShort(k, u)).join(', ')}</small></span><button data-act="unvac" data-arg="${k}">Withdraw</button><button data-act="hire" data-arg="${k}" aria-label="Advertise one more${lbl}">+1 more</button>`;
}
// Bev's staffing suggestions under her plan: each with its reason and a one-tap advert on the hours she suggests
const ADVISE_NAME = { arrsnurse: 'A nurse through the PCN', arrsgp: 'A GP through the PCN', salaried: 'A salaried GP', recep: 'A receptionist', anp: 'An advanced nurse practitioner', para: 'A paramedic', physio: 'A first contact physio', sp: 'A social prescriber', gpa: 'A GP assistant', cc: 'A care coordinator', nurse: 'A practice nurse', hca: 'A healthcare assistant', pharm: 'A clinical pharmacist', mhp: 'A mental health practitioner' };
function staffAdviceHTML(list) {
  if (!list) return '';
  const items = list.map((a, i) => a.note ? `<li class="sb-note">${esc(a.note)}</li>`
    : `<li><span><b>${esc(ADVISE_NAME[a.k] || a.k)}, ${esc(hrsTxt(a.k, a.u))}:</b> ${esc(a.why)}.</span>${a.done ? '<span class="sb-done">Advertised ✓</span>' : `<button class="btn small" data-act="advise" data-arg="${i}">Advertise${advertCost(a.k) ? ` <small>${advertCost(a.k) >= 1 ? '£' + advertCost(a.k) + 'k' : '£' + Math.round(advertCost(a.k) * 1000)}</small>` : ''}</button>`}</li>`).join('');
  return `<div class="sb-staff"><b>Staffing</b>${items ? `<ul>${items}</ul><p class="fc-note">Bev only suggests: nothing is advertised until you say so.</p>` : '<p class="fc-note">Nothing to recruit: appointments and reception cover the busiest month ahead.</p>'}</div>`;
}
// the hours chosen for the next advert in each role (full time, or six sessions for a GP, until changed)
const hrsPick = r => (UI.hrs && UI.hrs[r === 'arrsgp' ? 'salaried' : r === 'arrsnurse' ? 'nurse' : r]) || 1;
const hrsBtn = (k, u) => isGP(k) ? String(Math.round(u * 6)) : Math.abs(u - 1) < 0.01 ? 'Full time' : `${+(u * 37.5).toFixed(1)}h`;
const hrsShort = (k, u) => isGP(k) ? `${Math.round(u * 6)} sess.` : hrsBtn(k, u);
const cap1 = t => t.charAt(0).toUpperCase() + t.slice(1);
// "In post: 4 full time, 1 on 22.5 hours, 4.6 FTE"
function postsSummary(r, posts) {
  const g = new Map();
  posts.forEach(p => { const k = (Math.abs(p.u - 1) < 0.01 && !isGP(r) ? 'full time' : `on ${hrsTxt(r, p.u)}`) + (p.pcn ? ', paid by the PCN' : '') + (learning(p) ? ', in preceptorship' : ''); g.set(k, (g.get(k) || 0) + 1); });
  return `In post: ${[...g].map(([k, n]) => `${n} ${k}`).join('; ')}${isGP(r) ? '' : ` (${fteTxt(S.staff[r])} FTE)`}.`;
}

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
// The processes that end a practice, on the plan while they run: the ICB watching access, the team close to walking out,
// care getting unsafe (CQC's concerns) and special measures. Each says how far along it is and the biggest pull on the meter.
function riskHTML(c) {
  const f = S.flags, out = [], line = prac().accessLine || 10;
  const pull = k => { const w = c.T[k].why.filter(x => x[0] < 0).sort((a, b) => a[0] - b[0])[0]; return w ? ` The biggest pull on it: ${w[1].charAt(0).toLowerCase() + w[1].slice(1)}.` : ''; };
  if (f.remedialAt != null && S.st.patients < line) out.push(['The ICB is watching access.', `Patients is at ${Math.round(S.st.patients)}, under the ICB's line of ${line}. Three month-ends in a row under it and the ICB can end the contract (${f.lowAccess || 0} so far).${pull('patients')}`]);
  if (S.st.team < TEAM_LINE) out.push(['The team is close to walking out.', `Team is at ${Math.round(S.st.team)} and heading for ${c.T.team.v}. Below ${TEAM_LINE} at three month-ends in a row, they leave together (${f.lowTeam || 0} so far).${pull('team')}`]);
  const re = S.sched.find(x => x.id === 'cqc_reinspect'), reIn = S.queue.includes('cqc_reinspect') ? 0 : re ? re.m - S.month : -1;
  if (S.cqc && S.cqc.overall === 'i' && reIn >= 0) out.push(['Special measures.', `CQC comes back ${reIn ? `in ${reIn} month${reIn === 1 ? '' : 's'}` : 'this month'}, and a second Inadequate ends the contract. The rating turns mostly on Safe: the Safety meter (now ${Math.round(S.st.safety)}) plus any preparation. Under 32 is Inadequate.`]);
  else if (S.st.safety < SAFETY_LINE) out.push(['Care is getting unsafe.', `Safety is at ${Math.round(S.st.safety)} and heading for ${c.T.safety.v}. Below ${SAFETY_LINE} at two month-ends in a row, concerns reach CQC and an inspector comes unannounced (${f.lowSafety || 0} so far).${pull('safety')}`]);
  return out.map(([h, t]) => `<div class="warnbox" role="note"><b>${esc(h)}</b> ${esc(t)}</div>`).join('');
}
function renderPlan() {
  const pl = S.plan, c = calc(), p = prac();
  // the opening: the lights come on one window at a time and your name goes on the plate (new games only, once)
  const intro = !!UI.intro; UI.intro = false;
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
  const need = hireNeeds(c);
  const yrF = 1 + YEAR_STAFF * (S.yr || 0);
  const roles = ROLE_ORDER.map(r => {
    const R = ROLES[r], posts = postsOf(r), n = posts.length, vac = S.vac[r] || 0, u = hrsPick(r);
    // GPs and nurses can also be recruited through the PCN's additional-roles budget
    const pk = r === 'salaried' ? 'arrsgp' : r === 'nurse' ? 'arrsnurse' : '', pv = pk ? (S.vac[pk] || 0) : 0;
    const arrsFull = r === 'salaried' && gpHeadroom() < 6;
    const claim = R.arrs ? arrsClaimOf(r) * u : 0;
    const over = claim ? Math.min(claim, Math.max(0, claim - arrsLeft())) : 0;
    const week = [R.cap ? `${Math.round(R.cap * u)} appointments` : '', R.room ? `${fteTxt(R.room * u)} room sessions` : r === 'recep' ? 'no clinic room' : ''].filter(Boolean).join(' and ');
    const costTxt = `${cap1(hrsTxt(r, u))}: ` + (R.arrs ? `about £${Math.round(claim)}k a year (${R.band}), claimed from the PCN budget` : `£${(costOf(r, u) * 12 * yrF).toFixed(1)}k a year, all in`) + (week ? `, ${week} a week` : '');
    const pcnN = pk ? pcnPosts(r).length : 0;
    const pcnTxt = !pk ? '' : r === 'salaried'
      ? ` Or recruit through the PCN's additional-roles budget: the PCN claims their real cost, about £${Math.round(pcnClaim(r, u))}k a year, instead of the practice paying it.${pcnN ? ` ${pcnN} of yours ${pcnN === 1 ? 'is' : 'are'} paid this way.` : ''}`
      : ` Or recruit a nurse new to general practice through the PCN's additional-roles budget: the PCN claims their real cost, about £${Math.round(pcnClaim(r, u))}k a year. They start with six months of mentorship and preceptorship, working at about 60% while your nurses mentor them. Your current nurses can't be moved across: nobody who worked in the PCN in the last 12 months can be claimed.${pcnN ? ` ${pcnN} of yours ${pcnN === 1 ? 'is' : 'are'} paid this way.` : ''}`;
    const inPost = n && (isGP(r) || posts.some(p => p.pcn || Math.abs(p.u - 1) > 0.01)) ? `<small class="inpost">${esc(postsSummary(r, posts))}</small>` : '';
    const last = n ? posts[n - 1] : null;
    const hrs = `<div class="hrs" role="group" aria-label="${isGP(r) ? 'Sessions a week' : 'Hours a week'} for a new ${esc(R.name.toLowerCase())}"><span>${isGP(r) ? 'Sessions' : 'Hours'}</span>${hoursOf(r).map(v => `<button data-act="hrs" data-arg="${r}:${v}" aria-pressed="${Math.abs(v - u) < 0.01}">${hrsBtn(r, v)}</button>`).join('')}</div>`;
    return `<div class="role${need.has(r) ? ' need' : ''}"><div class="l"><b>${esc(R.name)}</b>${R.arrs ? '<span class="tag arrs">ARRS</span>' : ''}${vac ? `<span class="tag vac">${vac} advertised</span>` : ''}${pv ? `<span class="tag arrs">${pv} PCN ad${pv > 1 ? 's' : ''} open</span>` : ''}<small>${esc(R.desc)} ${esc(costTxt)}.${esc(pcnTxt)}</small>${inPost}</div>
      <span class="n" aria-label="${n} in post">${n}</span>
      <div class="acts">${hireBtns(r, arrsFull ? `off-${r}` : '')}${pk ? hireBtns(pk, '', 'via PCN') : ''}<button class="fire" data-act="fire" data-arg="${r}" ${n ? `aria-label="Let go of the newest ${esc(R.name.toLowerCase())} (${hrsTxt(r, last.u)})"` : 'disabled'}>Let go${last && (isGP(r) || Math.abs(last.u - 1) > 0.01) ? ` <small>${hrsShort(r, last.u)}</small>` : ''}</button></div>
      ${hrs}
      ${arrsFull ? `<p class="role-off" id="off-${r}">You can advertise, but don't expect anyone: ${esc(prac().place)} already has more GPs than local applicants will fill.</p>` : over > 0.5 ? `<p class="role-off">Over the PCN budget: about <b>£${Math.round(over)}k a year</b> of another one would come from the practice.</p>` : ''}</div>`;
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
    ['Enhanced services', c.inc.es, (c.serviceF < 0.98 ? `Only ${pct(c.serviceF)} claimed: not enough appointments to deliver them all` : 'Local and national enhanced services') + (() => { const cut = activeMods().filter(x => x.esCut).map(x => x.lcs); return cut.length ? `. Decommissioned by the ICB: ${cut.join(', ')}` : ''; })()],
    ['PCN', c.inc.pcn, 'Your share of PCN funding'],
    ['Private fees', c.inc.priv, 'Reports, medicals and letters'],
    ...(c.modCash ? [['Schemes, leases and extras', c.modCash, 'From earlier decisions']] : []),
    ['Staff', -c.cost.staff, 'Salaries plus 15% employer NI above £5,000 and 14.38% employer pension'],
    ...(c.cost.locum ? [['Locums and overtime', -c.cost.locum, [pl.locum ? `${pl.locum} locum sessions a week × £${Math.round(LOCUM_SESSION * 1000)}` : '', pl.extra ? `${pl.extra} overtime clinics a week × £${Math.round(OT_SESSION * 1000)}` : ''].filter(Boolean).join(', ') + ' × 4.33 weeks']] : []),
    ...(c.cost.cover ? [['Sickness cover and incidents', -c.cost.cover, 'Low morale means sickness and cover. Unsafe care means incidents to investigate.']] : []),
    ...(c.cost.arrs ? [['Additional roles over the PCN budget', -c.cost.arrs, `ARRS staff cost about £${Math.round(arrsSpend(false))}k a year against a budget of £${Math.round(arrsBudget())}k; the practice pays the difference`]] : []),
    ['Running costs and premises', -c.cost.running, 'Office, IT, insurance, CQC fee, supplies, unreimbursed premises costs'],
    ['Partners\' drawings', -c.out.draw, `${c.partnersN} × £${drawOf(pl.draw)}k`],
    ['Partners\' pension contributions', -c.out.pension, `${Math.round(pensionRate(c.estShare * 0.95) * 1000) / 10}% of pensionable profit, paid monthly`]
  ];
  const moneyTable = `<dl class="kv small">${moneyRows.map(([l, v, how]) => `<dt>${esc(l)}<small>${esc(how)}</small></dt><dd class="${v < 0 ? '' : 'good-t'}">${v < 0 ? '−' : '+'}${fmtK(Math.abs(v))}</dd>`).join('')}<dt class="sum">Net this month</dt><dd class="sum">${signK(c.net)}</dd></dl>`;
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap">
    <div class="plan-top"><section class="front${intro ? ' intro' : ''}" aria-label="Your surgery">${intro ? `<div class="intro-cap" aria-hidden="true">${calY(0) === 2026 ? 'Wednesday 1 April 2026' : '1 April'}, 7:59am</div>` : ''}${facadeSVG(c, { intro })}${brassPlate(intro)}<p class="front-hint">Each lit window is a meter. Tap one to see what's pulling it.</p></section>
    <div class="plan-head"><div><div class="eyebrow">Month plan</div><h1>${MONTHS[S.month]}</h1><a class="btn ghost jump" href="#h-team">Recruit staff ↓</a></div><p class="brief">${esc(BRIEF[S.month])} ${S.queue.length} things will land on your desk this month.${S.month === 0 && !S.yr && (S.gen || 1) === 1 ? (S.practiceKey === 'city' ? ' Nobody is going to tell you what to do here. Set your clinical sessions and pick a project; everything else can wait.' : ' New here? Set your clinical sessions and pick a project, or let Bev suggest a plan. Everything else can wait.') : ''}</p>${S.practiceKey === 'city' ? '' : '<button class="btn small" data-act="suggest" title="Sets sessions, cover, drawings and project for this month">Suggest a plan</button>'}${(() => { const g = UI.suggest; if (!g || g.m !== S.month || g.yr !== (S.yr || 0)) return ''; return `<div class="suggestbox" role="status"><div class="sb-h"><b>Bev's plan for ${MONTHS[S.month]}</b><button class="sb-x" data-act="suggest-x" aria-label="Close Bev's plan">×</button></div><ul>${g.why.map(w => `<li>${esc(w)}</li>`).join('')}</ul><p class="fc-note">It's set below. Change anything you like, then start the month.</p>${staffAdviceHTML(g.staff)}</div>`; })()}</div></div>
    ${(() => { const q = S.lastQuiet; if (!q || q.yr !== (S.yr || 0) || q.m !== S.month - 1) return ''; return `<section class="panel lastq" aria-label="Last month"><h3>${MONTHS[q.m]}: a quiet month <small>nothing new landed, so the report was skipped</small></h3><p>“${esc(q.headline)}” ${q.cap} appointments a week offered against ${q.demand} requested. The bank ${q.net >= 0 ? 'rose' : 'fell'} ${fmtK(Math.abs(q.net))} to ${fmtK(q.cash)}.</p>${q.d.length ? `<p class="lastq-d">${q.d.map(([k, d]) => `<span class="${d > 0 ? 'good-t' : 'bad-t'}">${STAT_LABEL[k]} ${d > 0 ? '+' : '−'}${Math.abs(d)}</span>`).join(' ')}</p>` : ''}${q.proj ? `<p><b>Project: ${esc(q.proj.name)}.</b> ${esc(q.proj.text)}</p>` : ''}<p class="fc-note">Prefer every report? Switch it in the menu.</p></section>`; })()}
    <div class="plan-grid">
      ${(() => { const Ty = c.T.you.v; const winterAhead = S.month >= 6 && S.month <= 9; if (!(winterAhead && Ty < 42) && !(S.st.you < 30)) return ''; return `<div class="warnbox" role="note"><b>${winterAhead ? 'Winter is coming for you.' : 'You are running on empty.'}</b> ${winterAhead ? 'January and February are when most partners burn out, and' : ''} your You meter is at ${Math.round(S.st.you)} and heading for ${Ty}. Book a week of leave, drop a clinical session, or add cover now, before the winter peak.</div>`; })()}
      ${riskHTML(c)}
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
            <div class="seg" role="group" aria-label="Drawings">${['low', 'std', 'high'].map(k => `<button data-act="draw" data-arg="${k}" aria-pressed="${pl.draw === k}">${k === 'low' ? 'Lean' : k === 'std' ? 'Standard' : 'Generous'} £${drawOf(k)}k</button>`).join('')}</div></div>
          ${explain('Drawings, pension and the tax bill', `<p>Drawings are payments on account of profit. On top, the practice pays each partner's NHS pension contributions: the member rate, up to 12.5%, plus the 14.38% employer share. Drawings aren't profits. At year end the accountant works out each partner's real share, and if drawings ran ahead, partners pay the difference back.</p><p>Income tax and Class 4 NI come later, through Self Assessment on 31 January and 31 July. A new partner's first bill can arrive about 22 months after joining, all at once.</p><p>Lean drawings protect the bank but weigh on you and on Nadia.</p>${srcLinks(['S21', 'S22', 'S23'])}`)}
        </section>
        <section class="panel" aria-labelledby="h-proj">
          <h3 id="h-proj">This month's project <small>Pick one.</small></h3>
          <div class="projects">${projs}</div>
          ${explain('How projects work', '<p>Effects land at the end of the month. Most are one-off boosts that fade as meters drift back toward where the practice\'s situation is taking them. A few change the situation itself: a mock CQC inspection leaves lasting improvements, and cloud telephony keeps patients happier for good.</p><p>Chasing unclaimed income finds less each time you do it.</p>')}
        </section>
        <details class="more-opts"${S.month < 2 ? '' : ' open'}><summary>More options: locums and overtime clinics</summary>
        <section class="panel" aria-labelledby="h-locum">
          <h3 id="h-locum">Extra capacity <small>Locums at £${Math.round(LOCUM_SESSION * 1000)} a session, or your own staff on overtime at about £${Math.round(OT_SESSION * 1000)}.</small></h3>
          <div class="step" style="border:0"><div class="l"><b>Locum sessions per week</b><small>${pl.locum ? `${pl.locum * 14} extra appointments, about ${fmtK(c.cost.locum)} this month` : 'None booked'}</small></div>${stepper('locum', pl.locum, pl.locum <= 0, pl.locum >= locumMax(), 'Locum sessions')}</div>
          <div class="step" style="border:0"><div class="l"><b>Evening and Saturday clinics</b><small>${pl.extra ? `${pl.extra * OT_APPTS} extra appointments from your own staff on overtime, about ${fmtK(pl.extra * WEEKS * OT_SESSION)} this month` : 'None this month'}</small></div>${stepper('extra', pl.extra || 0, !(pl.extra > 0), (pl.extra || 0) >= OT_MAX, 'Evening and Saturday clinics')}</div>
          ${explain('Overtime clinics or locums?', `<p>An evening or Saturday clinic is run by your own salaried GPs and nurses on overtime, with a receptionist. At sessional rates plus employer NI and pension, that's about £${Math.round(OT_SESSION * 1000)} for ${OT_APPTS} appointments, much cheaper than a locum, and they know your patients and do their own paperwork.</p><p>They run outside core hours, so they don't take up a consulting room. The cost is tiredness: each weekly overtime session pulls Team down. Up to ${OT_MAX} a week.</p>`)}
          ${explain('What a locum costs', `<p>Typical in-hours GP locum rates in 2026 are £85 to £105 an hour, and agencies keep 15 to 25%. A 4h10m session at £100 an hour, plus 14.38% employer pension on 90% of the fee (the pensionable part of NHS locum work), comes to about £${Math.round(LOCUM_SESSION * 1000)}.</p><p>Locums add appointments straight away, with no recruitment wait. They don't do results or letters, so each session adds a few items to your inbox.</p>${srcLinks(['S28', 'S22'])}`)}
        </section>
        </details>
        <section class="panel" aria-labelledby="h-team">
          <h3 id="h-team">Team <small><span class="${arrsLeft() < 0 ? 'bad-t' : ''}">PCN roles budget £${Math.round(arrsSpend(true))}k of £${Math.round(arrsBudget())}k a year used</span> · room sessions ${Math.round(c.rNeed)} of ${c.rAvail} booked · receptionists ${fteTxt(S.staff.recep)} of ${c.recepNeed} needed</small></h3>
          ${(() => { const w = hireNeeds(c).why; return `<p class="qh-t"><b>Recruit</b> <span class="muted">Each advert runs to the end of the month, when you find out who applied.</span>${w.length ? ` <span class="bad-t">${esc(w.join('. '))}.</span>` : ''}</p>`; })()}
          <div class="roles" aria-label="Staff">${roles}</div>
          ${explain('Staff costs, ARRS and recruitment', `<p>Every salary carries 15% employer NI above £5,000. GP practices can't claim the Employment Allowance that offsets NI for most small employers. Staff in the NHS Pension Scheme also cost 14.38% employer pension.</p><p>ARRS roles (pharmacists, physios, paramedics, advanced nurse practitioners and others) are paid from the PCN's additional-roles budget: £27.668 per weighted patient a year. Your practice's share is about <b>£${Math.round(arrsBudget())}k a year</b>, and <b>£${Math.round(arrsSpend(true))}k</b> is committed (staff in post plus open adverts). Each role is claimed up to a national maximum that includes employer NI and pension (2026/27: £71,725 for a clinical pharmacist or first contact physio, £78,534 for an advanced practitioner, £38,739 for a care coordinator). The game claims each post at its maximum. Staff beyond the budget are paid for by the practice. Clinicians still need somewhere to see patients, and supervising more than two adds to your hours. From 2026/27 PCNs can also claim GPs (up to £152,900 a year full time) and practice nurses (up to £46,447 new to general practice, £57,114 experienced) at their real cost, but only new recruits: anyone who worked in the PCN in the last 12 months can't be claimed. A nurse you recruit through the PCN here is new to general practice, so they start with six months of mentorship and preceptorship.</p><p><b>Posts can be part time.</b> Choose the hours before you recruit: pay, appointments, inbox work and room sessions follow them. Each employee has their own £5,000 NI threshold, so two part-timers cost a little less than one full-timer on the same hours. Part-time posts are a little easier to fill, because most GPs and practice nurses work part time.</p><p><b>Rooms are booked by the session.</b> Your ${S.rooms + activeMods().reduce((a, m) => a + (m.rooms || 0), 0)} consulting and treatment rooms give about ${ROOM_SESSIONS} bookable sessions a week each: ten core half-days, Monday to Friday mornings and afternoons, less one lost to double-bookings, cleaning and practice meetings. Evening and Saturday clinics are outside core hours, so they don't count. A meeting room can be turned into a clinic room as a project. A GP books a room for each clinical session. A nurse books about 8 a week, a pharmacist or paramedic about 4 (the rest is phone work or home visits). Receptionists work on headsets at the front desk, and care coordinators, social prescribers and GP assistants don't need a clinic room.</p><p>Recruiting opens an advert. Results come at month end and can fail. Low morale and a poor local reputation make it harder. Letting someone go hurts morale.</p>${srcLinks(['S19', 'S20', 'S22', 'S4', 'S84'])}`)}
          ${explain('How you compare with England', `<dl class="kv small">${benchmark().map(([l, you, nat, how]) => `<dt>${esc(l)}${how ? `<small>${esc(how)}</small>` : ''}</dt><dd><b class="${you < nat * 0.85 ? 'warn-t' : ''}">${you.toFixed(1)}</b> <span class="muted">vs ${nat.toFixed(1)}</span></dd>`).join('')}</dl><p>England averages for ${S.list.toLocaleString('en-GB')} patients, from the August 2026 workforce figures: about 4.6 fully qualified GPs, 2.6 nurses, 2.9 other clinical staff and 12.3 admin and reception staff per 10,000 patients. That's about ${Math.round(BENCH.patients / BENCH.gp).toLocaleString('en-GB')} patients per full-time GP. Averages aren't targets: an older or poorer list needs more.</p>${srcLinks(['S58', 'S59'])}`)}
          ${p.gpCap ? `<div class="fc-note"><p class="${gpHeadroom() < 6 ? 'bad-t' : ''}"><b>GPs are hard to find here.</b> Practices like yours can't recruit past about one GP per ${p.gpCap.toLocaleString('en-GB')} patients, against ${Math.round(BENCH.patients / BENCH.gp).toLocaleString('en-GB')} nationally. ${gpHeadroom() < 6 ? 'Nobody will apply for a salaried GP post unless your GP numbers fall below that.' : 'There\'s room for one more salaried GP.'} Locums are scarce too: at most ${locumMax()} sessions a week.</p>${explain('Why', `<p>GP numbers vary a lot by area. The worst-covered ICB, North West London, had one full-time GP for every 2,746 patients in late 2025, against about 2,200 nationally. Parts of Kent and Medway are worse: about 38 GPs per 100,000 people against 60 nationally, with some practices far beyond that. Deprived areas usually have the most patients per GP and the hardest time recruiting.</p>${srcLinks(['S66', 'S67', 'S59'])}`)}</div>` : ''}
        </section>
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
        ${c.recepShort ? `<p class="fc-note bad-t">Reception is ${fteTxt(c.recepShort)} full-time post${c.recepShort > 1.05 ? 's' : ''} short for a list this size.</p>` : ''}
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
    const cx = ctxFx(fx); fx = cx.fx; cx.why.forEach(w => (out.why = out.why || []).includes(w) || out.why.push(w));
    for (const k of STAT_KEYS) if (fx[k]) out[k] = Math.max(out[k] || 0, Math.abs(fx[k]));
    if (fx.cash) out.cash = Math.max(out.cash || 0, Math.abs(fx.cash) * 1.2);
    if (fx.qof) out.qof = Math.max(out.qof || 0, Math.abs(fx.qof));
    if (fx.inbox) out.inbox = Math.max(out.inbox || 0, Math.abs(fx.inbox) / 10);
    if (fx.aim || fx.mod) out.lasting = 1;
    if (fx.later || fx.sched) out.later = 1;
  };
  add(c.fx); if (c.alt) add(c.alt.fx);
  if (c.later) out.later = 1;
  // hidden logic: a roll of the dice or something planted for later
  const src = c.run ? String(c.run) : '';
  if (/chance\(/.test(src)) out.gamble = 1;
  if (/plant\(|schedule\(|later/.test(src)) out.later = 1;
  if (/addMod\(|payX|premX|S\.loan|lcsCut\(/.test(src)) out.lasting = 1;
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
  if (c.alt || h.gamble) parts.push(`<span class="chip risk" title="The outcome is uncertain">Gamble</span>`);
  if (h.why && h.why.length) parts.push(`<span class="chip now" title="${esc(h.why.join('. '))}.">Costs more right now</span>`);
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
  const info = e.info ? explain(e.tag === 'speculative' ? 'What\'s invented here?' : 'What\'s real here?', `${fill(e.info).split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}${srcLinks(e.src)}`, 'real') : '';
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap">
    ${UI.settings.timer && e.kind !== 'mini' ? `<div class="cardtimer" role="timer" aria-label="${CARD_SECONDS} seconds to decide"><b style="animation-duration:${CARD_SECONDS}s"></b></div>` : ''}
    <article class="card" aria-live="polite">${badge(e.who)}<span class="stampno">${MON3[S.month]} · ${Math.min(n, tot)}/${tot}</span></div>
      <div class="card-title-row"><h2>${esc(fill(val(e.title)))}</h2>${tagPill(e)}</div>
      <div class="text"><p>${esc(fill(cardText(e)))}</p></div>
      ${info}
      ${(() => { const w = [...new Set(e.choices.flatMap(c => { if (c.play) return []; const h = hintFor(c); return h.why || []; }))]; return w.length ? `<p class="nownote"><b>Right now:</b> ${esc(w.join('. '))}. Choices marked "Costs more right now" hit harder than usual.</p>` : ''; })()}
      <div class="choices">${choices}</div>
    </article></div></main>`;
  if (UI.settings.timer && e.kind !== 'mini') { const id = S.queue[S.qi], qi = S.qi; UI.tmr = setTimeout(() => timeUp(id, qi), CARD_SECONDS * 1000); }
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
      <div class="card-title-row"><h2>${esc(fill(val(e.title) || ''))}</h2>${tagPill(e)}</div>
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
