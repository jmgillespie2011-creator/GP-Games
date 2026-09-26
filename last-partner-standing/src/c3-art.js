/* ===================== ART: silhouettes, the surgery front, share image =====================
 Everything is drawn in code as SVG, so it stays tiny and sharp.
 Portraits are profile silhouettes (facing right) on a cream tile, told apart by outline:
 hair, glasses, a pipe, a headset, a clipboard. Cut-outs (stethoscopes, lanyards, ties) are
 drawn in the tile colour on top of the silhouette.
 A look is {body, hair, acc:[...]}; 64 x 64 units, head centre about (29, 23).
*/
const SIL_INK = '#1E1B16', SIL_TILE = '#EFE7D0';

const SIL_HEAD = 'M29 10.5C35.5 10.5 39.5 14 40.3 19.5L40.9 22L46 26.2L41.4 27.5L41.8 28.6L40.8 29.6L41.3 31.2C41 33.6 39.2 35.2 35.8 35.6L35.4 38L24.6 38L24.2 34.8C19.6 32.8 17.2 28.5 17.6 22.8C18.1 15 22.8 10.5 29 10.5Z';
const SIL_BODY = {
  std: 'M24.4 37L35.6 37L36 40C45 41.5 53 45.5 56.5 53L58.5 64L5.5 64L7.5 53C11 45.5 17.5 41.5 24 40Z',
  narrow: 'M25 37L35 37L35.4 40.5C43 42 49.5 46 52.5 53L54.5 64L9.5 64L11.5 53C14.5 46 19.5 42 24.6 40.5Z',
  broad: 'M24 37L36 37L36.5 40C47 41 56 45 59.5 53L62 64L2 64L4.5 53C8 45 16 41 23.5 40Z'
};
const SIL_HAIR = {
  none: '',
  short: 'M17.3 24C16 15 21 9 29.5 9.2C35.8 9.4 40 12.5 40.8 17.5C37.5 15.5 34 15.4 30.5 16.5C29 19.5 26 21.5 23 22C21.5 22.5 20.5 23.5 20 25Z',
  side: 'M17.2 24.5C15.8 14.5 21 8.6 29.8 8.8C36.5 9 40.6 12 41.3 16.8C38.8 14.6 35.2 13.4 31.6 13.8C28.5 17.5 25 20.5 20.5 22.5Z',
  quiff: 'M17.3 24C16 15 21 9 29.5 9.2C31 6 36 3.6 41.5 5.2C44 6 45 8 44.6 10.2C42 9.3 40 10 39.6 13.6C37 15.4 34 15.4 30.5 16.5C29 19.5 26 21.5 23 22C21.5 22.5 20.5 23.5 20 25Z',
  slick: 'M16.8 26C15 16 20.5 8.8 30 8.6C36.5 8.6 40.6 11.8 41 16.2C36.6 13.2 31 13 26.5 15.5C22 18 19.8 21.6 19.6 26Z',
  bob: 'M16.5 31C13.8 16 20 7.8 29.5 7.8C37.6 7.8 42.2 12.4 41.8 19.4L38 17.6C36 19.2 35 21.4 34.8 23.4L26 25.5L26.4 34C22 35 18.5 34 16.5 31Z',
  long: 'M15.5 42C11.6 26 15.6 7.8 29.5 7.8C37.6 7.8 42.2 12.4 41.8 19.4L38 17.6C36 19.4 35 22.4 34.6 25.4L27.5 30L26.8 44C21.5 45.5 17.5 44.6 15.5 42Z',
  bun: 'M17.6 25C16 15 21 9.4 29.5 9.4C36 9.4 40 13 40.6 18C36 15 31 15.2 26 18.2ZM19.5 8.2a5.6 5.6 0 1 0 0.1 0Z',
  highbun: 'M17.6 25C16 15 21 9.4 29.5 9.4C36 9.4 40 13 40.6 18C36 15 31 15.2 26 18.2ZM27 1.4a5.2 5.2 0 1 0 0.1 0Z',
  ponytail: 'M17.6 25C16 15 21 9.4 29.5 9.4C36 9.4 40 13 40.6 18C36 15 31 15.2 26 18.2ZM19.8 14.5C12.5 16 9.8 24 11.4 33.5C13.6 29 16.6 25.4 20.6 22.6Z',
  curly: 'M22 9a6 6 0 1 1 0.1 0ZM30 6.4a6.2 6.2 0 1 1 0.1 0ZM37.2 9.4a4.8 4.8 0 1 1 0.1 0ZM16.2 15a5.8 5.8 0 1 1 0.1 0ZM15.4 22.4a5.4 5.4 0 1 1 0.1 0ZM17.8 28.4a4.4 4.4 0 1 1 0.1 0Z',
  mop: 'M17.5 25C15 16 19.5 8 29 7.6C33 6 38 7 40.8 10.4C43 12.6 42.6 16 41 18.4C39.6 15.6 37.4 15 35.6 16.6C33.4 15.2 31 15.6 29.4 17.6C27 20.4 24 22 21 23.8Z',
  combover: 'M18 23C17.4 17.6 20 12.2 25.4 11.2C30 10.4 36 11.4 39.6 15.2C35 13.4 28 13.4 22 16.6C20 18.4 19.2 20.6 19 23Z',
  flatcap: 'M16.4 21.6C15.4 14.6 20 9.6 28 9C35 8.4 40.4 10.8 42.6 14.8L48.6 17.2C48 18.6 45 19.4 41 19.2L17.4 22.8Z',
  hood: 'M13.6 37C11.4 20 17.6 7.2 30 6.8C38.4 6.8 42.6 12 42.2 19.4L38.4 18.2C34.6 20.4 33.4 26 33.4 31.2L28.4 39L21 41.4Z'
};
// accessories: f = filled in ink (sticks out of the outline), c = cut out in the tile colour
const SIL_ACC = {
  glasses: { f: 'M40.2 18.6h3.6a0.9 0.9 0 0 1 0.9 0.9v1.8a0.9 0.9 0 0 1-0.9 0.9h-3.6Z' },
  halfmoon: { f: 'M40.4 21.4h3.8a0.8 0.8 0 0 1 0.8 0.8v0.6a1.6 1.6 0 0 1-1.6 1.6h-3Z' },
  pipe: { f: 'M40.6 29.2L46.2 30.8L46.2 28.4L49.8 28.4L49.8 33.2C49.8 34.8 46.6 34.8 46.2 33.2L40.6 30.9Z' },
  beard: { f: 'M24.6 31C27 35 31 37 35 36.6C38.4 36.2 40.4 34.4 41.4 30.6C42.6 35 42.2 39.6 38.6 41.6C34.8 43.6 29.4 42.6 26 39.6C24.4 37.4 24 34 24.6 31Z' },
  tache: { f: 'M40.6 27.4L43.6 28.2L42.8 29.2L40.6 28.9Z' },
  headset: { c: 'M19.6 21.4C19.6 13.6 24 10.2 29.6 10.2C34.4 10.2 37.8 13 38.8 17M25.2 25.6C30 30.6 35.4 31.6 40.2 30.6', f: 'M40 29.2h3.4a1.2 1.2 0 0 1 0 2.4H40Z' },
  steth: { c: 'M25.2 40.6C23.4 45.6 22.4 49.4 22.8 53.6M35 40.4C38.2 44.4 39.8 47.6 39.8 51M24.4 53.4C23.4 55.6 20.6 56 19.8 54', cc: [39.8, 53.6, 2.6] },
  lanyard: { c: 'M26 40.4L30.4 50.4L34.4 40.4M28.4 50.6h4.6v5.6h-4.6Z' },
  tie: { c: 'M26.6 40.2L30.2 46.6L33.4 40.2M30.2 46.6L28.6 57.6L30.2 60L31.8 57.6L30.2 46.6' },
  clipboard: { f: 'M40.6 43.2l11.8-2.4 2.8 15.4-11.8 2.4Z', c: 'M40.6 43.2l11.8-2.4 2.8 15.4-11.8 2.4ZM44.8 44.6l5-1M45.4 47.8l5-1M46 51l5-1' },
  watch: { cc: [42.2, 50.4, 2.4], c: 'M42.2 45.4v2.6' },
  pearls: { c: 'M24.6 41.6C27.2 45 33 45.2 35.8 41.4', dash: 1 },
  rosette: { cc: [42.6, 49.2, 3.2], f: 'M41.4 52.4l-1 5.4 2.2-1.6 2 1.6-0.8-5.4Z' },
  backpack: { f: 'M4 45C2.4 49 2 56 3 62L9.6 62L11.4 46Z', c: 'M20 41.4L12.6 60' },
  phone: { f: 'M31.6 21.6l3.2-1.2 3.4 9.8-3.2 1.2Z', c: 'M31.6 21.6l3.2-1.2 3.4 9.8-3.2 1.2Z' },
  gilet: { c: 'M30.2 40.6V64M24.6 40.8C22.6 46 20.6 50 17.6 53M35.6 40.8C37.8 46 40 50 43 53' },
  collar: { c: 'M26 40.2L30 44.6L34 40.2' }
};

// the cast: a look for each person; objects get their own drawings
const LOOKS = {
  bev: { body: 'narrow', hair: 'bob', acc: ['glasses', 'collar'] },
  hartley: { body: 'broad', hair: 'none', acc: ['pipe', 'steth'] },
  okoye: { body: 'narrow', hair: 'highbun', acc: ['steth'] },
  tom: { body: 'std', hair: 'quiff', acc: ['steth'] },
  maureen: { body: 'broad', hair: 'curly', acc: ['watch', 'collar'] },
  kayleigh: { body: 'narrow', hair: 'ponytail', acc: ['headset'] },
  raj: { body: 'std', hair: 'short', acc: ['beard', 'collar'] },
  kevin: { body: 'std', hair: 'combover', acc: ['glasses', 'tie'] },
  pratt: { body: 'broad', hair: 'flatcap', acc: ['collar'] },
  higgins: { body: 'narrow', hair: 'curly', acc: ['pearls'] },
  jay: { body: 'std', hair: 'hood', acc: [] },
  icb: { body: 'std', hair: 'side', acc: ['lanyard'] },
  pcn: { body: 'narrow', hair: 'ponytail', acc: ['lanyard'] },
  cqc: { body: 'narrow', hair: 'bun', acc: ['glasses', 'clipboard'] },
  lmc: { body: 'std', hair: 'short', acc: ['beard', 'glasses'] },
  accountant: { body: 'std', hair: 'none', acc: ['halfmoon', 'tie'] },
  apex: { body: 'std', hair: 'slick', acc: ['gilet'] },
  rowe: { body: 'narrow', hair: 'bob', acc: ['steth', 'pearls'] },
  reg: { body: 'narrow', hair: 'ponytail', acc: ['steth'] },
  ward: { body: 'std', hair: 'mop', acc: ['steth'] },
  med: { body: 'std', hair: 'mop', acc: ['backpack'] },
  mp: { body: 'broad', hair: 'combover', acc: ['rosette', 'tie'] },
  chemist: { body: 'std', hair: 'short', acc: ['tache', 'collar'] },
  rep: { body: 'std', hair: 'quiff', acc: ['tie'] },
  gavin: { body: 'std', hair: 'slick', acc: ['phone', 'lanyard'] },
  coroner: { body: 'std', hair: 'side', acc: ['tie'] },
  priya: { body: 'narrow', hair: 'long', acc: ['steth'] }
};
// what the player can be
const PLAYER_LOOKS = [
  { body: 'std', hair: 'short', acc: ['steth'] },
  { body: 'narrow', hair: 'bob', acc: ['steth'] },
  { body: 'std', hair: 'quiff', acc: ['steth', 'glasses'] },
  { body: 'narrow', hair: 'bun', acc: ['steth'] },
  { body: 'broad', hair: 'none', acc: ['steth', 'beard'] },
  { body: 'narrow', hair: 'curly', acc: ['steth'] },
  { body: 'narrow', hair: 'long', acc: ['steth', 'glasses'] },
  { body: 'std', hair: 'mop', acc: ['steth'] }
];
const PLAYER_COLOURS = ['#B8322A', '#2F6FB5', '#D07A1C', '#2C7A3A', '#6A3FA0', '#1F7F80', '#A8841E', '#A8325E'];
const DICE_LAST = ['Harcourt', 'Pemberton', 'Ashworth', 'Fairbrother', 'Mountjoy', 'Blenkinsop', 'Okafor', 'Vane', 'Gallagher', 'Thistlewood', 'Mehta', 'Llewellyn', 'Coombes', 'Featherstone', 'Oduya', 'Winterbottom', 'Pennington', 'Bhatt', 'Crabtree', 'Hollis'];

// objects and places, drawn on the same tile
const SIL_OBJ = {
  paper: 'M14 18h36v30a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4Z|M19 23h26M19 28h12M34 28h11v9H34ZM19 32h12M19 36h12M19 41h26M19 45h26',
  bank: 'M10 26L32 12L54 26ZM12 50h40v5H12ZM15 29h5v19h-5ZM24.5 29h5v19h-5ZM34.5 29h5v19h-5ZM44 29h5v19h-5Z|',
  dept: 'M10 26L32 13L54 26ZM12 50h40v5H12ZM15 29h5v19h-5ZM24.5 29h5v19h-5ZM34.5 29h5v19h-5ZM44 29h5v19h-5ZM31.2 4h1.6v10h-1.6ZM32.8 4h8l-2 3 2 3h-8Z|',
  landlord: 'M10 32L32 13L54 32V54H10Z|M27 54V41h10v13M16 38h7v6h-7ZM41 38h7v6h-7Z',
  deed: 'M16 12h30a4 4 0 0 1 4 4v34a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4ZM12 16a4 4 0 0 1 8 0v4h-8Z|M22 22h20M22 27h20M22 32h14M22 37h18M42.5 45.5a4.5 4.5 0 1 1-0.1 0Z',
  home: 'M22 17a5.6 5.6 0 1 1 0.1 0ZM13 64C13 44 17 34 22 34S31 44 31 64ZM42 30a4.2 4.2 0 1 1 0.1 0ZM35 64C35 50 38 43 42 43S49 50 49 64Z|',
  bankcard: '',
  hospital: 'M8 24h48v32H8ZM22 14h20v10H22Z|M29 16h6M32 13.6v8.8M14 30h7v6h-7ZM28.5 30h7v6h-7ZM43 30h7v6h-7ZM14 42h7v6h-7ZM43 42h7v6h-7ZM28 56V44h8v12',
  patient: 'M20 8h24a3 3 0 0 1 3 3v42a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3Z|M21 13h22v34H21ZM25 18h14v8H30l-3 3v-3h-2ZM27 51h10',
  cat: 'M22 58C18 46 20 34 28 30L26 20L31 25H37L42 20L41 31C47 36 48 48 44 58ZM44 56C52 56 56 50 54 44C53.4 50 49 53 44 53Z|',
  gerald: 'M32 12C44 12 52 22 52 34C52 46 44 54 32 54S12 46 12 34C12 22 20 12 32 12Z|M16 22H48M22 38C26 32 34 32 38 38C34 44 26 44 22 38ZM38 38L44 34V42ZM27 36.6a1 1 0 1 1 0.1 0Z',
  it: 'M10 12h44v30H10ZM28 42h8l2 8H26Z|M14 16h36v22H14ZM32 20.5a6.5 6.5 0 1 1-6.5 6.5',
  pcse: 'M10 18h44v30H10Z|M10 18L32 35L54 18M26 47L32 41L38 47',
  insurer: 'M14 24h36a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V28a4 4 0 0 1 4-4ZM24 18h16v6h-4v-2h-8v2h-4Z|M10 34h44',
  jobs: 'M10 18h44v30H10ZM50 5.5a6 6 0 1 1-0.1 0Z|M10 18L32 35L54 18',
  agency: 'M16 28C16 18 48 18 48 28L44 32L38 28V25H26V28L20 32ZM20 36h24l4 18H16Z|M32 41.5a4.5 4.5 0 1 1-0.1 0Z',
  you: ''
};

function silLook(look) {
  const L = look || PLAYER_LOOKS[0];
  let fill = SIL_BODY[L.body || 'std'] + SIL_HEAD + (SIL_HAIR[L.hair] || '');
  let cut = '', dots = '', circ = '';
  (L.acc || []).forEach(a => {
    const A = SIL_ACC[a]; if (!A) return;
    if (A.f) fill += A.f;
    if (A.c) { if (A.dash) dots += A.c; else cut += A.c; }
    if (A.cc) circ += `<circle cx="${A.cc[0]}" cy="${A.cc[1]}" r="${A.cc[2]}" fill="none" stroke="${SIL_TILE}" stroke-width="1.5"/>`;
  });
  return `<path d="${fill}" fill="${SIL_INK}"/>${cut ? `<path d="${cut}" fill="none" stroke="${SIL_TILE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}${dots ? `<path d="${dots}" fill="none" stroke="${SIL_TILE}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="0.1 2.4"/>` : ''}${circ}`;
}
function silObj(key) {
  const [f, c] = SIL_OBJ[key].split('|');
  return `<path d="${f}" fill="${SIL_INK}" fill-rule="evenodd"/>${c ? `<path d="${c}" fill="none" stroke="${SIL_TILE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}`;
}
// a portrait tile; `ring` is the character's colour, shown as a thin frame
function portraitSVG(key, size) {
  let inner;
  if (key === 'you' || key === 'player') inner = silLook(playerLook());
  else if (LOOKS[key]) inner = silLook(LOOKS[key]);
  else if (key === 'home') inner = `<g transform="translate(-8 4) scale(0.95)">${silLook({ body: 'narrow', hair: 'long', acc: [] })}</g><g transform="translate(30 26) scale(0.6)">${silLook({ body: 'narrow', hair: 'ponytail', acc: [] })}</g>`;
  else if (SIL_OBJ[key]) inner = silObj(key);
  else inner = silLook({ body: 'std', hair: 'short', acc: [] });
  const s = size || 48;
  const fig = LOOKS[key] || key === 'you' || key === 'player' || !SIL_OBJ[key];
  return `<svg class="sil" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect width="64" height="64" rx="10" fill="${SIL_TILE}"/>${fig ? `<g transform="translate(3.2 6.4) scale(0.9)">${inner}</g>` : inner}</svg>`;
}
function lookSrc() { return (typeof UI !== 'undefined' && (UI.screen === 'title' || !S)) ? UI.look : (S && S.look) || null; }
function playerLook() { const l = lookSrc(); return PLAYER_LOOKS[l ? l.s : 0] || PLAYER_LOOKS[0]; }
function playerColour() { const l = lookSrc(); return PLAYER_COLOURS[l ? l.c : 0] || PLAYER_COLOURS[0]; }
function diceName() { return DICE_LAST[Math.floor(_rand() * DICE_LAST.length)]; }

/* ---------- the surgery front: the practice's state at a glance ----------
 Five windows, one per meter. Lights dim as a meter falls, and the people inside change.
 A queue forms outside when appointments run short. Tap a window to see what's pulling that meter.
*/
const FACADE = {
  suburb: { wall: '#8E4F36', wall2: '#7A4330', trim: '#EDE3CC', roof: 'pitched', sign: '#1F3B2E' },
  town: { wall: '#A9A393', wall2: '#958F80', trim: '#E4E0D4', roof: 'flat', sign: '#23405A' },
  city: { wall: '#5A4336', wall2: '#4B372C', trim: '#CFC3AA', roof: 'parapet', sign: '#3A2A22' }
};
const WIN_LAYOUT = [
  { k: 'cash', x: 30, y: 62, w: 74, h: 52, label: 'OFFICE' },
  { k: 'team', x: 123, y: 62, w: 74, h: 52, label: 'STAFF ROOM' },
  { k: 'you', x: 216, y: 62, w: 74, h: 52, label: 'YOUR ROOM' },
  { k: 'patients', x: 30, y: 144, w: 100, h: 56, label: 'WAITING ROOM' },
  { k: 'safety', x: 198, y: 144, w: 92, h: 56, label: 'TREATMENT' }
];
function bustAt(look, x, y, sc, extra) { return `<g transform="translate(${x} ${y}) scale(${sc})${extra || ''}">${silLook(look).replace(new RegExp(SIL_TILE, 'g'), 'var(--winc)')}</g>`; }
function standFig(x, y, v) {
  const skirt = v % 3 === 1, hat = v % 4 === 2, brolly = v % 5 === 3;
  const body = skirt ? `M${x - 4.6} ${y - 18}C${x - 4.6} ${y - 22.6} ${x + 4.6} ${y - 22.6} ${x + 4.6} ${y - 18}L${x + 5.6} ${y - 7}H${x + 2.2}L${x + 2} ${y}H${x + 0.6}L${x} ${y - 6}L${x - 0.6} ${y}H${x - 2}L${x - 2.2} ${y - 7}H${x - 5.6}Z`
    : `M${x - 4.4} ${y - 18}C${x - 4.4} ${y - 22.6} ${x + 4.4} ${y - 22.6} ${x + 4.4} ${y - 18}L${x + 3.6} ${y - 8}L${x + 2.6} ${y}H${x + 0.6}L${x} ${y - 7}L${x - 0.6} ${y}H${x - 2.6}L${x - 3.6} ${y - 8}Z`;
  let s = `<circle cx="${x}" cy="${y - 25}" r="3.4"/><path d="${body}"/>`;
  if (hat) s += `<path d="M${x - 4.4} ${y - 26.4}h8.8v1.4h-8.8ZM${x - 2.8} ${y - 30.4}h5.6v4h-5.6Z"/>`;
  if (brolly) s += `<path d="M${x - 9} ${y - 31}C${x - 9} ${y - 38} ${x + 9} ${y - 38} ${x + 9} ${y - 31}Z"/><path d="M${x} ${y - 31}V${y - 16}" stroke="${SIL_INK}" stroke-width="1"/>`;
  return s;
}
function facadeSVG(c, opts) {
  opts = opts || {};
  const P0 = FACADE[S.practiceKey] || FACADE.town, closed = !!opts.closed;
  const st = S.st, ratio = c ? c.ratio : 1;
  const lvl = k => closed ? 0 : k === 'cash' ? (S.cash >= 0 ? 3 : S.cash >= S.overdraft / 2 ? 2 : 1) : st[k] >= 55 ? 3 : st[k] >= 35 ? 2 : st[k] > 18 ? 1 : 0;
  const glow = ['#2B2620', '#6E5A38', '#B8964E', '#F1D27C'];
  const winter = S.month >= 7 && S.month <= 10;
  const others = ['higgins', 'pratt', 'jay', 'med', 'icb', 'chemist', 'lmc', 'kevin'];
  let defs = `<defs><linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2433"/><stop offset="1" stop-color="#3E4658"/></linearGradient>`;
  WIN_LAYOUT.forEach(W => { defs += `<radialGradient id="fw-${W.k}" cx="0.5" cy="0.15" r="0.95"><stop offset="0" stop-color="${glow[lvl(W.k)]}"/><stop offset="1" stop-color="${glow[Math.max(0, lvl(W.k) - 1)]}"/></radialGradient>`; });
  defs += `</defs>`;
  let g = `<rect width="320" height="250" fill="url(#fsky)"/>`;
  // stars
  [[14, 12], [60, 26], [98, 9], [150, 20], [210, 8], [262, 24], [304, 12], [180, 32]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="0.9" fill="#E9E2C8" opacity=".7"/>`; });
  // building
  if (P0.roof === 'pitched') g += `<path d="M14 46L160 6L306 46Z" fill="#3A2C26"/><rect x="226" y="10" width="16" height="26" fill="${P0.wall2}"/><rect x="224" y="8" width="20" height="4" fill="#3A2C26"/>`;
  if (P0.roof === 'parapet') g += `<rect x="16" y="28" width="288" height="18" fill="${P0.wall2}"/><rect x="12" y="24" width="296" height="5" fill="${P0.trim}"/>`;
  if (P0.roof === 'flat') g += `<rect x="16" y="34" width="288" height="12" fill="#6F6A5E"/>`;
  g += `<rect x="20" y="44" width="280" height="190" fill="${P0.wall}"/>`;
  // brick courses
  for (let y = 50; y < 232; y += 7) g += `<path d="M20 ${y}H300" stroke="${P0.wall2}" stroke-width="0.8" opacity=".6"/>`;
  g += `<rect x="20" y="126" width="280" height="6" fill="${P0.trim}" opacity=".85"/>`;
  // fascia sign above the door
  const sw = Math.max(96, prac().surgery.length * 5.3 + 18);
  g += `<rect x="${160 - sw / 2}" y="${P0.roof === 'flat' ? 34 : 30}" width="${sw}" height="13" rx="2" fill="${P0.sign}" stroke="${P0.trim}" stroke-width="1"/><text x="160" y="${P0.roof === 'flat' ? 43.4 : 39.4}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="7.4" font-weight="700" fill="#EFE3B8" letter-spacing=".6">${esc(prac().surgery.toUpperCase())}</text>`;
  // windows
  WIN_LAYOUT.forEach(W => {
    const L = lvl(W.k), v = W.k === 'cash' ? null : Math.round(st[W.k]);
    let inner = '';
    const base = W.y + W.h;
    const winc = glow[L];
    if (!closed) {
      if (W.k === 'patients') {
        const n = ratio < 0.85 ? 6 : ratio < 0.95 ? 5 : ratio < 1.02 ? 4 : 3;
        for (let i = 0; i < n; i++) inner += bustAt(LOOKS[others[i % others.length]], W.x + 2 + i * (W.w - 22) / Math.max(1, n - 1), base - 26 - (i % 2) * 2, 0.36);
        if (!S.flags.geraldGone && S.practiceKey) inner += `<g transform="translate(${W.x + W.w - 16} ${W.y + 8})"><rect width="12" height="9" rx="1.5" fill="#6E9FAE" opacity=".8"/><path d="M4 4.4c1.6-1.6 3.6-1.6 5 0-1.4 1.6-3.4 1.6-5 0Z" fill="#E08A2E"/></g>`;
      }
      if (W.k === 'team') {
        const n = st.team >= 65 ? 4 : st.team >= 45 ? 3 : st.team >= 25 ? 2 : 1;
        const cast = ['kayleigh', 'maureen', 'raj', 'bev'];
        for (let i = 0; i < n; i++) inner += bustAt(LOOKS[cast[i]], W.x + 4 + i * (W.w - 26) / Math.max(1, n - 1 || 1), base - 26, 0.36, i % 2 ? ' translate(64 0) scale(-1 1)' : '');
      }
      if (W.k === 'you') {
        const slump = st.you < 35 ? ' rotate(14 32 40)' : '';
        inner += bustAt(playerLook(), W.x + W.w / 2 - 14, base - 30, 0.44, slump);
        inner += `<path d="M${W.x + 6} ${base - 6}h${W.w - 12}v6h-${W.w - 12}Z" fill="${SIL_INK}"/><path d="M${W.x + 12} ${base - 6}v-10M${W.x + 9} ${base - 17}l3-4 3 4Z" stroke="${SIL_INK}" stroke-width="1.4" fill="${SIL_INK}"/>`;
      }
      if (W.k === 'safety') {
        inner += `<path d="M${W.x + 8} ${base - 12}h${W.w * 0.55}v4h-${W.w * 0.55}ZM${W.x + 10} ${base - 8}v8M${W.x + 6 + W.w * 0.55} ${base - 8}v8" stroke="${SIL_INK}" stroke-width="2" fill="${SIL_INK}"/>`;
        inner += bustAt(LOOKS.maureen, W.x + W.w - 34, base - 28, 0.4, ' translate(64 0) scale(-1 1)');
        if (st.safety < 35) inner += `<path d="M${W.x + 14} ${W.y + 20}l7-12 7 12Z" fill="#D8412F"/><path d="M${W.x + 21} ${W.y + 12.4}v4" stroke="#fff" stroke-width="1.6"/>`;
      }
      if (W.k === 'cash') {
        inner += bustAt(LOOKS.bev, W.x + 20, base - 28, 0.4);
        inner += `<path d="M${W.x + 4} ${base - 6}h${W.w - 8}v6h-${W.w - 8}Z" fill="${SIL_INK}"/>`;
        if (S.cash < 0) inner += `<g transform="rotate(-8 ${W.x + 56} ${W.y + 14})"><rect x="${W.x + 48}" y="${W.y + 8}" width="16" height="12" fill="#EDE6D2"/><path d="M${W.x + 50} ${W.y + 12}h12M${W.x + 50} ${W.y + 15.4}h9" stroke="#C0392B" stroke-width="1.4"/></g>`;
      }
    }
    // light spilling from the ceiling lamp
    const lamp = L >= 2 && !closed ? `<path d="M${W.x + W.w / 2 - 4} ${W.y + 6}L${W.x + 6} ${base}H${W.x + W.w - 6}L${W.x + W.w / 2 + 4} ${W.y + 6}Z" fill="#FFF3C4" opacity="${L === 3 ? 0.22 : 0.1}"/><path d="M${W.x + W.w / 2} ${W.y}v4" stroke="${SIL_INK}" stroke-width="1"/><path d="M${W.x + W.w / 2 - 4} ${W.y + 7}a4 3 0 0 1 8 0Z" fill="${SIL_INK}"/>` : '';
    const panes = `<path d="M${W.x + W.w / 3} ${W.y}V${base}M${W.x + 2 * W.w / 3} ${W.y}V${base}M${W.x} ${W.y + W.h / 2}H${W.x + W.w}" stroke="${P0.trim}" stroke-width="1.6" opacity=".9"/>`;
    const lab = W.k === 'cash' ? `BANK ${fmtK(S.cash).replace('.0k', 'k')}` : `${W.label} ${v}`;
    const live = c && !closed;
    g += `<g class="fwin${live ? '' : ' still'}" ${live ? `data-act="win" data-arg="${W.k}" role="button" tabindex="0" aria-label="${esc(W.k === 'cash' ? 'Bank: ' + fmtK(S.cash) : STAT_LABEL[W.k] + ': ' + v)}. Show what is pulling it."` : ''} style="--winc:${winc}">
      <rect x="${W.x - 3}" y="${W.y - 3}" width="${W.w + 6}" height="${W.h + 6}" fill="${P0.trim}"/>
      <rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="url(#fw-${W.k})"/>
      ${lamp}${inner}${panes}
      <rect x="${W.x - 5}" y="${base + 3}" width="${W.w + 10}" height="10" rx="1.5" fill="${P0.trim}"/>
      <text x="${W.x + W.w / 2}" y="${base + 10.6}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="6.6" font-weight="600" fill="${L <= 1 && !closed ? '#A33A2A' : '#3B3226'}" letter-spacing=".4">${esc(lab)}</text>
    </g>`;
  });
  // door
  const dx = 144, dy = 146;
  g += `<rect x="${dx - 4}" y="${dy - 8}" width="48" height="90" rx="3" fill="${P0.trim}"/><path d="M${dx} ${dy + 4}a20 12 0 0 1 40 0Z" fill="${closed ? '#2B2620' : '#E9CF82'}" opacity=".9"/>
    <rect x="${dx}" y="${dy + 6}" width="40" height="76" fill="${closed ? '#2A2622' : P0.sign}"/><circle cx="${dx + 32}" cy="${dy + 44}" r="1.8" fill="#D8B45A"/>
    <rect x="${dx + 8}" y="${dy + 16}" width="24" height="7" rx="1" fill="#D8B45A"/>`;
  if (closed) g += `<g transform="rotate(-6 ${dx + 20} ${dy + 42})"><rect x="${dx + 2}" y="${dy + 32}" width="36" height="20" fill="#EFE8D6"/><text x="${dx + 20}" y="${dy + 41}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="6" font-weight="700" fill="#B3321F">CLOSED</text><text x="${dx + 20}" y="${dy + 48}" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="3.6" fill="#333">ASK THE ICB</text></g>`;
  // pavement, railings, queue
  g += `<rect x="0" y="234" width="320" height="16" fill="#8C877B"/><path d="M0 234H320" stroke="#B9B3A3" stroke-width="1.2"/>`;
  const queue = closed ? 0 : ratio < 0.8 ? 7 : ratio < 0.88 ? 5 : ratio < 0.95 ? 3 : ratio < 1 ? 1 : 0;
  let q = '';
  for (let i = 0; i < queue; i++) q += standFig(196 + i * 16, 244, i + S.month);
  if (queue) g += `<g fill="${SIL_INK}">${q}</g>`;
  if (winter && queue) for (let i = 0; i < 26; i++) { const x = (i * 37) % 320, y = (i * 53) % 230; g += `<path d="M${x} ${y}l-2 6" stroke="#B9C6D6" stroke-width="0.8" opacity=".55"/>`; }
  // the car park cat
  if (S.seen && S.seen.cat) g += `<path d="M12 234c-1-5 0-9 3-10l-0.6-3 2 1.6h2.4l2-1.6-0.4 3.2c2 2 2.2 6 1.6 9.8Zm11 0c4 0 5.4-3 4.4-5.4-0.4 2.6-2.2 3.8-4.6 3.6Z" fill="${SIL_INK}"/>`;
  // a portakabin once you've added rooms
  if (S.rooms > (prac().rooms || 0)) g += `<rect x="300" y="208" width="20" height="26" fill="#D5CFBE"/><rect x="304" y="214" width="12" height="8" fill="${glow[2]}"/>`;
  return `<svg class="facade" viewBox="0 0 320 250" role="img" aria-label="${esc(prac().surgery)} at night. Each lit window is one of your meters.">${defs}${g}</svg>`;
}
function brassPlate() {
  const names = ['Dr ' + S.name].concat(Object.keys(S.partners).filter(id => isActive(id))
    .map(id => 'Dr ' + PARTNERS0[id].name.split(' ').pop()));
  const gone = Object.keys(S.partners).filter(id => S.partners[id].status === 'left').map(id => 'Dr ' + PARTNERS0[id].name.split(' ').pop());
  (S.lineage || []).slice().reverse().forEach(x => gone.unshift('Dr ' + x.n));
  return `<div class="brass"><span class="brass-t">Partners</span> ${names.map(n => `<b>${esc(n)}</b>`).join('<i>·</i>')}${gone.map(n => `<i>·</i><s>${esc(n)}</s>`).join('')}${S.cqc ? `<span class="brass-cqc">CQC: ${esc(RATE_NAME[S.cqc.overall])}</span>` : ''}</div>`;
}

/* ---------- the year's brief: four numbers ---------- */
function briefHTML(months) {
  const st = S.st, ks = STAT_KEYS.slice().sort((a, b) => st[a] - st[b]);
  const weak = ks[0], strong = ks[ks.length - 1], best = Math.max(bestMonths(), months);
  const tile = (l, v, cls) => `<div class="btile"><span>${esc(l)}</span><b class="${cls || ''}">${v}</b></div>`;
  return `<section class="brief-tiles" aria-label="Your time as a partner">
    ${tile('Time as a partner', `${months} month${months === 1 ? '' : 's'}`)}
    ${tile('Personal best', `${best} month${best === 1 ? '' : 's'}`)}
    ${tile('Most fragile', `${STAT_LABEL[weak]} ${Math.round(st[weak])}`, 'bad-t')}
    ${tile('Strongest', `${STAT_LABEL[strong]} ${Math.round(st[strong])}`, 'good-t')}
  </section>${avgLineHTML(months)}`;
}

/* ---------- the Partners' Board: an honours board of every run in this browser ---------- */
function plaqueRow(x, i) {
  const look = PLAYER_LOOKS[x.look ? x.look.s : 0] || PLAYER_LOOKS[0], col = PLAYER_COLOURS[x.look ? x.look.c : 0] || PLAYER_COLOURS[0];
  const pr = PRACTICES[x.p] ? PRACTICES[x.p].surgery : '';
  return `<li class="plq${S && x.id === S.runId ? ' me' : ''}"><span class="plq-n">${i + 1}</span><span class="portrait sm" style="--ring:${col}"><svg viewBox="0 0 64 64" width="40" height="40"><rect width="64" height="64" rx="10" fill="${SIL_TILE}"/><g transform="translate(3.2 6.4) scale(0.9)">${silLook(look)}</g></svg></span><span class="plq-t"><b>Dr ${esc(x.n)}</b><small>${esc(pr)} · ${esc(x.how)}</small></span><span class="plq-m">${x.months}<small>months</small></span></li>`;
}
function partnersBoardHTML(limit) {
  const b = loadPlaques();
  if (!b.length) return `<div class="honours"><div class="honours-h">The Partners' Board</div><p class="honours-empty">No names yet. Every partner you play gets a line here, however briefly they served.</p></div>`;
  return `<div class="honours"><div class="honours-h">The Partners' Board<small>Those who served. Some briefly.</small></div><ol class="plqs">${b.slice(0, limit || 12).map(plaqueRow).join('')}</ol></div>`;
}

/* ---------- a picture to share ---------- */
function shareSVG() {
  const over = S.phase === 'over', E = S.end;
  const months = over ? S.over.months : E.months;
  const title = over ? OVER[S.over.k].title : E.arche.t;
  const col = playerColour();
  const head = over ? `lasted ${months} month${months === 1 ? '' : 's'} at` : S.yr ? `survived ${months} months at` : `survived a year at`;
  const bars = STAT_KEYS.map((k, i) => { const v = Math.round(S.st[k]); const y = 412 + i * 40; return `<text x="560" y="${y + 17}" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#C9CFDA">${STAT_LABEL[k]}</text><rect x="690" y="${y}" width="360" height="20" rx="10" fill="#2F3A4C"/><rect x="690" y="${y}" width="${3.6 * v}" height="20" rx="10" fill="${v <= 20 ? '#E0604E' : v <= 35 ? '#E3A43E' : '#5CBF90'}"/><text x="1070" y="${y + 18}" font-family="Menlo, Consolas, monospace" font-size="22" font-weight="700" fill="#EFE7D0">${v}</text>`; }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <rect width="1200" height="675" fill="#1B2433"/>
    <rect x="60" y="80" width="440" height="440" rx="44" fill="${col}"/>
    <g transform="translate(72 92) scale(6.5)"><rect width="64" height="64" rx="8" fill="${SIL_TILE}"/><g transform="translate(3.2 6.4) scale(0.9)">${silLook(playerLook())}</g></g>
    <text x="560" y="130" font-family="Menlo, Consolas, monospace" font-size="22" letter-spacing="4" fill="#C9A24B">LAST PARTNER STANDING</text>
    <text x="560" y="210" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="700" fill="#F4EEDD">Dr ${esc(S.name)}</text>
    <text x="560" y="262" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="#C9CFDA">${esc(head)}</text>
    <text x="560" y="304" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="700" fill="#F4EEDD">${esc(prac().surgery)}</text>
    <rect x="560" y="336" width="${Math.min(600, title.length * 17 + 40)}" height="54" rx="8" fill="${over ? '#8E2A1F' : '#C9A24B'}"/>
    <text x="580" y="372" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="700" fill="${over ? '#FBEDEA' : '#2B1F0C'}">${esc(title)}</text>
    ${bars}
    ${BD.stats ? `<text x="60" y="570" font-family="Georgia, 'Times New Roman', serif" font-size="24" fill="#C9CFDA">The average partner lasts ${Math.round(BD.stats.avg_months)} months.</text>` : ''}
    <text x="60" y="610" font-family="Menlo, Consolas, monospace" font-size="24" fill="#C9CFDA">How long can you last? <tspan fill="#F2D449" font-weight="700">last-partner-standing.vercel.app</tspan></text>
  </svg>`;
}
function openShareImage() {
  const svg = shareSVG();
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 675;
    cv.getContext('2d').drawImage(img, 0, 0);
    cv.toBlob(blob => {
      if (!blob) { toast('Couldn\'t make the picture here.'); return; }
      const url = URL.createObjectURL(blob);
      const file = typeof File === 'function' ? new File([blob], 'last-partner-standing.png', { type: 'image/png' }) : null;
      const canShare = file && navigator.canShare && navigator.canShare({ files: [file] });
      // inside a Claude Artifact the page is framed and can't offer downloads, so point to the website instead
      let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
      const acts = framed
        ? `<p class="muted">To save or share it, play at <a href="https://last-partner-standing.vercel.app" target="_blank" rel="noopener">last-partner-standing.vercel.app</a>.</p><div class="row-actions"><button class="btn primary" data-act="close">Close</button></div>`
        : `<div class="row-actions">${canShare ? '<button class="btn primary" data-act="shareimg-go">Share</button>' : ''}<a class="btn${canShare ? '' : ' primary'}" href="${url}" download="last-partner-standing.png">Save image</a><button class="btn ghost" data-act="close">Close</button></div>`;
      openOverlay(`<h2>Your picture</h2><img class="share-img" src="${url}" alt="Dr ${esc(S.name)} at ${esc(prac().surgery)}">${acts}`);
      UI.shareFile = file;
    }, 'image/png');
  };
  img.onerror = () => toast('Couldn\'t make the picture here.');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
