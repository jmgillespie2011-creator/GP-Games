/* ---------- Scene 2, Five windows (8 to 18s): each lit window is one of the five meters ----------
 The building dims and one window at a time stays lit. Its frame turns yellow, as it does when you point at it in the
 game, and a card in the margin names the meter the way the game's HUD draws it. Then all five light up together.
 Starts and ends on s1's last frame: TR.CAM.FULL, every window lit, the starting meters, three names on the plate. */
TR.css(`
.s2-brass{position:absolute}
.s2-dark{position:absolute;left:0;top:0;width:1280px;height:720px;line-height:0}
.s2-dark svg{display:block}
.s2-slot{position:absolute;left:0;top:0;width:240px}
.s2-card{transform:translateY(-50%);background:#F8FBF6;color:#15241C;border:1.5px solid #15241C;border-radius:12px;padding:11px 16px 14px;box-shadow:0 1px 0 rgba(21,36,28,.06),0 18px 40px -18px rgba(0,0,0,.65)}
.s2-rm{font-family:var(--mono);font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#4A5E52}
.s2-hd{display:flex;align-items:center;gap:8px;margin-top:5px}
.s2-hd svg{flex:none;width:28px;height:28px;color:#1D6A4D}
.s2-hd b{font-family:var(--display);font-weight:800;font-size:31px;line-height:1;letter-spacing:-.02em;font-variation-settings:"opsz" 96}
.s2-hd span{margin-left:auto;font-family:var(--mono);font-weight:600;font-size:18px;font-variant-numeric:tabular-nums}
.s2-bar{height:10px;margin:9px 0 10px;border-radius:99px;background:#D7E4D5;border:1px solid #BCCFBF;overflow:hidden}
.s2-bar b{display:block;height:100%;background:#1D6A4D;border-radius:99px}
.s2-card p{margin:0;font-size:18px;line-height:1.3}
.s2-ring{position:absolute;left:0;top:0;width:42px;height:42px;border:2.5px solid #F2D449;border-radius:50%;box-shadow:0 0 0 1.5px rgba(5,8,14,.35),inset 0 0 0 1.5px rgba(5,8,14,.35)}
.s2-cap{position:absolute;left:0;right:0;top:34px;text-align:center;font-size:46px}
.s2-u{position:relative}
.s2-u i{position:absolute;left:-.03em;right:-.03em;bottom:-.02em;height:.13em;background:#F2D449;transform-origin:left center}
`);
// the tour: the window, what the room is, a line only for yours (the review found the others unreadable in their time), and which margin its card sits in
const S2_TOUR = [
  { k: 'patients', room: 'The waiting room', line: '', side: 'L' },
  { k: 'team', room: 'The staff room', line: '', side: 'R' },
  { k: 'safety', room: 'The treatment room', line: '', side: 'R' },
  { k: 'cash', room: 'Bev’s office', line: '', side: 'L' },
  { k: 'you', room: 'Your room', line: 'Yes, you’re a meter.', side: 'R' }
];
const S2_ON = [0.3, 1.95, 3.25, 4.55, 5.85];   // when each window's light takes over from the last
const S2_FIVE = 6.85, S2_YOU = 7.85;           // all five light up with the line; then only yours again
const S2_OUT = 9.05;                           // everything goes, so the last 0.45s is s1's last frame again
// a window with its frame and sill label, as a path on the stage for a camera
const s2shape = (W, cam) => {
  const p = (x, y) => TR.camPt(cam, x, y), f = v => v.toFixed(1), base = W.y + W.h;
  const r = (x0, y0, x1, y1) => { const a = p(x0, y0), b = p(x1, y1); return `M${f(a.x)} ${f(a.y)}H${f(b.x)}V${f(b.y)}H${f(a.x)}Z`; };
  return r(W.x - 3.5, W.y - 3.5, W.x + W.w + 3.5, base + 3.5) + r(W.x - 5.5, base + 3, W.x + W.w + 5.5, base + 13.5);
};
const s2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const s2mix = (a, b, p) => { const A = s2rgb(a), B = s2rgb(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * p)).join(',')})`; };

TR.scene({
  id: 's2-windows', title: 'Five windows', dur: 10,
  lines: ['Each lit window is a meter: the waiting room is Patients, the staff room Team, the treatment room Safety, Bev’s office the Bank.', 'The fifth is your own room. Five things to keep alive, including you.'],
  build(root) {
    root._street = TR.el('div', 'tr-fill', null, root);
    root._fac = TR.el('div', 'tr-facade', null, root);
    root._brass = TR.el('div', 's2-brass', null, root);
    // the dark: a veil over the stage, with a hole for each window that can be let through a little or fully
    root._dark = TR.el('div', 's2-dark', `<svg width="1280" height="720" viewBox="0 0 1280 720"><defs><mask id="s2-veil" maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="720"><rect width="1280" height="720" fill="#fff"/>${TR.WINDOWS.map(() => '<path fill="#000" fill-opacity="0"/>').join('')}</mask></defs><rect width="1280" height="720" fill="#05080E" fill-opacity=".62" mask="url(#s2-veil)"/></svg>`, root);
    root._holes = [...root._dark.querySelectorAll('mask path')];
    // the meter cards, drawn like the HUD's meters: icon, name, value and bar, with the room above and one line below
    const w0 = TR.world(), P0 = PRACTICES[TR.PRACTICE];
    root._cards = S2_TOUR.map(T => {
      const val = T.k === 'cash' ? fmtK(w0.cash).replace('.0k', 'k') : String(w0.st[T.k]);
      const bar = T.k === 'cash' ? TR.clamp(50 + 50 * w0.cash / Math.abs(P0.overdraft), 2, 100) : w0.st[T.k];
      const c = TR.el('div', 's2-slot', `<div class="s2-card"><div class="s2-rm">${esc(T.room)}</div><div class="s2-hd">${ICON[T.k]}<b>${esc(STAT_LABEL[T.k])}</b><span>${esc(val)}</span></div><div class="s2-bar"><b></b></div>${T.line ? `<p>${esc(T.line)}</p>` : ''}</div>`, root);
      c._bar = c.querySelector('.s2-bar b'); c._v = bar;
      return c;
    });
    // Gerald's tank, ringed while the card says he stays
    root._ring = TR.el('div', 's2-ring', null, root);
    root._cap = TR.el('div', 's2-cap tr-cap', 'Five things to keep alive, <span class="s2-inc">including <span class="s2-u">you<i></i></span>.</span>', root);
    root._inc = root._cap.querySelector('.s2-inc');
    root._und = root._cap.querySelector('.s2-u i');
  },
  update(lt, root) {
    const E = TR.ease;
    // a slow lean in while the windows are named, and back out to the whole front for the line
    const push = TR.camOn(160, 139, 800, 640, 355.6);
    const cam = TR.camLerp(TR.CAM.FULL, push, TR.kf(lt, [[0.3, 0], [S2_FIVE, 1], [9.5, 0]], E.inOut));
    TR.street(root._street, cam);
    TR.cam(root._fac, cam);
    TR.facade(root._fac, {});
    TR.place(root._brass, { x: cam.x, y: cam.y + 250 * cam.w / 320, w: cam.w });
    TR.brass(root._brass, [{ n: 'Dr ' + TR.NAME }, { n: 'Dr Hartley' }, { n: 'Dr Okoye' }]);

    // how lit each window is against the dark: one at a time, then all five, then yours
    const lit = {};
    S2_TOUR.forEach((T, i) => {
      const on = i ? E.out(TR.seg(lt, S2_ON[i], S2_ON[i] + 0.3)) : 1;
      const off = i < S2_TOUR.length - 1 ? E.in(TR.seg(lt, S2_ON[i + 1], S2_ON[i + 1] + 0.3)) : 0;
      lit[T.k] = on * (1 - off);
    });
    ['cash', 'team', 'patients', 'safety'].forEach((k, j) => {   // the game's order, your room already on
      const a = S2_FIVE + 0.1 * j;
      lit[k] = Math.max(lit[k], E.out(TR.seg(lt, a, a + 0.3)) * (1 - E.in(TR.seg(lt, S2_YOU + 0.05 * j, S2_YOU + 0.05 * j + 0.35))));
    });
    TR.WINDOWS.forEach((W, wi) => {
      const h = root._holes[wi], d = s2shape(W, cam), o = +lit[W.k].toFixed(3);
      if (h._d !== d) { h.setAttribute('d', d); h._d = d; }
      if (h._o !== o) { h.setAttribute('fill-opacity', o); h._o = o; }
    });
    const veil = E.out(TR.seg(lt, 0.3, 0.75)) * (1 - E.in(TR.seg(lt, S2_OUT, S2_OUT + 0.5)));
    TR.pose(root._dark, { o: veil });

    // the lit window's frame turns yellow, the game's hover state, as far as the dark is down
    const fac = root._fac;
    if (fac._trimOf !== fac._svg) { fac._trim = [...fac.querySelectorAll('.fwin')].map(g => g.firstElementChild); fac._trimOf = fac._svg; }
    const trim = (FACADE[PRACTICES[TR.PRACTICE].key] || FACADE.town).trim;
    TR.WINDOWS.forEach((W, wi) => {
      const y = lit[W.k] * veil, r = fac._trim[wi], fill = y > 0.001 ? s2mix(trim, '#F2D449', y) : '';
      if (r._fill !== fill) { r.style.fill = fill; r._fill = fill; }
    });
    // Gerald: a ring round the tank in the waiting room's top corner
    const g = TR.camPt(cam, 120, 156.5), gs = cam.w / 768;
    TR.pose(root._ring, { x: g.x - 21, y: g.y - 21, s: gs * (0.4 + 0.6 * E.back(TR.seg(lt, 1.05, 1.4))), o: TR.window(lt, 1.05, 2.05, 0.2, 0.3) });

    // the cards: in as their window lights, out as the next one takes over
    root._cards.forEach((c, i) => {
      const T = S2_TOUR[i], dir = T.side === 'L' ? -1 : 1, W = TR.WINDOWS.find(w => w.k === T.k);
      const last = i === S2_TOUR.length - 1, a = S2_ON[i] + 0.05, z = last ? S2_OUT - 0.05 : S2_ON[i + 1];
      const pin = E.out(TR.seg(lt, a, a + 0.4)), pout = E.in(TR.seg(lt, z, z + (last ? 0.4 : 0.3)));
      const mid = TR.camPt(cam, 0, W.y + (W.h + 9) / 2).y;   // level with the window and its sill
      TR.pose(c, { x: (T.side === 'L' ? 40 : 1000) + dir * (22 * (1 - pin) + 14 * pout), y: mid, o: pin * (1 - pout) });
      const bw = (c._v * E.out(TR.seg(lt, a + 0.15, a + 0.75))).toFixed(1) + '%';   // the meter fills as the card lands
      if (c._bar._w !== bw) { c._bar.style.width = bw; c._bar._w = bw; }
    });

    // the line in the sky above the roof, in two beats
    TR.pose(root._cap, { y: 12 * (1 - E.out(TR.seg(lt, S2_FIVE, S2_FIVE + 0.5))), o: TR.window(lt, S2_FIVE, 9.95, 0.45, 0.45) });
    const inc = +E.out(TR.seg(lt, S2_YOU, S2_YOU + 0.35)).toFixed(3);
    if (root._inc._o !== inc) { root._inc.style.opacity = inc; root._inc._o = inc; }
    const u = `scaleX(${E.inOut(TR.seg(lt, S2_YOU + 0.2, S2_YOU + 0.65)).toFixed(3)})`;
    if (root._und._tf !== u) { root._und.style.transform = u; root._und._tf = u; }
  }
});
