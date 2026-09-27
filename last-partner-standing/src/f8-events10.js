/* ===================== EVENTS 10: the contract, explained =====================
 Five cards through year one in the leafy suburb and the market town, pitched at a GP trainee: where the money
 comes from (the global sum), QOF, ARRS, drawings and tax, and why anyone would be a partner. Someone asks, and you
 explain it with the practice's own figures; the teaching choice shows them worked out. On by default, switched off
 under Options or in the menu ("Explain the contract as you go", `UI.settings.teach`).
 Who asks: Ellie if you became a training practice and she's in post, otherwise Tom while he's at the practice,
 otherwise the registrars on the local GP training scheme, where Clare has signed you up to teach.
 Teaching pays off later: Tom is less likely to walk if you turn down his partnership (`tom_partner`), and Ellie is
 likelier to come back once she's qualified (`p_trainee_returns`).
*/
const TEACH = [['teach_money', 1], ['teach_qof', 4], ['teach_arrs', 6], ['teach_drawings', 9], ['teach_partner', 10]];
const TEACH_IDS = TEACH.map(x => x[0]);
// on unless switched off; the simulator has no UI, so it plays with them on, like a new player
function teachOn() {
  if (!S || S.practiceKey === 'city') return false;
  try { return typeof UI === 'undefined' || !UI.settings || UI.settings.teach !== false; } catch (e) { return true; }
}
// schedules what's left of year one's explainers: from newGame, or when they're switched on mid-year
function teachSchedule() {
  if (!teachOn() || (S.yr || 0)) return;
  TEACH.forEach(([id, m]) => { if (m > S.month && !S.seen[id] && !S.sched.some(x => x.id === id)) S.sched.push({ id, m }); });
}
function teachUnschedule() { S.sched = S.sched.filter(x => !TEACH_IDS.includes(x.id)); }
// keeps a running or reloaded game in step with the setting
function teachSync() { if (S) { if (teachOn()) teachSchedule(); else teachUnschedule(); } }
// who's asking. "Why be a partner?" skips Tom once he is one.
function tutor(notPartner) {
  if (hasMod('registrar')) return { who: 'reg', n: 'Ellie', flag: 'taughtEllie' };
  const tom = S.partners.tom || {};
  if (tom.status === 'active' && !notPartner) return { who: 'tom', n: 'Tom', flag: 'taughtTom', partner: 1 };
  if (tom.status === 'salaried' && S.staff.salaried >= 1 && !S.flags.tomGone) return { who: 'tom', n: 'Tom', flag: 'taughtTom' };
  return { who: 'pcn', n: 'the registrars', scheme: 1 };
}
function taught(notPartner) { const t = tutor(notPartner); if (t.flag) S.flags[t.flag] = (S.flags[t.flag] || 0) + 1; }
// teaching well builds the team, or your name with the local registrars (who are your future recruits)
const teachFx = (fx, g, notPartner) => Object.assign({}, fx, { [tutor(notPartner).scheme ? 'rep' : 'team']: g });
function teachAsk(t, own, q) {
  if (!t.scheme) return `${own} "${q}"`;
  return `${S.flags.teachScheme ? 'At the training scheme, a hand goes up.' : 'Clare has signed you up to teach the contract to the local GP registrars. A hand goes up.'} "${q}"`;
}
function teachDone(notPartner) { if (tutor(notPartner).scheme) S.flags.teachScheme = 1; }
// a small worked table for the outcome card (plain numbers and our own labels, so nothing to escape)
const tchN = v => Math.round(v).toLocaleString('en-GB');
const tchK = v => (v < 0 ? '−£' : '£') + Math.abs(v).toFixed(1) + 'k';
const tchTable = (title, rows, sum, note) => `<div class="teach"><h3>${title}</h3><dl class="kv small">${rows.map(([l, v, how]) => `<dt>${l}${how ? `<small>${how}</small>` : ''}</dt><dd>${v}</dd>`).join('')}${sum ? `<dt class="sum">${sum[0]}</dt><dd class="sum">${sum[1]}</dd>` : ''}</dl>${note ? `<p class="fc-note">${note}</p>` : ''}</div>`;
const teachArrsRoles = () => ROLE_ORDER.filter(r => ROLES[r].arrs && S.staff[r] > 0);

EVENTS.push(
{id:'teach_money',arc:1,get who(){ return tutor().who; },title:'Where the money comes from',cond:teachOn,tag:'real',src:['S2','S3'],
 info:'The global sum pays for essential services: £130.07 per weighted patient a year in 2026/27, paid monthly. The Carr-Hill formula weights each patient for age, sex, illness, care-home residence, new registration, rurality and staff costs. Practices that opt out of out-of-hours care, as nearly all do, lose 4.7%. Vaccinations and enhanced services are paid per item on top.',
 text:()=>{ const t = tutor(), w = weightedList(), r = w / S.list;
  const mix = r > 1.01 ? `${tchN(w)}, because they're older and need more than average` : r < 0.99 ? `only ${tchN(w)}, because they're younger than average` : `about ${tchN(w)}: an average mix`;
  return teachAsk(t, t.who === 'reg' ? 'Ellie has a tutorial on practice finance.' : 'Tom has been reading the practice accounts.', 'Where does the money actually come from?') +
   ` Mostly the global sum: £130.07 a year for each weighted patient. Weighting counts need as well as heads, so your {list} patients count as ${mix}. Less 4.7% for opting out of out-of-hours care, it pays about £${tchN(calc().inc.gs * 1000)} a month, however many appointments you offer.`; },
 choices:[
  {t:'Go through the statement line by line',fx:()=>teachFx({you:-2},2),
   run(){ const c = calc(), i = c.inc, tot = Object.values(i).reduce((a, b) => a + b, 0); taught();
    return { html: tchTable(`${prac().surgery}: income this month`, [
     ['Global sum', tchK(i.gs), `${tchN(weightedList())} weighted patients × £${P.gs} × (1 − 4.7%) ÷ 12`],
     ['QOF aspiration', tchK(i.qof), '80% of last year\'s QOF, paid monthly'],
     ['Vaccinations', tchK(i.vacc), 'Paid for each one given'],
     ['Enhanced services', tchK(i.es), 'Paid for what you deliver, so they fall when appointments run short'],
     ['Network and PCN', tchK(i.npp + i.pcn), 'Your share of the PCN\'s money'],
     ['Private fees', tchK(i.priv), 'Reports, medicals and letters']
    ], ['Income this month', tchK(tot)], 'Staff, locums, rent and running costs all come out of this before the partners see any of it.') }; },
   o:()=>{ const t = tutor(); return `You go through it together. The global sum is the biggest line by far, and it doesn't rise when demand does. "So being busier doesn't pay," ${t.scheme ? 'says a registrar' : t.n + ' says'}. Only a bigger list does, slowly, and the extra patients bring their own demand.`; }},
  {t:'"Patients, not appointments." Back to clinic.',fx:()=>teachFx({you:1},-1),
   o:()=>{ const t = tutor(); return t.scheme ? `It's the right answer, in three words. The registrars write it down and look no wiser.` : `It's the right answer, in three words. ${t.n} writes it down and looks no wiser.`; }}
 ],
 after(){ teachDone(); }},

{id:'teach_qof',arc:1,get who(){ return tutor().who; },title:'Points mean money',cond:teachOn,tag:'real',src:['S3','S13'],
 info:'The Quality and Outcomes Framework: 582 points in 2026/27, each worth £227.95 for a practice of average size (10,295 patients), adjusted for list size and how common each condition is. Practices get 80% of last year\'s value monthly as an aspiration payment, and the balance for what they actually achieve by the end of the following June.',
 text:()=>{ const t = tutor();
  return teachAsk(t, `${t.n} has found the QOF dashboard.`, 'Why does everyone care so much about this?') +
   ` QOF pays for care you can count, like blood pressure control and diabetes reviews: 582 points, each worth about £228 for an average practice, scaled for list size and how common the conditions are. Here, 100% is worth about £${tchN(qofValueK(100) * 1000)} a year, so each 1% is about £${tchN(qofValueK(1) * 1000)}. You're at {qof}% so far; it's counted on 31 March.`; },
 choices:[
  {t:()=>tutor().scheme ? 'Walk them through a year of QOF' : `Work through the recall list with ${tutor().n}`,fx:()=>teachFx(tutor().scheme ? {you:-2} : {you:-2,qof:1},1),
   run(){ const p = prac(); taught();
    return { html: tchTable(`${p.surgery}: what QOF is worth`, [
     ['Points available', '582', 'Each point is worth £227.95 for an average practice'],
     ['Scaled for your list', '× ' + (S.list / P.cpiAvg).toFixed(2), `${tchN(S.list)} patients against the average of ${tchN(P.cpiAvg)}`],
     ['Scaled for how common the conditions are', '× ' + p.prev.toFixed(2), 'Prevalence against the national average'],
     ['Paid monthly now', tchK(S.qofAsp), `80% of last year's ${p.lastQof}%, a twelfth a month`]
    ], ['100% would be worth', `£${tchN(qofValueK(100) * 1000)} a year`], `The balance for what you actually achieve is paid by the end of June ${2027 + (S.yr || 0)}. Achieve less than you were paid for and some of it goes back.`) }; },
   o:()=>{ const t = tutor(); return t.scheme ? `You show them how the year goes: recalls in the autumn, the scramble in March, the balance in June. "So it's money," says a registrar. "And strokes that don't happen," you say. Both are true.` : `You find four patients with diabetes who only need a foot check, and a man whose blood pressure hasn't been measured since 2019. "So it's money," ${t.n} says. "And a stroke that doesn't happen," you say. Both are true.`; }},
  {t:()=>tutor().scheme ? '"It keeps the lights on." Next question.' : '"It keeps the lights on. Ask Maureen."',fx:()=>teachFx({you:1},-1),
   o:()=>{ const t = tutor(); return t.scheme ? `The registrars laugh. One of them writes down "lights".` : `${t.n} asks Maureen, who explains it better than you would have, and mentions it at the practice meeting.`; }}
 ],
 after(){ teachDone(); }},

{id:'teach_arrs',arc:1,get who(){ return tutor().who; },title:'Who pays for the pharmacist?',cond:teachOn,tag:'real',src:['S4','S84'],
 info:'The Additional Roles Reimbursement Scheme pays each PCN £27.668 per weighted patient a year (2026/27) to claim back the pay of set roles, such as clinical pharmacists, physios, paramedics, care coordinators and, from 2026/27, GPs, up to a maximum for each role. Practices still provide the rooms, equipment and supervision, and pay for anything over the budget. The game\'s claim for each role is an estimate.',
 text:()=>{ const t = tutor(), roles = teachArrsRoles(), b = arrsBudget(), used = arrsSpend(true);
  const q = t.scheme ? 'Who pays for all the pharmacists and physios?' : roles.length ? `Who pays for the ${ROLES[roles[0]].name.replace(/^[A-Z](?![A-Z])/, c => c.toLowerCase())}?` : 'Other practices have pharmacists and physios. Are they free?';
  return teachAsk(t, `${t.n} is looking at the rota.`, q) +
   ` ${roles.length || t.scheme ? 'Mostly the PCN, through' : 'Nearly. The PCN pays, through'} the additional roles scheme, ARRS: £27.67 a year per weighted patient. {surgery}'s share is about £${tchN(b)}k, ${used > 0.5 ? `of which £${tchN(used)}k is spoken for` : 'none of it spoken for yet, and money nobody claims is never paid'}. It pays for set roles, like pharmacists, physios and paramedics, up to a limit for each. The room, the supervision and anything over budget are yours.`; },
 choices:[
  {t:()=>tutor().scheme ? 'Show them a real claims spreadsheet' : `Show ${tutor().n} the PCN's claims spreadsheet`,fx:()=>teachFx({you:-2},2),
   run(){ const b = arrsBudget(), left = arrsLeft(), w = weightedList(); taught();
    const rows = [['Your share of the PCN budget', `£${tchN(b)}k a year`, `${tchN(w)} weighted patients × £${P.arrs}`]];
    ROLE_ORDER.filter(r => ROLES[r].arrs).forEach(r => { const n = S.staff[r] + (S.vac[r] || 0); if (n) rows.push([`${ROLES[r].name}${n > 1 ? ' × ' + n : ''}${S.vac[r] ? ' (advert open)' : ''}`, `−£${tchN(arrsClaimOf(r) * n)}k`, `About £${tchN(arrsClaimOf(r))}k a year each (${ROLES[r].band}), claimed back`]); });
    const gps = arrsGPs() + (S.vac.arrsgp || 0);
    if (gps) rows.push([`GP${gps > 1 ? 's' : ''} through the PCN`, `−£${tchN(gps * ARRS_GP_CLAIM)}k`, 'Six sessions a week, claimed at their real cost']);
    const scale = rows.length > 1 ? '' : `Nobody is claimed yet. For scale, a clinical pharmacist costs about £${tchN(arrsClaimOf('pharm'))}k a year with on-costs, so this would cover about ${['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][Math.floor(left / arrsClaimOf('pharm'))] || Math.floor(left / arrsClaimOf('pharm'))}. `;
    return { html: tchTable(`${prac().surgery}: the additional roles budget`, rows, [left >= 0 ? 'Left to claim' : 'Over budget: the practice pays', `£${tchN(Math.abs(left))}k a year`], `${scale}Each post is claimed back only while it's filled. The practice still finds the room, the kit and a GP to supervise.`) }; },
   o:()=>{ const t = tutor(); return `You go through how it works: each role is paid back up to its limit, and only while the post is filled. "So they're free," ${t.scheme ? 'says a registrar' : t.n + ' says'}. "Free the way a puppy is free," you say.`; }},
  {t:'"The PCN pays. Mostly."',fx:()=>teachFx({you:1},-1),
   o:()=>{ const t = tutor(); return t.scheme ? `True, until the budget runs out. After that, every extra role comes out of profit. The registrars write down "mostly".` : `True, until the budget runs out. After that, every extra role comes out of profit. ${t.n} nods as if that were obvious. It isn't.`; }}
 ],
 after(){ teachDone(); }},

{id:'teach_drawings',arc:1,get who(){ return tutor().who; },title:'Drawings aren\'t a salary',cond:teachOn,tag:'real',src:['S21','S22','S23'],
 info:'Partners aren\'t employees. They take drawings on account of their share of the profit, and the accountant settles the difference once the year\'s accounts are done. Income tax and Class 4 National Insurance are paid through Self Assessment, and partners pay both the member and the employer shares of their NHS pension. Accountants often advise new partners to put about 40% of drawings aside.',
 text:()=>{ const t = tutor();
  const ask = t.partner ? teachAsk(t, 'Tom, a partner since the summer, has seen his first tax estimate.', 'Why is it so big? I haven\'t been paid that much.')
   : teachAsk(t, `It's the week of the partners' tax bills, and ${t.n} has noticed the mood.`, 'Don\'t partners just get paid a salary?');
  return ask + ` ${t.partner ? 'Because drawings aren\'t pay.' : 'No.'} Partners draw £${drawOf(S.plan.draw)}k a month on account of a profit share that nobody knows until the accounts close on 31 March. So far this year your own share is ${S.year.share < 0 ? `a loss of £${tchN(-S.year.share)}k` : `about £${tchN(S.year.share)}k`}; you've drawn £${tchN(S.drawTotal)}k, and £${tchN(S.penTotal)}k more has gone into your pension. Tax is due on the share, not the drawings, and nobody takes it at source.`; },
 choices:[
  {t:'Go through Neville\'s forecast together',fx:()=>teachFx({you:-2},2),
   run(){ const bal = S.year.share - S.drawTotal - S.penTotal, m = Math.max(1, S.month); taught();
    return { html: tchTable('Your own money so far this year', [
     ['Your share of the profit', tchK(S.year.share), `April to ${MONTHS[m - 1]}`],
     ['Drawings you took', tchK(-S.drawTotal), `${S.plan.draw === 'low' ? 'Lean' : S.plan.draw === 'high' ? 'Generous' : 'Standard'}: £${drawOf(S.plan.draw)}k this month`],
     ['Your NHS pension', tchK(-S.penTotal), 'Both halves: the member rate and the 14.38% employer share']
    ], [bal >= 0 ? 'Ahead so far: owed to you' : 'Behind so far: you\'d pay it back in', tchK(Math.abs(bal))], 'The QOF balance is added at the year end. Income tax and Class 4 NI are then due on the whole share, not on what you drew.') }; },
   o:()=>{ const t = tutor(); return `You go through it: the profit share, less both halves of the NHS pension, less income tax and Class 4 National Insurance. A new partner's first bill, in January 2028, is a whole year's tax plus half as much again, paid on account for the next year. "So put 40% aside," ${t.scheme ? 'says a registrar' : t.n + ' says'}. You nod, as if you had.`; }},
  {t:'"It\'s more than a salary. In a good year."',fx:()=>teachFx({you:1},-1),
   o:()=>{ const t = tutor(); return `${t.scheme ? 'A registrar asks' : t.n + ' asks'} what happens in a bad year. You say you'll know in March.`; }}
 ],
 after(){ teachDone(); }},

{id:'teach_partner',arc:1,get who(){ return tutor(1).who; },title:'Why be a partner?',cond:teachOn,tag:'real',src:['S8','S23','S83'],
 info:'NHS England Digital\'s estimates for 2024/25: partner (contractor) GPs averaged £164,200 before tax and salaried GPs £74,800. Neither figure is adjusted for part-time working. Partners share the profits and the decisions, and carry unlimited liability for the practice\'s debts. The number of GP partners under 40 in England fell by 17% in the 15 months to September 2025.',
 text:()=>{ const t = tutor(1);
  const ask = t.who === 'reg' ? teachAsk(t, 'Ellie finishes training in the summer, and she has been offered a salaried job.', 'Honestly, why would anyone be a partner?')
   : teachAsk(t, 'Tom is still thinking about partnership.', t.scheme ? 'Honestly, why would anyone be a partner?' : 'Honestly, why do it?');
  return ask + ` Partners averaged £164,200 before tax in 2024/25; salaried GPs £74,800, and neither figure is per full-time GP. Partners decide how the practice runs, and they own its problems: the lease, the payroll and the overdraft, with unlimited liability. In England, the number of partners under 40 fell by 17% in 15 months.`; },
 choices:[
  {t:()=>tutor(1).scheme ? 'Tell them the truth, good and bad' : `Tell ${tutor(1).n} the truth, good and bad`,fx:()=>teachFx({you:-1},2,1),
   run(){ taught(1); },
   o:()=>{ const t = tutor(1); return t.scheme ? `You tell them about the patients you've known for years, the decisions nobody can overrule and the spreadsheet at 2am. Three registrars ask for your email afterwards. One asks about your overdraft.` : `You tell ${t.n} about the patients you've known for years, the decisions nobody can overrule and the spreadsheet at 2am. "So it's worth it if the practice is well run," ${t.n} says. That's the whole answer, really.`; }},
  {t:'"Somebody has to be the last partner standing."',fx:()=>teachFx({you:1},-1,1),
   o:()=>{ const t = tutor(1); return t.scheme ? `The room laughs, then stops.` : `${t.n} laughs, then stops.`; }}
 ],
 after(){ teachDone(1); }}
);
