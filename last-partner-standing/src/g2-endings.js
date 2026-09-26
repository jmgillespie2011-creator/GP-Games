/* ===================== ENGINE: CQC, endings, accounts, storage ===================== */
function rateOf(v) { return v >= 82 ? 'o' : v >= 50 ? 'g' : v >= 32 ? 'ri' : 'i'; }
const RATE_NAME = { o: 'Outstanding', g: 'Good', ri: 'Requires improvement', i: 'Inadequate' };
function runCQC(reinspect) {
  const st = S.st, expected = (S.month / 12) * 85;
  const jitter = () => (Math.random() - 0.5) * 8;
  const prep = clamp(S.flags.cqcPrep || 0, -6, 8); // walkround and myth-busting done beforehand
  const dom = {
    Safe: clamp(st.safety + prep + jitter()),
    Effective: clamp(50 + (S.qof - expected) * 1.2 + (st.safety - 50) * 0.3 + jitter()),
    Caring: clamp(st.patients * 0.7 + st.team * 0.3 + jitter()),
    Responsive: clamp(st.patients * 0.6 + (S.lastRatio - 0.8) * 150 + 10 + jitter()),
    'Well-led': clamp(st.team * 0.55 + st.safety * 0.35 + S.plan.mgmt * 5 + prep / 2 + jitter())
  };
  const rates = {}; for (const k in dom) rates[k] = rateOf(dom[k]);
  const vals = Object.values(rates);
  const n = t => vals.filter(v => v === t).length;
  let overall = 'g';
  if (n('i') >= 2 || rates.Safe === 'i') overall = 'i';
  else if (n('i') === 1 || n('ri') >= 2) overall = 'ri';
  else if (n('o') >= 3) overall = 'o';
  S.cqc = { overall, rates };
  const fx = { o: { team: 10, you: 8, patients: 4, rep: 6 }, g: { team: 5, you: 4, rep: 2 }, ri: { team: -6, you: -8, safety: 4, rep: -4, cash: -6, aim: { safety: 2 } }, i: { team: -12, you: -15, patients: -8, safety: 6, rep: -10, icb: -10, cash: -15, aim: { safety: 4 } } }[overall];
  applyFx(fx);
  let o;
  if (overall === 'o') o = 'Outstanding. Patricia almost smiles. Bev has the report framed before it is even published.';
  else if (overall === 'g') o = 'Good. The report praises "a caring, committed team working under significant pressure". Bev reads that line out loud four times.';
  else if (overall === 'ri') o = 'Requires improvement. There is an action plan with 23 points and about £6,000 of work in it: policies, training, a governance consultant. It will make the practice safer. Patricia will be back to check.';
  else o = reinspect ? 'Still inadequate. The ICB begins the process of terminating the contract.' : `Inadequate. Warning notices, special measures, about £15,000 of improvement support you have to pay for, and a re-inspection in three months. The ${prac().paper} runs it on the front page.`;
  if (overall === 'i') { if (reinspect) S.forceOver = 'cqc'; else schedule('cqc_reinspect', 3); }
  if (overall === 'ri') schedule('cqc_factual', 1);
  S.flags.cqcDone = 1;
  const html = `<div class="cqc-card" role="table" aria-label="CQC ratings">${Object.keys(rates).map(k => `<div class="row"><span>${k}</span><span class="rate ${rates[k]}">${RATE_NAME[rates[k]]}</span></div>`).join('')}<div class="row overall"><span>Overall</span><span class="rate">${RATE_NAME[overall]}</span></div></div>`;
  return { o, html };
}
EVENTS.push({ id: 'cqc_reinspect', arc: 1, who: 'cqc', title: 'The re-inspection', tag: 'rule', src: ['S33'],
  text: 'Patricia Sharpe is back, three months to the day. She has the action plan. She has your last report. She has, you notice, a new and larger clipboard.',
  choices: [{ t: 'Show her what\'s changed', run() { return runCQC(true); } }] });
EVMAP.cqc_reinspect = EVENTS[EVENTS.length - 1];

/* ---------- game over ---------- */
function checkOver() {
  for (const k of STAT_KEYS) if (S.st[k] <= 0) return k;
  if (S.cash < S.overdraft && S.flags.lifelineOffered && !S.queue.slice(S.qi + 1).includes('lifeline')) return 'cash';
  if (S.forceOver) return S.forceOver;
  return null;
}
const OVER = {
  patients: { title: 'Contract terminated', stamp: 'Breach notice', text: () => `The complaints became a petition, the petition became a front page, and the front page became a breach notice from the ICB. The contract for ${prac().surgery} goes to Apex Primary Care Ltd, who replace the phone line with a QR code.`, counter: '1,480 practices in England have closed or merged since 2015.', src: ['S11'] },
  team: { title: 'Nobody came in', stamp: 'Mass resignation', text: () => 'Bev resigned on a Monday. By Friday, reception was a laminated sign reading "PLEASE USE THE APP". Without a team there is no practice, just a building with a flat roof.', counter: 'In a 2026 survey, 92.3% of practice staff had faced verbal abuse at work.', src: ['S37'] },
  you: { title: 'Burnt out', stamp: 'Signed off', text: () => 'You didn\'t come in on Tuesday. Or Wednesday. A locum signs you off with burnout. Six months later you\'re doing four sessions a week somewhere sunny, and you have never been happier. The partnership carries on without you, just.', counter: '37% of GPs say they are likely to leave direct patient care within five years.', src: ['S36'] },
  safety: { title: 'Special measures', stamp: 'Inadequate', text: () => 'A serious incident, then another. CQC rates the practice inadequate and uses the phrase "systemic failure" eleven times. You get to know your medical defence organisation very well.', counter: 'About 5% of practices are rated Requires Improvement or Inadequate.', src: ['S33'] },
  cqc: { title: 'Special measures', stamp: 'Inadequate', text: () => 'Two inadequate ratings in a row. The ICB terminates the contract. Your patients are spread across four practices, none of which are pleased.', counter: 'About 5% of practices are rated Requires Improvement or Inadequate.', src: ['S33'] },
  cash: { title: 'Unlimited liability', stamp: 'Account frozen', text: () => 'Payroll bounced. Partners carry unlimited liability, so you remortgage your house to pay the staff their last wages. The practice hands back its contract. The lease on the building does not end with it.', counter: 'A GP partner\'s liability is unlimited, joint and several. Lease rent can continue after the NHS reimbursement stops.', src: ['S23', 'S43'] }
};
const EXITS = {
  sold: { t: 'The Sell-Out', s: 'Sold', f: 0.6, d: 'You sold to Apex. The money was fine. The phones now go to a national call centre, and your patients call you "the one who sold us". You are a salaried "Clinical Lead" with a lanyard and no say.', counter: '1,480 practices in England have closed or merged since 2015.', src: ['S11'] },
  merged: { t: 'Merged', s: 'Bigger now', f: 0.85, d: 'You are now one site of a 24,000-patient partnership with seven partners, a head of operations and a WhatsApp group you can\'t mute. Somebody else worries about the boiler.', counter: 'Partners in practices of 20,000+ patients averaged £177,200 in 2024/25, against £144,900 in practices under 5,000.', src: ['S8'] },
  salaried: { t: 'Went salaried', s: 'Resigned', f: 0.5, d: 'Six sessions a week, no premises, no payroll, no HMRC in January. You miss the patients you knew. You don\'t miss the rest.', counter: 'Salaried GPs averaged £74,800 in 2024/25. Partners averaged £164,200.', src: ['S8'] },
  emigrated: { t: 'Emigrated', s: 'Sunshine', f: 0.4, d: 'Your new clinic shuts at 5pm, and nobody there has heard of QOF. You still check the Bramleigh Facebook group, out of habit.', counter: 'This ending is a joke. The partner numbers aren\'t: full-time equivalent partners fell by 336 in a year.', src: ['S11'] },
  handback: { t: 'Handed back the contract', s: 'Doors closed', f: 0.3, d: 'You gave the contract back rather than carry it alone. The ICB finds a caretaker provider. The lease on the building, you discover, keeps running.', counter: '1,480 practices have closed or merged since 2015. If you lease the building, rent continues after the reimbursement stops.', src: ['S11', 'S23'] }
};
function gameOver(k) {
  S.over = { k, month: S.month, months: (S.yr || 0) * 12 + S.month + 1 };
  S.phase = 'over';
  recordBest(null);
  plaque(`${OVER[k].title}, ${MONTHS[S.month]}${S.yr ? ` of year ${S.yr + 1}` : ''}`, OVER[k].title, 0);
  clearSave();
}

/* ---------- the partner's own money ---------- */
function personalTax(share) { // share in £ for the year
  const pensionable = Math.max(0, share * 0.95);
  const rate = pensionRate(pensionable);
  const pension = pensionable * rate;
  const taxable = Math.max(0, share - pension);
  const pa = Math.max(0, P.tax.pa - Math.max(0, taxable - P.tax.taper) / 2);
  const ti = Math.max(0, taxable - pa);
  const basicBand = P.tax.basicTop - P.tax.pa;
  const tax = 0.2 * Math.min(ti, basicBand) + 0.4 * Math.max(0, Math.min(taxable, P.tax.addl) - pa - basicBand) + 0.45 * Math.max(0, taxable - P.tax.addl);
  const c4 = share <= P.c4.lpl ? 0 : P.c4.main * (Math.min(share, P.c4.upl) - P.c4.lpl) + P.c4.upper * Math.max(0, share - P.c4.upl);
  return { pension, rate, tax, c4, takeHome: share - pension - tax - c4 };
}

function finishYear(exit) {
  const monthsDone = exit ? Math.max(1, S.month) : 12;
  const qofV = qofValueK(S.qof);
  const qofBal = exit ? 0 : qofV - S.aspPaid;
  const partnersN = 1 + activeOthers();
  let shareK = S.year.share + qofBal / partnersN;
  if (exit === 'sold') shareK += 60;
  const annualK = shareK * 12 / monthsDone;
  const pers = personalTax(Math.max(0, shareK) * 1000);
  const balancing = shareK - S.drawTotal - S.penTotal;
  const hours = Math.max(1, S.hoursTotal);
  const perHour = pers.takeHome / hours;
  const st = S.st, others = activeOthers();
  const cqcB = S.cqc ? { o: 40, g: 20, ri: -10, i: -40 }[S.cqc.overall] : 0;
  let score = st.patients + st.team + st.you + st.safety + S.qof + clamp(annualK - 120, -60, 60) * 0.35 + cqcB + others * 8 + (others === 0 && !exit ? 25 : 0) + (S.cash < 0 ? -15 : 0);
  const goalMet = !exit && S.goal && GOALS[S.goal] ? !!GOALS[S.goal].ok() : false;
  if (goalMet) score += GOAL_BONUS;
  if (exit) score *= EXITS[exit].f;
  score = Math.round(Math.max(0, score));
  const arche = exit ? EXITS[exit] : archetype(annualK, others);
  const months = (S.yr || 0) * 12 + monthsDone;
  S.end = { goalMet, exit, monthsDone, months, qofV, qofBal, partnersN, shareK, annualK, pers, balancing, hours, perHour, firstTax: (pers.tax + pers.c4) * 1.5, score, arche };
  S.bestYear = Math.max(S.bestYear || 0, score);
  S.phase = 'end';
  recordBest(S.end);
  plaque(exit ? EXITS[exit].t : `Year ${(S.yr || 0) + 1} complete`, arche.t, score);
  if (exit) clearSave(); else save();
}

/* ---------- endless mode: carry on into another year ---------- */
function continueYear() {
  S.yr = (S.yr || 0) + 1;
  S.qofAsp = P.qofAsp * qofValueK(S.qof) / 12;
  S.qof = 0;
  S.month = 0;
  S.year = { inc: {}, exp: {}, oneoff: 0, profit: 0, share: 0 };
  S.drawTotal = 0; S.penTotal = 0; S.aspPaid = 0; S.hoursTotal = 0; S.leaveUsed = 0;
  S.history = []; S.end = null; S.exit = null; S.report = null;
  // the card pool refreshes; one-off story arcs and last-chance crises stay used
  const keep = id => (EVMAP[id] && EVMAP[id].arc) || /^crisis_|^last_partner|^lifeline/.test(id);
  Object.keys(S.seen).forEach(id => { if (!keep(id)) delete S.seen[id]; });
  S.counts = {};
  delete S.flags.cqcDone;
  delete S.flags.lifelineOffered;
  S.sched = S.sched.filter(x => x.m > 11).map(x => ({ id: x.id, m: x.m - 12 }));
  // anything timed by month moves back a year with the calendar
  S.mods.forEach(x => { x.from -= 12; });
  S.later.forEach(x => { x.m -= 12; });
  S.newRegs.forEach(x => { x.until -= 12; });
  ['remedialAt', 'breachAt'].forEach(k => { if (S.flags[k] != null) S.flags[k] -= 12; });
  [['year_new', 0], ['mini_docman', 1], ['pay_award', 2], ['mini_triage', 2], ['survey', 3], ['headline', 4], ['flu_saturday', 5],
   ['winter_phones', 8], ['qof_yearend', 10], ['contract_new', 11]].forEach(([id, m]) => S.sched.push({ id, m }));
  S.sched.push({ id: pick(['twist_ill', 'twist_fire', 'twist_flood']), m: 6 + Math.floor(Math.random() * 4) });
  S.goal = pick(Object.keys(GOALS));
  startMonth();
  save();
}

/* ---------- the Partners' Board: every run you've played, kept in this browser ---------- */
const BOARD_LOCAL = 'lps-board-v1';
function loadPlaques() { try { const b = JSON.parse(localStorage.getItem(BOARD_LOCAL) || '[]'); return Array.isArray(b) ? b : []; } catch (e) { return []; } }
function plaque(how, title, score) {
  if (!S || !S.runId) return;
  const st = S.st, weakest = STAT_KEYS.reduce((a, k) => st[k] < st[a] ? k : a, STAT_KEYS[0]);
  const months = S.end ? S.end.months : (S.yr || 0) * 12 + (S.over ? S.over.month + 1 : S.month + 1);
  const row = { id: S.runId, n: S.name, look: S.look || { s: 0, c: 0 }, p: S.practiceKey, months, how, t: title, weak: weakest, wv: Math.round(st[weakest]), score: Math.max(score || 0, S.bestYear || 0), w: S.week || null, d: new Date().toISOString().slice(0, 10) };
  const b = loadPlaques().filter(x => x.id !== row.id);
  b.push(row);
  b.sort((a, c) => c.months - a.months || c.score - a.score);
  try { localStorage.setItem(BOARD_LOCAL, JSON.stringify(b.slice(0, 40))); } catch (e) { }
}
const bestMonths = () => loadPlaques().reduce((a, x) => Math.max(a, x.months || 0), 0);
function archetype(shareK, others) {
  const st = S.st, place = prac().place;
  const min = Math.min(st.patients, st.team, st.you, st.safety);
  const counter = { counter: 'Partners averaged £164,200 before tax in 2024/25. The median was £151,200.', src: ['S8'] };
  if (others === 0) return { t: 'Last Partner Standing', s: 'Sole partner', d: 'Everyone else left. You held the contract, the lease and the overdraft on your own, and you are still here on 31st March. It\'s either heroic or a cry for help. Possibly both.', counter: 'Full-time equivalent partners in England fell by 336 in the year to August 2026.', src: ['S11'] };
  if (st.patients >= 65 && st.team >= 65 && st.you >= 65 && st.safety >= 65 && shareK >= 145) return { t: 'The Unicorn', s: 'Mythical', d: 'Happy patients, happy team, a safe practice, a decent income and your sanity intact. Other partners will not believe you exist.', ...counter };
  if (shareK >= 185 && st.you < 40) return { t: 'Golden Handcuffs', s: 'Well paid', d: 'The accountant is thrilled. You are exhausted. You\'ve made excellent money, and you\'re too tired to spend it.', ...counter };
  if (st.patients >= 75 && shareK < 125) return { t: `Patron Saint of ${place}`, s: 'Beloved', d: 'The patients adore you. Mrs Higgins has put you in her will (the shortbread tin). Financially, it has been a vocation rather than a business.', ...counter };
  if (st.you >= 75 && st.patients < 45) return { t: 'Master of Boundaries', s: 'Well rested', d: 'You leave at 6:30pm, eat lunch sitting down and never read the Facebook group. The patients have noticed. You\'ve noticed that you don\'t mind.', ...counter };
  if (S.cqc && S.cqc.overall === 'o') return { t: 'The Inspector\'s Darling', s: 'Outstanding', d: 'Outstanding. The certificate is in reception, the policies are colour-coded, and Patricia Sharpe uses your practice as an example in training.', counter: 'About 5% of practices are rated Requires Improvement or Inadequate. Outstanding is rarer still.', src: ['S33'] };
  if (st.team >= 80) return { t: 'Everybody\'s Favourite Boss', s: 'Much loved', d: 'The team would walk through fire for you. Maureen has stopped threatening to retire. Kayleigh stayed rather than go to Aldi. That\'s the real prize.', ...counter };
  if (min < 20) return { t: 'Survived. Technically.', s: 'Held together', d: 'You made it to 31st March, but only just. Something is always about to break. Next year will be different, you tell yourself, again.', ...counter };
  return { t: 'Still Standing', s: 'Year complete', d: 'A solid year. Not glamorous, not a disaster. You kept the doors open, the patients seen and the bank quiet. That\'s what most partners dream of.', ...counter };
}

/* ---------- storage ---------- */
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
function loadSave() { try { const t = localStorage.getItem(SAVE_KEY); if (!t) return null; const s = JSON.parse(t); return s && s.v === 2 && s.phase !== 'over' && !(s.phase === 'end' && s.end && s.end.exit) ? s : null; } catch (e) { return null; } }
function loadBest() { try { const b = JSON.parse(localStorage.getItem(BEST_KEY) || '[]'); return Array.isArray(b) ? b : []; } catch (e) { return []; } }
function recordBest(end) {
  const entry = end
    ? { score: end.score, t: end.arche.t, p: prac().label, n: S.name, d: new Date().toISOString().slice(0, 10) }
    : { score: 0, t: OVER[S.over.k].title + ' (' + MON3[S.over.month] + ')', p: prac().label, n: S.name, d: new Date().toISOString().slice(0, 10) };
  const b = loadBest(); b.push(entry); b.sort((a, c) => c.score - a.score);
  try { localStorage.setItem(BEST_KEY, JSON.stringify(b.slice(0, 5))); } catch (e) { }
}
