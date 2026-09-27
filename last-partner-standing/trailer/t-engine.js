/* ===================== TRAILER ENGINE: a deterministic timeline over the game's own drawings =====================
 Assembled after src/c-data.js and src/c3-art.js (see trailer/assemble.sh), so the film uses the game's real
 silhouettes, surgery front, cast colours and sources.
 Every frame is a pure function of the time t, so the page plays live (requestAnimationFrame) and
 tools/trailer-render.mjs can capture any frame exactly. Inside the stage: no wall-clock time, no Math.random,
 no CSS animations or transitions. Everything moves because update() set it from the time.

 A scene:  TR.scene({ id, title, lines: [...], dur, build(root), update(lt, root) })
   build(root)      makes the scene's DOM once. root is a 1280x720 absolutely positioned div.
   update(lt, root) sets everything from lt, the seconds since the scene started (0 to dur). It is called for
                    every frame while the scene is on screen, in any order (the viewer can scrub backwards).
   title, lines     feed the chapter list under the player: a name and what is seen and said.
   fadeIn, fadeOut  optional seconds; the engine fades the whole scene from and to black.
 Scenes play one after another in file order (scenes/s1-*.js, s2-*.js, ...).
*/

// ---------- what the game's drawing code expects to find ----------
let S = null;                                    // the game's state; TR.world() fakes it for each drawing
let UI = { screen: 'trailer', look: { s: 0, c: 1 } };
const _rand = () => 0.5;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtK = v => (v < 0 ? '−£' : '£') + Math.abs(v).toFixed(1) + 'k';
const prac = () => PRACTICES[S.practiceKey];
const isActive = id => !!S.partners[id] && S.partners[id].status === 'active';
const RATE_NAME = { o: 'Outstanding', g: 'Good', ri: 'Requires improvement', i: 'Inadequate' };

const TR = {
  W: 1280, H: 720, FPS: 30,
  scenes: [], total: 0, t: 0,
  // the trailer's player: Dr Ashworth, Riverside Surgery in the market town
  NAME: 'Ashworth', LOOK: { s: 0, c: 1 }, PRACTICE: 'town',
  // the frame the page shows before it plays: the deed line over the lit front, three names on the plate
  POSTER: 6.9,
  _css: ''
};

// ---------- time helpers ----------
TR.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
TR.lerp = (a, b, p) => a + (b - a) * p;
// progress of x through [a, b], clamped to 0..1
TR.seg = (x, a, b) => b <= a ? (x >= b ? 1 : 0) : TR.clamp((x - a) / (b - a), 0, 1);
TR.ease = {
  lin: p => p,
  in: p => p * p * p,
  out: p => 1 - Math.pow(1 - p, 3),
  inOut: p => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  back: p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  step: p => p < 1 ? 0 : 1
};
// keyframes: TR.kf(lt, [[0, 48], [2, 40], [5, 31]]) holds the ends and eases between points.
// Values may be numbers or flat objects of numbers ({patients: 48, team: 52}), interpolated key by key.
TR.kf = (x, pts, ease) => {
  ease = ease || TR.ease.inOut;
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x < pts[i][0]) {
      const [a, va] = pts[i - 1], [b, vb] = pts[i], p = ease((x - a) / (b - a));
      if (typeof va === 'number') return va + (vb - va) * p;
      const o = {}; for (const k in va) o[k] = typeof va[k] === 'number' && typeof vb[k] === 'number' ? va[k] + (vb[k] - va[k]) * p : (p < 1 ? va[k] : vb[k]);
      return o;
    }
  }
  return pts[pts.length - 1][1];
};
// in, hold, out: 0 before a, rises to 1 by a+fi, holds, falls to 0 by b. For captions and callouts.
TR.window = (x, a, b, fi, fo) => {
  fi = fi == null ? 0.35 : fi; fo = fo == null ? fi : fo;
  if (x < a || x > b) return 0;
  return Math.min(fi ? TR.ease.out(TR.seg(x, a, a + fi)) : 1, fo ? 1 - TR.ease.in(TR.seg(x, b - fo, b)) : 1);
};
// typewriter: the first part of text, p from 0 to 1
TR.type = (text, p) => text.slice(0, Math.round(text.length * TR.clamp(p, 0, 1)));
// deterministic "random" numbers from a seed (mulberry32), for rain, jitter and crowds
TR.rnd = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
TR.mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ---------- DOM helpers ----------
TR.el = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
// place an element on the stage: TR.place(el, {x, y, w, h}) in stage pixels
TR.place = (el, r) => { el.style.position = 'absolute'; if (r.x != null) el.style.left = r.x + 'px'; if (r.y != null) el.style.top = r.y + 'px'; if (r.w != null) el.style.width = r.w + 'px'; if (r.h != null) el.style.height = r.h + 'px'; return el; };
// set transform and opacity in one go (only writes when they change)
TR.pose = (el, o) => {
  const tf = `translate(${(o.x || 0).toFixed(2)}px, ${(o.y || 0).toFixed(2)}px) scale(${(o.s == null ? 1 : o.s).toFixed(4)}) rotate(${(o.r || 0).toFixed(2)}deg)`;
  if (el._tf !== tf) { el.style.transform = tf; el._tf = tf; }
  const op = o.o == null ? 1 : +o.o.toFixed(3);
  if (el._op !== op) { el.style.opacity = op; el._op = op; el.style.visibility = op <= 0.001 ? 'hidden' : ''; }
};
TR.text = (el, s) => { if (el._txt !== s) { el.textContent = s; el._txt = s; } };
TR.html = (el, s) => { if (el._html !== s) { el.innerHTML = s; el._html = s; } };
// scene CSS: call at the top level of a scene file; prefix class names with the scene id (.s3-...)
TR.css = s => { TR._css += s + '\n'; };

// ---------- the world: the game's state for one drawing ----------
// o: { st: {patients, team, you, safety}, cash, month (0 = April), ratio (appointments against demand, 1 = enough),
//      partners: {hartley: 'active'|'left', okoye: ...}, closed, geraldGone, cat, name, look, practice }
TR.world = o => {
  o = o || {};
  const P0 = PRACTICES[o.practice || TR.PRACTICE];
  const ps = Object.assign({ hartley: 'active', okoye: 'active' }, o.partners || {});
  return {
    practiceKey: P0.key, name: o.name || TR.NAME, look: o.look || TR.LOOK,
    st: Object.assign({}, P0.st, o.st || {}), cash: o.cash == null ? P0.cash : o.cash, overdraft: P0.overdraft,
    month: Math.round(o.month || 0), rooms: P0.rooms, lineage: o.lineage || [], cqc: o.cqc || null,
    partners: { hartley: { status: ps.hartley }, okoye: { status: ps.okoye }, tom: { status: 'salaried' }, priya: { status: 'none' } },
    flags: { geraldGone: !!o.geraldGone }, seen: { cat: !!o.cat }
  };
};
// the surgery front, redrawn from the world. el is a .tr-facade div (320 x 250 viewBox; give it a width).
// o as TR.world, plus lo: [5 numbers] to black out windows (1 = dark) in this order: office, staff room, your room, waiting room, treatment.
let _facadeN = 0;
TR.facade = (el, o) => {
  if (!el._uid) el._uid = 'f' + (++_facadeN);
  S = TR.world(o);
  UI.look = S.look;
  let svg = facadeSVG({ ratio: o.ratio == null ? 1 : o.ratio }, { closed: !!o.closed, intro: !!o.lo });
  // each copy gets its own gradient ids, so a hidden copy elsewhere can't capture the references
  svg = svg.replace(/(id="|url\(#)(fsky|fw-\w+)/g, `$1$2-${el._uid}`).replace(/ data-act="win"[^>]*?tabindex="0"/g, '');
  if (el._svg !== svg) { el.innerHTML = svg; el._svg = svg; el._lo = [...el.querySelectorAll('.lo')]; }
  if (o.lo) el._lo.forEach((r, i) => { const v = +TR.clamp(o.lo[i] == null ? 0 : o.lo[i], 0, 1).toFixed(3); if (r._v !== v) { r.style.opacity = v; r._v = v; } });
};
// where each window sits, in facade units (320 x 250), from the game's own layout
TR.WINDOWS = WIN_LAYOUT.map(W => ({ k: W.k, x: W.x, y: W.y, w: W.w, h: W.h, label: W.label }));

// ---------- the camera: where the surgery front sits on the stage ----------
// cam = {x, y, w}: stage pixels of the facade's top left corner, and its width (the height is w * 250 / 320).
// Presets that every scene shares, so cuts between scenes line up:
TR.CAM = {
  FULL: { x: 256, y: 22, w: 768 },   // the whole front, centred, with the brass plate under it (y 622 to about 676)
  LEFT: { x: 36, y: 128, w: 620 }    // the front on the left, below the HUD strip, leaving the right half for cards
};
TR.camLerp = (a, b, p) => ({ x: TR.lerp(a.x, b.x, p), y: TR.lerp(a.y, b.y, p), w: TR.lerp(a.w, b.w, p) });
// stage pixels of a point given in facade units
TR.camPt = (cam, fx, fy) => ({ x: cam.x + fx * cam.w / 320, y: cam.y + fy * cam.w / 320 });
// a zoom that puts facade point (fx, fy) at stage point (sx, sy) at facade width w
TR.camOn = (fx, fy, w, sx, sy) => ({ x: sx - fx * w / 320, y: sy - fy * w / 320, w });
// position the facade element for a camera (layout, not transforms, so the SVG stays sharp at every size)
TR.cam = (el, cam) => {
  const k = `${cam.x.toFixed(2)}|${cam.y.toFixed(2)}|${cam.w.toFixed(2)}`;
  if (el._cam === k) return; el._cam = k;
  el.style.left = cam.x.toFixed(2) + 'px'; el.style.top = cam.y.toFixed(2) + 'px'; el.style.width = cam.w.toFixed(2) + 'px';
};
// the street around the facade, painted to line up with it: the same night sky gradient, the pavement, the road,
// and stars outside the building. el is a full-stage .tr-fill div behind the facade.
TR.street = (el, cam) => {
  const k = cam.w / 320, y0 = cam.y, y1 = cam.y + 250 * k, pv = cam.y + 234 * k;
  const bg = [
    // the facade strokes its kerb line centred on y 234, so it starts 0.6 units higher
    `linear-gradient(#B9B3A3,#B9B3A3) 0 ${(pv - 0.6 * k).toFixed(1)}px/100% ${Math.max(1, 1.2 * k).toFixed(1)}px no-repeat`,
    `linear-gradient(#8C877B,#8C877B) 0 ${pv.toFixed(1)}px/100% ${(16 * k).toFixed(1)}px no-repeat`,
    `linear-gradient(#262A31,#16191E) 0 ${y1.toFixed(1)}px/100% ${Math.max(0, 720 - y1 + 2).toFixed(1)}px no-repeat`,
    `linear-gradient(to bottom,#1B2433 ${y0.toFixed(1)}px,#3E4658 ${y1.toFixed(1)}px)`
  ].join(',');
  if (el._bg !== bg) { el.style.background = bg; el._bg = bg; }
  if (!el._stars) {
    const r = TR.rnd(7);
    el._stars = TR.el('div', null, Array.from({ length: 70 }, () => `<i style="position:absolute;left:${(r() * 1280).toFixed(0)}px;top:${(r() * 1).toFixed(3) * 100}%;width:2px;height:2px;border-radius:50%;background:#E9E2C8;opacity:${(0.35 + r() * 0.45).toFixed(2)}"></i>`).join(''), el);
    el._stars.style.cssText = 'position:absolute;left:0;right:0;top:0';
  }
  // stars live in the sky: above the pavement, and the building covers the ones behind it
  const h = Math.max(0, pv - 20).toFixed(0) + 'px';
  if (el._stars._h !== h) { el._stars.style.height = h; el._stars._h = h; }
};

// ---------- components drawn like the game's ----------
TR.portrait = (who, size) => {
  const ring = who === 'you' ? PLAYER_COLOURS[TR.LOOK.c] : (CAST[who] || CAST.you).c;
  S = S || TR.world(); UI.look = TR.LOOK;
  return `<div class="tr-portrait" style="--ring:${ring};width:${size || 52}px;height:${size || 52}px">${portraitSVG(who, size || 52)}</div>`;
};
// a card: {who, title, text, tag: 'real'|'rule'|'story', stamp: 'OCT · 1/3', name, role}
TR.cardHTML = c => {
  const cast = CAST[c.who] || CAST.you;
  S = S || TR.world();
  const name = c.name || (c.who === 'you' ? 'Dr ' + TR.NAME : c.who === 'paper' ? PRACTICES[TR.PRACTICE].paper : cast.name);
  const role = c.role || (c.who === 'you' ? 'You' : cast.role);
  const tag = c.tag || 'story', tagName = { real: 'Real figures', rule: 'Real rule', story: 'Fiction' }[tag] || 'Fiction';
  return `<div class="tr-card"><div class="who">${TR.portrait(c.who)}<div><b>${esc(name)}</b><small>${esc(role)}</small></div>${c.stamp ? `<span class="stampno">${esc(c.stamp)}</span>` : ''}</div>
    <div class="ttl"><h2>${esc(c.title)}</h2><span class="tagpill t-${tag}">${tagName}</span></div><div class="text">${esc(c.text)}</div></div>`;
};
// the HUD strip: build once with TR.hud(el), then TR.hudSet(el, {st, cash, month}) every frame
TR.hud = el => {
  el.classList.add('tr-hud');
  const P0 = PRACTICES[TR.PRACTICE];
  el.innerHTML = `<div class="row"><span class="nm">Dr ${esc(TR.NAME)}</span><span class="sub">${esc(P0.surgery)} · ${esc(P0.place)}</span><span class="mlab"></span><span class="pills">${'<i></i>'.repeat(12)}</span></div>
    <div class="meters">${['patients', 'team', 'you', 'safety', 'cash'].map(k => `<div class="meter" data-k="${k}">${ICON[k]}<div class="lab"><span>${STAT_LABEL[k]}</span><span class="val"></span></div><div class="bar"><b></b></div></div>`).join('')}</div>`;
  el._m = {}; el.querySelectorAll('.meter').forEach(m => { el._m[m.dataset.k] = { m, v: m.querySelector('.val'), b: m.querySelector('.bar b') }; });
  el._pills = [...el.querySelectorAll('.pills i')]; el._mlab = el.querySelector('.mlab');
};
TR.hudSet = (el, o) => {
  const P0 = PRACTICES[TR.PRACTICE], st = Object.assign({}, P0.st, o.st || {}), cash = o.cash == null ? P0.cash : o.cash, month = Math.round(o.month || 0);
  ['patients', 'team', 'you', 'safety'].forEach(k => {
    const v = Math.round(st[k]), M = el._m[k];
    TR.text(M.v, String(v)); const w = v + '%'; if (M.b._w !== w) { M.b.style.width = w; M.b._w = w; }
    const cls = 'meter' + (v <= 20 ? ' crit' : v <= 35 ? ' low' : ''); if (M.m._c !== cls) { M.m.className = cls; M.m._c = cls; }
  });
  const M = el._m.cash; TR.text(M.v, fmtK(Math.round(cash)).replace('.0k', 'k'));
  const w = TR.clamp(50 + 50 * cash / Math.abs(P0.overdraft), 2, 100).toFixed(1) + '%'; if (M.b._w !== w) { M.b.style.width = w; M.b._w = w; }
  const cls = 'meter' + (cash < P0.overdraft / 2 ? ' crit' : cash < 0 ? ' low' : ''); if (M.m._c !== cls) { M.m.className = cls; M.m._c = cls; }
  TR.text(el._mlab, `${MONTHS[month]} ${CAL_YEAR[month]}`);
  el._pills.forEach((p, i) => { const c = i < month ? 'done' : i === month ? 'now' : ''; if (p._c !== c) { p.className = c; p._c = c; } });
};
// the brass plate: TR.brass(el, [{n: 'Dr Ashworth', engrave: 0..1, strike: 0..1}], opts) every frame.
// engrave reveals a name left to right with a glint; strike draws the line through it.
TR.brass = (el, names, opts) => {
  opts = opts || {};
  const key = names.map(x => x.n).join('|') + '|' + (opts.label || 'Partners');
  if (el._key !== key) {
    el.classList.add('tr-brass');
    el.innerHTML = `<span class="bt">${esc(opts.label || 'Partners')}</span>` + names.map((x, i) => `${i ? '<i>·</i>' : ''}<span class="bn">${esc(x.n)}<span class="ln"></span></span>`).join('');
    el._key = key; el._bn = [...el.querySelectorAll('.bn')];
  }
  names.forEach((x, i) => {
    const b = el._bn[i], e = x.engrave == null ? 1 : TR.clamp(x.engrave, 0, 1), s = TR.clamp(x.strike || 0, 0, 1);
    const clip = e >= 1 ? 'none' : `inset(-20% ${(100 - 100 * e).toFixed(1)}% -20% 0)`;
    if (b._clip !== clip) { b.style.clipPath = clip; b._clip = clip; }
    const glow = e > 0 && e < 1 ? '0 0 8px #FFF6D0' : 'none'; if (b._glow !== glow) { b.style.textShadow = glow; b._glow = glow; }
    const op = (x.o == null ? 1 : x.o) * (1 - 0.45 * s); if (b._op !== op) { b.style.opacity = op; b._op = op; }
    const ln = b.firstElementChild, tf = `scaleX(${s.toFixed(3)})`; if (ln._tf !== tf) { ln.style.transform = tf; ln._tf = tf; }
  });
};

// ---------- scenes and the clock ----------
TR.scene = def => { TR.scenes.push(def); };
TR.init = stage => {
  TR.stage = stage;
  if (TR._css) { const st = document.createElement('style'); st.textContent = TR._css; document.head.appendChild(st); }
  let at = 0;
  TR.scenes.forEach(sc => {
    sc.start = at; at += sc.dur;
    sc.root = TR.el('div', 'scene', null, stage); sc.root.dataset.scene = sc.id; sc.root.hidden = true;
    sc.build(sc.root);
  });
  TR.total = at;
};
TR.seek = t => {
  t = TR.clamp(t, 0, TR.total); TR.t = t;
  const last = TR.scenes[TR.scenes.length - 1];
  TR.scenes.forEach(sc => {
    const on = t >= sc.start && (t < sc.start + sc.dur || (sc === last && t <= TR.total));
    if (sc.root.hidden === on) sc.root.hidden = !on;
    if (!on) return;
    const lt = t - sc.start;
    sc.update(lt, sc.root);
    const f = Math.min(sc.fadeIn ? TR.seg(lt, 0, sc.fadeIn) : 1, sc.fadeOut ? 1 - TR.seg(lt, sc.dur - sc.fadeOut, sc.dur) : 1);
    if (sc._f !== f) { sc.root.style.opacity = f; sc._f = f; }
  });
  if (TR.onseek) TR.onseek(t);
};
TR.sceneAt = t => TR.scenes.find((sc, i) => t < sc.start + sc.dur || i === TR.scenes.length - 1);
