/* ===================== LEADERBOARD =====================
 Shared scores in Supabase (table lps_scores, see supabase/lps_scores.sql).
 The publishable key is meant to be public: row-level security only allows reading and inserting,
 and table constraints reject silly values. Scores are worked out in the browser, so they can be faked.
 If BOARD.url is empty, or the network is blocked (as inside a Claude Artifact), the board says so and the game carries on.
*/
const BOARD = { url: 'https://rttvlxawjidhneljhglk.supabase.co', key: 'sb_publishable_Zj804D7rgJdWCl2QTNJWGw_RBPYmCWT', table: 'lps_scores', version: 'v6' };
const BOARD_NAME_KEY = 'lps-board-name-v1';
const PRAC_SHORT = { suburb: 'Suburb', town: 'Town', city: 'City' };
let BD = { tab: 'all', rows: null, err: '', loading: false, posting: false, posted: null, rank: null };

const boardOn = () => !!(BOARD.url && BOARD.key);
function boardHeaders(extra) { return Object.assign({ apikey: BOARD.key, 'Content-Type': 'application/json' }, extra || {}); }
function boardFetch(path, opts) {
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), 8000) : null;
  return fetch(`${BOARD.url}/rest/v1/${path}`, Object.assign({ signal: ctl ? ctl.signal : undefined }, opts))
    .finally(() => { if (t) clearTimeout(t); });
}
function cleanName(n) { return String(n || '').replace(/[^A-Za-z0-9 .'-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24); }
// A light word filter for the public board. The same lists are enforced in the database trigger (supabase/lps_scores.sql).
// Letters are compared with look-alike digits swapped back and spaces and punctuation removed, so "f.u c k" and "5h1t" are caught.
const BAD_PARTS = ['fuck', 'cunt', 'nigg', 'whore', 'bitch', 'bastard', 'twat', 'bollock', 'hitler', 'paedo', 'retard', 'spastic', 'tranny', 'wanker'];
const BAD_WORDS = ['dick', 'cock', 'arse', 'ass', 'tits', 'rape', 'fag', 'faggot', 'paki', 'spaz', 'chink', 'coon', 'dyke', 'gook', 'wog', 'jizz', 'cum', 'nonce', 'prick', 'knob', 'shit', 'shite', 'shitty', 'wank', 'piss', 'pissed', 'pedo', 'porn', 'nazi', 'kike', 'slut'];
function nameOk(n) {
  const low = String(n || '').toLowerCase().replace(/[013457]/g, d => ({ 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't' })[d]);
  const squashed = low.replace(/[^a-z]/g, '');
  if (BAD_PARTS.some(w => squashed.includes(w))) return false;
  const words = low.split(/[^a-z]+/);
  return !BAD_WORDS.some(w => words.includes(w) || words.includes(w + 's'));
}
function savedBoardName() { try { return localStorage.getItem(BOARD_NAME_KEY) || ''; } catch (e) { return ''; } }

// the number to beat: the average months served by partners on the board (shown once enough runs exist)
function loadStats() {
  if (!boardOn() || BD.stats !== undefined) return;
  BD.stats = null;
  boardFetch('rpc/lps_stats', { method: 'POST', headers: boardHeaders(), body: '{}' })
    .then(r => r.ok ? r.json() : null)
    .then(j => { if (j && j.runs >= 10 && j.avg_months) { BD.stats = j; const el = document.getElementById('avg-line'); if (el) el.outerHTML = avgLineHTML(); } })
    .catch(() => { });
}
const REAL_LINE = 'In real life, the number of GP partners under 40 in England fell by 17% in 15 months, to September 2025.';
function avgLineHTML(mine) {
  const st = BD.stats;
  return `<p class="avg-line" id="avg-line">${st ? `Partners on the leaderboard last <b>${Math.round(st.avg_months)} months</b> on average.${mine != null ? ` You lasted <b>${mine}</b>.` : ''} ` : ''}${esc(REAL_LINE)} <a href="${esc(SOURCES.S83[1])}" target="_blank" rel="noopener">Institute for Government</a></p>`;
}
function loadBoard() {
  if (!boardOn()) { BD.err = 'off'; return; }
  BD.loading = true; BD.err = '';
  const q = `${BOARD.table}?select=id,name,practice,title,score,share_k,qof,cqc,exit,week,months,created_at&order=${BD.tab === 'long' ? 'months.desc.nullslast,score.desc' : 'score.desc'},created_at.asc&limit=20` + (BD.tab === 'long' ? '&months=not.is.null' : BD.tab === 'week' ? `&week=eq.${isoWeek()}&practice=eq.city` : BD.tab !== 'all' ? `&practice=eq.${BD.tab}` : '');
  boardFetch(q, { headers: boardHeaders() })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(rows => { BD.rows = Array.isArray(rows) ? rows : []; })
    .catch(() => { BD.rows = null; BD.err = 'net'; })
    .finally(() => { BD.loading = false; refreshBoard(); });
}
// what a post is about: the finished year, or (in endless mode) a run that ended after year one
function boardRun() {
  if (!S) return null;
  if (S.phase === 'end') return S.end;
  if (S.phase === 'over' && S.yr >= 1) return S.overPost || (S.overPost = { arche: { t: `${OVER[S.over.k].title}, year ${S.yr + 1}` }, score: S.bestYear || 0, annualK: null, exit: null, months: S.over.months, over: 1 });
  return null;
}
function postScore() {
  const E = boardRun();
  if (!boardOn() || !E || BD.posting || E.posted) return;
  const inp = document.getElementById('board-name');
  const name = cleanName(inp ? inp.value : '');
  if (!name) { toast('Pick a name for the board first.'); return; }
  if (!nameOk(name)) { toast('That name can\'t go on the board. Pick another.'); return; }
  try { localStorage.setItem(BOARD_NAME_KEY, name); } catch (e) { }
  const row = { name, practice: S.practiceKey, title: String(E.arche.t).slice(0, 48), score: Math.max(0, Math.min(800, E.score)),
    share_k: E.annualK == null ? null : Math.round(Math.max(-300, Math.min(500, E.annualK))), qof: Math.round(clamp(S.qof)), cqc: S.cqc ? S.cqc.overall : null, exit: E.exit || null, week: S.week || null, months: E.months || 12, version: BOARD.version };
  BD.posting = true; refreshBoard();
  boardFetch(BOARD.table, { method: 'POST', headers: boardHeaders({ Prefer: 'return=representation' }), body: JSON.stringify(row) })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(res => {
      const id = res && res[0] && res[0].id;
      E.posted = id || true; BD.posted = id || null;
      return boardFetch(`${BOARD.table}?select=id&score=gt.${row.score}`, { method: 'HEAD', headers: boardHeaders({ Prefer: 'count=exact' }) })
        .then(r => { const m = /\/(\d+)$/.exec(r.headers.get('content-range') || ''); BD.rank = m ? +m[1] + 1 : null; })
        .catch(() => { });
    })
    .then(() => { toast(BD.rank ? `Posted. You're number ${BD.rank} on the board.` : 'Posted to the leaderboard.'); BD.tab = 'all'; loadBoard(); })
    .catch(() => { toast('Couldn\'t reach the leaderboard. Try again in a moment.'); })
    .finally(() => { BD.posting = false; refreshBoard(); });
}

function boardTableHTML() {
  if (!boardOn() || BD.err === 'off') return '<p class="fc-note">The leaderboard isn\'t switched on yet.</p>';
  if (BD.err === 'net') return `<p class="fc-note">The leaderboard can't be reached from here. It works at <a href="https://last-partner-standing.vercel.app" target="_blank" rel="noopener">last-partner-standing.vercel.app</a>.</p>`;
  if (!BD.rows) return '<p class="fc-note">Loading the leaderboard…</p>';
  if (!BD.rows.length) return '<p class="fc-note">No scores yet. Be the first partner on the board.</p>';
  return `<ol class="board">${BD.rows.map((r, i) => `<li class="${BD.posted && r.id === BD.posted ? 'me' : ''}"><span class="pos">${i + 1}</span><span class="who-b"><b>${esc(r.name)}</b><small>${esc(r.title)} · ${esc(PRAC_SHORT[r.practice] || '')}${r.cqc ? ' · CQC ' + esc(RATE_NAME[r.cqc] || '') : ''}${r.share_k != null ? ' · £' + r.share_k + 'k' : ''}${r.week ? ' · weekly' : ''}${r.months && BD.tab !== 'long' ? ' · ' + r.months + ' months' : ''}</small></span><span class="sc">${BD.tab === 'long' ? (r.months || '') + '<small> mo</small>' : r.score}</span></li>`).join('')}</ol>`;
}
function boardTabsHTML() {
  return `<div class="seg board-tabs" role="group" aria-label="Filter by practice">${['all', 'long', 'week', 'suburb', 'town', 'city'].map(k => `<button data-act="board-tab" data-arg="${k}" aria-pressed="${BD.tab === k}">${k === 'all' ? 'All' : k === 'long' ? 'Longest serving' : k === 'week' ? 'This week' : PRAC_SHORT[k]}</button>`).join('')}</div>`;
}
function boardInner() { return `${boardTabsHTML()}<div id="board-list">${boardTableHTML()}</div>`; }

// the panel on the year-end screen
function boardPanelHTML() {
  const E = boardRun();
  if (!E) return '';
  const form = !boardOn() || BD.err === 'net' ? '' : E.posted
    ? `<p class="fc-note good-t">Your year is on the board${BD.rank ? `, at number ${BD.rank}` : ''}.</p>`
    : `<div class="board-form"><label for="board-name">Name on the board</label><div class="name-row"><input id="board-name" maxlength="24" autocomplete="nickname" value="${esc(savedBoardName() || 'Dr ' + S.name)}"></div>
       <button class="btn primary" data-act="board-post" ${BD.posting ? 'disabled' : ''}>${BD.posting ? 'Posting…' : E.over ? `Post my ${E.months} months` : `Post my score (${E.score})`}</button></div>
       <p class="fc-note">Everyone can see the board. Only the name you choose, your score and your year's results are stored, with no other details about you. Use a nickname if you'd rather not use your real name. Offensive names are blocked and removed.</p>`;
  return `<section class="panel" id="board-panel"><h3>Leaderboard <small>top 20 partners</small></h3>${form}${boardInner()}</section>`;
}
function boardOverlayHTML() {
  return `<h2>Leaderboard</h2><p class="muted">The best years anyone has finished. Finish a year to post yours.</p>${boardInner()}<div class="row-actions"><button class="btn primary" data-act="close">Close</button></div>`;
}
function refreshBoard() {
  const list = document.getElementById('board-list');
  if (list) list.innerHTML = boardTableHTML();
  document.querySelectorAll('.board-tabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.arg === BD.tab)));
  const panel = document.getElementById('board-panel');
  if (panel && boardRun()) {
    const inp = document.getElementById('board-name'), typed = inp ? inp.value : null, y = window.scrollY;
    panel.outerHTML = boardPanelHTML();
    const again = document.getElementById('board-name'); if (again && typed != null) again.value = typed;
    window.scrollTo(0, y);
  }
}
function boardAction(a, arg) {
  if (a === 'board') { BD.tab = 'all'; openOverlay(boardOverlayHTML()); loadBoard(); return true; }
  if (a === 'board-tab') { BD.tab = arg; BD.rows = null; refreshBoard(); loadBoard(); return true; }
  if (a === 'board-post') { postScore(); return true; }
  return false;
}
