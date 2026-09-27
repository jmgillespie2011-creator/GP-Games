/* ---------- Scene 1, Day one (0 to 8s): 7:59am, the windows light up, your name goes on the brass plate ----------
 Mirrors the game's own opening (the .lo blackouts, the dusk, the engraved name), slowed down for the film.
 Ends on TR.CAM.FULL with every window lit, the starting meters and three names on the plate, captions gone. */
TR.css(`
.s1-clock{position:absolute;left:0;top:0;white-space:pre;text-align:center;line-height:1.5;padding:8px 14px;border-radius:8px}
.s1-clock .s1-gp{color:#F4EEDD}
.s1-cap{position:absolute;left:0;right:0;top:34px;text-align:center;font-size:46px}
.s1-shade{background:#05070B}
.s1-brass{position:absolute}
`);
TR.scene({
  id: 's1-deed', title: 'Day one', dur: 8,
  lines: ['Wednesday 1 April 2026, 7:59am: your first day as a GP partner. The lights come on at Riverside Surgery, one window at a time.', 'Your name goes on the brass plate: you have just signed the partnership deed.'],
  build(root) {
    root._street = TR.el('div', 'tr-fill', null, root);
    root._fac = TR.el('div', 'tr-facade', null, root);
    root._brass = TR.el('div', 's1-brass', null, root);
    root._shade = TR.el('div', 'tr-fill s1-shade', null, root);
    root._clock = TR.el('div', 's1-clock tr-kick', '<span></span>\n<span></span>\n<span class="s1-gp"></span>', root);
    root._lines = [...root._clock.children];
    root._cap = TR.el('div', 's1-cap tr-cap', 'You’ve just signed the partnership deed.', root);
  },
  update(lt, root) {
    const E = TR.ease;
    // a slow pull back from the front door to the whole building, done before the name and the line land
    const start = TR.camOn(160, 128, 1000, 640, 372);
    const cam = TR.camLerp(start, TR.CAM.FULL, E.inOut(TR.seg(lt, 2.6, 5.4)));
    TR.street(root._street, cam);
    TR.cam(root._fac, cam);
    // the windows come on in the game's order (office, staff room, your room, waiting room, treatment), with its flicker
    const lo = [0, 1, 2, 3, 4].map(i => TR.kf(TR.seg(lt, 3.0 + i * 0.36, 3.55 + i * 0.36), [[0, 1], [0.35, 0.25], [0.55, 0.7], [1, 0]], E.lin));
    TR.facade(root._fac, { lo });
    // the brass plate hangs under the front and follows the camera; your name is engraved as the line lands
    const k = cam.w / 320;
    TR.place(root._brass, { x: cam.x, y: cam.y + 250 * k, w: cam.w });
    TR.brass(root._brass, [{ n: 'Dr ' + TR.NAME, engrave: E.inOut(TR.seg(lt, 5.3, 6.2)) }, { n: 'Dr Hartley' }, { n: 'Dr Okoye' }]);
    // dusk: from black, then dim, then the street as the game draws it
    TR.pose(root._shade, { o: TR.kf(lt, [[2.6, 1], [3.2, 0.5], [4.6, 0]], E.out) });
    // the clock: typed on black in the middle, held, then it moves to the corner like the game's caption, and goes
    const L = ['WEDNESDAY 1 APRIL 2026', '7:59AM', 'YOUR FIRST DAY AS A GP PARTNER'];
    TR.text(root._lines[0], TR.type(L[0], TR.seg(lt, 0.3, 1.2)));
    TR.text(root._lines[1], TR.type(L[1], TR.seg(lt, 1.25, 1.55)));
    TR.text(root._lines[2], TR.type(L[2], TR.seg(lt, 1.65, 2.35)));
    const mv = E.inOut(TR.seg(lt, 2.75, 3.25));
    const cw = root._clock.offsetWidth || 300, ch = root._clock.offsetHeight || 60;
    root._clock.style.background = `rgba(15,22,34,${(0.75 * mv).toFixed(3)})`;
    TR.pose(root._clock, { x: TR.lerp(640 - cw / 2, 36, mv), y: TR.lerp(360 - ch / 2, 30, mv), s: TR.lerp(1.55, 0.8, mv), o: 1 - TR.seg(lt, 4.9, 5.4) });
    // the line that sets up the whole game, in the sky above the roof
    const c = TR.window(lt, 5.1, 7.9, 0.45, 0.4);
    TR.pose(root._cap, { y: 12 * (1 - E.out(TR.seg(lt, 5.1, 5.6))), o: c });
  }
});
