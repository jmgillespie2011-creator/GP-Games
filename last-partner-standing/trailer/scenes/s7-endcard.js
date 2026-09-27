/* ---------- Scene 7, End card (68 to 75s): the logo, the line, the address ----------
 Cuts in on the front at night, as dim as s6 leaves the street. The lights come back up and the picture closes into
 a frame like the game's .front, lying on the title screen's paper green, with one name on its brass plate. The logo
 sets itself as renderTitle() does: the lines rise, the yellow line draws under Standing and the Rx stamp lands.
 Then the line, the address and the small print. Everything is still from 3.95s, so the last frame works as a poster. */
TR.css(`
.s7-paper{background:#E3EDE1 repeating-linear-gradient(135deg,rgba(29,106,77,.055) 0 2px,transparent 2px 9px)}
.s7-ink{position:absolute;left:72px;color:#15241C;white-space:nowrap}
.s7-eye{font-family:var(--mono);font-size:17px;letter-spacing:.12em;text-transform:uppercase;color:#4A5E52}
.s7-logo{font-family:var(--display);font-weight:800;font-size:116px;letter-spacing:-.035em;line-height:.88;font-variation-settings:"opsz" 96;margin-left:-4px}
.s7-rx{display:inline-block;font-family:var(--mono);font-weight:600;font-size:.3em;letter-spacing:0;vertical-align:.95em;color:#BF3A2C;border:3px solid #BF3A2C;border-radius:8px;padding:.05em .3em;margin-left:.15em;transform:rotate(-8deg)}
.s7-under{display:inline-block;padding:0 .04em .1em;background:linear-gradient(#F2D449,#F2D449) left bottom/100% .13em no-repeat;border-radius:2px}
.s7-tag{font-size:26px;line-height:1.35;color:#4A5E52}
.s7-row{display:flex;align-items:center;gap:28px}
.s7-url{background:#1D6A4D;color:#F4FAF6;border:2px solid #15241C;border-radius:999px;padding:10px 30px 12px;font-family:var(--mono);font-weight:600;font-size:34px;line-height:1.15;box-shadow:0 4px 0 #15241C}
.s7-free{font-size:26px;font-weight:700}
.s7-fine{font-size:16px;color:#4A5E52}
.s7-front{position:absolute;overflow:hidden;background:#1B2433;border:1.5px solid #15241C;box-shadow:0 1px 0 rgba(21,36,28,.06),0 10px 28px -14px rgba(21,36,28,.35)}
.s7-brass{position:absolute;left:0;top:0;width:768px;height:56px;transform-origin:0 0}
.s7-scrim{background:#070A10}
`);
TR.scene({
  id: 's7-endcard', title: 'End card', dur: 7,
  lines: ['The lights come back up at Riverside Surgery, and the front shrinks into a framed picture beside the game’s logo.', 'Last Partner Standing: a year on England’s 2026/27 GP contract, then as many more as you can survive. Free, in your browser, at last-partner-standing.vercel.app.'],
  build(root) {
    TR.el('div', 'tr-fill s7-paper', null, root);
    root._eye = TR.el('div', 's7-ink s7-eye', 'A general practice survival game', root);
    const logo = TR.el('div', 's7-ink s7-logo', null, root);
    root._lines = ['Last', 'Partner<span class="s7-rx">Rx</span>', '<span class="s7-under">Standing</span>'].map(h => TR.el('div', null, h, logo));
    root._rx = logo.querySelector('.s7-rx');
    root._under = logo.querySelector('.s7-under');
    root._tag = TR.el('div', 's7-ink s7-tag', 'A year on England’s 2026/27 GP contract,<br>then as many more as you can survive.', root);
    const row = TR.el('div', 's7-ink s7-row', null, root);
    root._url = TR.el('div', 's7-url', 'last-partner-standing.vercel.app', row);
    root._free = TR.el('div', 's7-free', 'Free, in your browser.', row);
    root._fine = TR.el('div', 's7-ink s7-fine', 'Fictional practices and people. Real rules. Not affiliated with the NHS, the BMA or any government body.', root);
    TR.place(root._eye, { y: 60 });
    TR.place(logo, { y: 94 });
    TR.place(root._tag, { y: 432 });
    TR.place(row, { y: 540 });
    TR.place(root._fine, { y: 648 });
    // the picture: the night street, the front (default state, every window lit) and a brass plate with one name
    root._front = TR.el('div', 's7-front', null, root);
    root._street = TR.el('div', 'tr-fill', null, root._front);
    root._fac = TR.el('div', 'tr-facade', null, root._front);
    root._brass = TR.el('div', 's7-brass', null, root._front);
    root._scrim = TR.el('div', 'tr-fill s7-scrim', null, root._front);
    TR.facade(root._fac, {});
    TR.brass(root._brass, [{ n: 'Dr ' + TR.NAME }]);
  },
  update(lt, root) {
    const E = TR.ease;
    // the whole stage is the picture at first (the front at TR.CAM.FULL); it closes into its frame on the right
    const p = E.inOut(TR.seg(lt, 0.15, 1.65));
    const W = 512, iw = W - 3, R0 = { x: -1.5, y: -1.5, w: 1283, h: 723 }, h1 = 3 + iw * 250 / 320 + 56 * iw / 768;
    const R1 = { x: 1208 - W, y: 281 - h1 / 2, w: W, h: h1 };   // centred on the eyebrow-to-tagline block
    const R = { x: TR.lerp(R0.x, R1.x, p), y: TR.lerp(R0.y, R1.y, p), w: TR.lerp(R0.w, R1.w, p), h: TR.lerp(R0.h, R1.h, p) };
    const f = root._front, k = [R.x, R.y, R.w, R.h].map(v => v.toFixed(2)).join('|') + '|' + (14 * p).toFixed(2);
    if (f._k !== k) { f._k = k; TR.place(f, R); f.style.borderRadius = (14 * p).toFixed(2) + 'px'; }
    // inside the frame: from TR.CAM.FULL to the front filling the frame, the brass plate hanging under it
    const cam = TR.camLerp(TR.CAM.FULL, { x: 0, y: 0, w: iw }, p);
    TR.street(root._street, cam);
    TR.cam(root._fac, cam);
    TR.pose(root._brass, { x: cam.x, y: cam.y + 250 * cam.w / 320, s: cam.w / 768 });
    // it opens as dim as s6 leaves the street, and the lights come back up
    // s6 fades to black, so this opens from black and the street comes up
    TR.pose(root._scrim, { o: 1 - E.inOut(TR.seg(lt, 0, 0.8)) });
    // the type rises in on the paper once the picture has moved off it
    const rise = (el, a, dy) => { const q = E.out(TR.seg(lt, a, a + 0.5)); TR.pose(el, { y: dy * (1 - q), o: q }); };
    rise(root._eye, 1.0, 10);
    root._lines.forEach((el, i) => rise(el, 1.1 + i * 0.12, 30));
    // the yellow line draws under Standing, and the Rx stamp lands
    const u = (100 * E.out(TR.seg(lt, 1.8, 2.35))).toFixed(2) + '% .13em';
    if (root._under._bs !== u) { root._under.style.backgroundSize = u; root._under._bs = u; }
    const st = TR.seg(lt, 2.15, 2.55), sb = E.back(st);
    TR.pose(root._rx, { s: TR.lerp(2.2, 1, sb), r: TR.lerp(-24, -8, sb), o: E.out(TR.seg(st, 0, 0.35)) });
    rise(root._tag, 2.45, 16);
    rise(root._url, 2.95, 18);
    rise(root._free, 3.15, 12);
    rise(root._fine, 3.45, 8);
  }
});
