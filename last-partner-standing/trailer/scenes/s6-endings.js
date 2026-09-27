/* ---------- Scene 6, Two endings (60 to 68s): survived, technically, or the doors close. Then the Partners' Board ----------
 Two copies of the front on one night street. On the left, 31 March 2027: every window still lit. On the right, one
 January in year 2: your room goes dark as You runs out (the game's own rule), then the other windows, then the door
 gets the game's CLOSED sign. The banners are the year-end and game-over titles, drawn like the game's share picture.
 Then the game's honours board rises over the street, its names engraved one by one, and the question above it.
 Ends on the board and the line over the street dimmed to 62%, pavement at about y 580, as scene 7 opens. */
TR.css(`
.s6-kick{position:absolute;left:0;top:0;width:560px;text-align:center;white-space:nowrap}
.s6-bw{position:absolute;left:0;top:0;width:560px;text-align:center}
.s6-ban{display:inline-block;font-family:var(--serif);font-weight:700;font-size:40px;line-height:1;padding:13px 28px 14px;border-radius:10px;white-space:nowrap;box-shadow:0 12px 26px -14px rgba(0,0,0,.8)}
.s6-gold{background:#C9A24B;color:#2B1F0C}
.s6-red{background:#8E2A1F;color:#FBEDEA}
.s6-scrim{background:#070A10}
.s6-end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px}
.s6-board{width:900px;background:linear-gradient(#5A3B24,#4A2F1C);border:4px solid #2E1D10;border-radius:16px;padding:22px 26px 18px;color:#EAD9A8;box-shadow:inset 0 0 0 1.5px #7A5634,0 30px 60px -24px rgba(0,0,0,.85)}
.s6-bh{font-family:var(--serif);font-weight:700;font-size:34px;line-height:1.15;text-align:center;color:#E4C66E;letter-spacing:.02em}
.s6-bh small{display:block;font-weight:400;font-style:italic;font-size:21px;letter-spacing:0;color:#CDB889;margin-top:3px}
.s6-plqs{list-style:none;margin:16px 0 0;padding:0;display:grid;gap:8px}
.s6-plq{display:grid;grid-template-columns:34px 62px 1fr auto;align-items:center;gap:16px;padding:9px 14px;border-top:1.5px solid rgba(228,198,110,.25);border-radius:10px}
.s6-n{font-family:var(--mono);font-size:19px;color:#CDB889;text-align:right}
.s6-pt{display:block;width:62px;height:62px;border-radius:12px;overflow:hidden;line-height:0;box-shadow:0 0 0 3.5px var(--ring),0 2px 6px rgba(0,0,0,.3)}
.s6-pt svg{display:block;width:100%;height:100%}
.s6-t{display:grid;min-width:0;font-family:var(--serif);line-height:1.25}
.s6-t b{color:#F2E3B4;font-size:25px}
.s6-t small{color:#CDB889;font-size:20px;white-space:nowrap}
.s6-m{font-family:var(--mono);font-weight:600;font-size:30px;color:#E4C66E;text-align:right;line-height:1}
.s6-m small{display:block;font-size:15px;font-weight:400;color:#CDB889;margin-top:4px}
.s6-line{font-size:60px;text-align:center;white-space:nowrap}
.s6-u{background:linear-gradient(#F2D449,#F2D449) left bottom/0% .12em no-repeat;padding-bottom:.06em}
`);
// the board's rows, as the game's plaque() writes them: sorted by months served, "how" in the game's own words
const S6_ROWS = [
  { n: 'Okafor', p: 'suburb', how: 'Year 3 complete', m: 36, look: 5, c: 3 },
  { n: TR.NAME, p: 'town', how: 'Burnt out, January of year 2', m: 22, look: TR.LOOK.s, c: TR.LOOK.c, me: 1 },
  { n: 'Pemberton', p: 'city', how: 'Contract terminated, December', m: 9, look: 2, c: 2 },
  { n: 'Mehta', p: 'suburb', how: 'Nobody came in, March', m: 3, look: 6, c: 5 }
];
// one row, drawn like the game's plaqueRow(): rank, portrait ringed in the player's colour, name, practice and ending, months
const s6Row = (x, i) => `<li class="s6-plq"><span class="s6-n">${i + 1}</span><span class="s6-pt" style="--ring:${PLAYER_COLOURS[x.c]}"><svg viewBox="0 0 64 64" width="62" height="62"><rect width="64" height="64" rx="10" fill="${SIL_TILE}"/><g transform="translate(3.2 6.4) scale(0.9)">${silLook(PLAYER_LOOKS[x.look])}</g></svg></span><span class="s6-t"><b>Dr ${esc(x.n)}</b><small>${esc(PRACTICES[x.p].surgery)} · ${esc(x.how)}</small></span><span class="s6-m">${x.m}<small>months</small></span></li>`;
TR.scene({
  id: 's6-endings', title: 'Two endings', dur: 8, fadeIn: 0.5, fadeOut: 0.35,
  lines: ['31 March 2027: one partner left, and the lights are still on at Riverside Surgery. Last Partner Standing.', 'Or, one January in year 2, the windows go dark one by one and a sign on the door says “Closed. Ask the ICB.” Burnt out.', 'The Partners’ Board: every partner you play gets a line, however briefly they served. How long can you last?'],
  build(root) {
    root._street = TR.el('div', 'tr-fill', null, root);
    root._facL = TR.el('div', 'tr-facade', null, root);
    root._facR = TR.el('div', 'tr-facade', null, root);
    root._kL = TR.el('div', 's6-kick tr-kick', '31 March 2027', root);
    root._kR = TR.el('div', 's6-kick tr-kick', 'January 2028 · year 2', root);
    root._bL = TR.el('div', 's6-bw', '<span class="s6-ban s6-gold">Last Partner Standing</span>', root);
    root._bR = TR.el('div', 's6-bw', '<span class="s6-ban s6-red">Burnt out</span>', root);
    root._scrim = TR.el('div', 'tr-fill s6-scrim', null, root);
    // the question sits over the sky, the board under it hides the pavement in the middle
    const end = TR.el('div', 's6-end', null, root);
    root._line = TR.el('div', 's6-line tr-cap', 'How long can you <span class="s6-u">last</span>?', end);
    root._u = root._line.querySelector('.s6-u');
    root._board = TR.el('div', 's6-board', `<div class="s6-bh">The Partners’ Board<small>Those who served. Some briefly.</small></div><ol class="s6-plqs">${S6_ROWS.map(s6Row).join('')}</ol>`, end);
    root._rows = [...root._board.querySelectorAll('.s6-plq')];
  },
  update(lt, root) {
    const E = TR.ease;
    // one camera for both fronts, side by side on the same baseline (their own pavements join in the middle),
    // pushing in slowly all scene and ending with the pavement at y 580, where scene 7 has it
    const k = TR.lerp(1.7, 1.8, lt / 8), w = 320 * k, y = 384 - 125 * k;
    const camL = { x: 640 - w, y, w }, camR = { x: 639, y, w };
    TR.street(root._street, camL);
    TR.cam(root._facL, camL);
    TR.cam(root._facR, camR);
    // the end of year one with one partner left (the game's title for a sole partner): every window still lit, dimly,
    // you slumped at your desk, a red letter on Bev's desk
    TR.facade(root._facL, { st: { patients: 35, team: 40, you: 24, safety: 36 }, cash: -70, month: 11 });
    // January of year 2: You runs down to 0 and your room goes dark (18 or less is dark), then the other windows go
    // out, then the building is shut. The blackouts lift once it's closed, leaving the game's own closed front.
    const you = Math.round(TR.kf(lt, [[0.6, 22], [1.05, 0]], E.in));
    const shut = lt >= 1.72, open = 1 - E.inOut(TR.seg(lt, 1.72, 2.1));
    const lo = [1.04, 1.2, 0.86, 1.36, 1.52].map(a => TR.seg(lt, a, a + 0.06) * open);
    TR.facade(root._facR, { st: { patients: 29, team: 31, you, safety: 30 }, cash: -68, month: 9, closed: shut, lo });
    // the kickers and the banners sit over each roof and follow the camera; they go as the board comes up
    const roof = y + 34 * k, xL = camL.x + w / 2 - 280, xR = camR.x + w / 2 - 280;
    const out = 1 - E.in(TR.seg(lt, 3.55, 3.9));
    const kL = E.out(TR.seg(lt, 0.2, 0.55)), kR = E.out(TR.seg(lt, 0.55, 0.9));
    TR.pose(root._kL, { x: xL, y: roof - 120 + 8 * (1 - kL), o: kL * out });
    TR.pose(root._kR, { x: xR, y: roof - 120 + 8 * (1 - kR), o: kR * out });
    const gIn = E.out(TR.seg(lt, 0.3, 0.75));
    TR.pose(root._bL, { x: xL, y: roof - 86 - 14 * (1 - gIn), o: gIn * out });
    // "Burnt out" lands like a stamp as the door shuts
    const st = TR.seg(lt, 1.72, 1.96);
    TR.pose(root._bR, { x: xR, y: roof - 86, s: TR.lerp(1.35, 1, E.out(st)), o: Math.min(1, st * 4) * out });
    // the street dims and the Partners' Board rises over it
    TR.pose(root._scrim, { o: 0.62 * E.inOut(TR.seg(lt, 3.55, 4.25)) });
    TR.pose(root._board, { y: 190 * (1 - E.out(TR.seg(lt, 3.6, 4.3))), o: E.out(TR.seg(lt, 3.6, 3.9)) });
    // the names are engraved one by one, left to right with a glint, like the brass plate in scene 1
    root._rows.forEach((li, i) => {
      const e = E.inOut(TR.seg(lt, 4.0 + 0.2 * i, 4.42 + 0.2 * i));
      const vis = e > 0 ? '' : 'hidden';
      if (li._vis !== vis) { li.style.visibility = vis; li._vis = vis; }
      const clip = e >= 1 ? 'none' : `inset(-10% ${(100 - 100 * e).toFixed(1)}% -10% -2%)`;
      if (li._clip !== clip) { li.style.clipPath = clip; li._clip = clip; }
      const glow = e > 0 && e < 1 ? '0 0 10px #FFF6D0' : 'none';
      if (li._glow !== glow) { li.style.textShadow = glow; li._glow = glow; }
    });
    // your line lights up like the game's .plq.me
    const me = root._rows[1], a = E.out(TR.seg(lt, 4.55, 4.95));
    const bg = `rgba(228,198,110,${(0.16 * a).toFixed(3)})`, ring = `inset 0 0 0 1.5px rgba(228,198,110,${(0.45 * a).toFixed(3)})`;
    if (me._bg !== bg) { me.style.background = bg; me.style.boxShadow = ring; me._bg = bg; }
    // the question, with the logo's yellow line drawn under "last"
    const lIn = E.out(TR.seg(lt, 4.95, 5.45));
    TR.pose(root._line, { y: 18 * (1 - lIn), o: lIn });
    const u = `${(100 * E.inOut(TR.seg(lt, 5.5, 6.0))).toFixed(1)}% .12em`;
    if (root._u._bs !== u) { root._u.style.backgroundSize = u; root._u._bs = u; }
  }
});
