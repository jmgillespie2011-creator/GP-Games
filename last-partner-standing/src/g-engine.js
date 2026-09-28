/* ===================== ENGINE: state, month flow, simulation ===================== */
let S = null;
// Weekly challenge games use a seeded random stream (kept in S.rng, so it survives saving); everything else uses the browser's.
const _rand = Math.random.bind(Math);
Math.random = () => {
  if (!S || S.rng == null) return _rand();
  S.rng = (S.rng + 0x6D2B79F5) >>> 0;
  let t = S.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function isoWeek(d) {
  d = d || new Date();
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  return y + '-W' + String(Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7)).padStart(2, '0');
}
function weekSeed(key) { let h = 2166136261; for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; }
function weeklyChallenge() { const week = isoWeek(), seed = weekSeed(week); return { week, seed, practice: 'city' }; }  // always the brutal practice
// a goal for the year, worth a score bonus
const GOALS = {
  keepNadia: { t: 'Keep Nadia in the partnership', ok: () => isActive('okoye') },
  cqcGood: { t: 'Get Good or Outstanding from CQC', ok: () => !!S.cqc && (S.cqc.overall === 'g' || S.cqc.overall === 'o') },
  qof95: { t: 'Reach 95% QOF by 31 March', ok: () => S.qof >= 95 },
  patients60: { t: 'Finish with Patients at 60 or more', ok: () => S.st.patients >= 60 },
  steadyBank: { t: 'Never go past half your overdraft limit', ok: () => !S.flags.deepOD },
  happyTeam: { t: 'Finish with Team at 65 or more', ok: () => S.st.team >= 65 }
};
const GOAL_BONUS = 40;
// endless mode: what each extra year adds
const YEAR_DEMAND = 0.1, YEAR_FUNDING = 0.02, YEAR_STAFF = 0.05, YEAR_RUNNING = 0.03, YEAR_YOU = 7;
const calY = m => CAL_YEAR[Math.min(m, 11)] + ((S && S.yr) || 0);
const monthsServed = () => ((S && S.yr) || 0) * 12 + Math.min(S.month, 11) + 1 - ((S && S.startAt) || 0);
const SAVE_KEY = 'lps-save-v2', BEST_KEY = 'lps-best-v1';
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const r1 = v => Math.round(v * 10) / 10;
// drawings a month, £k: fixed in year one, then rebased each year on last year's profit share (S.drawBase)
const drawOf = k => S && S.drawBase ? r1(S.drawBase * DRAW[k] / DRAW.std) : DRAW[k];
const chance = p => Math.random() < p;
const pick = a => a[Math.floor(Math.random() * a.length)];
const val = v => (typeof v === 'function' ? v() : v);
const pctTxt = v => Math.round(v * 100) + '%';
const prac = () => PRACTICES[S.practiceKey];
const pt = id => S.partners[id];
const isActive = id => !!S.partners[id] && S.partners[id].status === 'active';
const activeOthers = () => Object.values(S.partners).filter(p => p.status === 'active').length;
const hasFlag = f => !!S.flags[f];
const activeMods = () => S.mods.filter(m => S.month >= m.from);
const hasMod = id => activeMods().some(m => m.id === id);
const arrsCount = () => ROLE_ORDER.filter(r => ROLES[r].arrs).reduce((n, r) => n + S.staff[r] + (S.vac[r] || 0), 0);
// the PCN's additional-roles budget, as the practice's share (£k a year); pay grows faster than the budget in later years
const arrsBudget = () => weightedList() * P.arrs / 1000 * (1 + YEAR_FUNDING * ((S && S.yr) || 0));
const arrsClaimOf = r => (ROLES[r].claim || 0) * (1 + YEAR_STAFF * ((S && S.yr) || 0));
// from 2026/27 a PCN can claim a GP from the same budget: up to £152,900 a year full time; our salaried GP works six sessions
// a GP through ARRS is reimbursed at actual salary plus on-costs, up to £152,900 a year full time (2026/27);
// ours work six sessions, so the claim is their real cost, capped at six ninths of the maximum
const ARRS_GP_CLAIM = Math.min(152.9 * 6 / 9, ROLES.salaried.cost * 12);
const arrsGPs = () => Math.min(S.arrsGP || 0, S.staff.salaried);
const arrsSpend = withAdverts => ROLE_ORDER.filter(r => ROLES[r].arrs).reduce((a, r) => a + arrsClaimOf(r) * (S.staff[r] + (withAdverts ? (S.vac[r] || 0) : 0)), 0) + (arrsGPs() + (withAdverts ? (S.vac.arrsgp || 0) : 0)) * ARRS_GP_CLAIM * (1 + YEAR_STAFF * ((S && S.yr) || 0));
const arrsLeft = () => arrsBudget() - arrsSpend(true);
const EVMAP = {};
EVENTS.forEach(e => { EVMAP[e.id] = e; });
const DRIFT = { patients: 0.3, team: 0.22, you: 0.25, safety: 0.2 };
const qofHeadroom = () => clamp((100 - S.qof) / 35, 0.2, 1); // the last patients on the recall list are the hardest to reach

// rooms are booked by the session: part-timers share, and receptionists on headsets need none
function roomsNeeded() {
  let n = S.plan.clin;
  for (const id in S.partners) if (isActive(id)) n += S.partners[id].clin;
  for (const r of ROLE_ORDER) if (ROLES[r].room) n += ROLES[r].room * S.staff[r];
  n += S.plan.locum;
  if (hasMod('registrar')) n += 7;
  if (hasMod('scheme')) n += 2;
  return n;
}
function roomsAvail() { return ROOM_SESSIONS * (S.rooms + activeMods().reduce((a, m) => a + (m.rooms || 0), 0)); }
// Under-doctored areas: some practices can't recruit GPs past a local ceiling (patients per full-time GP).
// Your own sessions count as one full-time GP, so working harder never blocks a hire.
function gpHiredSessions() {
  let n = GP_FTE_SESSIONS + 6 * (S.staff.salaried + (S.vac.salaried || 0) + (S.vac.arrsgp || 0));
  for (const id in S.partners) if (isActive(id)) n += S.partners[id].clin + 1;
  if (hasMod('scheme')) n += 2;
  return n;
}
const NO_GP_REPLIES = [
  'GP advert: no applicants. The only enquiry was from a recruitment agency offering to "partner with you on your GP challenge".',
  'GP advert: no applicants. The job board says it has had 212 views.',
  'GP advert: one application, from a GP who wanted to know if the job could be done entirely from Portugal.',
  'GP advert: no applicants. Every GP within 20 miles already has three job offers.'
];
function gpHeadroom() { const cap = prac().gpCap; return cap ? S.list / cap * GP_FTE_SESSIONS - gpHiredSessions() : Infinity; }
const locumMax = () => prac().locumMax || 8;
// a sensible plan for this month, explained. Used by "Suggest a plan" (hiring stays the player's call).
function suggestPlan() {
  const pl = S.plan, why = [];
  pl.clin = S.st.you < 40 ? 5 : 6; pl.admin = 1; pl.mgmt = 1; pl.locum = 0; pl.extra = 0;
  pl.leave = S.st.you < 50 && S.leaveUsed < 6;
  why.push(`${pl.clin} clinical sessions for you${pl.clin < 6 ? ', one fewer because You is low' : ''}, 1 admin, 1 management`);
  if (pl.leave) why.push('A week off, because You is low');
  pl.draw = S.cash < S.overdraft / 2 ? 'low' : 'std';
  why.push(pl.draw === 'low' ? 'Lean drawings, to protect the bank' : 'Standard drawings');
  let c = calc();
  while (c.inboxEnd > 380 && pl.admin < 3) { pl.admin++; c = calc(); }
  if (pl.admin > 1) why.push(`${pl.admin} admin sessions, to keep the inbox under 400`);
  while (c.ratio < 0.97 && (pl.extra || 0) < 2 && S.st.team >= 50) { pl.extra = (pl.extra || 0) + 1; c = calc(); }
  if (pl.extra) why.push(`${pl.extra} evening or Saturday clinic${pl.extra > 1 ? 's' : ''} a week, because appointments are short`);
  while (c.ratio < 0.95 && pl.locum < Math.min(4, locumMax()) && S.cash > S.overdraft + 25) { pl.locum++; c = calc(); }
  if (pl.locum) why.push(`${pl.locum} locum session${pl.locum > 1 ? 's' : ''} a week, because appointments are still short`);
  const done = id => (PROJECTS.find(x => x.id === id) || {}).once && S.flags['proj_' + id];
  // weigh every need, and don't nag: a project done last month (or twice in the last three) counts for much less
  const hist = S.projHist || [], recent = id => hist.slice(-3).filter(x => x === id).length;
  const cqcSoon = !S.seen.cqc_visit && !(S.yr || 0) ? S.month >= 5 && S.month <= 8 : false;
  const opts = [
    ['telephony', S.flags.telephony && !done('telephony') ? 100 : 0, 'the new phones are ready to go live'],
    ['wellbeing', S.st.team < 45 ? 10 + (45 - S.st.team) * 2 : 0, `Team is down to ${Math.round(S.st.team)}`],
    ['cqc', (S.st.safety < 45 ? 10 + (45 - S.st.safety) * 2 : 0) + (cqcSoon && S.st.safety < 60 ? 12 : 0), cqcSoon ? 'CQC usually calls before the winter' : `Safety is down to ${Math.round(S.st.safety)}`],
    ['inbox', S.inbox > 450 ? 10 + (S.inbox - 450) / 10 : 0, `the inbox is at ${Math.round(S.inbox)}`],
    ['ppg', S.st.patients < 40 ? 10 + (40 - S.st.patients) * 2 : 0, `Patients is down to ${Math.round(S.st.patients)}`],
    ['meetingroom', roomsNeeded() + 4 > roomsAvail() && !done('meetingroom') && S.cash > S.overdraft + 10 ? 22 : 0, 'you are nearly out of clinic rooms'],
    ['recruit', Object.keys(S.vac).length ? 14 : 0, 'you have adverts out, and this improves the odds'],
    ['claims', S.cash < 0 ? 12 * Math.pow(0.55, S.counts.proj_claims || 0) : 0, 'the bank is overdrawn and there is money in the claims'],
    ['qof', 8 + (S.month >= 6 && S.qof < S.month * 8 ? 8 : 0), S.month >= 6 && S.qof < S.month * 8 ? `QOF is behind at ${Math.round(S.qof)}%` : 'QOF is money you can still earn'],
    ['digital', !done('digital') && S.cash > S.overdraft + 10 ? 6 : 0, 'clearer online forms cut demand for good'],
    ['cqc', !recent('cqc') && S.st.safety >= 45 && S.st.safety < 60 ? 4 : 0, 'a check now keeps you ready for CQC'],
    ['ppg', S.st.patients >= 40 && S.st.patients < 55 ? 4 : 0, 'patient feedback lifts your reputation'],
    ['none', S.st.you < 35 ? 10 + (35 - S.st.you) : hist[hist.length - 1] !== 'none' ? 3.5 : 0, S.st.you < 35 ? 'You needs a month without extra work' : 'a quiet month gives you some breathing space']
  ].map(([id, sc, why]) => [id, sc * (hist[hist.length - 1] === id ? 0.4 : 1) * (recent(id) >= 2 ? 0.6 : 1), why])
   .filter(o => o[1] > 0 && !done(o[0])).sort((a, b) => b[1] - a[1]).filter((o, i, a) => a.findIndex(x => x[0] === o[0]) === i);
  const [proj, , because] = opts[0] || ['qof', 0, 'QOF is money you can still earn'];
  const again = hist[hist.length - 1] === proj;
  pl.project = proj;
  why.push(`Project: ${(PROJECTS.find(x => x.id === proj) || {}).name}, because ${because}${again ? ' (again: it still matters most)' : ''}`);
  return why;
}
// headcount and FTE against the England averages for a list this size
function benchmark() {
  const k = S.list / BENCH.patients;
  let gpSess = S.plan.clin + S.plan.admin + S.plan.mgmt + 6 * S.staff.salaried;
  for (const id in S.partners) if (isActive(id)) gpSess += S.partners[id].clin + 1;
  if (hasMod('scheme')) gpSess += 2;
  const office = S.list * CORE_ADMIN / OFFICE_COST;
  const other = ['hca', 'pharm', 'physio', 'para', 'mhp', 'cc', 'sp', 'gpa'].reduce((a, r) => a + S.staff[r], 0);
  return [
    ['GPs (FTE, excluding trainees)', gpSess / GP_FTE_SESSIONS, BENCH.gp * k, 'Your sessions and your partners\', salaried GPs\' and scheme sessions, at 9 a week each'],
    ['Nurses', S.staff.nurse + (S.staff.anp || 0), BENCH.nurse * k, 'Practice nurses and advanced nurse practitioners'],
    ['Other clinical staff', other, BENCH.dpc * k, 'Nationally this counts practice staff only. PCN-funded ARRS roles come on top.'],
    ['Admin and reception', S.staff.recep + office, BENCH.admin * k, `${S.staff.recep} receptionists and about ${office.toFixed(1)} office staff`]
  ];
}
function weightedList() {
  const p = prac();
  const nr = S.newRegs.reduce((a, r) => a + (S.month < r.until ? r.n : 0), 0);
  return S.list * p.weight + nr * (P.newReg - 1) * p.weight + S.careBeds * (P.careHome - 1);
}
function qofValueK(pctAchieved) {
  const p = prac();
  return P.qofPts * P.qofVal * (S.list / P.cpiAvg) * p.prev * clamp(pctAchieved) / 100 / 1000;
}
function pensionRate(pensionable) { return P.tiers.find(t => pensionable <= t[0])[1] + P.erPen; }

// a card's text can be a list of variants; each replay of the card (across years) shows the next one
function cardText(e) { const t = e.text; if (!Array.isArray(t)) return val(t); return val(t[((S.ever && S.ever[e.id]) || 0) % t.length]); }
function fill(t) {
  if (!t) return '';
  return String(t)
    .replace(/\{surgery\}/g, prac().surgery).replace(/\{place\}/g, prac().place).replace(/\{paper\}/g, prac().paper)
    .replace(/\{name\}/g, 'Dr ' + S.name).replace(/\{qof\}/g, Math.round(S.qof)).replace(/\{inbox\}/g, Math.round(S.inbox))
    .replace(/\{list\}/g, S.list.toLocaleString('en-GB'));
}

function newGame(practiceKey, name, opts) {
  opts = opts || {};
  const p = PRACTICES[practiceKey];
  S = {
    v: 2, practiceKey, name: name || 'Jones', look: { ...(opts.look || (typeof UI !== 'undefined' && UI.look) || { s: 0, c: 0 }) }, runId: Date.now().toString(36) + _rand().toString(36).slice(2, 6), yr: 0, month: 0, phase: 'plan', rng: opts.seed != null ? opts.seed >>> 0 : null, week: opts.week || null, goal: null,
    st: { ...p.st }, cash: p.cash, overdraft: p.overdraft, qof: 0, inbox: 180, list: p.list,
    demandMod: 0, adminMod: 0, rooms: p.rooms, icb: 55, rep: 55,
    aim: { patients: 0, team: 0, you: 0, safety: 0 },
    plan: { clin: 6, admin: 1, mgmt: 1, locum: 0, extra: 0, draw: 'std', project: 'none', leave: false },
    staff: { ...p.staff }, vac: {},
    partners: { hartley: { status: 'active', clin: 6 }, okoye: { status: 'active', clin: 5 }, tom: { status: 'salaried', clin: 6 }, priya: { status: 'none', clin: 6 } },
    okoye: 40, flags: {}, mods: [], sched: [], later: [], seen: {}, counts: {}, queue: [], qi: 0, front: [],
    newRegs: [], careBeds: 0, fluMod: 1,
    history: [], leaveUsed: 0, drawTotal: 0, penTotal: 0, aspPaid: 0, hoursTotal: 0, loan: 0, premX: 0, payX: 0, tomRaise: 0,
    year: { inc: {}, exp: {}, oneoff: 0, profit: 0, share: 0 },
    cqc: null, cur: null, report: null, exit: null, forceOver: null, over: null, end: null, lastRatio: 1, log: [], consq: []
  };
  S.qofAsp = P.qofAsp * qofValueK(p.lastQof) / 12;
  [['contract_2026', 0], ['welcome', 0], ['hartley_retire', 0], ['okoye_email', 1], ['mini_docman', 1], ['pay_award', 2], ['mini_triage', 2],
   ['tom_partner', 3], ['survey', 3], ['headline', 4], ['flu_saturday', 5], ['okoye_leaving', 7], ['okoye_staying', 7],
   ['winter_phones', 8], ['qof_yearend', 10], ['contract_new', 11]].forEach(([id, m]) => S.sched.push({ id, m }));
  S.goal = pick(Object.keys(GOALS));
  // one late-year shock, so a good plan still gets tested
  S.sched.push({ id: pick(['twist_ill', 'twist_fire', 'twist_flood']), m: 6 + Math.floor(Math.random() * 4) });
  // a mid-year crunch for the suburb and town, so good players are at risk before the winter (the city has its turnover)
  if (S.practiceKey !== 'city') { S.sched.push({ id: 'twist_summer', m: 2 + Math.floor(Math.random() * 3) }); S.flags.summerGP = S.staff.salaried > 0 && Math.random() < 0.5 ? 1 : 0; }
  // the contract explained, in six cards through the year (suburb and town, unless switched off)
  teachSchedule();
  startMonth();
  save();
}

/* ---------- scheduling, modifiers, delayed consequences ---------- */
function schedule(id, n) {
  if (!EVMAP[id]) return;
  if (n <= 0 && (S.phase === 'event' || S.phase === 'outcome' || S.phase === 'mini')) { if (!S.queue.slice(S.qi + 1).includes(id)) S.queue.splice(S.qi + 1, 0, id); return; }
  if (n <= 0 && (S.phase === 'report' || S.phase === 'monthend')) { S.front.push(id); return; }
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
// plant a consequence that may land in a later month: {in, p, fx, note}
// It remembers the card, the month and the choice that planted it, so the report can say which decision it came from.
function plant(seed) {
  const e = S.phase === 'event' ? currentEvent() : null;
  S.later.push({ m: S.month + (seed.in || 1), p: seed.p == null ? 1 : seed.p, fx: seed.fx || {}, note: seed.note || '', from: seed.from || (e ? fill(val(e.title)) + ', ' + MONTHS[S.month] : ''),
    card: e ? fill(val(e.title)) : '', mon: e ? MONTHS[S.month] : '', yr: S.yr || 0, gen: S.gen || 1, pick: seed.pick || (e && S._pick) || '' });
  S._planted = true;
}
function partnerLeaves(id) {
  const q = S.partners[id];
  if (!q || q.status !== 'active') return;
  q.status = 'left';
  const cap = PARTNERS0[id].capital || 0;
  S.cash = r1(S.cash - cap);
  S.log.push(`${PARTNERS0[id].name} left the partnership. Their £${cap}k of capital was repaid.`);
  addMod({ id: 'loss_' + id, label: `Settling in after ${PARTNERS0[id].short} left`, months: 3, aim: { team: -4 } });
}

/* ---------- month flow ---------- */
// how hard things have got: years served, partners fallen, meters in the red. Gates the long-haul cards (pmin).
function pressure() { return (S.yr || 0) + ((S.gen || 1) - 1) + STAT_KEYS.filter(k => S.st[k] < 30).length * 0.5; }
function eligible(e, queued) {
  if (e.arc) return false;
  if (e.pmin && pressure() < e.pmin) return false;
  if (e.months && !e.months.includes(S.month)) return false;
  if (!e.rep && S.seen[e.id]) return false;
  if (e.rep && e.max && (S.counts[e.id] || 0) >= e.max) return false;
  if (queued.includes(e.id)) return false;
  if (e.kind === 'mini' && queued.some(id => EVMAP[id] && EVMAP[id].kind === 'mini')) return false;
  if (e.kind === 'mini' && S.lastMini === e.game) return false;
  try { if (e.cond && !e.cond()) return false; } catch (err) { return false; }
  return true;
}
function crisisQueue() {
  const q = [];
  if (S.cash < S.overdraft && !S.flags.lifelineOffered) { S.flags.lifelineOffered = 1; q.push('lifeline'); }
  if (activeOthers() === 0 && !S.seen.last_partner) q.push('last_partner');
  if (S.st.you <= 18 && !S.seen.crisis_you) q.push('crisis_you');
  if (S.st.team <= 18 && !S.seen.crisis_team) q.push('crisis_team');
  if (S.st.patients <= 18 && !S.seen.crisis_patients) q.push('crisis_patients');
  if (S.st.safety <= 18 && !S.seen.crisis_safety && !S.seen.cqc_visit) q.push('crisis_safety');
  return q;
}
function startMonth() {
  const m = S.month;
  const q = S.front.concat(S.sched.filter(x => x.m === m).map(x => x.id));
  S.front = [];
  S.sched = S.sched.filter(x => x.m > m);
  if (m === 8 && !S.seen.cqc_call && !q.includes('cqc_call')) q.push('cqc_call');
  const crisis = crisisQueue().filter(id => !q.includes(id));
  const target = (m === 8 || m === 9) ? 4 : 3;
  let need = Math.max(0, target - q.length);
  const drawn = [];
  while (need > 0) {
    const pool = EVENTS.filter(e => eligible(e, q.concat(drawn)));
    if (!pool.length) break;
    const wt = e => (val(e.w) || 1) * (S.ever && S.ever[e.id] ? 0.25 : 1);
    const tot = pool.reduce((a, e) => a + wt(e), 0);
    let r = Math.random() * tot, chosen = pool[0];
    for (const e of pool) { r -= wt(e); if (r <= 0) { chosen = e; break; } }
    drawn.push(chosen.id); need--;
  }
  S.queue = q.concat(drawn);
  if (S.queue.length > 2 && drawn.length) { const last = S.queue.pop(); S.queue.splice(1, 0, last); }
  S.queue = crisis.concat(S.queue);
  S.qi = 0;
  S.plan.leave = false;
  S.phase = 'plan';
}
function beginMonth() {
  if (S.plan.leave) S.leaveUsed++;
  S.monthStart = { st: { ...S.st }, cash: S.cash, qof: S.qof, inbox: S.inbox, list: S.list };
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
  for (const k of STAT_KEYS) { const d = Math.round(b[k] - a[k]); if (d) out.push({ k, d, label: STAT_LABEL[k], txt: (d > 0 ? '+' : '') + d, good: d > 0 }); }
  const dc = r1(b.cash - a.cash); if (dc) out.push({ k: 'cash', d: dc, label: 'Bank', txt: (dc > 0 ? '+£' : '−£') + Math.abs(dc).toFixed(1) + 'k', good: dc > 0 });
  const dq = Math.round(b.qof - a.qof); if (dq) out.push({ k: 'qof', d: dq, label: 'QOF', txt: (dq > 0 ? '+' : '') + dq + '%', good: dq > 0 });
  const di = Math.round(b.inbox - a.inbox); if (di) out.push({ k: 'inbox', d: di, label: 'Inbox', txt: (di > 0 ? '+' : '') + di, good: di < 0 });
  const dl = b.list - a.list; if (dl) out.push({ k: 'list', d: dl, label: 'List', txt: (dl > 0 ? '+' : '') + dl, neutral: true });
  return out;
}

function applyFx(fx) {
  if (!fx) return;
  for (const k of STAT_KEYS) if (fx[k]) S.st[k] = clamp(S.st[k] + fx[k]);
  if (fx.cash) { S.cash = r1(S.cash + fx.cash); S.year.oneoff += fx.cash; S.year.share += fx.cash / (1 + activeOthers()); }
  if (fx.capital) S.cash = r1(S.cash + fx.capital);
  if (fx.qof) S.qof = clamp(S.qof + (fx.qof > 0 ? fx.qof * qofHeadroom() : fx.qof));
  if (fx.inbox) S.inbox = Math.max(0, Math.round(S.inbox + fx.inbox));
  if (fx.list) S.list += fx.list;
  if (fx.demand) S.demandMod += fx.demand;
  if (fx.admin) S.adminMod += fx.admin;
  if (fx.rooms) S.rooms = Math.max(1, S.rooms + fx.rooms);
  if (fx.okoye) S.okoye = clamp(S.okoye + fx.okoye);
  if (fx.icb) S.icb = clamp(S.icb + fx.icb);
  if (fx.rep) S.rep = clamp(S.rep + fx.rep);
  if (fx.aim) for (const k in fx.aim) S.aim[k] = (S.aim[k] || 0) + fx.aim[k];
  if (fx.staff) for (const r in fx.staff) S.staff[r] = Math.max(0, (S.staff[r] || 0) + fx.staff[r]);
  if (fx.flags) Object.assign(S.flags, fx.flags);
  if (fx.sched) fx.sched.forEach(([id, n]) => schedule(id, n));
  if (fx.mod) addMod(fx.mod);
  if (fx.later) fx.later.forEach(plant);
}

// The same choice costs more when the practice is already stretched, so the best answer depends on the moment:
// a hit to a meter that's already below 30 lands a quarter harder, and so does a hit to You in winter,
// team costs hurt more in the summer holidays and patient costs in winter, money spent near the overdraft limit costs you sleep, and more inbox on a full inbox costs safety.
// Gains to a meter that's already high are halved, and gains to one below 30 are worth a third more. Returns the adjusted effects and the reasons.
const WINTER_MONTHS = [8, 9, 10], SUMMER_MONTHS = [3, 4];
function ctxFx(fx) {
  if (!fx || typeof fx !== 'object' || !S || !S.st) return { fx, why: [] };
  const out = Object.assign({}, fx), why = [];
  for (const k of STAT_KEYS) {
    const d = fx[k]; if (!d) continue;
    if (d < 0) {
      let m = 1;
      if (S.st[k] < 30) { m += 0.25; why.push(`${STAT_LABEL[k]} is already low`); }
      if (k === 'you' && WINTER_MONTHS.includes(S.month)) { m += 0.25; why.push('Winter: everything takes more out of you'); }
      if (k === 'team' && SUMMER_MONTHS.includes(S.month)) { m += 0.25; why.push('Summer holidays: half the team is on leave'); }
      if (k === 'patients' && WINTER_MONTHS.includes(S.month)) { m += 0.25; why.push('Winter: patients have nowhere else to go'); }
      out[k] = Math.round(d * m);
    } else if (S.st[k] >= 75) { out[k] = Math.max(1, Math.round(d / 2)); }
    else if (S.st[k] < 30) { out[k] = Math.round(d * 1.3); } // help lands harder where it's needed most
  }
  if (fx.cash < 0 && S.cash < S.overdraft / 2) { out.you = (out.you || 0) - Math.min(4, Math.ceil(-fx.cash / 2)); why.push('The bank is deep in the overdraft'); }
  if (fx.inbox > 0 && S.inbox > 500) { out.safety = (out.safety || 0) - Math.min(4, Math.ceil(fx.inbox / 50)); why.push('The inbox is already over 500'); }
  return { fx: out, why: [...new Set(why)] };
}
function resolveChoice(i, extra) {
  const e = currentEvent(); if (!e) return;
  const c = e.choices[i]; if (!c) return;
  const before = snap();
  S._alt = false; S._planted = false;
  try { S._pick = fill(val(c.t)); } catch (err) { S._pick = ''; }
  const schedBefore = S.sched.length + S.queue.length;
  let fx = c.fx, o = c.o;
  if (c.alt && chance(val(c.alt.p))) { S._alt = true; fx = c.alt.fx; o = c.alt.o; }
  applyFx(ctxFx(val(fx)).fx);
  if (!S._alt && c.later) c.later.forEach(plant);
  let res = null;
  if (c.run) res = c.run() || null;
  if (S._alt && c.alt && c.alt.run) c.alt.run();
  if (extra) applyFx(extra.fx);
  if (e.after) e.after();
  S.seen[e.id] = 1; S.counts[e.id] = (S.counts[e.id] || 0) + 1;
  (S.ever = S.ever || {})[e.id] = (S.ever[e.id] || 0) + 1;
  if (e.kind === 'mini') S.lastMini = e.game;
  const deltas = diffSnap(before, snap());
  const echoes = S._planted || S.sched.length + S.queue.length > schedBefore;
  S.cur = { id: e.id, o: fill((res && res.o) || (extra && extra.o) || val(o) || ''), html: (res && res.html) || (extra && extra.html) || '', deltas, alt: S._alt, echoes, lasting: !!(val(fx) || {}).aim };
  delete S._alt; delete S._planted; delete S._pick;
  S.phase = 'outcome';
  save();
}
function continueOutcome() {
  if (S.exit) return finishYear(S.exit);
  const over = checkOver();
  if (over) return gameOver(over);
  if (S.cash < S.overdraft && !S.flags.lifelineOffered) { S.flags.lifelineOffered = 1; schedule('lifeline', 0); }
  if (activeOthers() === 0 && !S.seen.last_partner) schedule('last_partner', 0);
  advanceEvent();
}

/* ---------- the simulation ---------- */
function calc() {
  const p = prac(), pl = S.plan, m = Math.min(S.month, 11);
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
  cap += pl.locum * 14 + (pl.extra || 0) * OT_APPTS;
  clear += 80; // the admin team's workflow coding
  mods.forEach(x => { if (x.capAdd) cap += x.capAdd; });
  let capMul = 1;
  mods.forEach(x => { if (x.capMul) capMul *= x.capMul; });
  const recepNeed = Math.round(S.list / 1600); // about 6 per 10,000 patients: within the national 12.3 admin staff per 10,000 [S58]
  const recepShort = Math.max(0, recepNeed - S.staff.recep);
  capMul *= 1 - 0.04 * recepShort;
  const rNeed = roomsNeeded(), rAvail = roomsAvail();
  const roomsOver = Math.max(0, rNeed - rAvail) / ROOM_SESSIONS; // in rooms' worth of sessions
  capMul *= 1 - 0.04 * roomsOver;
  if (S.st.team < 30) capMul *= 0.93;
  capMul *= LEAVE[m] || 1; // staff annual leave: school holidays in summer, Christmas, Easter
  cap = Math.round(cap * capMul);
  const dm = S.demandMod + mods.reduce((a, x) => a + (x.demand || 0), 0) - 2 * Math.min(S.staff.sp, 2);
  const yr = S.yr || 0; // each extra year as a partner: more demand, funding that lags costs
  const demand = Math.round(S.list * p.demandRate * SEASON[m] * (1 + dm / 100) * (1 + YEAR_DEMAND * yr));
  const ratio = demand ? cap / demand : 1;
  const inflow = Math.round(S.list * p.inboxRate * (1 + S.adminMod / 100) + pl.locum * 6);
  clear = Math.round(clear);
  const inboxEnd = Math.max(0, Math.round(S.inbox + (inflow - clear) * WEEKS));
  // money, £k a month
  const partnersN = 1 + activeOthers();
  const w = weightedList();
  // claims for vaccinations and enhanced services need appointments to deliver them
  const serviceF = clamp(0.4 + 0.6 * ratio, 0.45, 1.03);
  const inc = {
    gs: w * P.gs * (1 - P.ooh) / 12 / 1000,
    qof: S.qofAsp,
    npp: P.npp * w / 12 / 1000,
    vacc: serviceF * S.list * PER_PATIENT.vacc * (0.4 / 12 + (FLU_MONTHS.includes(m) ? 0.12 * S.fluMod : 0)) / 1000,
    es: serviceF * S.list * PER_PATIENT.es / 12 / 1000,
    pcn: S.list * PER_PATIENT.pcn / 12 / 1000,
    priv: S.list * p.priv / 12 / 1000
  };
  // local services the ICB has decommissioned take their share of the enhanced-services income with them (lcs_cut)
  inc.es *= 1 - Math.min(0.9, mods.reduce((a, x) => a + (x.esCut || 0), 0));
  ['gs', 'npp', 'vacc', 'es', 'pcn'].forEach(k => { inc[k] *= 1 + YEAR_FUNDING * yr; });
  let modCash = 0; mods.forEach(x => { if (x.fx && x.fx.cash) modCash += x.fx.cash; });
  let roleCost = 0; for (const r of ROLE_ORDER) roleCost += ROLES[r].cost * S.staff[r];
  roleCost -= arrsGPs() * ROLES.salaried.cost; // a GP claimed through the PCN is paid from the ARRS budget instead
  const cost = {
    staff: (roleCost + S.list * CORE_ADMIN + S.payX + S.tomRaise) * (1 + YEAR_STAFF * yr),
    locum: pl.locum * WEEKS * LOCUM_SESSION + (pl.extra || 0) * WEEKS * OT_SESSION,
    running: (S.list * RUNNING + p.premNet + p.overhead) * (1 + YEAR_RUNNING * yr) + S.premX + S.loan,
    // neglect costs money: sickness cover when morale is low, incident handling when care is unsafe
    cover: Math.max(0, 45 - S.st.team) * 0.25 + Math.max(0, 35 - S.st.safety) * 0.2,
    // additional-roles staff beyond the PCN budget are paid by the practice
    arrs: Math.max(0, arrsSpend(false) - arrsBudget()) / 12
  };
  const incTot = Object.values(inc).reduce((a, b) => a + b, 0);
  const costTot = cost.staff + cost.locum + cost.running + cost.cover + cost.arrs;
  const profit = incTot + modCash - costTot;
  const estShare = Math.max(0, profit * 12 / partnersN * 1000);
  const penEach = estShare * 0.95 * pensionRate(estShare * 0.95) / 12 / 1000;
  const out = { draw: drawOf(pl.draw) * partnersN, pension: penEach * partnersN };
  const net = profit - out.draw - out.pension;
  // your week
  const sessions = pl.clin + pl.admin + pl.mgmt;
  const supN = ROLE_ORDER.filter(r => ROLES[r].sup).reduce((a, r) => a + S.staff[r], 0);
  let hours = sessions * P.realHours * leaveF;
  const hWhy = [[hours, `${sessions} sessions at about ${P.realHours} real hours each`]];
  const addH = (h, why) => { if (h > 0.4) { hours += h; hWhy.push([h, why]); } };
  addH(Math.min(10, Math.max(0, inboxEnd - 400) / 60), 'Results and letters in the evenings');
  addH(Math.min(8, Math.max(0, 1 - ratio) * 30), 'Extras squeezed in when demand outruns capacity');
  addH(Math.max(0, supN - 2) * 1.2, `Supervising ${supN} ARRS clinicians`);
  // advanced practitioners need a named GP supervisor and regular debriefs from day one
  addH((S.staff.anp || 0) * 2, `Supervising ${S.staff.anp === 1 ? 'your advanced nurse practitioner' : `${S.staff.anp} advanced nurse practitioners`}`);
  addH(activeOthers() === 0 ? 8 : activeOthers() === 1 ? 3 : 0, activeOthers() === 0 ? 'Doing every partner job yourself' : 'Only two partners to share the running of it');
  mods.forEach(x => { if (x.hours) addH(x.hours, x.label); });
  const qofGain = (1.5 + S.staff.nurse * 1.1 + S.staff.hca * 0.7 + S.staff.pharm * 0.7 + S.staff.cc * 1.8 + pl.mgmt * 1.1) * p.qofEase;
  const c = { serviceF, cap, demand, ratio, inflow, clear, inboxEnd, inc, cost, incTot, costTot, modCash, profit, out, net, penEach, estShare, sessions, hours, hWhy, recepNeed, recepShort, rNeed, rAvail, roomsOver, supN, qofGain, partnersN, capMul };
  c.T = targets(c);
  return c;
}

// where each meter is heading, and why. Meters drift a fraction of the way there each month.
function targets(c) {
  const p = prac(), mods = activeMods(), m = Math.min(S.month, 11);
  const T = {};
  const build = (k, base, parts) => {
    let v = base; const why = [];
    parts.forEach(([d, label]) => { if (Math.abs(d) >= 0.5) { v += d; why.push([Math.round(d), label]); } });
    const modAim = mods.reduce((a, x) => a + ((x.aim && x.aim[k]) || 0), 0);
    if (modAim) { v += modAim; why.push([modAim, mods.filter(x => x.aim && x.aim[k]).map(x => x.label).join(', ')]); }
    if (S.aim[k]) { v += S.aim[k]; why.push([Math.round(S.aim[k]), 'Lasting effects of earlier decisions']); }
    T[k] = { v: Math.round(clamp(v, 5, 95)), why };
  };
  const r = c.ratio, ib = c.inboxEnd;
  build('patients', 52, [
    [clamp(110 * (r - 1), -35, 25), `Appointments cover ${pctTxt(r)} of what patients ask for`],
    [(S.rep - 55) * 0.3, 'Local reputation'],
    [-5 * c.recepShort, 'Reception short: nobody answers the phone'],
    [ib > 700 ? -8 : ib > 400 ? -3 : 0, 'Results and letters waiting too long'],
    [WINTER.includes(m) ? -3 : 0, 'Winter: everyone is ill at once'],
    [p.key === 'city' ? -3 : 0, 'High need and a transient list']
  ]);
  build('team', 58, [
    [-clamp(90 * (0.97 - r), 0, 30), 'Short of appointments: everyone is firefighting'],
    [-4 * c.recepShort, 'Reception understaffed'],
    [-4 * c.roomsOver, 'Not enough rooms'],
    [-1.5 * (S.plan.extra || 0), 'Staff doing evening and Saturday overtime'],
    [ib > 700 ? -4 : 0, 'The inbox is everyone\'s problem'],
    [S.st.team < 30 ? -3 : 0, 'Sickness absence'],
    [p.key === 'city' ? -3 : 0, 'Abuse at the front desk'],
    [SUMMER_MONTHS.includes(m) ? -3 : 0, 'Summer holidays: the rota has holes']
  ]);
  build('you', 80, [
    [-(S.yr || 0) * YEAR_YOU, `Year ${(S.yr || 0) + 1} as a partner`],
    [-(c.hours - 38) * 2.6, `${Math.round(c.hours)} hours a week`],
    [WINTER.includes(m) ? -1 : 0, 'Winter'],
    [SUMMER_MONTHS.includes(m) ? -3 : 0, 'Covering everyone else\'s summer holidays'],
    [m === 5 || m === 6 || m === 7 ? -2 : 0, 'Flu clinics on top of everything else'],
    [S.plan.draw === 'low' ? -3 : S.plan.draw === 'high' ? 2 : 0, S.plan.draw === 'low' ? 'Lean drawings: the mortgage' : 'Generous drawings'],
    [S.drawBase && S.drawBase < DRAW.std ? -Math.min(8, Math.round((DRAW.std - S.drawBase) * 1.2)) : 0, 'Drawings cut to what the practice earns'],
    [S.plan.leave ? 8 : 0, 'A week off'],
    [activeOthers() === 0 ? -4 : 0, 'Carrying it alone'],
    [p.key === 'city' ? -2 : 0, 'Interpreter line on hold, again'],
    [-(p.youDrag || 0), p.youDragWhy || '']
  ]);
  build('safety', 56, [
    [Math.min(S.plan.mgmt, 3) * 4, 'Management time for governance'],
    [ib > 700 ? -18 : ib > 400 ? -7 : 0, `${ib} unfiled results and letters`],
    [r < 0.8 ? -10 : r < 0.9 ? -4 : 0, 'Rushed appointments'],
    [S.st.team < 30 ? -6 : 0, 'An exhausted team cuts corners'],
    [S.staff.pharm > 0 ? 3 : 0, 'Pharmacist-led medication monitoring']
  ]);
  return T;
}
// what the month end does to each meter before anything else happens (used by the planner)
function forecast(c) {
  c = c || calc();
  const d = {};
  for (const k of STAT_KEYS) d[k] = Math.round((c.T[k].v - S.st[k]) * DRIFT[k]);
  return { d, inboxEnd: c.inboxEnd, T: c.T };
}

// things that happen because of the state you are in. Each note says why.
function incidents(c) {
  const notes = [];
  const add = (fx, note) => { applyFx(fx); notes.push(note); };
  if (S.inbox > 500 && chance(Math.min(0.45, (S.inbox - 500) / 1200)))
    add({ safety: -6, you: -3, rep: -2 }, `Because the inbox reached ${S.inbox}: an abnormal result sat unactioned for three weeks. It's now a significant event.`);
  if ((c.recepShort > 0 || S.st.team < 35) && S.staff.recep > 2 && chance(0.22))
    add({ staff: { recep: -1 } }, `Because reception is stretched: a receptionist resigned. "I didn't sign up to be shouted at."`);
  if (S.st.team < 30 && S.staff.nurse > 0 && chance(0.2))
    add({ staff: { nurse: -1 }, qof: -2 }, 'Because morale is low: a practice nurse took a job at the hospital.');
  if (S.st.team < 30 && S.staff.salaried > 0 && chance(0.15)) {
    add({ staff: { salaried: -1 } }, 'Because morale is low: a salaried GP left to locum. "At £100 an hour I can choose my days."');
    if (!S.flags.tomGone) S.flags.tomGone = 1;
  }
  // high-turnover areas lose staff even when morale is fine
  const tv = prac().turnover || 0;
  if (tv && chance(tv)) {
    const pool = ['recep', 'nurse', 'hca'].filter(r => S.staff[r] > (r === 'recep' ? 2 : 0));
    if (pool.length) {
      const r = pick(pool);
      add({ staff: { [r]: -1 }, team: -2 }, `Because staff turnover is high in ${prac().place}: a ${ROLES[r].name.toLowerCase()} left for a job nearer home that pays a little more.`);
    }
  }
  if (c.ratio < 0.87 && chance(0.5))
    add({ rep: -3, icb: -2, patients: -2 }, `Because appointments only covered ${pctTxt(c.ratio)} of demand: ${3 + Math.floor(Math.random() * 5)} written complaints about access.`);
  if (c.hours > 55 && chance(0.3))
    add({ you: -5, team: -2 }, `Because you're working ${Math.round(c.hours)} hours a week: you were off sick for three days. Your partners covered.`);
  if (S.icb < 30 && !S.flags.icbWarn && chance(0.4)) {
    S.flags.icbWarn = 1;
    add({ you: -3 }, 'Because relations with the ICB have soured: Jonathan has asked for a "performance conversation".');
  }
  if (c.ratio >= 1.03 && S.st.team >= 55 && chance(0.3))
    add({ you: 3, team: 2, rep: 1 }, 'A quiet week. Everyone went home on time, once.');
  if (chance(0.12)) {
    const sh = pick([
      [{ team: -3 }, 'Two receptionists were off sick with the same cold.'],
      [{ you: -3 }, 'A locum cancelled at 7:45am. You covered.'],
      [{ patients: 2, team: 3 }, 'A patient brought flapjacks for reception.'],
      [{ you: 3 }, 'You had a whole lunch break, sitting down.']
    ]);
    add(sh[0], sh[1]);
  }
  return notes;
}

function monthEnd() {
  const c = calc(), pl = S.plan, p = prac();
  S.phase = 'monthend';
  const before = S.monthStart ? { ...S.monthStart.st, cash: S.monthStart.cash, qof: S.monthStart.qof, inbox: S.monthStart.inbox, list: S.monthStart.list } : snap();
  const inboxStart = S.inbox;
  const notes = [], consq = S.consq.slice(); S.consq = [];
  // meters drift toward where the practice's situation is taking them
  const drift = {};
  for (const k of STAT_KEYS) { const d = (c.T[k].v - S.st[k]) * DRIFT[k]; drift[k] = Math.round(d); S.st[k] = clamp(S.st[k] + d); }
  S.inbox = c.inboxEnd;
  // money
  S.cash = r1(S.cash + c.net);
  if (S.cash < S.overdraft / 2) S.flags.deepOD = 1;
  S.aspPaid += c.inc.qof;
  S.drawTotal += drawOf(pl.draw);
  S.penTotal += c.penEach;
  S.hoursTotal += c.hours * WEEKS;
  for (const k in c.inc) S.year.inc[k] = (S.year.inc[k] || 0) + c.inc[k];
  for (const k in c.cost) S.year.exp[k] = (S.year.exp[k] || 0) + c.cost[k];
  if (c.modCash) S.year.inc.schemes = (S.year.inc.schemes || 0) + c.modCash;
  S.year.profit += c.profit;
  S.year.share += c.profit / c.partnersN;
  S.qof = clamp(S.qof + c.qofGain * qofHeadroom());
  // monthly effects from modifiers
  activeMods().forEach(x => { if (x.fx) { const fx = { ...x.fx }; delete fx.cash; applyFx(fx); } });
  // project
  const proj = PROJECTS.find(x => x.id === pl.project) || PROJECTS[0];
  // what the project did, measured, for the report's "This month's project" panel
  const px = { before: snap(), rooms: S.rooms, dem: ['digital', 'telephony'].includes(proj.id) ? calc().demand : 0, ads: Object.values(S.vac).reduce((a, n) => a + n, 0) };
  if (proj.id === 'claims') {
    const times = S.counts.proj_claims || 0;
    const found = r1((3 + Math.random() * 6) * Math.pow(0.55, times));
    S.counts.proj_claims = times + 1;
    applyFx({ cash: found });
    px.found = found; px.times = times;
  } else applyFx(proj.fx);
  px.deltas = diffSnap(px.before, snap());
  if (px.dem) px.dem = Math.max(0, px.dem - calc().demand);
  if (proj.once) S.flags['proj_' + proj.id] = 1;
  S.projHist = (S.projHist || []).concat(proj.id).slice(-6);
  if (proj.id === 'telephony') S.flags.telephonyLive = 1;
  // Nadia watches everything
  S.okoye = clamp(S.okoye + (c.ratio < 0.9 ? 2 : 0) + (S.st.team < 40 ? 2 : 0) - (S.st.team >= 65 ? 2 : 0) + (pl.draw === 'low' ? 4 : pl.draw === 'high' ? -2 : 0) + (c.hours > 52 ? 1 : 0));
  // delayed consequences of earlier decisions
  const due = S.later.filter(x => x.m <= S.month);
  S.later = S.later.filter(x => x.m > S.month);
  due.forEach(x => {
    if (!chance(x.p)) return;
    const b = snap(); applyFx(x.fx);
    // older saves only have `from`; newer seeds also carry the card, month, year and the choice
    if (x.note) consq.push({ card: x.card || '', mon: x.mon || '', ago: x.card ? (S.yr || 0) - (x.yr || 0) : 0, pred: !!x.card && (x.gen || 1) !== (S.gen || 1), from: x.from || '', pick: x.pick || '', note: x.note, ds: diffSnap(b, snap()) });
  });
  // things that happen because of the state you're in
  incidents(c).forEach(n => consq.push(n));
  // unhappy patients register elsewhere, and the global sum follows them
  if (S.st.patients < 35) {
    const gone = Math.round(S.list * 0.002 * (35 - S.st.patients) / 5 * (p.key === 'city' ? 0.6 : 1));
    if (gone > 0) { S.list -= gone; consq.push(`Because patients are unhappy: ${gone} registered with other practices this month, and their funding went with them.`); }
  }
  // the contract process: a remedial notice, a breach notice if access hasn't improved a month later,
  // and termination after three month-ends in a row of poor access once notice has been served
  const f = S.flags;
  if (f.remedialAt != null && f.breachAt == null && !S.seen.breach_notice && S.month >= f.remedialAt + 1 && S.st.patients < 30) schedule('breach_notice', 0);
  f.lowAccess = S.st.patients < (prac().accessLine || 10) ? (f.lowAccess || 0) + 1 : 0;
  if (f.remedialAt != null && f.lowAccess >= 3) {
    S.forceOver = 'patients';
    consq.push('Because patients still couldn\'t get through, three months running after the ICB\'s notice: the ICB has given notice to terminate the contract.');
  } else if (f.remedialAt != null && f.lowAccess === 2) consq.push('Warning: two months in a row of poor access since the ICB\'s notice. A third means the contract can be terminated.');
  // recruitment: harder when morale or reputation is poor
  const hires = [];
  for (const r in S.vac) {
    let n = S.vac[r];
    while (n > 0) {
      // in an under-doctored area a salaried GP advert can run, but nobody applies
      if ((r === 'salaried' || r === 'arrsgp') && gpHeadroom() < 0) { hires.push(pick(NO_GP_REPLIES)); n--; continue; }
      // a GP through the PCN's additional-roles budget: a salaried GP whose pay is claimed from ARRS.
      // Since 2026/27 any GP can be claimed, so the pool is a little wider than for a practice post.
      if (r === 'arrsgp') {
        if (chance(Math.min(0.95, ROLES.salaried.hire * 1.25 * p.hire * (1 + (proj.hireBoost || 0)) * (0.8 + S.rep / 250) * (S.st.team < 35 ? 0.7 : 1)))) { S.staff.salaried++; S.arrsGP = (S.arrsGP || 0) + 1; S.vac.arrsgp--; hires.push('Salaried GP hired through the PCN\'s additional-roles budget.'); }
        else hires.push('GP through the PCN budget: no suitable applicants yet.');
        n--; continue;
      }
      const pr = Math.min(0.95, ROLES[r].hire * p.hire * (1 + (proj.hireBoost || 0)) * (0.8 + S.rep / 250) * (S.st.team < 35 ? 0.7 : 1));
      if (chance(pr)) { S.staff[r]++; S.vac[r]--; hires.push(`${ROLES[r].name} hired.`); }
      else hires.push(`${ROLES[r].name}: no suitable applicants yet.`);
      n--;
    }
    if (!S.vac[r]) delete S.vac[r];
  }
  px.hired = hires.filter(h => / hired/.test(h)).length;
  const projOut = { name: proj.name, text: projResult(proj.id, px), deltas: px.deltas };
  // modifiers tick down
  S.mods.forEach(x => { if (S.month >= x.from) x.months--; });
  const ended = S.mods.filter(x => x.months <= 0).map(x => x.label);
  S.mods = S.mods.filter(x => x.months > 0);
  ended.forEach(l => { if (l) notes.push(`Ended: ${l}.`); });
  const logged = S.log.length;
  S.log.forEach(l => notes.push(l)); S.log = [];
  if (c.recepShort) notes.push(`Reception is ${c.recepShort} short for a list this size.`);
  if (c.roomsOver) notes.push(`${c.rNeed - c.rAvail} clinic sessions a week had no room. Someone is consulting in the baby-change.`);
  if (activeOthers() === 0) notes.push('You are the only partner. Every decision, and every liability, is yours.');
  const pool = c.ratio < 0.87 ? HEADLINES.bad : c.ratio >= 1.02 ? HEADLINES.good : HEADLINES.ok;
  const headline = fill(pick(chance(0.25) ? HEADLINES.filler : pool));
  S.lastRatio = c.ratio;
  S.report = { month: S.month, c, drift, inboxStart, inboxEnd: S.inbox, headline, notes, consq, hires, project: proj.name, proj: projOut, news: consq.length + ended.length + logged + hires.filter(h => / hired\.$/.test(h)).length, deltas: diffSnap(before, snap()), cashEnd: S.cash };
  S.history.push({ m: S.month, patients: S.st.patients, team: S.st.team, you: S.st.you, safety: S.st.safety, cash: S.cash, qof: S.qof, ratio: c.ratio });
  S.phase = 'report';
  save();
}
// one plain sentence on what this month's project actually did
function projResult(id, x) {
  const d = k => (x.deltas.find(e => e.k === k) || {}).d || 0;
  const pts = (k, n = d(k)) => `${STAT_LABEL[k]} ${n >= 0 ? '+' : '−'}${Math.abs(n)}`;
  switch (id) {
    case 'none': return 'No project. The practice ticked over and you got a slightly easier month.';
    case 'qof': return `The recall texts went out and the Saturday clinic ran: QOF up ${d('qof')} points to ${Math.round(S.qof)}%. The overtime cost £1,200, and the team felt it.`;
    case 'cqc': return `Policies updated, fridge logs found, fire marshals named. ${pts('safety')} now, and Safety settles a point higher for good.`;
    case 'wellbeing': return `The practice closed for an afternoon of learning, and pizza. ${pts('team')}. Some patients found the doors shut, and the cover cost £600.`;
    case 'inbox': return `The admin team now codes letters themselves: the inbox fell by ${Math.abs(d('inbox'))} items, to ${Math.round(S.inbox)}. The training cost £1,500.`;
    case 'ppg': return `The patient participation group met, with tea and some pointed feedback. ${pts('patients')}, and your reputation in ${prac().place} rose.`;
    case 'claims': return `The claims audit found £${x.found.toFixed(1)}k of unclaimed income${x.times ? ', less than last time: the easy money has gone' : ''}.`;
    case 'recruit': return x.ads ? `Adverts, social media and a stall at the training scheme gave your ${x.ads} open advert${x.ads > 1 ? 's' : ''} better odds: ${x.hired ? `${x.hired} hired` : 'nobody suitable yet'}. It cost £1,000.` : 'Adverts, social media and a stall at the training scheme, but you had no posts advertised, so nobody was hired. It cost £1,000. Recruit someone first next time.';
    case 'meetingroom': return `The meeting room is a clinic room now: ${S.rooms} rooms, about ${ROOM_SESSIONS} more bookable sessions a week, for good. It cost £4,000, and meetings have moved to the staff room.`;
    case 'digital': return `Clearer online forms: about ${Math.round(x.dem)} fewer requests a week from now on. It cost £800.`;
    case 'telephony': return `Cloud telephony is live: call-backs, queue positions, no engaged tone. ${pts('patients')}, and Patients settle higher for good. It cost £9,000.`;
  }
  return (PROJECTS.find(p => p.id === id) || {}).desc || '';
}
function nextMonth() {
  const over = checkOver();
  if (over) return gameOver(over);
  if (S.month >= 11) return finishYear(null);
  S.month++;
  if ((PROJECTS.find(x => x.id === S.plan.project) || {}).once) S.plan.project = 'none';
  startMonth();
  save();
}
