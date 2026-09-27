/* ---------- Scene 4, The brass plate (40 to 52s): the other partners leave, and one name is left ----------
 Cuts in on the plate, close up, in front of the February night that s3 ends on (dim windows, rain, you slumped).
 Hartley's notice and Nadia's goodbye each strike a name through. Then the deed says what that means, the other
 windows go out around yours, and the scene fades to black over its last 0.6s. */
TR.css(`
.s4-fac path[stroke="#B9C6D6"]{display:none}
.s4-dim,.s4-shade{background:#070A10}
.s4-rain{position:absolute;background-repeat:repeat;will-change:transform}
.s4-plate{position:absolute;left:40px;width:1200px}
.tr-brass.s4-brass{display:grid;grid-template-columns:96px minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr) 96px;align-items:baseline;column-gap:8px;padding:20px 34px 18px;font-size:42px;line-height:1.3;border-top:3px solid #6B5220;border-bottom:3px solid #6B5220;border-radius:6px;box-shadow:inset 0 2px 0 rgba(255,246,208,.4),0 24px 44px -16px rgba(0,0,0,.85)}
.tr-brass.s4-brass::after{content:''}
.tr-brass.s4-brass .bt{font-size:15px;justify-self:start}
.tr-brass.s4-brass .bn{justify-self:center}
.tr-brass.s4-brass .bn .ln{left:-10px;right:-10px;top:50%;height:5px;border-radius:3px;box-shadow:0 1.5px 0 rgba(255,240,200,.35)}
.s4-plate::before,.s4-plate::after{content:'';position:absolute;top:50%;width:13px;height:13px;margin-top:-6.5px;border-radius:50%;background:#8C6A26;box-shadow:inset 0 1.5px 0 rgba(255,246,208,.45)}
.s4-plate::before{left:12px}
.s4-plate::after{right:12px}
.s4-shine{position:absolute;inset:0;overflow:hidden;border-radius:6px;pointer-events:none}
.s4-shine i{position:absolute;top:-10px;bottom:-10px;left:0;width:120px;mix-blend-mode:overlay}
.s4-shine i::before,.s4-shine i::after{content:'';position:absolute;top:0;bottom:0;background:#FFF6D0;transform:skewX(-22deg)}
.s4-shine i::before{left:0;width:74px;opacity:.45}
.s4-shine i::after{left:90px;width:14px;opacity:.7}
.s4-beat{position:absolute;width:440px}
.s4-beat .tr-kick{margin:0 0 10px 2px;text-shadow:0 1px 3px #05080E,0 0 14px rgba(5,8,14,.9)}
.s4-beat .tr-card{width:440px;padding:16px 22px 18px 26px}
.s4-beat .tr-card .who{margin-bottom:10px}
.s4-beat .tr-portrait{width:46px;height:46px}
.s4-beat .tr-card h2{font-size:28px}
.s4-beat .tr-card .text{font-size:18px}
.s4-end{position:absolute;left:64px;width:660px}
.s4-end-k{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.s4-end-k .tr-portrait{width:38px;height:38px;border-radius:9px}
.s4-end-k .tr-kick{text-shadow:0 1px 3px #05080E,0 0 14px rgba(5,8,14,.9)}
.s4-end-c{font-size:66px}
.s4-end-s{margin-top:14px;max-width:600px}
`);

// the February night s3 ends on: Patients 33, Team 39, You 23, Safety 34, bank −£78k, 0.84 of the appointments needed
const S4_WORLD = { st: { patients: 33, team: 39, you: 23, safety: 34 }, cash: -78, month: 10, ratio: 0.84 };
const S4_PLATE_Y = 452, S4_END_Y = 366;
const S4_YOURS = TR.WINDOWS.find(w => w.k === 'you');
// a tile of rain streaks, slanted like the game's (2 across for 6 down), repeated across the stage
const s4RainTile = (seed, w, h, n, len, sw, op) => {
  const r = TR.rnd(seed);
  let p = '';
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, l = len * (0.7 + r() * 0.6), o = op * (0.6 + r() * 0.4);
    // drawn three times across and down so a streak that crosses the edge carries on in the next tile
    for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) p += `<path d="M${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}l${(-l / 3).toFixed(1)} ${l.toFixed(1)}" opacity="${o.toFixed(2)}"/>`;
  }
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><g stroke="#B9C6D6" stroke-width="${sw}" stroke-linecap="round">${p}</g></svg>`)}")`;
};

TR.scene({
  id: 's4-partners', title: 'The brass plate', dur: 12, fadeOut: 0.6,
  lines: ['September: Dr Hartley retires on six months’ notice. January: Dr Okoye leaves for Perth. Their names are struck through on the brass plate.', 'The partnership deed: every lease, loan and redundancy is now yours alone. Last partner standing.'],
  build(root) {
    root._street = TR.el('div', 'tr-fill', null, root);
    root._fac = TR.el('div', 'tr-facade s4-fac', null, root);
    // rain in two layers, far and near; each layer is a tile larger than its step, moved by a transform
    root._rain = [
      { w: 150, h: 240, vx: -110, vy: 330, img: s4RainTile(41, 150, 240, 7, 22, 1.1, 0.5) },
      { w: 230, h: 360, vx: -190, vy: 570, img: s4RainTile(42, 230, 360, 5, 40, 1.6, 0.55) }
    ].map(L => {
      const el = TR.el('div', 's4-rain', null, root);
      TR.place(el, { x: -L.w, y: -L.h, w: 1280 + 2 * L.w, h: 720 + 2 * L.h });
      el.style.backgroundImage = L.img;
      return Object.assign(L, { el });
    });
    // the front is dimmed behind the plate; at the end everything but your window darkens further
    root._dim = TR.el('div', 'tr-fill s4-dim', null, root);
    root._shade = TR.el('div', 'tr-fill s4-shade', null, root);
    // the plate: TR.brass on a mount with two screws, and a shine that crosses it at the end
    root._plate = TR.el('div', 's4-plate', null, root);
    root._plate.style.top = S4_PLATE_Y + 'px';
    root._brass = TR.el('div', 's4-brass', null, root._plate);
    root._shine = TR.el('i', null, null, TR.el('div', 's4-shine', null, root._plate));
    // the two leavers: a kicker for the month and a compact card, over their own name on the plate
    const beat = (kick, card, cx) => {
      const el = TR.el('div', 's4-beat', `<div class="tr-kick">${kick}</div>${TR.cardHTML(card)}`, root);
      el.style.left = (cx - 220) + 'px'; el.style.bottom = (720 - S4_PLATE_Y + 36) + 'px';
      return el;
    };
    root._hart = beat('September', { who: 'hartley', title: 'Six months’ notice', text: '“I’m retiring at the end of September.”', tag: 'real' }, 640);
    root._okoye = beat('January', { who: 'okoye', title: 'G’day from the future', text: '“Sorry, not sorry. Come and visit.”', tag: 'story' }, 957);
    // the deed: what being the last partner means, over the dark office and staff room
    root._end = TR.el('div', 's4-end', null, root);
    root._end.style.bottom = (720 - S4_END_Y) + 'px';
    root._endK = TR.el('div', 's4-end-k', `${TR.portrait('deed', 38)}<span class="tr-kick">The partnership deed · Clause 31</span>`, root._end);
    root._endC = TR.el('div', 's4-end-c tr-cap', 'Last partner standing.', root._end);
    root._endS = TR.el('div', 's4-end-s tr-sub', 'Every lease, loan and redundancy is now yours alone, with unlimited liability.', root._end);
  },
  update(lt, root) {
    const E = TR.ease;
    // a slow push in on the front, towards your window
    const cam = TR.camLerp(TR.camOn(253, 88, 1340, 985, 262), TR.camOn(253, 88, 1440, 1010, 246), E.inOut(TR.seg(lt, 0, 12)));
    TR.street(root._street, cam);
    TR.cam(root._fac, cam);
    // after the second strike the lights go out around yours, with a flicker: staff room, office, waiting room, treatment
    const off = t0 => 0.9 * TR.kf(TR.seg(lt, t0, t0 + 0.5), [[0, 0], [0.3, 0.75], [0.5, 0.3], [1, 1]], E.lin);
    TR.facade(root._fac, Object.assign({ lo: [off(6.55), off(6.35), 0, off(6.8), off(7.0)] }, S4_WORLD));
    root._rain.forEach(L => TR.pose(L.el, { x: -((-L.vx * lt) % L.w), y: (L.vy * lt) % L.h }));
    // the dark closes in around your window: a shade with a hole the shape of its frame and sill
    const dark = E.inOut(TR.seg(lt, 6.5, 7.7));
    TR.pose(root._dim, { o: 0.42 - 0.12 * dark });
    const box = (x0, y0, x1, y1) => { const a = TR.camPt(cam, x0, y0), b = TR.camPt(cam, x1, y1); return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}H${b.x.toFixed(1)}V${b.y.toFixed(1)}H${a.x.toFixed(1)}Z`; };
    const W = S4_YOURS, cp = `path(evenodd, "M0 0H1280V720H0Z${box(W.x - 3, W.y - 3, W.x + W.w + 3, W.y + W.h + 3)}${box(W.x - 5, W.y + W.h + 3, W.x + W.w + 5, W.y + W.h + 13)}")`;
    if (root._shade._cp !== cp) { root._shade.style.clipPath = cp; root._shade._cp = cp; }
    TR.pose(root._shade, { o: 0.6 * dark });
    // the plate: two strikes, and the names that went fade a little further at the end
    const hs = E.inOut(TR.seg(lt, 2.8, 3.35)), os = E.inOut(TR.seg(lt, 5.85, 6.4)), fade = 1 - 0.25 * E.inOut(TR.seg(lt, 8.4, 9.4));
    TR.brass(root._brass, [{ n: 'Dr ' + TR.NAME }, { n: 'Dr Hartley', strike: hs, o: fade }, { n: 'Dr Okoye', strike: os, o: fade }]);
    // a glint runs along the plate once there is one name on it, after the deed has been read
    const g = TR.seg(lt, 9.9, 11.0);
    TR.pose(root._shine, { x: TR.lerp(-130, 1240, g), o: g > 0 && g < 1 ? 1 : 0 });
    // the cards: in from below, out upwards
    const card = (el, a, b) => {
      const i = E.out(TR.seg(lt, a, a + 0.45)), o = E.in(TR.seg(lt, b - 0.4, b));
      TR.pose(el, { y: 18 * (1 - i) - 14 * o, o: TR.window(lt, a, b, 0.45, 0.4) });
    };
    card(root._hart, 0.55, 3.95);
    card(root._okoye, 3.8, 6.95);
    // the deed lands: kicker, the line, then what it means
    const rise = (el, a) => TR.pose(el, { y: 14 * (1 - E.out(TR.seg(lt, a, a + 0.5))), o: E.out(TR.seg(lt, a, a + 0.45)) });
    rise(root._endK, 6.95);
    rise(root._endC, 7.1);
    rise(root._endS, 7.55);
  }
});
