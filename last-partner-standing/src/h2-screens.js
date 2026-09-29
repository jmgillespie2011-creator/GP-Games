/* ===================== UI 2: reports, endings, overlays, input ===================== */
function statLines(extra) {
  return `<div class="statlines">${STAT_KEYS.map(k => {
    const v = Math.round(S.st[k]); const d = extra ? extra[k] : null;
    return `<div class="statline">${ICON[k]}<span>${STAT_LABEL[k]}</span><div class="bar"><b style="width:${v}%;${v <= 20 ? 'background:var(--bad)' : v <= 35 ? 'background:var(--warn)' : ''}"></b></div><span class="d">${v}${d != null ? ` <span class="${d > 0 ? 'good-t' : d < 0 ? 'bad-t' : 'muted'}">${d > 0 ? '+' : ''}${d}</span>` : ''}</span></div>`;
  }).join('')}</div>`;
}

/* ---------- month report ---------- */
// "What came of it": each delayed consequence names the card, the month and the choice that planted it, and what it changed.
// Older saves only have strings, and consequences of the practice's state are strings too.
function consqHTML(list) {
  const picks = list.filter(n => n && typeof n === 'object'), state = list.filter(n => typeof n === 'string');
  const q = t => /["“”]/.test(t) ? t : `“${t}”`;
  const src = n => n.card ? `<b>${esc(n.card)}</b>, ${esc(n.mon)}${n.ago === 1 ? ' last year' : n.ago > 1 ? `, ${n.ago} years ago` : ''}` : n.from ? `<b>${esc(n.from)}</b>` : '';
  const item = n => { const w = src(n); return `<li><p class="cq-src">${w}${n.pick ? `${w ? ': ' : ''}${n.pred ? 'your predecessor chose' : 'you chose'} ${esc(q(n.pick))}` : ''}</p><p>${esc(n.note)}</p>${n.ds && n.ds.length ? deltaChips(n.ds) : ''}</li>`; };
  return `<section class="panel consq"><h3>What came of it</h3>
    ${picks.length ? `<h4>From your earlier choices</h4><ul class="cqs">${picks.map(item).join('')}</ul>` : ''}
    ${state.length ? `<h4>From the state of the practice</h4><ul class="notes">${state.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}</section>`;
}
function renderReport() {
  const R = S.report, c = R.c;
  const dmap = {}; R.deltas.forEach(d => { dmap[d.k] = d.d; });
  const last = S.month >= 11;
  const notes = R.hires.concat(R.notes);
  const avgH = Math.round((S.hoursTotal || 0) / (WEEKS * (R.month + 1)));
  const driftTxt = STAT_KEYS.map(k => `${STAT_LABEL[k]} ${R.drift[k] > 0 ? '+' : ''}${R.drift[k]}`).join(' · ');
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap report">
    <div class="clip"><div class="masthead"><span>${esc(prac().paper)}</span><span>${MONTHS[R.month]} ${calY(R.month)}</span></div>
      <h2>${esc(R.headline)}</h2><p>${c.cap} appointments offered a week against ${c.demand} requested (${pct(c.ratio)}).</p></div>
    ${R.proj ? `<section class="panel projout"><h3>This month's project <small>${esc(R.proj.name)}</small></h3><p>${esc(R.proj.text)}</p>${R.proj.deltas.length ? deltaChips(R.proj.deltas) : ''}</section>` : ''}
    ${(() => { const all = []; STAT_KEYS.forEach(k => c.T[k].why.forEach(([d, l]) => all.push([d, l, k]))); const top = all.filter(x => Math.abs(x[0]) >= 3).sort((a, b) => Math.abs(b[0]) - Math.abs(a[0])).slice(0, 3); return top.length ? `<section class="panel"><h3>What's driving the practice <small>the biggest pulls on your meters right now</small></h3><ul class="why">${top.map(([d, l, k]) => `<li><span class="${d > 0 ? 'good-t' : 'bad-t'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</span> ${STAT_LABEL[k]}: ${esc(l)}</li>`).join('')}</ul></section>` : ''; })()}
    ${R.consq.length ? consqHTML(R.consq) : ''}
    <div class="rgrid">
      <section class="panel"><h3>The month in numbers</h3>
        <dl class="kv">
          <dt>Appointments offered a week</dt><dd>${c.cap}</dd>
          <dt>Appointments requested a week</dt><dd>${c.demand}</dd>
          <dt>Inbox: start → end</dt><dd>${R.inboxStart} → ${R.inboxEnd}</dd>
          <dt>Your hours a week this month</dt><dd>${Math.round(c.hours)}</dd>
          <dt>Your average week so far this year</dt><dd class="${avgH > 48 ? 'bad-t' : ''}">${avgH} hours</dd>
          <dt>QOF achievement</dt><dd>${Math.round(S.qof)}%</dd>
          <dt>List size</dt><dd>${S.list.toLocaleString('en-GB')}</dd>
        </dl>
        ${explain('Your hours against the 48-hour limit', `<p>Averaged over the ${R.month + 1} month${R.month ? 's' : ''} so far, you've worked about <b>${avgH} hours a week</b>, including leave. That's ${avgH > 48 ? `${avgH - 48} over` : avgH === 48 ? 'right at' : `${48 - avgH} under`} the 48-hour average that the Working Time Regulations set for employees, and ${avgH - 37.5 > 0 ? `${Math.round(avgH - 37.5)} hours more than` : 'within'} a standard 37.5-hour NHS week.</p><p>Your salaried GPs and staff are covered by that limit unless they opt out. As a partner you're self-employed, so it doesn't apply to you. Nothing stops you working 60 hours but the You meter.</p>`)}
        <h3 style="margin-top:6px">How everyone's feeling</h3>
        ${statLines(dmap)}
        ${explain('Why the meters moved', `<p>The practice's situation moved the meters by: ${esc(driftTxt)}. The rest came from this month's decisions and events.</p><p>Behind the scenes, your relationship with the ICB is <b>${relWord(S.icb)}</b> and your local reputation is <b>${relWord(S.rep)}</b>. Reputation shapes patient satisfaction and who applies for your jobs. The ICB shapes funding bids and how it treats you when things go wrong.</p>`)}
      </section>
      <section class="panel"><h3>The money</h3>
        <dl class="kv">
          <dt>Global sum</dt><dd>${fmtK(c.inc.gs)}</dd>
          <dt>QOF aspiration payment</dt><dd>${fmtK(c.inc.qof)}</dd>
          <dt>Vaccinations, enhanced services and PCN</dt><dd>${fmtK(c.inc.vacc + c.inc.es + c.inc.pcn + c.inc.npp)}</dd>
          <dt>Private fees</dt><dd>${fmtK(c.inc.priv)}</dd>
          ${c.modCash ? `<dt>Schemes, leases and extras</dt><dd>${signK(c.modCash)}</dd>` : ''}
          <dt>Staff</dt><dd>−${fmtK(c.cost.staff)}</dd>
          ${c.cost.locum ? `<dt>Locums and overtime</dt><dd>−${fmtK(c.cost.locum)}</dd>` : ''}
          ${c.cost.cover ? `<dt>Sickness cover and incidents</dt><dd>−${fmtK(c.cost.cover)}</dd>` : ''}
          ${c.cost.arrs ? `<dt>Additional roles over the PCN budget</dt><dd>−${fmtK(c.cost.arrs)}</dd>` : ''}
          <dt>Running costs and premises</dt><dd>−${fmtK(c.cost.running)}</dd>
          <dt class="sum">Profit this month</dt><dd class="sum">${signK(c.profit)}</dd>
          <dt>Partners' drawings (${c.partnersN})</dt><dd>−${fmtK(c.out.draw)}</dd>
          <dt>Partners' pension contributions</dt><dd>−${fmtK(c.out.pension)}</dd>
          <dt class="sum">Change in the bank</dt><dd class="sum">${signK(c.net)}</dd>
          <dt>Bank balance now</dt><dd>${fmtK(S.cash)}</dd>
        </dl>
        ${explain('Profit isn\'t the same as cash', `<p>Profit is what the practice earns after staff and running costs. It belongs to the partners, but it leaves the bank as drawings and pension contributions. One-off costs from this month's decisions come out of the bank too. The difference between profit and what partners took is settled after the year-end accounts.</p><p>This month's one-offs and extras: ${signK(R.deltas.filter(d => d.k === 'cash').reduce((a, d) => a + d.d, 0) - c.net)}.</p>`)}
        ${notes.length ? `<h3 style="margin-top:6px">Notes</h3><ul class="notes">${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      </section>
    </div>
    <div class="plan-go">${checkOver() || last ? `<button class="btn primary" data-act="next">${checkOver() ? 'Uh oh…' : 'See the year-end accounts →'}</button>` : `<button class="btn primary go-main" data-act="next">Plan ${MONTHS[S.month + 1]} →</button><div class="carry"><button class="btn ghost small" data-act="nextgo" title="Keep this month's sessions, cover and drawings">Or keep this plan and start ${MONTHS[S.month + 1]}</button><p class="fc-note">${S.plan.clin} clinical, ${S.plan.admin} admin and ${S.plan.mgmt} management sessions${S.plan.locum ? `, ${S.plan.locum} locum` : ''}${S.plan.extra ? `, ${S.plan.extra} overtime` : ''}. Leave and one-off projects don't carry over.</p></div>`}</div>
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
function counterHTML(o) { return o && o.counter ? `<div class="counter"><p>${esc(o.counter)}</p>${srcLinks(o.src)}</div>` : ''; }
function shareText() {
  const E = S.end;
  return `A year as a GP partner at ${prac().surgery} (${prac().label.toLowerCase()}): "${E.arche.t}". Profit share £${Math.round(E.annualK)}k, take-home £${Math.round(E.pers.takeHome / 1000)}k after pension and tax, about £${Math.round(E.perHour)} an hour. QOF ${Math.round(S.qof)}%, CQC ${S.cqc ? RATE_NAME[S.cqc.overall] : 'not inspected'}. Score ${E.score}. Last Partner Standing.`;
}
function renderEnd() {
  const E = S.end, pers = E.pers;
  const best = loadBest();
  const yr = S.year;
  const incY = Object.values(yr.inc).reduce((a, b) => a + b, 0), expY = Object.values(yr.exp).reduce((a, b) => a + b, 0);
  const accounts = E.exit ? `
        <dl class="kv">
          <dt>Months as a partner</dt><dd>${E.monthsDone}</dd>
          <dt>Your share of profit for those months</dt><dd>${fmtK(E.shareK)}</dd>
          <dt>Your drawings</dt><dd>${fmtK(S.drawTotal)}</dd>
          <dt>Your pension contributions</dt><dd>${fmtK(S.penTotal)}</dd>
          <dt>Settled with the partnership</dt><dd class="${E.balancing < 0 ? 'bad-t' : ''}">${signK(E.balancing)}</dd>
          <dt class="sum">Take-home after pension, tax and NI</dt><dd class="sum">${gbp(pers.takeHome)}</dd>
        </dl>` : `
        <dl class="kv">
          <dt>Practice income</dt><dd>${fmtK(incY)}</dd>
          <dt>Staff, locums and running costs</dt><dd>−${fmtK(expY)}</dd>
          <dt>One-off costs and income</dt><dd>${signK(yr.oneoff)}</dd>
          <dt>QOF: ${Math.round(S.qof)}% achieved, worth ${fmtK(E.qofV)}</dt><dd>&nbsp;</dd>
          <dt>…less aspiration already paid</dt><dd>−${fmtK(S.aspPaid)}</dd>
          <dt>QOF balance, due by 30 June ${2027 + (S.yr || 0)}</dt><dd class="${E.qofBal < 0 ? 'bad-t' : 'good-t'}">${signK(E.qofBal)}</dd>
          <dt class="sum">Your share of the profit (÷${E.partnersN})</dt><dd class="sum">${fmtK(E.shareK)}</dd>
          <dt>Drawings you took</dt><dd>−${fmtK(S.drawTotal)}</dd>
          <dt>Pension paid for you</dt><dd>−${fmtK(S.penTotal)}</dd>
          <dt>${E.balancing >= 0 ? `Balancing payment to you, July ${2027 + (S.yr || 0)}` : `You pay back in, July ${2027 + (S.yr || 0)}`}</dt><dd class="${E.balancing < 0 ? 'bad-t' : 'good-t'}">${signK(E.balancing)}</dd>
        </dl>`;
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap ending">
    <section class="front front-end" aria-label="Your surgery">${facadeSVG(null)}${brassPlate()}</section>
    <section class="verdict"><div class="eyebrow">${E.exit ? MONTHS[S.month] + ' ' + calY(S.month) : `31st March ${2027 + (S.yr || 0)}`} · ${esc(prac().surgery)}${S.yr ? ` · year ${S.yr + 1}` : ''}</div><span class="bigstamp">${esc(E.arche.s)}</span>
      <h1>${esc(E.arche.t)}</h1><p class="lede">${esc(E.arche.d)}</p>
      ${S.goal && GOALS[S.goal] && !E.exit ? `<p class="goal-line ${E.goalMet ? 'good-t' : 'bad-t'}">${E.goalMet ? `Goal met: ${esc(GOALS[S.goal].t)}. +${GOAL_BONUS} points.` : `Goal missed: ${esc(GOALS[S.goal].t)}.`}</p>` : ''}
      <div class="score">${(S.yr || 0) >= 1 || (S.gen || 1) > 1 ? `<span>Months as a partner <b>${E.months}</b></span>` : ''}<span>${(S.yr || 0) >= 1 ? `Year ${S.yr + 1} score` : 'Year score'} <b>${E.score}</b></span><span>Profit share <b>£${Math.round(E.annualK)}k</b></span><span>Take-home <b>${gbp(pers.takeHome)}</b></span><span>Per hour <b>£${Math.round(E.perHour)}</b></span></div>
      ${counterHTML(E.arche)}
    </section>
    ${briefHTML(E.months || 12)}
    ${E.exit ? '' : `<section class="carry-on"><div><b>Carry on into year ${(S.yr || 0) + 2}?</b><p>Same practice, same staff, same overdraft. Demand keeps rising, the funding doesn't quite keep up, and the years wear on you. How long can you last?</p></div><button class="btn primary" data-act="nextyear">Carry on: year ${(S.yr || 0) + 2} →</button></section>`}
    <div class="rgrid">
      <section class="panel"><h3>The accounts</h3>${accounts}
        ${explain('When the money actually arrives', `<p>Profit for the year is fixed on 31 March, but the cash comes later. The QOF balance is due by the end of June, and the accountant settles each partner's drawings against their real share once the accounts are signed, typically in the summer.</p>${srcLinks(['S3', 'S23'])}`)}
      </section>
      <section class="panel"><h3>Your own money</h3>
        <dl class="kv">
          <dt>Your profit share, before tax</dt><dd>${gbp(E.shareK * 1000)}</dd>
          <dt>NHS pension (${(pers.rate * 100).toFixed(1)}%: member plus employer share)</dt><dd>−${gbp(pers.pension)}</dd>
          <dt>Income tax</dt><dd>−${gbp(pers.tax)}</dd>
          <dt>Class 4 National Insurance</dt><dd>−${gbp(pers.c4)}</dd>
          <dt class="sum">Take-home</dt><dd class="sum">${gbp(pers.takeHome)}</dd>
          <dt>Hours worked</dt><dd>${Math.round(E.hours).toLocaleString('en-GB')}</dd>
          <dt>Take-home per hour</dt><dd>£${E.perHour.toFixed(0)}</dd>
          <dt>A locum's hourly rate, before their tax</dt><dd>£85–£105</dd>
        </dl>
        ${E.exit || S.yr ? '' : `<p class="fc-note">Your first Self Assessment bill as a new partner: about <b>${gbp(E.firstTax)}</b> on 31 January 2028. That's a full year's tax and NI plus a 50% payment on account, in one go. Hope you put 40% aside.</p>`}
        ${explain('Why take-home is so much lower than the headline', `<p>Partners pay both halves of their NHS pension: the member rate, up to 12.5%, and the 14.38% employer share. It buys a defined-benefit pension, so it isn't lost, but it isn't spendable either. Income tax follows at 20%, 40% and 45%. The personal allowance tapers away above £100,000, so part of the income is effectively taxed at 60%. Class 4 NI is 6%, then 2%.</p><p>Nationally, partners averaged £164,200 before tax in 2024/25, from £581,800 of income per partner. 71.8% of the money went on staff and running costs.</p>${srcLinks(['S8', 'S21', 'S22', 'S23'])}`)}
      </section>
    </div>
    <section class="panel"><h3>The practice</h3>${statLines(null)}
      ${S.cqc ? `<div class="cqc-card">${Object.keys(S.cqc.rates).map(k => `<div class="row"><span>${k}</span><span class="rate ${S.cqc.rates[k]}">${RATE_NAME[S.cqc.rates[k]]}</span></div>`).join('')}<div class="row overall"><span>Overall</span><span class="rate">${RATE_NAME[S.cqc.overall]}</span></div></div>` : '<p class="fc-note">CQC never came. Enjoy it while it lasts.</p>'}
      ${chartSVG()}</section>
    ${sponsorHTML()}
    ${boardPanelHTML()}
    ${partnersBoardHTML(8)}
    <div class="end-actions"><button class="btn" data-act="shareimg">Share a picture</button><button class="btn" data-act="share">Copy my result</button><button class="btn ghost" data-act="again">New partner, same practice</button><button class="btn ghost" data-act="home">Title screen</button></div>
    ${supportHTML()}
  </div></main>`;
}
function renderOver() {
  const O = OVER[S.over.k];
  $app.innerHTML = hudHTML() + `<main class="stage"><div class="wrap ending">
    <section class="front front-end" aria-label="Your surgery, closed">${facadeSVG(null, { closed: true })}${brassPlate()}</section>
    <section class="verdict over"><div class="eyebrow">${MONTHS[S.over.month]} ${calY(S.over.month)} · ${esc(prac().surgery)}${S.yr ? ` · year ${S.yr + 1}` : ''}</div><span class="bigstamp">${esc(O.stamp)}</span>
      <h1>${esc(O.title)}</h1><p class="lede">${esc(O.text())}</p>
      <div class="score"><span>You lasted <b>${S.over.months || S.over.month + 1}</b> month${(S.over.months || S.over.month + 1) === 1 ? '' : 's'} as a partner</span></div>
      ${counterHTML(O)}</section>
    ${briefHTML(S.over.months || S.over.month + 1)}
    <section class="panel"><h3>Where it ended</h3>${statLines(null)}<p class="fc-note">Bank ${fmtK(S.cash)} · QOF ${Math.round(S.qof)}% · Inbox ${Math.round(S.inbox)}</p>
      ${explain('What went wrong', `<p>Meters drift toward wherever the practice's situation is taking them. When capacity falls behind demand, the inbox grows or your hours climb, the pull is downward every month until something changes: more staff, fewer sessions, a different project, time off.</p><p>Watch the <b>Where things are heading</b> panel in the month plan. It shows where each meter will settle, and why.</p>`)}</section>
    ${S.history.length > 1 ? `<section class="panel"><h3>How it went</h3>${chartSVG()}</section>` : ''}
    ${S.yr >= 1 ? boardPanelHTML() : ''}
    ${partnersBoardHTML(8)}
    <section class="carry-on"><div><b>Take over the practice?</b><p>A new partner walks in where Dr ${esc(S.name)} fell: same staff, same list, same overdraft, same queue. The longer the practice struggles, the harder it gets.</p></div><button class="btn primary" data-act="takeover">Take over →</button></section>
    <div class="end-actions"><button class="btn" data-act="again">Start afresh</button><button class="btn" data-act="shareimg">Share a picture</button><button class="btn ghost" data-act="home">Title screen</button></div>
    ${supportHTML()}
  </div></main>`;
}

/* ---------- overlays ---------- */
function openOverlay(html) { closeOverlay(); const d = document.createElement('div'); d.className = 'overlay'; d.id = 'overlay'; d.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">${html}</div>`; document.body.appendChild(d); const b = d.querySelector('button'); if (b) b.focus(); }
function closeOverlay() { const o = document.getElementById('overlay'); if (o) o.remove(); }
function howHTML() {
  return `<h2>How it works</h2><ul>
    <li><b>Four meters and a bank balance.</b> Patients, Team, You and Safety run from 0 to 100. If one hits zero, the game ends. Before that, a crisis card gives you one last chance. The bank can go into overdraft, but not past the limit.</li>
    <li><b>Meters drift.</b> Each month they move toward wherever your practice's situation is taking them. The month plan shows where each will settle, and why.</li>
    <li><b>Plan each month.</b> Your sessions set capacity, the inbox and your hours. Locums add appointments but cost money and do no paperwork. Recruit or let staff go. Pick one project.</li>
    <li><b>Decisions have consequences.</b> Choices marked <b>Lasting</b> change where things settle. <b>Comes back later</b> means something may return in a later month. <b>Gamble</b> choices can go wrong.</li>
    <li><b>Real or fiction.</b> Cards tagged <b>Real figures</b> or <b>Real rule</b> have a "What's real here?" explainer with sources.</li>
    <li><b>Keyboard.</b> 1 to 3 to choose, Enter to continue. The mini-games use number keys too.</li>
  </ul><div class="row-actions"><button class="btn primary" data-act="close">Got it</button></div>`;
}
function glossaryHTML() {
  return `<h2>Glossary</h2><div class="gloss">${GLOSSARY.map(([term, def, src]) => explain(term, `<p>${esc(def)}</p>${srcLinks(src)}`)).join('')}</div><div class="row-actions"><button class="btn primary" data-act="close">Close</button></div>`;
}
function sourcesHTML() {
  return `<h2>Sources</h2><p class="muted">The figures come from 2026/27 scoping research. Grade A is an official primary source, B a reputable secondary source, C market data or examples.</p>${srcLinks(Object.keys(SOURCES))}<div class="row-actions"><button class="btn primary" data-act="close">Close</button></div>`;
}
function menuHTML() {
  return `<h2>Menu</h2><p class="muted">Your game saves automatically after every decision, in this browser only.${typeof BUILD !== 'undefined' ? ` Version ${BUILD}.` : ''}</p>
  <div class="row-actions" style="justify-content:flex-start"><button class="btn" data-act="how">How it works</button><button class="btn" data-act="glossary">Glossary</button>${boardOn() ? `<button class="btn" data-act="board">Leaderboard</button>` : ''}<button class="btn" data-act="honours">The Partners' Board</button><button class="btn" data-act="timer">${UI.settings.timer ? 'Turn off' : 'Turn on'} the ${CARD_SECONDS}-second timer</button><button class="btn" data-act="quick">${UI.settings.quick ? 'Show every month report' : 'Skip quiet month reports'}</button><button class="btn" data-act="teach">${UI.settings.teach ? 'Stop explaining the contract' : 'Explain the contract as you go'}</button>${updOn() ? '<button class="btn" data-act="update">Check for a new version</button>' : ''}<button class="btn" data-act="sources">Sources</button><button class="btn" data-act="theme">Switch light/dark</button><button class="btn" data-act="restart-ask">Resign from the partnership</button><button class="btn primary" data-act="close">Back to work</button></div>`;
}
// a month with nothing to read: no consequences, hires, departures or endings, small meter moves, nothing near the edge
function quietMonth(R) {
  if (!R || R.news || checkOver() || S.month >= 11 || (!(S.yr || 0) && S.month < 2)) return false;
  if (R.deltas.some(d => STAT_KEYS.includes(d.k) && Math.abs(d.d) >= 6)) return false;
  if (STAT_KEYS.some(k => S.st[k] < 30) || S.cash < S.overdraft + 20) return false;
  return true;
}
// places an advert for k (a role, or arrsgp / arrsnurse through the PCN) on hours u; returns the message to show
function placeAdvert(k, u) {
  const role = k === 'arrsgp' ? 'salaried' : k === 'arrsnurse' ? 'nurse' : k, R = ROLES[role], pcn = role !== k;
  if (!R) return '';
  const claim = R.arrs ? arrsClaimOf(role) * u : pcn ? pcnClaim(role, u) : 0;
  const overK = claim ? Math.max(0, Math.min(claim, claim - arrsLeft())) : 0;
  const cost = advertCost(k);
  advertise(k, u); S.cash = r1(S.cash - cost);
  return `${R.name}${isGP(role) || Math.abs(u - 1) > 0.01 ? ` (${hrsTxt(role, u)})` : ''} advertised${pcn ? ' through the PCN\'s additional-roles budget' : ''}${cost ? ` (${fmtK(cost)})` : ''}.${role === 'salaried' && gpHeadroom() < 0 ? ` Don't hold your breath: ${prac().place} already has one GP per ${prac().gpCap.toLocaleString('en-GB')} patients, and the local GPs are all taken.` : ' Results at month end.'}${overK > 0.5 ? ` Over the PCN budget: about £${Math.round(overK)}k a year from the practice.` : ''}`;
}
// stays long enough to read: about 4 seconds, longer for longer messages; tap to dismiss
function toast(msg) { document.querySelectorAll('.toast').forEach(x => x.remove()); const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; t.addEventListener('click', () => t.remove()); document.body.appendChild(t); setTimeout(() => t.remove(), Math.min(9000, 3500 + msg.length * 30)); }

/* ---------- render ---------- */
function render() {
  if (UI.tmr) { clearTimeout(UI.tmr); UI.tmr = null; }
  if (!S || UI.screen === 'title') { renderTitle(); return; }
  switch (S.phase) {
    case 'plan': return renderPlan();
    case 'event': return renderEvent();
    case 'outcome': return renderOutcome();
    case 'mini': return renderMini();
    case 'report': {
      // quiet months skip straight to the next plan, with a short "last month" panel there instead
      if (UI.settings.quick && quietMonth(S.report)) {
        const R = S.report;
        S.lastQuiet = { m: R.month, yr: S.yr || 0, headline: R.headline, cap: R.c.cap, demand: R.c.demand, net: R.c.net, cash: S.cash, proj: R.proj, d: R.deltas.filter(d => STAT_KEYS.includes(d.k)).map(d => [d.k, d.d]) };
        nextMonth();
        return render();
      }
      return renderReport();
    }
    case 'end': { const first = BD.for !== S.end; if (first) { BD.for = S.end; BD.posted = null; BD.rank = null; BD.tab = runTab(); BD.rows = null; } renderEnd(); if (first) loadBoard(); return; }
    case 'over': { const r = boardRun(), first = r && BD.for !== r; if (first) { BD.for = r; BD.posted = null; BD.rank = null; BD.tab = 'long'; BD.rows = null; } renderOver(); if (first) loadBoard(); return; }
  }
}
function go(fn) { fn(); render(); window.scrollTo(0, 0); }

/* ---------- input ---------- */
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act, arg = b.dataset.arg;
  switch (a) {
    case 'pick': UI.pickPractice = arg; keepScroll(renderTitle); break;
    case 'win': { const c = calc(); const T = targets(c);
      if (arg === 'cash') openOverlay(`<h2>The office: the bank</h2><p class="lede-s">Bev's office. The practice account is at <b>${fmtK(S.cash)}</b>, with an overdraft limit of ${fmtK(S.overdraft)}. This month it will move by <b>${signK(c.net)}</b>.</p><p class="muted">Income is mostly the global sum, QOF and enhanced services. Staff, locums, running costs and your drawings take it back out. The money panel in the month plan has the details.</p><div class="row-actions"><button class="btn primary" data-act="close">Close</button></div>`);
      else { const k = arg, now = Math.round(S.st[k]); openOverlay(`<h2>${esc({ patients: 'The waiting room', team: 'The staff room', you: 'Your room', safety: 'The treatment room' }[k])}: ${STAT_LABEL[k]}</h2><p class="lede-s">The ${STAT_LABEL[k]} meter is at <b>${now}</b>. If nothing changes, it settles at <b>${T[k].v}</b>.</p>${whyList(T[k].why)}<div class="row-actions"><button class="btn primary" data-act="close">Close</button></div>`); }
      break; }
    case 'nextyear': go(continueYear); track('continue'); break;
    case 'quick': { UI.settings.quick = !UI.settings.quick; saveSettings(); if (S && UI.screen !== 'title') { closeOverlay(); render(); } else keepScroll(renderTitle); toast(UI.settings.quick ? 'Quiet months now skip straight to the next plan.' : 'You\'ll see every month report.'); break; }
    case 'teach': {
      UI.settings.teach = !UI.settings.teach; saveSettings();
      if (S && UI.screen !== 'title') {
        // mid-game: schedule what's left of year one, or clear it and skip one that's on screen
        teachSync();
        if (!UI.settings.teach && S.phase === 'event' && TEACH_IDS.includes(S.queue[S.qi])) advanceEvent();
        save(); closeOverlay(); render();
      } else keepScroll(renderTitle);
      toast(UI.settings.teach ? 'Contract explainers on: six cards through year one, in the leafy suburb and the market town.' : 'Contract explainers off.');
      break;
    }
    case 'timer': { UI.settings.timer = !UI.settings.timer; saveSettings(); if (S && UI.screen !== 'title') { closeOverlay(); render(); } else keepScroll(renderTitle); toast(UI.settings.timer ? `The 8am pace is on: ${CARD_SECONDS} seconds a card.` : 'The 8am pace is off.'); break; }
    case 'takeover': go(takeOver); break;
    case 'honours': openOverlay(partnersBoardHTML(40) + '<div class="row-actions"><button class="btn primary" data-act="close">Close</button></div>'); break;
    case 'shareimg': openShareImage(); break;
    case 'shareimg-go': { const f = UI.shareFile; if (f && navigator.share) navigator.share({ files: [f], text: 'How long can you last as a GP partner?', url: 'https://last-partner-standing.vercel.app' }).catch(() => { }); break; }
    case 'look': UI.look.s = +arg; UI.lookOpen = true; keepScroll(renderTitle); break;
    case 'lookc': UI.look.c = +arg; UI.lookOpen = true; keepScroll(renderTitle); break;
    case 'dice': { UI.nameDraft = diceName(); keepScroll(renderTitle); break; }
    case 'start': { const nm = (UI.nameDraft || '').trim().replace(/^dr\.?\s+/i, '') || 'Jones'; UI.screen = 'game'; UI.intro = true; go(() => newGame(UI.pickPractice, nm)); break; }
    case 'continue': { const s = loadSave(); if (s) { S = s; teachSync(); UI.screen = 'game'; go(() => { }); track('resume'); } break; }
    case 'menu': openOverlay(menuHTML()); break;
    case 'update': closeOverlay(); checkUpdate(true); break;
    case 'reload': { try { if (S) save(); } catch (e) { } location.reload(); break; }
    case 'how': openOverlay(howHTML()); break;
    case 'glossary': openOverlay(glossaryHTML()); break;
    case 'sources': openOverlay(sourcesHTML()); break;
    case 'close': closeOverlay(); break;
    case 'theme': { const r = document.documentElement; const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; r.dataset.theme = dark ? 'light' : 'dark'; closeOverlay(); break; }
    case 'restart-ask': openOverlay(`<h2>Resign?</h2><p>This ends the current year. Your progress will be lost.</p><div class="row-actions"><button class="btn" data-act="close">Stay</button><button class="btn primary" data-act="restart">Resign</button></div>`); break;
    case 'restart': closeOverlay(); clearSave(); S = null; UI.screen = 'title'; go(() => { }); break;
    case 'clin': case 'admin': case 'mgmt': {
      const d = +arg, pl = S.plan, tot = pl.clin + pl.admin + pl.mgmt;
      if (d > 0 && tot >= 12) break; if (d < 0 && pl[a] <= 0) break;
      pl[a] += d; save(); keepScroll(renderPlan); break;
    }
    case 'locum': S.plan.locum = clamp(S.plan.locum + +arg, 0, locumMax()); save(); keepScroll(renderPlan); break;
    case 'extra': S.plan.extra = clamp((S.plan.extra || 0) + +arg, 0, OT_MAX); save(); keepScroll(renderPlan); break;
    case 'draw': S.plan.draw = arg; save(); keepScroll(renderPlan); break;
    case 'proj': S.plan.project = arg; save(); keepScroll(renderPlan); break;
    case 'hire': {
      if (UI.lastHire && UI.lastHire.r === arg && Date.now() - UI.lastHire.t < 700) break;
      UI.lastHire = { r: arg, t: Date.now() };
      const t = placeAdvert(arg, hrsPick(arg)); if (t) { save(); keepScroll(renderPlan); toast(t); } break;
    }
    // one of Bev's staffing suggestions, on the hours she suggested
    case 'advise': {
      const g = UI.suggest, a = g && g.staff && g.staff[+arg]; if (!a || a.done || !a.k) break;
      const t = placeAdvert(a.k, a.u); if (t) { a.done = 1; save(); keepScroll(renderPlan); toast(t); } break;
    }
    case 'hrs': { const [r, v] = String(arg).split(':'); if (ROLES[r] && +v > 0) { (UI.hrs = UI.hrs || {})[r] = +v; keepScroll(renderPlan); } break; }
    case 'unvac': if (S.vac[arg]) { unadvertise(arg); save(); keepScroll(renderPlan); } break;
    case 'fire': {
      const p = headcount(arg) ? loseStaff(arg, 'last') : null; if (!p) break;
      const big = ['salaried', 'nurse'].includes(arg);
      S.st.team = clamp(S.st.team - (big ? 6 : 3)); save(); keepScroll(renderPlan);
      toast(`${ROLES[arg].name} (${hrsTxt(arg, p.u)}) let go. Team morale ${big ? '−6' : '−3'}.`); break;
    }
    case 'weekly': { const w = weeklyChallenge(); const nm = (UI.nameDraft || '').trim().replace(/^dr\.?\s+/i, '') || 'Jones'; UI.screen = 'game'; UI.intro = true; go(() => newGame(w.practice, nm, { seed: w.seed, week: w.week })); break; }
    case 'begin': go(beginMonth); break;
    case 'suggest': { if (S.practiceKey === 'city') break; UI.suggest = { yr: S.yr || 0, m: S.month, ...bevAdvice() }; save(); keepScroll(renderPlan); break; }
    case 'suggest-x': UI.suggest = null; keepScroll(renderPlan); break;
    case 'choose': chooseAt(+arg); break;
    case 'cont': go(continueOutcome); break;
    case 'next': go(nextMonth); break;
    case 'nextgo': go(() => { nextMonth(); if (S.phase === 'plan') beginMonth(); }); break;
    case 'again': { const k = S.practiceKey, n = S.name, lk = S.look; go(() => newGame(k, n, { look: lk })); break; }
    case 'home': S = null; UI.screen = 'title'; go(() => { }); break;
    case 'share': {
      const txt = shareText();
      const done = () => toast('Copied. Go and humblebrag in the practice WhatsApp.');
      const fallback = () => openOverlay(`<h2>Your result</h2><textarea id="sharebox" rows="5" style="width:100%;font-family:var(--mono);font-size:13px;padding:8px;border-radius:8px;border:1.5px solid var(--rule);background:var(--sheet-2)">${esc(txt)}</textarea><div class="row-actions"><button class="btn primary" data-act="close">Done</button></div>`);
      try { navigator.clipboard.writeText(txt).then(done, () => { fallback(); const t = document.getElementById('sharebox'); if (t) t.select(); }); } catch (e) { fallback(); }
      break;
    }
    default: if (typeof boardAction === 'function' && boardAction(a, arg)) break; if (typeof miniAction === 'function') miniAction(a, arg);
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
  if ((ev.key === 'Enter' || ev.key === ' ') && document.activeElement && document.activeElement.matches && document.activeElement.matches('g[data-act]')) { ev.preventDefault(); document.activeElement.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
  if (document.getElementById('overlay')) { if (ev.key === 'Escape') closeOverlay(); return; }
  if (!S || UI.screen === 'title') return;
  if (ev.target && /input|textarea|summary/i.test(ev.target.tagName)) return;
  if (S.phase === 'mini') { if (typeof miniKey === 'function') miniKey(ev); return; }
  if (S.phase === 'event' && /^[1-4]$/.test(ev.key)) { ev.preventDefault(); chooseAt(+ev.key - 1); }
  else if (ev.key === 'Enter' && !(ev.target && ev.target.closest && ev.target.closest('button'))) {
    if (S.phase === 'outcome') go(continueOutcome); else if (S.phase === 'report') go(nextMonth);
  }
});
