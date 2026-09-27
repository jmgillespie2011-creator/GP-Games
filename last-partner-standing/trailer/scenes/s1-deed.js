/* ---------- Scene 1, Day one (0 to 8s): 7:59am, the windows light up, your name goes on the brass plate ----------
 Mirrors the game's own opening (the .lo blackouts, the dusk, the engraved name), slowed down for the film.
 Ends on TR.CAM.FULL with every window lit, the starting meters and three names on the plate, captions gone. */
TR.css(`
.s1-clock{position:absolute;left:0;top:0;white-space:pre;text-align:center;line-height:1.5;padding:8px 14px;border-radius:8px}
.s1-cap{position:absolute;left:0;right:0;top:34px;text-align:center;font-size:46px}
.s1-shade{background:#05070B}
.s1-brass{position:absolute}
`);
TR.scene({
  id: 's1-deed', title: 'Day one', dur: 8,
  lines: ['Wednesday 1 April 2026, 7:59am. The lights come on at Riverside Surgery, one window at a time.', 'Your name goes on the brass plate: you have just signed the partnership deed.'],
  build(root) {
    root._street = TR.el('div', 'tr-fill', null, root);
    root._fac = TR.el('div', 'tr-facade', null, root);
    root._brass = TR.el('div', 's1-brass', null, root);
    root._shade = TR.el('div', 'tr-fill s1-shade', null, root);
    root._clock = TR.el('div', 's1-clock tr-kick', null, root);
    root._cap = TR.el('div', 's1-cap tr-cap', 'You’ve just signed the partnership deed.', root);
  },
  update(lt, root) {
    const E = TR.ease;
    // a slow pull back from the front door to the whole building
    const start = TR.camOn(160, 128, 1000, 640, 372);
    const cam = TR.camLerp(start, TR.CAM.FULL, E.inOut(TR.seg(lt, 1.6, 7.6)));
    TR.street(root._street, cam);
    TR.cam(root._fac, cam);
    // the windows come on in the game's order (office, staff room, your room, waiting room, treatment), with its flicker
    const lo = [0, 1, 2, 3, 4].map(i => TR.kf(TR.seg(lt, 2.4 + i * 0.42, 3.0 + i * 0.42), [[0, 1], [0.35, 0.25], [0.55, 0.7], [1, 0]], E.lin));
    TR.facade(root._fac, { lo });
    // the brass plate hangs under the front and follows the camera
    const k = cam.w / 320;
    TR.place(root._brass, { x: cam.x, y: cam.y + 250 * k, w: cam.w });
    TR.brass(root._brass, [{ n: 'Dr ' + TR.NAME, engrave: E.inOut(TR.seg(lt, 4.6, 5.8)) }, { n: 'Dr Hartley' }, { n: 'Dr Okoye' }]);
    // dusk: from black, then dim, then the street as the game draws it
    TR.pose(root._shade, { o: TR.kf(lt, [[1.6, 1], [2.4, 0.5], [4.4, 0]], E.out) });
    // the clock: typed on black in the middle, then it moves to the corner like the game's caption, and goes
    const line1 = 'WEDNESDAY 1 APRIL 2026', line2 = '7:59AM';
    TR.text(root._clock, TR.type(line1, TR.seg(lt, 0.3, 1.3)) + '\n' + TR.type(line2, TR.seg(lt, 1.35, 1.7)));
    const mv = E.inOut(TR.seg(lt, 1.75, 2.3));
    const cw = root._clock.offsetWidth || 300, ch = root._clock.offsetHeight || 60;
    root._clock.style.background = `rgba(15,22,34,${(0.75 * mv).toFixed(3)})`;
    TR.pose(root._clock, { x: TR.lerp(640 - cw / 2, 36, mv), y: TR.lerp(360 - ch / 2, 30, mv), s: TR.lerp(1.7, 0.85, mv), o: 1 - TR.seg(lt, 5.0, 5.6) });
    // the line that sets up the whole game, in the sky above the roof
    const c = TR.window(lt, 5.5, 7.9, 0.5, 0.45);
    TR.pose(root._cap, { y: 12 * (1 - E.out(TR.seg(lt, 5.5, 6.0))), o: c });
  }
});
