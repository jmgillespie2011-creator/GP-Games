/* ---------- Scene 3, The year (18 to 40s): six cards from April to February, and the front shows every one ----------
 The game's loop at speed. A card is dealt on the right, twice a choice is made, then the HUD bars slide to the
 storyboard's next row and the surgery front changes with them: lights dim, the staff room empties, a queue forms.
 Starts on s1's last frame (TR.CAM.FULL, every window lit, three names on the plate). Ends on TR.CAM.LEFT in
 February 2027: Patients 31, Team 38, You 26, Safety 33, the bank at −£52k, a queue of five in the rain. */
TR.css(`
.s3-brass{position:absolute}
.s3-rain{position:absolute;background-repeat:repeat}
.s3-deck{position:absolute;left:690px;top:96px;width:550px;height:582px;display:grid;grid-template:100%/100%;place-items:center}
.s3-slot{grid-area:1/1;transform-origin:50% 70%}
.s3-choices{display:grid;gap:9px;margin-top:16px}
.s3-choice{border:1.5px solid var(--t-ink);background:#EEF4EC;border-radius:10px;padding:10px 14px;display:grid;gap:6px;transform-origin:20% 50%}
.s3-choice .t{font-weight:700;font-size:16px;line-height:1.3}
.s3-kbd{font-family:var(--mono);font-size:11px;font-weight:400;border:1px solid currentColor;border-radius:4px;padding:0 .35em;opacity:.7;margin-right:.35em;vertical-align:1px}
.s3-dwrap{height:0}
.s3-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.s3-chip{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-size:11.5px;line-height:1.5;color:var(--t-ink2);border:1px solid var(--t-rule);border-radius:99px;padding:1px 8px 1px 5px;background:var(--t-sheet)}
.s3-chip svg{width:14px;height:14px}
.s3-chip .dot{width:6px;height:6px;border-radius:50%;background:var(--t-ink2)}
.s3-chip .dot.big{width:10px;height:10px}
.s3-chip.risk{border-style:dashed;color:var(--t-stamp);border-color:var(--t-stamp)}
.s3-chip.later{color:var(--t-warn);border-color:var(--t-warn);border-style:dashed}
.s3-chip.now{color:var(--t-bad);border-color:var(--t-bad);font-weight:700}
.s3-chip.txt{padding-left:8px}
.s3-deltas{display:flex;flex-wrap:wrap;gap:8px;padding-top:14px}
.s3-delta{font-family:var(--mono);font-size:13px;font-weight:600;line-height:1.5;border-radius:6px;padding:2px 9px;border:1.5px solid;background:var(--t-sheet)}
.s3-delta.up{color:var(--t-good);border-color:var(--t-good)}
.s3-delta.down{color:var(--t-bad);border-color:var(--t-bad)}
`);

const S3 = {
  // the meters after each beat, from the storyboard: patients, team, you, safety, bank (£k), appointments against demand
  rows: [
    [48, 52, 64, 52, 30, 1.00],
    [46, 50, 60, 51, 24, 0.98],
    [42, 47, 55, 49, 20, 0.93],
    [44, 49, 52, 47, 12, 0.95],
    [40, 43, 44, 38, -6, 0.90],
    [33, 39, 33, 34, -30, 0.84],
    [31, 38, 26, 33, -52, 0.82]
  ],
  // the six cards: dealt at `at`, meters move `move` seconds later; two show the game's choices, and the first is taken
  // (`press`). Choice chips as the game draws them: a meter with a dot (! for a big one), later, risk, now, follow.
  cards: [
    { who: 'dept', title: 'Contract day', tag: 'real', month: 0, at: 0.8, move: 1.85,
      text: 'The new contract has landed. Global sum up 5.5% to £130.07 per weighted patient. Online requests can no longer be capped.' },
    { who: 'patient', title: 'Monday, 8:02am', tag: 'rule', month: 2, at: 4.1, move: 1.85,
      text: 'Online requests can’t be capped any more. There are 212 already. One of them just says “hello?”' },
    { who: 'gerald', title: 'The fish tank', tag: 'story', month: 3, at: 7.4, move: 2.65, press: 2.3,
      text: 'A CQC inspector asked a practice for the risk assessment for its waiting-room fish tank. Bev looks at Gerald, a goldfish who has outlived three practice managers.',
      choices: [['Write Gerald a risk assessment', 'team you safety'], ['Rehome Gerald with Kayleigh', 'patients team now'], ['Leave it. He’s a goldfish.', 'you later']] },
    { who: 'hospital', title: 'Four thousand letters', tag: 'real', month: 6, at: 11.4, move: 1.85,
      text: 'Two years of clinic letters were never sent to GPs. At 9am the fault sent all of them at once. Docman shows 4,212 new documents.' },
    { who: 'kayleigh', title: 'Queue in the rain', tag: 'story', month: 8, at: 14.7, move: 1.85,
      text: 'It’s 7:40am and there are 30 people queuing outside in the rain. Someone has brought a camping chair.' },
    { who: 'bank', title: 'Payroll day', tag: 'real', month: 10, at: 18.0, move: 2.65, press: 2.3,
      text: 'Payroll is due and you’re past the £75k overdraft limit. The bank will extend it by £60,000 if every partner signs a personal guarantee.',
      choices: [['Sign the personal guarantee', 'you! risk now'], ['Ring Parkside about a merger', 'risk'], ['Refuse. Hand back the contract.', 'follow']] }
  ],
  keys: ['patients', 'team', 'you', 'safety', 'cash'],
  MOVE: 0.6,     // seconds for the meters to slide
  TURN: 0.45,    // seconds for the front to cross into a new month
  ROW: 42        // px the row of delta chips adds to a card when it opens
};
S3.stateOf = (row, month) => { const r = S3.rows[row]; return { st: { patients: r[0], team: r[1], you: r[2], safety: r[3] }, cash: r[4], ratio: r[5], month }; };
// the front's discrete states in order: a new month as each card is dealt, then the card's consequences
S3.front = [];
S3.cards.forEach((c, i) => {
  if (i && c.month !== S3.cards[i - 1].month) S3.front.push({ at: c.at, dur: S3.TURN, row: i, month: c.month });
  S3.front.push({ at: c.at + c.move, dur: S3.MOVE, row: i + 1, month: c.month });
});
// the HUD's keyframes: each row holds until its card's meters move
S3.hudKf = [[0, S3.rows[0]]];
S3.cards.forEach((c, i) => { S3.hudKf.push([c.at + c.move, S3.rows[i]], [c.at + c.move + S3.MOVE, S3.rows[i + 1]]); });
S3.monthKf = [[0, 0]];
S3.cards.forEach((c, i) => { if (i) S3.monthKf.push([c.at - 0.1, S3.cards[i - 1].month], [c.at + 0.3, c.month]); });
// a tile of rain streaks, slanted like the game's (2 across for 6 down); the same rain as s4's, so the cut matches
S3.rainTile = (seed, w, h, n, len, sw, op) => {
  const r = TR.rnd(seed);
  let p = '';
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, l = len * (0.7 + r() * 0.6), o = op * (0.6 + r() * 0.4);
    for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) p += `<path d="M${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}l${(-l / 3).toFixed(1)} ${l.toFixed(1)}" opacity="${o.toFixed(2)}"/>`;
  }
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><g stroke="#B9C6D6" stroke-width="${sw}" stroke-linecap="round">${p}</g></svg>`)}")`;
};
// write a style property only when it changes
S3.set = (el, k, v) => { if (el['_s3' + k] !== v) { el.style[k] = v; el['_s3' + k] = v; } };
S3.mix = (a, b, p) => '#' + [1, 3, 5].map(i => Math.round(TR.lerp(parseInt(a.substr(i, 2), 16), parseInt(b.substr(i, 2), 16), p)).toString(16).padStart(2, '0')).join('');

TR.scene({
  id: 's3-year', title: 'The year', dur: 22,
  lines: ['April to February in six cards: the new contract, uncapped online requests, a risk assessment for Gerald the goldfish, 4,212 hospital letters, a queue in the rain and payroll day.', 'After every card the meters fall and the front shows it: the lights dim, the staff room empties, a queue forms in the rain and you slump at your desk.'],
  build(root) {
    const K = S3.keys;
    root._street = TR.el('div', 'tr-fill', null, root);
    // two copies of the front: the state before a change underneath, the state after it fading in on top
    root._facA = TR.el('div', 'tr-facade', null, root);
    root._facB = TR.el('div', 'tr-facade', null, root);
    root._rain = [
      { w: 150, h: 240, vx: -110, vy: 330, img: S3.rainTile(41, 150, 240, 7, 22, 1.1, 0.5) },
      { w: 230, h: 360, vx: -190, vy: 570, img: S3.rainTile(42, 230, 360, 5, 40, 1.6, 0.55) }
    ].map(L => {
      const el = TR.el('div', 's3-rain', null, root);
      TR.place(el, { x: -L.w, y: -L.h, w: 1280 + 2 * L.w, h: 720 + 2 * L.h });
      el.style.backgroundImage = L.img;
      return Object.assign(L, { el });
    });
    root._brass = TR.el('div', 's3-brass', null, root);
    // the cards, all built now and posed by the time
    root._deck = TR.el('div', 's3-deck', null, root);
    const chip = s => {
      const k = s.replace('!', '');
      if (ICON[k]) return `<span class="s3-chip">${ICON[k]}<span class="dot${s.endsWith('!') ? ' big' : ''}"></span></span>`;
      return { later: '<span class="s3-chip txt later">Comes back later</span>', risk: '<span class="s3-chip txt risk">Gamble</span>', now: '<span class="s3-chip txt now">Costs more right now</span>', follow: '<span class="s3-chip txt">Consequences to follow</span>' }[k];
    };
    const choice = (ch, j) => `<div class="s3-choice"><span class="t"><span class="s3-kbd">${j + 1}</span>${esc(ch[0])}</span><div class="s3-chips">${ch[1].split(' ').map(chip).join('')}</div></div>`;
    root._cards = S3.cards.map((c, i) => {
      const slot = TR.el('div', 's3-slot', TR.cardHTML({ who: c.who, title: c.title, text: c.text, tag: c.tag, stamp: `${MON3[c.month].toUpperCase()} · ${i + 1}/6` }), root._deck);
      const card = slot.firstElementChild;
      // the game's delta chips for what this card's month did to the meters
      const deltas = K.map((k, j) => {
        const d = S3.rows[i + 1][j] - S3.rows[i][j];
        return d ? `<span class="s3-delta ${d > 0 ? 'up' : 'down'}">${STAT_LABEL[k]} ${d > 0 ? '+' : '−'}${k === 'cash' ? '£' + Math.abs(d) + 'k' : Math.abs(d)}</span>` : '';
      }).join('');
      if (c.choices) {
        // the first choice is taken; the others dim, like the game's unavailable ones
        const box = TR.el('div', 's3-choices', c.choices.map(choice).join(''), card);
        [slot._pick, ...slot._others] = box.children;
      }
      // the row of deltas opens under the card as the meters move
      slot._dwrap = TR.el('div', 's3-dwrap', `<div class="s3-deltas">${deltas}</div>`, card);
      slot._chips = [...slot._dwrap.firstElementChild.children];
      return slot;
    });
    // the HUD strip, as the game draws it
    root._hud = TR.el('div', null, null, root);
    TR.hud(root._hud);
    root._bars = K.map(k => root._hud._m[k].b.parentElement);
  },
  update(lt, root) {
    const E = TR.ease;
    // the camera: from the whole front to the left, making room for the cards and the HUD
    const cam = TR.camLerp(TR.CAM.FULL, TR.CAM.LEFT, E.inOut(TR.seg(lt, 0, 1.0)));
    TR.street(root._street, cam);
    TR.cam(root._facA, cam);
    TR.cam(root._facB, cam);
    // the front: find the change in progress; the old state underneath, the new one fading in over it
    let from = { row: 0, month: 0 }, to = from, p = 1;
    for (const s of S3.front) { if (lt < s.at) break; from = to; to = s; p = E.inOut(TR.seg(lt, s.at, s.at + s.dur)); }
    const draw = (el, s) => { const k = s.row + '|' + s.month; if (el._s3k !== k) { TR.facade(el, S3.stateOf(s.row, s.month)); el._s3k = k; } };
    draw(root._facA, from);
    draw(root._facB, to);
    const bo = +p.toFixed(3);
    S3.set(root._facB, 'opacity', String(bo));
    // rain from December, as the queue gets wet
    const ro = E.inOut(TR.seg(lt, S3.cards[4].at, S3.cards[4].at + 0.6));
    root._rain.forEach(L => TR.pose(L.el, { x: -((-L.vx * lt) % L.w), y: (L.vy * lt) % L.h, o: ro }));
    // the brass plate hangs under the front, then drops away as the camera moves
    const k = cam.w / 320;
    TR.place(root._brass, { x: cam.x, y: cam.y + 250 * k, w: cam.w });
    TR.brass(root._brass, [{ n: 'Dr ' + TR.NAME }, { n: 'Dr Hartley' }, { n: 'Dr Okoye' }]);
    TR.pose(root._brass, { y: 110 * E.in(TR.seg(lt, 0, 0.6)), o: 1 - E.in(TR.seg(lt, 0.05, 0.6)) });
    // the HUD slides down from the top, then follows the year
    TR.pose(root._hud, { y: -140 * (1 - E.out(TR.seg(lt, 0.1, 0.75))), o: E.out(TR.seg(lt, 0.1, 0.4)) });
    const v = TR.kf(lt, S3.hudKf, E.inOut);
    TR.hudSet(root._hud, { st: { patients: v[0], team: v[1], you: v[2], safety: v[3] }, cash: Math.round(v[4]), month: TR.kf(lt, S3.monthKf, E.lin) });
    // the game's pulse on the bars while they move: green up, red down
    let mi = -1; S3.cards.forEach((c, i) => { if (lt >= c.at + c.move) mi = i; });
    const pa = mi < 0 ? 0 : TR.window(lt, S3.cards[mi].at + S3.cards[mi].move, S3.cards[mi].at + S3.cards[mi].move + 1.3, 0.15, 0.55);
    root._bars.forEach((b, j) => {
      const d = mi < 0 ? 0 : S3.rows[mi + 1][j] - S3.rows[mi][j];
      S3.set(b, 'boxShadow', pa > 0.005 && d ? `0 0 0 3px ${d > 0 ? 'rgba(44,134,86,' : 'rgba(191,58,44,'}${(0.5 * pa).toFixed(3)})` : 'none');
    });
    // the cards: dealt from slightly below with a hint of rotation; each leaves upwards just before the next lands
    S3.cards.forEach((c, i) => {
      const slot = root._cards[i], r = lt - c.at, nx = S3.cards[i + 1];
      const d = E.out(TR.seg(r, 0, 0.45)), x = nx ? E.in(TR.seg(lt, nx.at - 0.28, nx.at + 0.02)) : 0;
      const o = E.out(TR.seg(r, 0, 0.25)) * (1 - x);
      // the deltas row opens downwards: the deck centres the card, so half the growth is given back to hold its top still
      const g = S3.ROW * E.out(TR.seg(r, c.move - 0.05, c.move + 0.3));
      TR.pose(slot, { y: 46 * (1 - d) - 22 * x + g / 2, r: -1.4 * (1 - d) + 0.8 * x, s: 1 - 0.035 * x, o });
      if (o <= 0.001) return;
      S3.set(slot._dwrap, 'height', g.toFixed(1) + 'px');
      if (c.press) {
        // the choice: the pointer arrives (the game's hover), then the press; the other choices dim
        const P = c.press, h = E.out(TR.seg(r, P - 0.32, P - 0.1)), a = E.out(TR.seg(r, P, P + 0.12));
        const dip = TR.kf(r, [[P, 0], [P + 0.07, 1], [P + 0.26, 0]], E.inOut);
        TR.pose(slot._pick, { x: 3 * h, s: 1 - 0.02 * dip });
        S3.set(slot._pick, 'boxShadow', h > 0.001 ? `-4px 0 0 rgba(29,106,77,${h.toFixed(3)})` : 'none');
        S3.set(slot._pick, 'background', S3.mix(S3.mix('#EEF4EC', '#F8FBF6', h), '#CFE5D8', a));
        S3.set(slot._pick, 'borderColor', S3.mix('#15241C', '#1D6A4D', a));
        slot._others.forEach(el => TR.pose(el, { o: 1 - 0.62 * E.inOut(TR.seg(r, P + 0.1, P + 0.4)) }));
      }
      // the delta chips land one after another as the meters move
      slot._chips.forEach((el, j) => {
        const q = TR.seg(r, c.move + 0.07 * j, c.move + 0.07 * j + 0.3);
        TR.pose(el, { y: 6 * (1 - E.out(q)), s: 0.82 + 0.18 * E.back(q), o: E.out(q) });
      });
    });
  }
});
