// Headless balance check for Last Partner Standing.
// Usage: node tools/simulate.mjs [games per practice and policy, default 200] [suburb|town|city|all] [random|smart|both] [endless]
// With `endless`, each game carries on into later years (up to 10) until it ends, and reports how many months partners last.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const FILES = ['c-data.js', 'c2-minidata.js', 'd-events1.js', 'e-events2.js', 'f-events3.js', 'f2-events4.js', 'f3-events5.js', 'f4-events6.js', 'g-engine.js', 'g2-endings.js'];
const code = FILES.map(f => readFileSync(path.join(dir, '..', 'src', f), 'utf8')).join('\n') +
  '\n;globalThis.__lps = { newGame, gpHeadroom, locumMax, beginMonth, currentEvent, resolveChoice, continueOutcome, nextMonth, continueYear, calc, activeOthers, arrsCount, roomsNeeded, roomsAvail, ROLES, STAT_KEYS, val, S: () => S };';
const ctx = vm.createContext({ console, Math, JSON, Date });
vm.runInContext(code, ctx, { filename: 'lps.js' });
const L = ctx.__lps;

const N = +(process.argv[2] || 200);
const practices = !process.argv[3] || process.argv[3] === 'all' ? ['suburb', 'town', 'city'] : [process.argv[3]];
const policies = !process.argv[4] || process.argv[4] === 'both' ? ['random', 'smart'] : [process.argv[4]];
const ENDLESS = process.argv[5] === 'endless', MAX_YEARS = 10;
const EXIT_CHOICES = { breach_notice: [2], apex_offer: [0], merger_vote: [0], salaried_offer: [0], emigrate: [0], last_partner: [0], lifeline: [1] };

function options(e) {
  return e.choices.map((c, i) => i).filter(i => { const c = e.choices[i]; try { return !c.need || c.need(); } catch { return false; } });
}
function greedy(e, S) {
  let best = -1e9, bi = options(e)[0];
  for (const i of options(e)) {
    const c = e.choices[i];
    let fx = {}; try { fx = L.val(c.fx) || {}; } catch { }
    let s = 0;
    for (const k of L.STAT_KEYS) if (fx[k]) s += fx[k] * (1 + Math.max(0, (50 - S.st[k]) / 12));
    if (fx.cash) s += fx.cash * (S.cash < S.overdraft / 2 ? 1.2 : 0.35);
    if (fx.qof) s += fx.qof * 0.5;
    if (fx.inbox) s -= fx.inbox / 40;
    if (fx.aim) for (const k in fx.aim) s += fx.aim[k] * 3;
    if (c.alt) s -= 2;
    if (c.later) s -= 3;
    if ((EXIT_CHOICES[e.id] || []).includes(i)) s -= 999;
    if (c.play) s += 1;
    if (s > best) { best = s; bi = i; }
  }
  return bi;
}
function smartPlan(S) {
  const pl = S.plan;
  pl.clin = S.st.you < 40 ? 5 : 6; pl.admin = 1; pl.mgmt = 1; pl.locum = 0; pl.leave = false;
  pl.draw = S.cash < S.overdraft / 2 ? 'low' : 'std';
  let c = L.calc();
  if (S.month >= 1 && S.month <= 7) {
    const roomFree = L.roomsNeeded() + 8 <= L.roomsAvail();
    if (roomFree && L.arrsCount() < 6) for (const r of ['physio', 'para', 'mhp']) if (!S.staff[r] && !S.vac[r]) { S.vac[r] = 1; break; }
    if (c.ratio < 1.02 && L.gpHeadroom() >= 6 && !S.vac.salaried && S.staff.salaried < 3 && S.cash > S.overdraft + 50) { S.vac.salaried = 1; S.cash -= 1.5; }
    if (c.recepShort && !S.vac.recep) S.vac.recep = 1;
  }
  if (L.activeOthers() <= 1 && L.arrsCount() < 6 && !S.staff.gpa && !S.vac.gpa) S.vac.gpa = 1;
  c = L.calc();
  while (c.inboxEnd > 380 && pl.admin < 3) { pl.admin++; c = L.calc(); }
  pl.extra = 0;
  while (c.ratio < 0.97 && pl.extra < 2 && S.st.team >= 50) { pl.extra++; c = L.calc(); }
  while (c.ratio < 0.95 && pl.locum < Math.min(5, L.locumMax()) && S.cash > S.overdraft + 25) { pl.locum++; c = L.calc(); }
  if (S.st.you < 50 && S.leaveUsed < 6) pl.leave = true;
  pl.project = S.flags.telephony && !S.flags.proj_telephony ? 'telephony'
    : !S.flags.proj_meetingroom && L.roomsNeeded() + 4 > L.roomsAvail() && S.cash > S.overdraft + 30 ? 'meetingroom'
    : S.st.team < 45 ? 'wellbeing' : S.st.safety < 45 ? 'cqc' : S.inbox > 450 ? 'inbox' : S.st.patients < 40 ? 'ppg'
    : (S.month >= 6 && S.qof < 85) ? 'qof' : S.cash < 0 ? 'claims' : 'qof';
}

function play(practice, policy) {
  L.newGame(practice, 'Sim');
  let steps = 0;
  for (let S = L.S(); !['end', 'over'].includes(S.phase) || (ENDLESS && S.phase === 'end' && !S.end.exit && (S.yr || 0) < MAX_YEARS - 1); S = L.S()) {
    if (++steps > 2000 * MAX_YEARS) break;
    if (S.phase === 'end') { L.continueYear(); continue; }
    if (S.phase === 'plan') { if (policy === 'smart') smartPlan(S); L.beginMonth(); }
    else if (S.phase === 'event') {
      const e = L.currentEvent();
      const opts = options(e);
      const i = policy === 'smart' ? greedy(e, S) : opts[Math.floor(Math.random() * opts.length)];
      if (e.choices[i].play) L.resolveChoice(i, { fx: { inbox: -80, safety: 1, patients: 1 }, o: 'sim' });
      else L.resolveChoice(i);
    } else if (S.phase === 'outcome') L.continueOutcome();
    else if (S.phase === 'report') L.nextMonth();
    else if (S.phase === 'mini') S.phase = 'event';
    else throw new Error('stuck in phase ' + S.phase);
  }
  return L.S();
}

const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const errors = [];
if (ENDLESS) {
  for (const practice of practices) for (const policy of policies) {
    const months = [], ends = {};
    for (let g = 0; g < N; g++) {
      let S; try { S = play(practice, policy); } catch (err) { errors.push(`${practice}/${policy}: ${err.message}`); continue; }
      const m = S.phase === 'over' ? S.over.months : S.end.months;
      months.push(m);
      const why = S.phase === 'over' ? S.over.k : S.end.exit ? S.end.exit : 'still going';
      ends[why] = (ends[why] || 0) + 1;
    }
    months.sort((a, b) => a - b);
    const q = f => months[Math.min(months.length - 1, Math.floor(f * months.length))];
    const by = y => Math.round(100 * months.filter(m => m > y * 12).length / months.length);
    console.log(`\n${practice} / ${policy} (endless, up to ${MAX_YEARS} years): median ${q(0.5)} months, quartiles ${q(0.25)}–${q(0.75)}, longest ${months[months.length - 1]}`);
    console.log(`  reached year 2: ${by(1)}%, year 3: ${by(2)}%, year 5: ${by(4)}%, all ${MAX_YEARS} years: ${by(MAX_YEARS)}%`);
    console.log(`  how it ended: ${Object.entries(ends).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  }
  if (errors.length) { console.log(`\n${errors.length} errors. First:\n${errors[0]}`); process.exitCode = 1; }
  process.exit();
}
for (const practice of practices) for (const policy of policies) {
  const R = { survived: 0, exits: {}, overs: {}, share: [], take: [], perHour: [], qof: [], cqc: {}, st: { patients: [], team: [], you: [], safety: [] }, cash: [], titles: {} };
  for (let g = 0; g < N; g++) {
    let S;
    try { S = play(practice, policy); } catch (err) { errors.push(`${practice}/${policy}: ${err.message}\n${(err.stack || '').split('\n').slice(1, 4).join('\n')}`); continue; }
    if (S.phase === 'over') { const k = `${S.over.k}@${['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'][S.over.month]}`; R.overs[k] = (R.overs[k] || 0) + 1; continue; }
    const E = S.end;
    if (E.exit) { R.exits[E.exit] = (R.exits[E.exit] || 0) + 1; continue; }
    R.survived++;
    R.score = R.score || []; R.score.push(E.score); R.share.push(E.annualK); R.take.push(E.pers.takeHome / 1000); R.perHour.push(E.perHour); R.qof.push(S.qof); R.cash.push(S.cash);
    R.titles[E.arche.t] = (R.titles[E.arche.t] || 0) + 1;
    const cq = S.cqc ? S.cqc.overall : 'none'; R.cqc[cq] = (R.cqc[cq] || 0) + 1;
    for (const k of L.STAT_KEYS) R.st[k].push(S.st[k]);
  }
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${v}`).join(', ') || '-';
  console.log(`\n${practice} / ${policy}: survived ${R.survived}/${N}`);
  console.log(`  exits: ${top(R.exits)}`);
  console.log(`  game overs: ${top(R.overs)}`);
  if (R.survived) {
    console.log(`  score ${avg(R.score || []).toFixed(0)},`); console.log(`  profit share £${avg(R.share).toFixed(0)}k, take-home £${avg(R.take).toFixed(0)}k, £${avg(R.perHour).toFixed(0)}/hour, QOF ${avg(R.qof).toFixed(0)}%, bank £${avg(R.cash).toFixed(0)}k`);
    console.log(`  final meters: ${L.STAT_KEYS.map(k => `${k} ${avg(R.st[k]).toFixed(0)}`).join(', ')}`);
    console.log(`  CQC: ${top(R.cqc)}`);
    console.log(`  titles: ${top(R.titles)}`);
  }
}
if (errors.length) { console.log(`\n${errors.length} errors. First:\n${errors[0]}`); process.exitCode = 1; }
