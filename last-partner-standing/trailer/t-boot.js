/* ===================== TRAILER PLAYER: controls, chapters, scaling, capture mode ===================== */
(function boot() {
  const q = new URLSearchParams(location.search);
  const capture = q.has('capture');
  if (capture) document.documentElement.classList.add('capture');
  const screen = document.getElementById('screen'), stage = document.getElementById('stage');
  TR.init(stage);
  // social cuts (capture only): ?frame=square (X) or ?frame=portrait (LinkedIn) puts the film in a frame with a
  // headline above, a progress bar and the address below
  const soc = capture ? q.get('frame') : null;
  let socBar = null;
  if (soc === 'square' || soc === 'portrait') {
    document.documentElement.classList.add('social', 'social-' + soc);
    const shell = TR.el('div', 'soc', `<div class="soc-top"><div class="soc-eyebrow">Last Partner Standing · a GP survival game</div><h1 class="soc-h">How long can you last as a <span class="under">GP partner?</span></h1>${soc === 'portrait' ? '<p class="soc-sub">A year on England’s 2026/27 GP contract.<br>A fictional practice, with the real rules and numbers.</p>' : ''}</div><div class="soc-film"></div><div class="soc-bar"><b></b></div><div class="soc-bot"><span class="soc-url">last-partner-standing.vercel.app</span><span class="soc-free">Free, in your browser.</span>${soc === 'portrait' ? '<span class="soc-fine">Fictional practices and people. Real rules.</span>' : ''}</div>`, document.body);
    shell.querySelector('.soc-film').appendChild(screen);
    socBar = shell.querySelector('.soc-bar b');
  }

  // scale the 1280x720 stage to the width of the screen box
  const fit = () => { const k = document.fullscreenElement === screen ? Math.min(screen.clientWidth / TR.W, screen.clientHeight / TR.H) : screen.clientWidth / TR.W; stage.style.setProperty('--k', k.toFixed(5)); };
  fit();
  try { new ResizeObserver(fit).observe(screen); } catch (e) { addEventListener('resize', fit); }

  const $ = id => document.getElementById(id);
  const playBtn = $('tr-play'), big = $('big-play'), scrub = $('tr-scrub'), clock = $('tr-clock'), chapters = $('tr-chapters');
  scrub.max = TR.total.toFixed(1);
  $('tr-length').textContent = `The trailer · ${TR.mmss(TR.total)}`;
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5Z" fill="currentColor"/></svg>';
  const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h4v15h-4ZM13.5 4.5h4v15h-4Z" fill="currentColor"/></svg>';

  // chapters: one per scene, with what happens in it
  chapters.innerHTML = TR.scenes.map((sc, i) => `<li><button type="button" data-i="${i}"><time>${TR.mmss(sc.start)}</time><span><b>${esc(sc.title)}</b>${(sc.lines || []).map(l => `<small>${esc(l)}</small>`).join('')}</span></button></li>`).join('');
  const chapBtns = [...chapters.querySelectorAll('button')];
  chapters.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const sc = TR.scenes[+b.dataset.i]; started = true; big.hidden = true; seek(sc.start + 0.001); if (!playing) play(); });

  // the MP4 only exists on the website, and a framed page (the Claude Artifact) can't download files
  let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  const mp4 = $('tr-mp4');
  if (mp4 && !framed && /vercel\.app$/.test(location.hostname)) mp4.hidden = false;

  let playing = false, t0 = 0, w0 = 0, raf = 0;
  const TOT = TR.mmss(TR.total);
  TR.onseek = t => {
    if (socBar) socBar.style.width = (100 * t / TR.total).toFixed(2) + '%';
    const v = t.toFixed(1); if (scrub.value !== v && document.activeElement !== scrub) scrub.value = v;
    clock.textContent = `${TR.mmss(t)} / ${TOT}`;
    const cur = TR.scenes.indexOf(TR.sceneAt(t));
    chapBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === cur)));
  };
  const seek = t => { TR.seek(t); if (playing) { t0 = TR.t; w0 = performance.now(); } };
  const frame = now => {
    const t = t0 + (now - w0) / 1000;
    if (t >= TR.total) { TR.seek(TR.total); pause(); return; }
    TR.seek(t); raf = requestAnimationFrame(frame);
  };
  function play() {
    if (TR.t >= TR.total - 0.05 || !started) TR.seek(0);
    started = true; playing = true; big.hidden = true;
    t0 = TR.t; w0 = performance.now(); raf = requestAnimationFrame(frame);
    playBtn.innerHTML = PAUSE; playBtn.setAttribute('aria-label', 'Pause');
  }
  function pause() {
    playing = false; cancelAnimationFrame(raf);
    playBtn.innerHTML = PLAY; playBtn.setAttribute('aria-label', TR.t >= TR.total - 0.05 ? 'Play again' : 'Play');
  }
  let started = false;
  playBtn.addEventListener('click', () => playing ? pause() : play());
  big.addEventListener('click', play);
  $('tr-restart').addEventListener('click', () => { started = true; big.hidden = true; seek(0); if (!playing) play(); });
  scrub.addEventListener('input', () => { started = true; big.hidden = true; seek(+scrub.value); });
  // Space or k plays and pauses (not on a focused control, which Space already presses); the arrow keys skip 5 s
  // anywhere except in the scrubber, which moves with them itself
  addEventListener('keydown', e => {
    const ctl = e.target.closest ? e.target.closest('input,button,a,textarea,select') : null;
    if ((e.key === ' ' || e.key === 'k') && !ctl) { e.preventDefault(); playing ? pause() : play(); }
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !(ctl && ctl.matches('input,textarea,select'))) {
      e.preventDefault(); started = true; big.hidden = true; seek(TR.t + (e.key === 'ArrowRight' ? 5 : -5));
    }
  });
  // full screen where the browser allows it (not on iPhones, and not in every app view)
  const full = $('tr-full');
  if (document.fullscreenEnabled && screen.requestFullscreen) {
    full.hidden = false;
    full.addEventListener('click', () => { (document.fullscreenElement ? document.exitFullscreen() : screen.requestFullscreen()).catch(() => { }); });
    document.addEventListener('fullscreenchange', () => { full.setAttribute('aria-label', document.fullscreenElement ? 'Leave full screen' : 'Full screen'); fit(); });
  }
  // hidden tabs don't need frames
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); });

  // at rest the page shows a poster frame, so a thumbnail or a paused tab still says what this is
  const at = q.get('t');
  TR.seek(at != null ? +at : (TR.POSTER != null ? TR.POSTER : 0));
  if (at != null) { started = true; big.hidden = true; }
  if (capture) { big.hidden = true; window.TR_READY = true; }
})();
