/* ===================== MINI-GAMES ===================== */
const MINI = {
  docman: {
    name: 'Docman Dash', dur: 45000, items: DOCS,
    blurb: 'Documents arrive one at a time. Sort each one before the timer runs out. Wrong answers cost two seconds.',
    rules: ['<b>File</b>: normal, or already dealt with.', '<b>Action</b>: needs doing, but not today: a referral, a medication change, a form.', '<b>Urgent</b>: a same-day problem. Missing one of these hurts Safety.', '<b>Bounce</b>: someone else\'s job. Send it back where it belongs.'],
    bins: [{ k: 'file', l: 'File', s: 'No action' }, { k: 'action', l: 'Action', s: 'Needs doing' }, { k: 'urgent', l: 'Urgent', s: 'Same day' }, { k: 'bounce', l: 'Bounce', s: 'Not your job' }]
  },
  triage: {
    name: 'The 8am Rush', dur: 45000, items: TRIAGE,
    blurb: 'Online requests flood in. Send each patient to the right place. Wrong answers cost two seconds.',
    rules: ['<b>999 / A&E</b>: life-threatening, right now.', '<b>GP today</b>: needs a clinician the same day.', '<b>Routine</b>: book an appointment with the right person.', '<b>Pharmacy</b>: Pharmacy First conditions and self-care.', '<b>Physio</b>: musculoskeletal problems without red flags.'],
    bins: [{ k: '999', l: '999 / A&E', s: 'Emergency' }, { k: 'gp', l: 'GP today', s: 'Same day' }, { k: 'routine', l: 'Routine', s: 'Book in' }, { k: 'pharm', l: 'Pharmacy', s: 'Pharmacy First' }, { k: 'physio', l: 'Physio', s: 'First contact' }]
  },
  walkround: {
    name: 'The Walkround', dur: 45000, items: WALK,
    blurb: 'Walk the building the way an inspector would. Decide what each thing needs before the timer runs out. Wrong answers cost two seconds.',
    rules: ['<b>Fix it now</b>: a real risk to someone today. Missing one of these hurts Safety.', '<b>Show the log</b>: fine, as long as you can prove you check it.', '<b>Risk-assess it</b>: a reasonable choice that needs writing down.', '<b>Mythbuster</b>: CQC doesn\'t require it. Don\'t spend money on it.'],
    bins: [{ k: 'fix', l: 'Fix it now', s: 'Real risk' }, { k: 'log', l: 'Show the log', s: 'Prove you check' }, { k: 'assess', l: 'Risk-assess it', s: 'Write it down' }, { k: 'myth', l: 'Mythbuster', s: 'Not required' }]
  }
};
let MG = null;
// later years are harder: less time (down to two thirds) and a bigger penalty for wrong answers
const miniDur = game => Math.round(MINI[game].dur * Math.max(0.66, 1 - 0.08 * ((S && S.yr) || 0)) / 1000) * 1000;
const miniPen = () => 2000 + 500 * Math.min(4, (S && S.yr) || 0);
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// A career meets a game's whole pool before anything comes back: items it hasn't answered are dealt first. S.miniSeen keeps
// a short key for each item answered, per game; when fewer than a round's worth are left unseen, the next round starts.
const miniItemKey = it => { let h = 5381; for (const ch of it.b) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h.toString(36); };
function miniDeck(game) {
  const pool = MINI[game].items, seen = new Set(((S.miniSeen || {})[game]) || []);
  const fresh = pool.filter(it => !seen.has(miniItemKey(it))), old = pool.filter(it => seen.has(miniItemKey(it)));
  if (fresh.length < 12 && S.miniSeen) S.miniSeen[game] = [];
  return shuffle(fresh).concat(shuffle(old));
}

function startMini(game, choiceIdx) {
  S.phase = 'mini';
  MG = { game, choiceIdx, stage: 'intro', items: miniDeck(game), idx: 0, score: 0, correct: 0, wrong: 0, danger: 0, streak: 0, best: 0, t0: 0, penalty: 0, left: miniDur(game), timer: null, last: null };
  save(); render(); window.scrollTo(0, 0);
}
function ensureMG() {
  if (MG) return true;
  const e = currentEvent();
  if (!e || e.kind !== 'mini') { S.phase = 'event'; return false; }
  MG = { game: e.game, choiceIdx: e.choices.findIndex(c => c.play), stage: 'intro', items: miniDeck(e.game), idx: 0, score: 0, correct: 0, wrong: 0, danger: 0, streak: 0, best: 0, t0: 0, penalty: 0, left: miniDur(e.game), timer: null, last: null };
  return true;
}
function renderMini() {
  if (!ensureMG()) return render();
  const G = MINI[MG.game];
  let body = '';
  if (MG.stage === 'intro') {
    body = `<div class="card mini-intro"><div class="eyebrow">Mini-game · ${miniDur(MG.game) / 1000} seconds</div><h2>${G.name}</h2><p class="text">${G.blurb.replace('two seconds', miniPen() === 2000 ? 'two seconds' : `${miniPen() / 1000} seconds`)}${(S.yr || 0) ? ` Year ${S.yr + 1}: the clock is shorter and mistakes cost more.` : ''}</p><ul>${G.rules.map(r => `<li>${r}</li>`).join('')}</ul>
      <p class="muted" style="font-size:14px">Use the buttons, or number keys 1 to ${G.bins.length}. Simplified for a game: not ${MG.game === 'walkround' ? 'regulatory' : 'clinical'} guidance.</p>
      <div class="card-foot"><button class="btn primary" data-act="mini-start" autofocus>Start the clock</button></div></div>`;
  } else if (MG.stage === 'play') {
    const it = MG.items[MG.idx % MG.items.length];
    const docHead = it.k ? `<div class="kind"><span>${esc(it.k)}</span><span>${esc(it.f)}</span></div>` : `<div class="kind"><span>Online request</span><span>#${4100 + MG.idx}</span></div>`;
    const fb = MG.last ? (MG.last.ok ? `<b class="ok">Right.</b> ${esc(MG.last.w)}` : `<b class="no">Not quite: ${esc(MG.last.ans)}.</b> ${esc(MG.last.w)}`) : '&nbsp;';
    body = `<div class="mini-top"><h2>${G.name}</h2><div class="mini-score"><span>Sorted <b>${MG.correct}</b></span><span>Streak <b>${MG.streak}</b></span><span id="mg-secs">${Math.ceil(MG.left / 1000)}s</span></div></div>
      <div class="timer" id="mg-timer"><b style="width:${(MG.left / miniDur(MG.game)) * 100}%"></b></div>
      <div class="doc ${MG.game === 'triage' ? 'sms' : ''}" id="mg-doc">${docHead}<div class="body">${esc(it.b)}</div></div>
      <div class="bins ${G.bins.length === 5 ? 'five' : ''}" style="--n:${G.bins.length}">${G.bins.map((b, i) => `<button class="bin" data-act="bin" data-arg="${b.k}" id="bin-${b.k}"><span class="kbd">${i + 1}</span>${esc(b.l)}<small>${esc(b.s)}</small></button>`).join('')}</div>
      <p class="lastfb" aria-live="polite">${fb}</p>`;
  } else {
    const R = miniResult();
    body = `<div class="card"><div class="eyebrow">${G.name} · results</div><h2>${esc(R.grade)}</h2>
      <p class="text">${esc(R.text)}</p>
      <dl class="kv" style="margin-top:14px"><dt>Sorted correctly</dt><dd>${MG.correct}</dd><dt>Wrong</dt><dd>${MG.wrong}</dd><dt>Accuracy</dt><dd>${Math.round(R.acc * 100)}%</dd><dt>Best streak</dt><dd>${MG.best}</dd><dt>${{ docman: 'Urgent results missed', triage: 'Dangerous misroutes', walkround: 'Real risks missed' }[MG.game]}</dt><dd class="${MG.danger ? 'bad-t' : ''}">${MG.danger}</dd></dl>
      <div class="card-foot"><button class="btn primary" data-act="mini-done" autofocus>Back to the practice</button></div></div>`;
  }
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap mini">${body}</div></main>`;
}
function miniResult() {
  const n = MG.correct + MG.wrong, acc = n ? MG.correct / n : 0;
  let grade, fx, text;
  if (MG.game === 'docman') {
    grade = acc >= 0.9 && MG.correct >= 12 ? 'Docman Deity' : acc >= 0.75 ? 'Safe Pair of Hands' : acc >= 0.5 ? 'Needs a Second Look' : 'Please Step Away From the Inbox';
    fx = { inbox: -MG.correct * 9, safety: (acc >= 0.85 ? 3 : acc >= 0.65 ? 1 : -2) - MG.danger * 3, you: MG.correct >= 12 ? 1 : -1 };
    text = `You cleared ${MG.correct * 9} items' worth of the backlog.` + (MG.danger ? ` ${MG.danger} urgent result${MG.danger > 1 ? 's' : ''} went to the wrong pile. Someone will have to ring those patients this afternoon.` : ' Nothing dangerous slipped through.');
  } else if (MG.game === 'walkround') {
    grade = acc >= 0.9 && MG.correct >= 12 ? 'Inspector\'s Nightmare (Complimentary)' : acc >= 0.75 ? 'Inspection-Ready, Mostly' : acc >= 0.5 ? 'Laminated Everything' : 'Gavin\'s Best Customer';
    const prep = acc >= 0.85 ? 4 : acc >= 0.65 ? 2 : 0;
    fx = { safety: (acc >= 0.85 ? 4 : acc >= 0.65 ? 2 : -1) - MG.danger * 2, team: -1, you: MG.correct >= 12 ? 1 : -1, flags: { cqcPrep: (S.flags.cqcPrep || 0) + prep - MG.danger } };
    if (acc >= 0.75) fx.aim = { safety: 1 };
    text = `You checked ${MG.correct + MG.wrong} things and got ${MG.correct} right.` + (MG.danger ? ` ${MG.danger} real risk${MG.danger > 1 ? 's' : ''} got a form instead of a fix. Patricia will find ${MG.danger > 1 ? 'them' : 'it'}.` : ' Every real risk was fixed on the spot.') + (prep ? ' Your evidence folder will help on inspection day.' : '');
  } else {
    grade = acc >= 0.9 && MG.correct >= 10 ? 'Care Navigation Legend' : acc >= 0.75 ? 'Sensible Triager' : acc >= 0.5 ? 'Sends Everyone to the GP' : 'Chaos Coordinator';
    const cut = Math.min(6, r1(MG.correct * 0.4));
    fx = { patients: acc >= 0.85 ? 4 : acc >= 0.65 ? 2 : -2, safety: (acc >= 0.85 ? 2 : 0) - MG.danger * 4, you: -1, mod: cut > 0 ? { id: 'nav' + S.month, label: 'Good care navigation', months: 1, demand: -cut } : null };
    text = `Good routing takes ${cut}% off this month's demand for appointments.` + (MG.danger ? ` ${MG.danger} patient${MG.danger > 1 ? 's' : ''} who needed urgent help got sent somewhere slower. That's a significant event.` : ' Every red flag went to the right place.');
  }
  return { acc, grade, fx, text };
}
function miniStart() {
  MG.stage = 'play'; MG.t0 = performance.now(); MG.penalty = 0; MG.left = miniDur(MG.game);
  clearInterval(MG.timer);
  MG.timer = setInterval(miniTick, 100);
  renderMini();
}
function miniTick() {
  if (!MG || MG.stage !== 'play') return;
  const G = MINI[MG.game];
  MG.left = Math.max(0, miniDur(MG.game) - (performance.now() - MG.t0) - MG.penalty);
  const tb = document.querySelector('#mg-timer b'), tt = document.getElementById('mg-timer'), secs = document.getElementById('mg-secs');
  if (tb) tb.style.width = (MG.left / miniDur(MG.game) * 100) + '%';
  if (tt) tt.classList.toggle('hurry', MG.left < 10000);
  if (secs) secs.textContent = Math.ceil(MG.left / 1000) + 's';
  if (MG.left <= 0) { clearInterval(MG.timer); MG.stage = 'result'; renderMini(); }
}
function miniAnswer(k) {
  if (!MG || MG.stage !== 'play') return;
  const G = MINI[MG.game];
  const it = MG.items[MG.idx % MG.items.length];
  const ok = it.a.includes(k);
  const seen = (S.miniSeen = S.miniSeen || {})[MG.game] = S.miniSeen[MG.game] || [], key = miniItemKey(it);
  if (!seen.includes(key)) seen.push(key);
  const label = kk => (G.bins.find(b => b.k === kk) || {}).l || kk;
  if (ok) { MG.correct++; MG.streak++; MG.best = Math.max(MG.best, MG.streak); }
  else {
    MG.wrong++; MG.streak = 0; MG.penalty += miniPen();
    if (MG.game === 'docman' && it.a[0] === 'urgent') MG.danger++;
    if (MG.game === 'walkround' && it.a[0] === 'fix' && k !== 'fix') MG.danger++;
    if (MG.game === 'triage' && (it.a.includes('999') || it.a[0] === 'gp') && ['pharm', 'physio', 'routine'].includes(k)) MG.danger++;
  }
  MG.last = { ok, w: it.w, ans: it.a.map(label).join(' or ') };
  MG.idx++;
  if (MG.idx % MG.items.length === 0) MG.items = shuffle(MG.items);
  renderMini();
  const b = document.getElementById('bin-' + k);
  if (b) { b.classList.add(ok ? 'flash-ok' : 'flash-no'); setTimeout(() => b.classList.remove('flash-ok', 'flash-no'), 300); }
  miniTick();
}
function miniDone() {
  const R = miniResult();
  const idx = MG.choiceIdx;
  clearInterval(MG.timer);
  const fx = { ...R.fx }; const mod = fx.mod; delete fx.mod;
  MG = null;
  go(() => { if (mod) addMod(mod); resolveChoice(idx, { fx, o: `${R.grade}. ${R.text}` }); });
}
function miniAction(a, arg) {
  if (a === 'mini-start') miniStart();
  else if (a === 'bin') miniAnswer(arg);
  else if (a === 'mini-done') miniDone();
}
function miniKey(ev) {
  if (!MG) return;
  if (MG.stage === 'intro' && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); miniStart(); return; }
  if (MG.stage === 'result' && ev.key === 'Enter') { ev.preventDefault(); miniDone(); return; }
  if (MG.stage === 'play' && /^[1-5]$/.test(ev.key)) {
    const b = MINI[MG.game].bins[+ev.key - 1];
    if (b) { ev.preventDefault(); miniAnswer(b.k); }
  }
}

/* ===================== UPDATES ===================== */
// On the website, an open game checks build.txt (written by build.sh) against its own BUILD when it comes back into view,
// at most every five minutes, and offers a reload when they differ. The game saves after every decision, so nothing is lost.
const UPD = { last: 0, shown: false };
const updOn = () => { try { return typeof BUILD !== 'undefined' && location.protocol === 'https:' && window.self === window.top && /vercel\.app$/.test(location.hostname); } catch (e) { return false; } };
function checkUpdate(asked) {
  if (!updOn() || (!asked && (UPD.shown || Date.now() - UPD.last < 300000))) { if (asked && !updOn()) toast('Updates are checked on the website, not here.'); return; }
  UPD.last = Date.now();
  fetch('/last-partner-standing/build.txt', { cache: 'no-store' }).then(r => r.ok ? r.text() : '').then(t => {
    t = (t || '').trim();
    if (/^[0-9a-f]{7}$/.test(t) && t !== BUILD) showUpdate(t);
    else if (asked) toast(`You have the latest version (${BUILD}).`);
  }).catch(() => { if (asked) toast('Couldn\'t check for a new version. Are you online?'); });
}
function showUpdate(v) {
  if (UPD.shown) return;
  UPD.shown = true;
  const d = document.createElement('div');
  d.className = 'update'; d.setAttribute('role', 'status');
  d.innerHTML = `<span><b>A new version of the game is ready.</b> Your game is saved, so reloading loses nothing.</span><button class="btn primary" data-act="reload">Reload</button>`;
  document.body.appendChild(d);
}

/* ===================== BOOT ===================== */
function boot(data) {
  try { loadStats(); } catch (e) { }
  // installable app: register the service worker on the real website only (not in a Claude Artifact or a local file)
  try { if ('serviceWorker' in navigator && location.protocol === 'https:' && window.self === window.top && /vercel\.app$/.test(location.hostname)) navigator.serviceWorker.register('/sw.js').catch(() => { }); } catch (e) { }
  try { if (data && data.S && data.S.v === 1) { S = data.S; UI.screen = data.screen || 'game'; } } catch (e) { }
  render();
  // look for a new release a little after opening, whenever the game comes back into view, and every half hour
  if (updOn()) {
    setTimeout(checkUpdate, 4000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });
    setInterval(() => { if (document.visibilityState === 'visible') checkUpdate(); }, 1800000);
  }
}
try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ S, screen: UI.screen })); } catch (e) { }
if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(boot);
else boot((window.claude && window.claude.hot && window.claude.hot.data) || {});
