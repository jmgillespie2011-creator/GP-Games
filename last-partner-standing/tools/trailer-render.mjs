// Renders the trailer (trailer/, assembled with the game's src/c-data.js and src/c3-art.js) with Playwright.
// Every frame is TR.seek(t) on a 1280x720 stage, so any time can be captured exactly.
//   node last-partner-standing/tools/trailer-render.mjs --list                      scenes with their start times
//   node last-partner-standing/tools/trailer-render.mjs --check                     play every frame at 10 fps and report page errors
//   node last-partner-standing/tools/trailer-render.mjs --at 3,12.5 --out DIR       full-size PNG frames
//   node last-partner-standing/tools/trailer-render.mjs --scene s3 --every 0.5 --sheet s3.png
//                                                    contact sheets (24 frames each: s3.png, s3-2.png, ...); --from/--to work too
//   node last-partner-standing/tools/trailer-render.mjs --video trailer.mp4 [--fps 30] [--scale 1.5] [--crf 25] [--poster 74.5 poster.png]
//   --only s4[,s5] assembles only those scenes (each then starts at 0 in that page), so other scenes can't break it.
//   --frame square|portrait renders the social cuts instead: 1080x1080 for X, 1080x1350 for LinkedIn (use --scale 1).
//   --page FILE renders an already built page (last-partner-standing-trailer.html) instead of assembling the sources.
// Needs the playwright package and a Chromium (set CHROMIUM to its path if Playwright can't find one), and ffmpeg with
// libx264 for --video (set FFMPEG, or `pip install imageio-ffmpeg`).
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { execSync, execFile, spawn } from 'child_process';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };

// the page: assembled fresh from the sources into a private temp file, so parallel runs never collide
let page_file = arg('page');
let tmp = null;
if (!page_file) {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lps-trailer-'));
  page_file = path.join(tmp, 'trailer.html');
  // --only s4 assembles just that scene (it then starts at 0), so a half-written scene elsewhere can't break the page
  const only = arg('only');
  const env = Object.assign({}, process.env, only ? { TRAILER_SCENES: String(only).split(',').map(id => `scenes/${id}*.js`).join(' ') } : {});
  execSync(`sh "${path.join(root, 'trailer', 'assemble.sh')}" "${page_file}"`, { stdio: 'inherit', env });
}
page_file = path.resolve(page_file);

const scale = +arg('scale', 1);
const frame = arg('frame');
const [W, H] = { square: [1080, 1080], portrait: [1080, 1350] }[frame] || [1280, 720];
const b = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
// Web fonts come through curl into a small cache, so renders work behind a TLS-intercepting proxy the browser
// doesn't trust (curl uses the system's CA settings) and repeat runs don't refetch them. If curl fails, the browser tries.
const fontCache = path.join(os.tmpdir(), 'lps-font-cache');
fs.mkdirSync(fontCache, { recursive: true });
await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, async route => {
  const req = route.request(), url = req.url(), f = path.join(fontCache, crypto.createHash('sha1').update(url).digest('hex'));
  try {
    const part = `${f}.${process.pid}.part`;
    if (!fs.existsSync(f)) { await new Promise((res, rej) => execFile('curl', ['-sSfL', '-A', req.headers()['user-agent'] || 'Mozilla/5.0', '-o', part, url], e => e ? rej(e) : res())); fs.renameSync(part, f); }
    await route.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': url.includes('googleapis') ? 'text/css; charset=utf-8' : 'font/woff2', 'access-control-allow-origin': '*' } });
  } catch (e) { await route.continue(); }
});
const pg = await ctx.newPage();
const errors = [];
pg.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message)));
pg.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await pg.goto('file://' + page_file + '?capture=1' + (frame ? '&frame=' + frame : ''));
await pg.waitForFunction(() => window.TR_READY === true, null, { timeout: 15000 }).catch(() => { });
// load every face the film uses before the first frame, so no frame falls back to a system font
const fontsOk = await pg.evaluate(async () => {
  const faces = ['500 20px "Bricolage Grotesque"', '700 20px "Bricolage Grotesque"', '800 20px "Bricolage Grotesque"', '400 20px "Atkinson Hyperlegible"', '700 20px "Atkinson Hyperlegible"', 'italic 400 20px "Atkinson Hyperlegible"', '400 20px "IBM Plex Mono"', '600 20px "IBM Plex Mono"', '400 20px Gelasio', '700 20px Gelasio', 'italic 400 20px Gelasio'];
  try { await Promise.race([Promise.all(faces.map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 8000))]); } catch (e) { }
  await document.fonts.ready;
  return faces.filter(f => !document.fonts.check(f));
});
if (fontsOk.length) console.warn('warning: these fonts did not load, frames use fallbacks:', fontsOk.join(', '));
if (errors.length) { console.error(errors.join('\n')); }
const info = await pg.evaluate(() => ({ total: TR.total, scenes: TR.scenes.map(s => ({ id: s.id, title: s.title, start: s.start, dur: s.dur })) }));

const seekShot = async (t, opts) => {
  await pg.evaluate(t => TR.seek(t), t);
  return pg.screenshot(Object.assign({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } }, opts || {}));
};
const range = () => {
  let from = +arg('from', 0), to = +arg('to', info.total);
  const sid = arg('scene');
  if (sid) { const sc = info.scenes.find(s => s.id === sid || s.id.startsWith(sid)); if (!sc) throw new Error('no scene ' + sid); from = sc.start; to = sc.start + sc.dur; }
  return [from, Math.min(to, info.total)];
};
const done = async code => { await b.close(); if (tmp) fs.rmSync(tmp, { recursive: true, force: true }); process.exit(code); };

if (arg('list')) {
  info.scenes.forEach(s => console.log(`${s.id.padEnd(14)} ${s.start.toFixed(2).padStart(6)}s  +${s.dur}s  ${s.title}`));
  console.log(`total ${info.total}s`);
  await done(errors.length ? 1 : 0);
}

if (arg('check')) {
  const [from, to] = range();
  const n0 = errors.length;
  const slow = await pg.evaluate(([from, to]) => {
    let worst = 0, at = 0;
    for (let t = from; t <= to + 1e-9; t += 0.1) { const a = performance.now(); TR.seek(t); const d = performance.now() - a; if (d > worst) { worst = d; at = t; } }
    for (let t = to; t >= from; t -= 0.7) TR.seek(t); // backwards too: update() must not depend on the previous frame
    return { worst: +worst.toFixed(1), at: +at.toFixed(1) };
  }, [from, to]);
  console.log(`checked ${from}s to ${to}s at 10 fps (and backwards): slowest frame ${slow.worst} ms at ${slow.at}s`);
  if (errors.length > n0 || errors.length) { console.error(errors.join('\n')); await done(1); }
  console.log('no page errors');
  await done(0);
}

const at = arg('at');
if (at) {
  const out = path.resolve(arg('out', path.join(os.tmpdir(), 'lps-frames')));
  fs.mkdirSync(out, { recursive: true });
  for (const t of String(at).split(',').map(Number)) {
    const f = path.join(out, `frame-${t.toFixed(2)}.png`);
    fs.writeFileSync(f, await seekShot(t));
    console.log(f);
  }
}

const sheet = arg('sheet');
if (sheet) {
  const [from, to] = range(), every = +arg('every', 0.5);
  const times = []; for (let t = from; t < to - 1e-6; t += every) times.push(+t.toFixed(3));
  if (!times.length || times[times.length - 1] < to - 0.05) times.push(+(to - 0.04).toFixed(3));
  const shots = [];
  for (const t of times) shots.push({ t, src: 'data:image/png;base64,' + (await seekShot(t, { scale: 'css' })).toString('base64') });
  const sp = await ctx.newPage();
  const base = path.resolve(sheet).replace(/\.png$/i, '');
  for (let i = 0, n = 1; i < shots.length; i += 24, n++) {
    const part = shots.slice(i, i + 24);
    await sp.setViewportSize({ width: 1320, height: 400 });
    await sp.setContent(`<body style="margin:0;background:#222;font:600 13px/1 monospace;color:#eee"><div style="display:grid;grid-template-columns:repeat(4,320px);gap:8px;padding:8px">${part.map(s => `<figure style="margin:0"><img src="${s.src}" style="display:block;width:320px;height:${Math.round(320 * H / W)}px"><figcaption style="padding:4px 2px">${s.t.toFixed(2)}s</figcaption></figure>`).join('')}</div></body>`);
    const f = n === 1 ? base + '.png' : `${base}-${n}.png`;
    await sp.screenshot({ path: f, fullPage: true });
    console.log(f);
  }
}

const video = arg('video');
if (video) {
  const fps = +arg('fps', 30), N = Math.round(info.total * fps);
  let ff = process.env.FFMPEG || 'ffmpeg';
  try { execSync(`"${ff}" -version`, { stdio: 'ignore' }); } catch (e) {
    try { ff = execSync('python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"').toString().trim(); } catch (e2) { console.error('no ffmpeg: set FFMPEG or pip install imageio-ffmpeg'); await done(1); }
  }
  const out = path.resolve(video);
  // H.264 High, yuv420p, keyframes every 2 s, a silent AAC track (some upload pipelines expect audio) and the index at
  // the front, so it plays as it downloads and uploads cleanly to X, LinkedIn and messaging apps
  const enc = spawn(ff, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000', '-shortest',
    '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', String(arg('crf', 25)), '-pix_fmt', 'yuv420p', '-g', String(fps * 2),
    '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ended = new Promise((res, rej) => enc.on('close', c => c ? rej(new Error('ffmpeg exited ' + c)) : res()));
  const a = Date.now();
  for (let i = 0; i < N; i++) {
    const png = await seekShot(i / fps);
    if (!enc.stdin.write(png)) await new Promise(r => enc.stdin.once('drain', r));
    if (i % (fps * 5) === 0) console.log(`frame ${i}/${N} (${(i / fps).toFixed(0)}s of film, ${((Date.now() - a) / 1000).toFixed(0)}s elapsed)`);
  }
  enc.stdin.end(); await ended;
  console.log(`wrote ${out} (${(fs.statSync(out).size / 1e6).toFixed(2)} MB, ${N} frames at ${fps} fps, ${W * scale}x${H * scale})`);
}

const poster = arg('poster');
if (poster) {
  const i = argv.indexOf('--poster'), t = +argv[i + 1], f = path.resolve(argv[i + 2]);
  fs.writeFileSync(f, await seekShot(t));
  console.log('poster', f);
}

if (errors.length) { console.error(`${errors.length} page error(s):\n` + errors.join('\n')); await done(1); }
await done(0);
