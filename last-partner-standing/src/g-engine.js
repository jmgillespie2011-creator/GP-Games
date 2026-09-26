/* ===================== ENGINE ===================== */
let S = null;
const SAVE_KEY = 'lps-save-v1', BEST_KEY = 'lps-best-v1';
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const r1 = v => Math.round(v * 10) / 10;
const chance = p => Math.random() < p;
const pick = a => a[Math.floor(Math.random() * a.length)];
const val = v => (typeof v === 'function' ? v() : v);
const P = () => PRACTICES[S.practiceKey];
const pt = id => S.partners[id];
const isActive = id => !!S.partners[id] && S.partners[id].status === 'active';
const activeOthers = () => Object.values(S.partners).filter(p => p.status === 'active').length;
const hasFlag = f => !!S.flags[f];
const activeMods = () => S.mods.filter(m => S.month >= m.from);
const hasMod = id => activeMods().some(m => m.id === id);
const arrsCount = () => ROLE_ORDER.filter(r => ROLES[r].arrs).reduce((n, r) => n + S.staff[r] + (S.vac[r] || 0), 0);
const EVMAP = {};
EVENTS.forEach(e => { EVMAP[e.id] = e; });

function roomsNeeded() {
  let n = 1 + activeOthers();
  for (const r of ROLE_ORDER) if (ROLES[r].room) n += S.staff[r];
  if (S.plan.locum > 0) n += 1;
  if (hasMod('registrar')) n += 1;
  return n;
}
function roomsAvail() { return S.rooms + activeMods().reduce((a, m) => a + (m.rooms || 0), 0); }

function fill(t) {
  if (!t) return '';
  return String(t)
    .replace(/\{surgery\}/g, P().surgery).replace(/\{place\}/g, P().place).replace(/\{paper\}/g, P().paper)
    .replace(/\{name\}/g, 'Dr ' + S.name).replace(/\{qof\}/g, Math.round(S.qof)).replace(/\{inbox\}/g, Math.round(S.inbox))
    .replace(/\{list\}/g, S.list.toLocaleString('en-GB'));
}

function newGame(practiceKey, name) {
  const p = PRACTICES[practiceKey];
  S = {
    v: 1, practiceKey, name: name || 'Jones', month: 0, phase: 'plan',
    st: { ...p.st }, cash: p.cash, qof: 0, inbox: 180, list: p.list,
    demandMod: 0, adminMod: 0, rooms: p.rooms,
    plan: { clin: 6, admin: 1, mgmt: 1, locum: 0, draw: 'std', project: 'none', leave: false },
    staff: { ...p.staff }, vac: {},
    partners: { hartley: { status: 'active', clin: 6 }, okoye: { status: 'active', clin: 5 }, tom: { status: 'salaried', clin: 6 }, priya: { status: 'none', clin: 6 } },
    okoye: 40, flags: {}, mods: [], sched: [], seen: {}, counts: {}, queue: [], qi: 0,
    history: [], leaveUsed: 0, drawTotal: 0, aspPaid: 0, loan: 0, premX: 0, payX: 0, tomRaise: 0,
    cqc: null, cur: null, report: null, soldOut: 0, forceOver: null, over: null, end: null, lastRatio: 1, log: []
  };
  [['welcome', 0], ['hartley_retire', 0], ['okoye_email', 1], ['mini_docman', 1], ['mini_triage', 2], ['tom_partner', 3],
   ['okoye_leaving', 7], ['okoye_staying', 7], ['qof_yearend', 10], ['contract_new', 11]].forEach(([id, m]) => S.sched.push({ id, m }));
  startMonth();
  save();
}

/* ---------- scheduling & modifiers ---------- */
function schedule(id, n) {
  if (!EVMAP[id]) return;
  if (n <= 0 && (S.phase === 'event' || S.phase === 'outcome' || S.phase === 'mini')) { S.queue.splice(S.qi + 1, 0, id); return; }
  const m = S.month + Math.max(n, S.phase === 'plan' ? 0 : 1);
  if (m <= 11) S.sched.push({ id, m });
}
function addMod(m) {
  const mod = JSON.parse(JSON.stringify(m));
  mod.from = Math.max(S.month, m.at != null ? m.at : S.month);
  delete mod.at;
  S.mods = S.mods.filter(x => x.id !== mod.id);
  S.mods.push(mod);
}
function partnerLeaves(id) {
  const q = S.partners[id];
  if (!q || q.status !== 'active') return;
  q.status = 'left';
  S.cash = r1(S.cash - (PARTNERS0[id].capital || 0));
  S.log.push(`${PARTNERS0[id].name} left the partnership. Capital repaid: £${PARTNERS0[id].capital}k.`);
}

/* ---------- month flow ---------- */
function eligible(e, queued) {
  if (e.arc) return false;
  if (e.months && !e.months.includes(S.month)) return false;
  if (!e.rep && S.seen[e.id]) return false;
  if (e.rep && e.max && (S.counts[e.id] || 0) >= e.max) return false;
  if (queued.includes(e.id)) return false;
  if (e.kind === 'mini' && queued.some(id => EVMAP[id] && EVMAP[id].kind === 'mini')) return false;
  if (e.kind === 'mini' && S.lastMini === e.game) return false;
  try { if (e.cond && !e.cond()) return false; } catch (err) { return false; }
  return true;
}
function startMonth() {
  const m = S.month;
  const q = S.sched.filter(x => x.m === m).map(x => x.id);
  S.sched = S.sched.filter(x => x.m > m);
  if (m === 8 && !S.seen.cqc_call && !q.includes('cqc_call')) q.push('cqc_call');
  const target = (m === 8 || m === 9) ? 4 : 3;
  let need = Math.max(0, target - q.length);
  const drawn = [];
  while (need > 0) {
    const pool = EVENTS.filter(e => eligible(e, q.concat(drawn)));
    if (!pool.length) break;
    const tot = pool.reduce((a, e) => a + (e.w || 1), 0);
    let r = Math.random() * tot, chosen = pool[0];
    for (const e of pool) { r -= (e.w || 1); if (r <= 0) { chosen = e; break; } }
    drawn.push(chosen.id); need--;
  }
  // arcs first, one random event slotted in the middle for rhythm
  S.queue = q.concat(drawn);
  if (S.queue.length > 2 && drawn.length) { const last = S.queue.pop(); S.queue.splice(1, 0, last); }
  S.qi = 0;
  S.plan.leave = false;
  S.phase = 'plan';
}
function beginMonth() {
  if (S.plan.leave) S.leaveUsed++;
  S.monthStart = { st: { ...S.st }, cash: S.cash, qof: S.qof, inbox: S.inbox };
  S.phase = 'event';
  S.qi = -1;
  advanceEvent();
}
function currentEvent() { return EVMAP[S.queue[S.qi]]; }
function advanceEvent() {
  S.qi++;
  while (S.qi < S.queue.length) {
    const e = EVMAP[S.queue[S.qi]];
    let ok = !!e;
    if (ok && e.cond) { try { ok = !!e.cond(); } catch (err) { ok = false; } }
    if (ok && !e.rep && S.seen[e.id]) ok = false;
    if (ok) { S.phase = 'event'; save(); return; }
    S.qi++;
  }
  monthEnd();
}

function snap() { return { ...S.st, cash: S.cash, qof: S.qof, inbox: S.inbox, list: S.list }; }
function diffSnap(a, b) {
  const out = [];
  for (const k of ['patients', 'team', 'you', 'safety']) { const d = Math.round(b[k] - a[k]); if (d) out.push({ k, d, label: STAT_LABEL[k], txt: (d > 0 ? '+' : '') + d, good: d > 0 }); }
  const dc = r1(b.cash - a.cash); if (dc) out.push({ k: 'cash', d: dc, label: 'Bank', txt: (dc > 0 ? '+£' : '−£') + Math.abs(dc).toFixed(1) + 'k', good: dc > 0 });
  const dq = Math.round(b.qof - a.qof); if (dq) out.push({ k: 'qof', d: dq, label: 'QOF', txt: (dq > 0 ? '+' : '') + dq + '%', good: dq > 0 });
  const di = Math.round(b.inbox - a.inbox); if (di) out.push({ k: 'inbox', d: di, label: 'Inbox', txt: (di > 0 ? '+' : '') + di, good: di < 0 });
  const dl = b.list - a.list; if (dl) out.push({ k: 'list', d: dl, label: 'List', txt: (dl > 0 ? '+' : '') + dl, neutral: true });
  return out;
}

function applyFx(fx) {
  if (!fx) return;
  for (const k of STAT_KEYS) if (fx[k]) S.st[k] = clamp(S.st[k] + fx[k]);
  if (fx.cash) S.cash = r1(S.cash + fx.cash);
  if (fx.qof) S.qof = clamp(S.qof + fx.qof);
  if (fx.inbox) S.inbox = Math.max(0, Math.round(S.inbox + fx.inbox));
  if (fx.list) S.list += fx.list;
  if (fx.demand) S.demandMod += fx.demand;
  if (fx.admin) S.adminMod += fx.admin;
  if (fx.rooms) S.rooms = Math.max(1, S.rooms + fx.rooms);
  if (fx.okoye) S.okoye = clamp(S.okoye + fx.okoye);
  if (fx.staff) for (const r in fx.staff) S.staff[r] = Math.max(0, (S.staff[r] || 0) + fx.staff[r]);
  if (fx.flags) Object.assign(S.flags, fx.flags);
  if (fx.sched) fx.sched.forEach(([id, n]) => schedule(id, n));
  if (fx.mod) addMod(fx.mod);
}

function resolveChoice(i, extra) {
  const e = currentEvent(); if (!e) return;
  const c = e.choices[i]; if (!c) return;
  const before = snap();
  S._alt = false;
  let fx = c.fx, o = c.o;
  if (c.alt && chance(c.alt.p)) { S._alt = true; fx = c.alt.fx; o = c.alt.o; }
  applyFx(val(fx));
  let res = null;
  if (c.run) res = c.run() || null;
  if (S._alt && c.alt && c.alt.run) c.alt.run();
  if (extra) applyFx(extra.fx);
  if (e.after) e.after();
  S.seen[e.id] = 1; S.counts[e.id] = (S.counts[e.id] || 0) + 1;
  if (e.kind === 'mini') S.lastMini = e.game;
  const deltas = diffSnap(before, snap());
  S.cur = { id: e.id, o: fill((res && res.o) || (extra && extra.o) || val(o) || ''), html: (res && res.html) || (extra && extra.html) || '', deltas, alt: S._alt };
  delete S._alt;
  S.phase = 'outcome';
  save();
}
function continueOutcome() {
  const over = checkOver();
  if (over) return gameOver(over);
  if (S.soldOut) return finishYear(true);
  advanceEvent();
}

/* ---------- the simulation ---------- */
function calc() {
  const p = P(), pl = S.plan, m = Math.min(S.month, 11);
  const mods = activeMods();
  const away = new Set(mods.filter(x => x.away).map(x => x.away));
  const leaveF = pl.leave ? 0.75 : 1;
  let cap = pl.clin * 14 * leaveF;
  let clear = (pl.admin * 55 + pl.clin * 5) * leaveF;
  for (const id in S.partners) {
    const q = S.partners[id];
    if (q.status === 'active' && !away.has(id)) { cap += q.clin * 14; clear += 55 + q.clin * 5; }
  }
  for (const r of ROLE_ORDER) {
    const n = S.staff[r], R = ROLES[r]; if (!n) continue;
    if (R.cap) cap += R.cap * n;
    if (R.clear) clear += R.clear * n;
  }
  cap += pl.locum * 14;
  clear += 80; // admin workflow team
  mods.forEach(x => { if (x.capAdd) cap += x.capAdd; });
  let capMul = 1;
  mods.forEach(x => { if (x.capMul) capMul *= x.capMul; });
  const recepNeed = Math.round(S.list / 1400);
  const recepShort = Math.max(0, recepNeed - S.staff.recep);
  capMul *= 1 - 0.04 * recepShort;
  const rNeed = roomsNeeded(), rAvail = roomsAvail();
  const roomsOver = Math.max(0, rNeed - rAvail);
  capMul *= 1 - 0.04 * roomsOver;
  if (S.st.team < 30) capMul *= 0.93;
  cap = Math.round(cap * capMul);
  const dm = S.demandMod + mods.reduce((a, x) => a + (x.demand || 0), 0) - 2 * Math.min(S.staff.sp, 2);
  const demand = Math.round(S.list * p.demandRate * SEASON[m] * (1 + dm / 100));
  const ratio = demand ? cap / demand : 1;
  const inflow = Math.round(S.list * p.inboxRate * (1 + S.adminMod / 100) + pl.locum * 6);
  clear = Math.round(clear);
  // money, £k per month
  const partnersN = 1 + activeOthers();
  const listF = S.list / p.list;
  const inc = {
    gs: S.list * p.gsRate,
    qof: p.qofValue * listF * 0.7 / 12,
    es: S.list * 0.0007 + FLU_INCOME[m] + S.staff.nurse * 0.5,
    other: p.other
  };
  let modCash = 0; mods.forEach(x => { if (x.fx && x.fx.cash) modCash += x.fx.cash; });
  let roleCost = 0; for (const r of ROLE_ORDER) roleCost += ROLES[r].cost * S.staff[r];
  const cost = {
    staff: roleCost + S.list * 0.0023 + p.overhead + S.payX + S.tomRaise,
    locum: pl.locum * WEEKS * 0.46,
    premises: p.premises + S.premX + S.loan,
    draw: DRAW[pl.draw] * partnersN
  };
  const incTot = inc.gs + inc.qof + inc.es + inc.other;
  const costTot = cost.staff + cost.locum + cost.premises + cost.draw;
  const net = incTot + modCash - costTot;
  // your week
  const sessions = pl.clin + pl.admin + pl.mgmt;
  const supN = ROLE_ORDER.filter(r => ROLES[r].sup).reduce((a, r) => a + S.staff[r], 0);
  const qofGain = (1.5 + S.staff.nurse * 1.1 + S.staff.hca * 0.7 + S.staff.pharm * 0.7 + S.staff.cc * 1.8 + pl.mgmt * 1.1) * p.qofEase;
  return { cap, demand, ratio, inflow, clear, inc, cost, incTot, costTot, modCash, net, sessions, recepNeed, recepShort, rNeed, rAvail, roomsOver, supN, qofGain, partnersN, capMul };
}

function ratioDelta(r) { return r >= 1.08 ? 4 : r >= 1.0 ? 2 : r >= 0.94 ? 0 : r >= 0.87 ? -3 : r >= 0.8 ? -6 : -10; }
function sessDelta(s) { return s <= 6 ? 5 : s === 7 ? 3 : s === 8 ? 1 : s === 9 ? -1 : s === 10 ? -4 : s === 11 ? -7 : -10; }

// what the month-end will do to each meter, before events (used by the planner too)
function forecast(c) {
  c = c || calc();
  const pl = S.plan;
  const inboxEnd = Math.max(0, Math.round(S.inbox + (c.inflow - c.clear) * WEEKS));
  const ib = inboxEnd > 700 ? 2 : inboxEnd > 400 ? 1 : 0;
  const d = { patients: 0, team: 0, you: 0, safety: 0 };
  d.patients = ratioDelta(c.ratio) - c.recepShort - (ib === 2 ? 2 : 0);
  d.team = -1 + (c.ratio < 0.87 ? -3 : c.ratio < 0.94 ? -1 : 0) + (c.ratio >= 1.05 ? 1 : 0) - 2 * c.recepShort - (c.roomsOver ? 2 : 0);
  d.you = -1 + sessDelta(c.sessions) + (pl.leave ? 10 : 0) + (ib === 2 ? -5 : ib === 1 ? -2 : 0) + (pl.draw === 'low' ? -2 : pl.draw === 'high' ? 1 : 0)
    - Math.max(0, c.supN - 2) - (activeOthers() === 0 ? 3 : 0) - (c.ratio < 0.87 ? 2 : 0);
  d.safety = -1 + Math.min(pl.mgmt, 3) + (ib === 2 ? -5 : ib === 1 ? -2 : 0) - (c.ratio < 0.8 ? 3 : 0);
  return { d, inboxEnd };
}

function monthEnd() {
  const c = calc(), pl = S.plan, p = P();
  const f = forecast(c);
  const before = S.monthStart ? { ...S.monthStart.st, cash: S.monthStart.cash, qof: S.monthStart.qof, inbox: S.monthStart.inbox, list: S.list } : snap();
  const inboxStart = S.inbox;
  const notes = [];
  // core running of the practice
  for (const k of STAT_KEYS) S.st[k] = clamp(S.st[k] + f.d[k]);
  S.inbox = f.inboxEnd;
  S.cash = r1(S.cash + c.net);
  S.aspPaid += c.inc.qof;
  S.drawTotal += DRAW[pl.draw];
  S.qof = clamp(S.qof + c.qofGain);
  // modifiers
  activeMods().forEach(x => {
    if (x.fx) { const fx = { ...x.fx }; delete fx.cash; applyFx(fx); }
  });
  // project
  const proj = PROJECTS.find(x => x.id === pl.project) || PROJECTS[0];
  if (proj.id === 'claims') {
    const times = S.counts.proj_claims || 0;
    const found = r1((3 + Math.random() * 6) * Math.pow(0.55, times));
    S.counts.proj_claims = times + 1;
    S.cash = r1(S.cash + found);
    notes.push(`Claims audit found £${found.toFixed(1)}k of unclaimed income.`);
  } else applyFx(proj.fx);
  if (proj.once) S.flags['proj_' + proj.id] = 1;
  if (proj.id !== 'none') notes.unshift(`Project: ${proj.name}.`);
  // Nadia watches everything
  S.okoye = clamp(S.okoye + (c.ratio < 0.9 ? 2 : 0) + (S.st.team < 40 ? 2 : 0) - (S.st.team >= 65 ? 2 : 0) + (pl.draw === 'low' ? 4 : pl.draw === 'high' ? -2 : 0));
  // recruitment
  const hires = [];
  for (const r in S.vac) {
    let n = S.vac[r];
    while (n > 0) {
      const pr = Math.min(0.95, ROLES[r].hire * p.hire * (1 + (proj.hireBoost || 0)));
      if (chance(pr)) { S.staff[r]++; S.vac[r]--; hires.push(`${ROLES[r].name} hired.`); }
      else hires.push(`${ROLES[r].name}: no suitable applicants yet.`);
      n--;
    }
    if (!S.vac[r]) delete S.vac[r];
  }
  // random resignation when morale is on the floor
  if (S.st.team < 25 && chance(0.4)) {
    const cands = ['recep', 'nurse', 'hca', 'salaried'].filter(r => S.staff[r] > 0);
    if (cands.length) { const r = pick(cands); S.staff[r]--; notes.push(`A ${ROLES[r].name.toLowerCase()} resigned. Morale is that bad.`); }
  }
  // mods tick down
  S.mods.forEach(x => { if (S.month >= x.from) x.months--; });
  const ended = S.mods.filter(x => x.months <= 0).map(x => x.label);
  S.mods = S.mods.filter(x => x.months > 0);
  ended.forEach(l => { if (l) notes.push(`Ended: ${l}.`); });
  S.log.forEach(l => notes.push(l)); S.log = [];
  if (c.recepShort) notes.push(`Reception is ${c.recepShort} short. The phones are suffering.`);
  if (c.roomsOver) notes.push(`${c.roomsOver} more clinician${c.roomsOver > 1 ? 's' : ''} than rooms. Someone is consulting in the baby-change.`);
  if (c.supN > 2) notes.push(`Supervising ${c.supN} ARRS clinicians is eating your evenings.`);
  if (activeOthers() === 0) notes.push(`You are the only partner left. Every decision, and every liability, is yours.`);
  // headline
  const pool = c.ratio < 0.87 ? HEADLINES.bad : c.ratio >= 1.02 ? HEADLINES.good : HEADLINES.ok;
  const headline = fill(pick(chance(0.25) ? HEADLINES.filler : pool));
  S.lastRatio = c.ratio;
  S.report = {
    month: S.month, c, inboxStart, inboxEnd: S.inbox, headline, notes, hires, project: proj.name,
    deltas: diffSnap(before, snap()), cashEnd: S.cash
  };
  S.history.push({ m: S.month, patients: S.st.patients, team: S.st.team, you: S.st.you, safety: S.st.safety, cash: S.cash, qof: S.qof, ratio: c.ratio });
  S.phase = 'report';
  save();
}
function nextMonth() {
  const over = checkOver();
  if (over) return gameOver(over);
  if (S.month >= 11) return finishYear(false);
  S.month++;
  if ((PROJECTS.find(x => x.id === S.plan.project) || {}).once) S.plan.project = 'none';
  startMonth();
  save();
}

/* ---------- CQC ---------- */
function rateOf(v) { return v >= 82 ? 'o' : v >= 50 ? 'g' : v >= 32 ? 'ri' : 'i'; }
const RATE_NAME = { o: 'Outstanding', g: 'Good', ri: 'Requires improvement', i: 'Inadequate' };
function runCQC(reinspect) {
  const st = S.st, expected = (S.month / 12) * 85;
  const dom = {
    Safe: st.safety,
    Effective: clamp(50 + (S.qof - expected) * 1.2 + (st.safety - 50) * 0.3),
    Caring: st.patients * 0.7 + st.team * 0.3,
    Responsive: clamp(st.patients * 0.6 + (S.lastRatio - 0.8) * 150 + 10),
    'Well-led': clamp(st.team * 0.55 + st.safety * 0.35 + S.plan.mgmt * 5)
  };
  const rates = {}; for (const k in dom) rates[k] = rateOf(dom[k]);
  const vals = Object.values(rates);
  const n = t => vals.filter(v => v === t).length;
  let overall = 'g';
  if (n('i') >= 2 || rates.Safe === 'i') overall = 'i';
  else if (n('i') === 1 || n('ri') >= 2) overall = 'ri';
  else if (n('o') >= 3) overall = 'o';
  S.cqc = { overall, rates };
  const fx = { o: { team: 10, you: 8, patients: 4 }, g: { team: 5, you: 4 }, ri: { team: -6, you: -8, safety: 4 }, i: { team: -12, you: -15, patients: -8, safety: 6 } }[overall];
  applyFx(fx);
  let o;
  if (overall === 'o') o = `Outstanding. Patricia almost smiles. Bev has the report framed before it's even published.`;
  else if (overall === 'g') o = `Good. The report praises "a caring, committed team working under significant pressure". Bev reads that line out loud four times.`;
  else if (overall === 'ri') o = `Requires improvement. There's an action plan with 23 points. Patricia will be back to check.`;
  else o = reinspect ? `Still inadequate. The ICB begins the process of terminating the contract.` : `Inadequate. Warning notices, special measures and a re-inspection in three months. The ${P().paper} runs it on the front page.`;
  if (overall === 'i') { if (reinspect) S.forceOver = 'cqc'; else schedule('cqc_reinspect', 3); }
  S.flags.cqcDone = 1;
  const html = `<div class="cqc-card" role="table" aria-label="CQC ratings">${Object.keys(rates).map(k => `<div class="row"><span>${k}</span><span class="rate ${rates[k]}">${RATE_NAME[rates[k]]}</span></div>`).join('')}<div class="row overall"><span>Overall</span><span class="rate">${RATE_NAME[overall]}</span></div></div>`;
  return { o, html };
}
EVENTS.push({ id: 'cqc_reinspect', arc: 1, who: 'cqc', title: 'The re-inspection',
  text: `Patricia Sharpe is back, three months to the day. She has the action plan. She has your last report. She has, you notice, a new and larger clipboard.`,
  choices: [{ t: 'Show her what\'s changed', run() { return runCQC(true); } }] });
EVMAP.cqc_reinspect = EVENTS[EVENTS.length - 1];

/* ---------- game over & year end ---------- */
function checkOver() {
  for (const k of STAT_KEYS) if (S.st[k] <= 0) return k;
  if (S.cash < OVERDRAFT) return 'cash';
  if (S.forceOver) return S.forceOver;
  return null;
}
const OVER = {
  patients: { title: 'Contract terminated', stamp: 'Breach notice', text: () => `The complaints became a petition, the petition became a front page, and the front page became a breach notice from the ICB. The contract for ${P().surgery} is handed to Apex Primary Care Ltd, who replace the phone line with a QR code.` },
  team: { title: 'Nobody came in', stamp: 'Mass resignation', text: () => `Bev resigned on a Monday. By Friday, reception was staffed by a laminated sign reading "PLEASE USE THE APP". Without a team, there is no practice, just a building with a flat roof.` },
  you: { title: 'Burnt out', stamp: 'Signed off', text: () => `You didn't come in on Tuesday. Or Wednesday. A locum signs you off with burnout. Six months later you're doing four sessions a week in New Zealand, and you have never been happier. The partnership dissolves without you.` },
  safety: { title: 'Special measures', stamp: 'Inadequate', text: () => `A serious incident, then another. CQC rates the practice inadequate and uses the phrase "systemic failure" eleven times. You get to know your medical defence organisation very, very well.` },
  cqc: { title: 'Special measures', stamp: 'Inadequate', text: () => `Two inadequate ratings in a row. The ICB terminates the contract. Your patients are dispersed across four practices, none of which are pleased.` },
  cash: { title: 'Unlimited liability', stamp: 'Account frozen', text: () => `The bank freezes the account. Partners carry unlimited liability, so you remortgage your house to pay the staff their last wages. The practice hands back its contract. Your accountant sends a sympathy card, and an invoice.` }
};
function gameOver(k) {
  S.over = { k, month: S.month };
  S.phase = 'over';
  recordBest(null);
  clearSave();
}

function finishYear(sold) {
  const p = P();
  const qofValue = p.qofValue * (S.list / p.list);
  const monthsPaid = S.month + 1;
  const earned = sold ? S.aspPaid : qofValue * S.qof / 100;
  const balancing = earned - S.aspPaid;
  const cashFinal = S.cash + balancing;
  const partnersN = 1 + activeOthers();
  const surplus = cashFinal - RESERVE;
  let share = surplus / partnersN;
  if (sold) share = Math.max(0, share) + 60; // Apex pays for your share of goodwill
  const takeHome = S.drawTotal + share;
  const st = S.st;
  const cqcB = S.cqc ? { o: 40, g: 20, ri: -10, i: -40 }[S.cqc.overall] : 0;
  const others = activeOthers();
  let score = st.patients + st.team + st.you + st.safety + S.qof + (takeHome - 100) * 0.8 + cqcB + others * 8 + (others === 0 ? 25 : 0);
  if (sold) score *= 0.6;
  score = Math.round(Math.max(0, score));
  const arche = archetype({ sold, takeHome, others });
  S.end = { sold, qofValue, earned, balancing, cashFinal, surplus, partnersN, share, takeHome, score, arche, monthsPaid };
  S.phase = 'end';
  recordBest(S.end);
  clearSave();
}
function archetype({ sold, takeHome, others }) {
  const st = S.st, place = P().place;
  const min = Math.min(st.patients, st.team, st.you, st.safety);
  if (sold) return { t: 'The Sell-Out', s: 'Sold', d: `You sold to Apex. The money was fine. The phone system is now a national call centre, and your patients call you "the one who sold us". You are a salaried "Clinical Lead" with a lanyard and no say.` };
  if (others === 0) return { t: 'Last Partner Standing', s: 'Sole partner', d: `Everyone else left. You held the contract, the lease and the overdraft on your own, and you are still here on 31st March. It's either heroic or a cry for help. Possibly both.` };
  if (st.patients >= 65 && st.team >= 65 && st.you >= 65 && st.safety >= 65 && takeHome >= 125) return { t: 'The Unicorn', s: 'Mythical', d: `Happy patients, happy team, a safe practice, a decent income and your sanity intact. Other partners will not believe you exist. Some will report you to the LMC for showing off.` };
  if (takeHome >= 160 && st.you < 40) return { t: 'Golden Handcuffs', s: 'Well paid', d: `The accountant is thrilled. You are exhausted. You've made excellent money, and you're too tired to spend it.` };
  if (st.patients >= 75 && takeHome < 110) return { t: `Patron Saint of ${place}`, s: 'Beloved', d: `The patients adore you. Mrs Higgins has put you in her will (the shortbread tin). Financially, it has been a vocation rather than a business.` };
  if (st.you >= 75 && st.patients < 45) return { t: 'Master of Boundaries', s: 'Well rested', d: `You leave at 6:30pm, eat lunch sitting down and never read the Facebook group. The patients have noticed. You have noticed that you don't mind.` };
  if (S.cqc && S.cqc.overall === 'o') return { t: 'The Inspector\'s Darling', s: 'Outstanding', d: `Outstanding. The certificate is in reception, the laminated policies are colour-coded, and Patricia Sharpe uses your practice as an example in training sessions.` };
  if (st.team >= 80) return { t: 'Everybody\'s Favourite Boss', s: 'Much loved', d: `The team would walk through fire for you. Maureen has stopped threatening to retire. Kayleigh stayed rather than go to Aldi. That's the real prize.` };
  if (min < 20) return { t: 'Survived. Technically.', s: 'Held together', d: `You made it to 31st March, but only just. Something is always about to break. Next year will be different, you tell yourself, again.` };
  return { t: 'Still Standing', s: 'Year complete', d: `A solid year. Not glamorous, not a disaster. You kept the doors open, the patients seen and the bank quiet. That's what most partners dream of.` };
}

/* ---------- storage ---------- */
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
function loadSave() { try { const t = localStorage.getItem(SAVE_KEY); if (!t) return null; const s = JSON.parse(t); return s && s.v === 1 && s.phase !== 'end' && s.phase !== 'over' ? s : null; } catch (e) { return null; } }
function loadBest() { try { const b = JSON.parse(localStorage.getItem(BEST_KEY) || '[]'); return Array.isArray(b) ? b : []; } catch (e) { return []; } }
function recordBest(end) {
  const entry = end
    ? { score: end.score, t: end.arche.t, p: P().label, n: S.name, d: new Date().toISOString().slice(0, 10) }
    : { score: 0, t: OVER[S.over.k].title + ' (' + MON3[S.over.month] + ')', p: P().label, n: S.name, d: new Date().toISOString().slice(0, 10) };
  const b = loadBest(); b.push(entry); b.sort((a, c) => c.score - a.score);
  try { localStorage.setItem(BEST_KEY, JSON.stringify(b.slice(0, 5))); } catch (e) { }
}
