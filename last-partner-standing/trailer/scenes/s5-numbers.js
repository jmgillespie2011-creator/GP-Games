/* ---------- Scene 5, The numbers are real (52 to 60s): three real figures and their sources ----------
 A typographic interlude on the game's dark paper, between the story and the endings. The kicker types in; the global
 sum and employer NI count up in the top band; the fall in partners under 40 counts down below, biggest and red.
 Each figure counts inside a box the width of its final value (a hidden copy), so the digits never jitter. */
TR.css(`
.s5-paper{background:#0D1712 repeating-linear-gradient(135deg,rgba(92,191,144,.045) 0 2px,transparent 2px 9px)}
.s5-page{position:absolute;inset:0;transform-origin:420px 520px}
.s5-page .s5-kick{position:absolute;left:72px;top:52px;white-space:nowrap;font-size:26px;letter-spacing:.12em}
.s5-rule{position:absolute;height:1.5px;background:#2B4135;transform-origin:left center}
.s5-col{position:absolute;display:flex;flex-direction:column;align-items:flex-start}
.s5-fig{display:inline-grid;font-family:var(--display);font-weight:800;line-height:.9;letter-spacing:-.03em;font-variation-settings:"opsz" 96;font-variant-numeric:tabular-nums;color:#F4EEDD;white-space:nowrap}
.s5-fig>span{grid-area:1/1}
.s5-fig .gh{visibility:hidden}
.s5-fig .lv{justify-self:end}
.s5-col .s5-fig{font-size:118px}
.s5-what{font-family:var(--body);font-size:22px;line-height:1.3;color:#C9CFDA;margin-top:14px;white-space:nowrap}
.s5-src{display:grid;grid-template-columns:auto auto;column-gap:.8em;font-family:var(--mono);font-size:13px;line-height:1.5;color:#8FA89A;margin-top:auto;white-space:nowrap}
.s5-src b{font-weight:600;color:#5CBF90;letter-spacing:.12em;text-transform:uppercase}
.s5-hero{position:absolute;left:60px;top:412px}
.s5-hero .s5-fig{font-size:248px;color:#F07C6E}
.s5-htext{position:absolute;left:736px;display:flex;flex-direction:column;align-items:flex-start}
.s5-htext .s5-what{margin-top:0;font-size:28px;line-height:1.3}
.s5-htext .s5-what b{color:#F4EEDD}
`);
TR.scene({
  id: 's5-numbers', title: 'The numbers are real', dur: 8, fadeIn: 0.4, fadeOut: 0.4,
  lines: ['The practice is fictional. The numbers are real.', '£130.07: the global sum, what a practice is paid a year per weighted patient, 2026/27. 15%: employer National Insurance on staff pay; GP practices can’t claim the Employment Allowance.', '−17%: GP partners under 40 in England, in the 15 months to September 2025.'],
  build(root) {
    TR.el('div', 'tr-fill s5-paper', null, root);
    // everything but the paper sits on a page that leans slowly in towards the last figure
    const pg = root._pg = TR.el('div', 's5-page', null, root);
    root._kick = TR.el('div', 's5-kick tr-kick', '', pg);
    root._r1 = TR.place(TR.el('div', 's5-rule', null, pg), { x: 72, y: 104, w: 1136 });
    root._r2 = TR.place(TR.el('div', 's5-rule', null, pg), { x: 72, y: 396, w: 1136 });
    // a figure: the hidden final value sets the box, the live count sits right-aligned inside it
    const fig = (parent, final) => { const f = TR.el('div', 's5-fig', `<span class="gh">${final}</span><span class="lv"></span>`, parent); f._lv = f.lastChild; return f; };
    const src = (parent, label, list) => TR.el('div', 's5-src', `<b>${label}</b><span>${list.join('<br>')}</span>`, parent);
    const col = (x, w, final, what, list) => {
      const c = TR.place(TR.el('div', 's5-col', null, pg), { x, y: 128, w, h: 246 });
      return { f: fig(c, final), w: TR.el('div', 's5-what', what, c), s: src(c, 'Sources', list) };
    };
    root._a = col(72, 580, '£130.07', 'The global sum: what a practice is paid a year<br>per weighted patient, 2026/27.', ['DHSC, GMS Statement of Financial Entitlements Directions 2026', 'BMA, DDRB uplift 2026/27 FAQs']);
    root._b = col(680, 528, '15%', 'Employer National Insurance on staff pay.<br>GP practices can’t claim the Employment Allowance.', ['BMA, Impact of employer NICs on GPs', 'HMRC, Employment Allowance eligibility guidance']);
    // the last figure, the reason for the title: biggest, red, its line beside it from the top of the digits to the baseline
    const hero = TR.el('div', 's5-hero', null, pg), ht = TR.place(TR.el('div', 's5-htext', null, pg), { y: 435, h: 176 });
    root._c = { f: fig(hero, '−17%'), w: TR.el('div', 's5-what', '<b>GP partners under 40 in England,</b><br>in the 15 months to September 2025.', ht), s: src(ht, 'Source', ['Institute for Government, Performance Tracker 2025']) };
    // change-only scaleX for the rules
    root._sx = (el, p) => { const tf = `scaleX(${p.toFixed(4)})`; if (el._tf !== tf) { el.style.transform = tf; el._tf = tf; } };
  },
  update(lt, root) {
    const E = TR.ease, seg = TR.seg;
    TR.pose(root._pg, { s: 1 + 0.03 * E.inOut(seg(lt, 1, 8)) });
    // the kicker types in, then the rule under it draws
    TR.text(root._kick, TR.type('The practice is fictional. The numbers are real.', seg(lt, 0.15, 0.95)));
    root._sx(root._r1, E.inOut(seg(lt, 0.55, 1.35)));
    root._sx(root._r2, E.inOut(seg(lt, 3.05, 3.75)));
    // a figure arrives: the number rises into place as it counts, then its line, then its source
    const arrive = (F, t0, count, dim) => {
      TR.text(F.f._lv, count);
      TR.pose(F.f, { y: 22 * (1 - E.out(seg(lt, t0, t0 + 0.55))), o: E.out(seg(lt, t0, t0 + 0.3)) * dim });
      TR.pose(F.w, { y: 12 * (1 - E.out(seg(lt, t0 + 0.2, t0 + 0.65))), o: E.out(seg(lt, t0 + 0.2, t0 + 0.55)) });
      TR.pose(F.s, { o: E.out(seg(lt, t0 + 0.4, t0 + 0.8)) });
    };
    // the two top figures step back a little once the last one has landed
    const dim = 1 - 0.2 * E.inOut(seg(lt, 4.2, 5.0));
    arrive(root._a, 1.15, '£' + (130.07 * E.out(seg(lt, 1.15, 1.95))).toFixed(2), dim);
    arrive(root._b, 2.25, Math.round(15 * E.out(seg(lt, 2.25, 2.85))) + '%', dim);
    // the fall counts down more slowly: the last steps (−15, −16, −17) linger, and −17 lands at about 4.2s
    const v = Math.round(17 * E.out(seg(lt, 3.3, 4.6)));
    arrive(root._c, 3.3, v ? '−' + v + '%' : '0%', 1);
  }
});
