# Last Partner Standing: the trailer

A 75-second film, 1280×720 at 30 fps, drawn live in the browser with the game's own art (`src/c3-art.js`) and data (`src/c-data.js`). The same frames become `trailer.mp4`.

The one idea: **the surgery front is the game**. Five lit windows are the five meters. As the year goes wrong the lights dim, the staff room empties, you slump at your desk, a queue forms in the rain, and the names come off the brass plate until one is left.

## Scenes

| File | Time | Scene | What happens |
|---|---|---|---|
| `s1-deed.js` | 0–8 s | Day one | 7:59am on 1 April 2026. The windows light up one by one. Your name is engraved on the brass plate. "You've just signed the partnership deed." (Done: the reference scene.) |
| `s2-windows.js` | 8–18 s | Five windows | Each window is picked out and named as a meter. "Five things to keep alive, including you." |
| `s3-year.js` | 18–40 s | The year | The HUD strip and the month pills run April to February. Six real cards are dealt. The meters fall and the front shows it. |
| `s4-partners.js` | 40–52 s | The brass plate | Dr Hartley retires, Dr Okoye goes to Perth, their names are struck through. The partnership deed: last partner standing. |
| `s5-numbers.js` | 52–60 s | The numbers are real | Three real figures with their sources. |
| `s6-endings.js` | 60–68 s | Two endings | Survived, technically, or the doors close. The Partners' Board. "How long can you last?" |
| `s7-endcard.js` | 68–75 s | End card | The logo, the line, the address. |

Durations are fixed. The scene's `dur` must be exactly the figure above, so the total stays 75 s.

## Cast and constants

- **You**: Dr Ashworth (`TR.NAME`), look `PLAYER_LOOKS[0]` (short hair, stethoscope), colour `PLAYER_COLOURS[1]` (`#2F6FB5`). `TR.portrait('you')` draws it.
- **The practice**: Riverside Surgery, Bramleigh, the market town (`PRACTICES.town`, `TR.PRACTICE`). Starts with Patients 48, Team 52, You 64, Safety 52, bank £30k, overdraft limit −£75k.
- **The partners**: you, Dr Alan Hartley (senior partner, 62, `hartley`) and Dr Nadia Okoye (`okoye`).
- **The team, as the game draws them**: Bev Marsh (practice manager, the office window), Kayleigh Dunn (reception), Maureen Kelly (lead practice nurse, the treatment room), Raj Mistry (pharmacist). Gerald the goldfish lives in the waiting room.

## Look and feel

- **Only the game's drawings.** The surgery front comes from `TR.facade()` (the game's `facadeSVG`), people from `TR.portrait()` / `silLook()`, colours from `CAST`. Anything new you draw must match: flat dark silhouettes (`#1E1B16`) on cream (`#EFE7D0`), lamp-lit windows, the night sky `#1B2433` to `#3E4658`. No emoji, no clip art, no gradients beyond the game's own.
- **Type.** Big lines: `.tr-cap` (Bricolage Grotesque 800, cream `#F4EEDD`). Small labels and dates: `.tr-kick` (IBM Plex Mono, yellow `#F2D449`, uppercase). Body text: Atkinson Hyperlegible. The brass plate: Georgia.
- **Colours on the stage**: cream `#F4EEDD`, dim `#C9CFDA`, highlight yellow `#F2D449`, stamp red `#BF3A2C`, brass `#C9A24B`, the game's green `#1D6A4D`. Cards use the game's light card (`TR.cardHTML`), always light.
- **Motion.** Entrances ease out, exits ease in, 0.3 to 0.6 s. Nothing bounces more than `TR.ease.back`. Camera moves are slow (`inOut`, 1 s or more). Hold every line long enough to read: at least 1.2 s plus 0.3 s a word. At most about 10 words of big text on screen at once.
- **Safe area.** Keep text at least 40 px from the stage edges.
- **Tone** (from the game's writing rules). Humour punches up at systems and paperwork, never at patients or reception staff. Real rules and numbers, fictional people and practices. No named politicians. Clinical content stays generic.

## Facts you may use

Use only these, word for word where quoted. They come from the game's cards (tag in brackets) and `SOURCES` in `src/c-data.js`. Card titles must be the game's exact titles.

- Contract day [real, S1 S2 S25], who `dept` (The Department): "The new contract has landed. Global sum up 5.5% to £130.07 per weighted patient. Online requests can no longer be capped."
- Monday, 8:02am [rule, S1 S26], who `patient` (Online request): "Online requests can't be capped any more. There are 212 already. One of them just says "hello?""
- The fish tank [Fiction], who `gerald`: "A CQC inspector asked a practice for the risk assessment for its waiting-room fish tank." Bev looks at Gerald, a goldfish who has outlived three practice managers.
- Four thousand letters [real, S95 S96 S97], who `hospital` (St Swithin's Hospital): "Two years of clinic letters were never sent to GPs. At 9am the fault sent all of them at once. Docman shows 4,212 new documents."
- Queue in the rain [Fiction], who `kayleigh`: "It's 7:40am and there are 30 people queuing outside in the rain. Someone has brought a camping chair."
- Payroll day [real, S23], who `bank` (The bank): "Payroll is due and you're past the £75k overdraft limit. The bank will extend it by £60,000 if every partner signs a personal guarantee."
- Six months' notice [real, S23 S43], who `hartley`: "I'm retiring at the end of September. Six months' notice, as the deed requires."
- Just a joke [real], who `okoye`: Nadia forwards a job advert. "Perth, Western Australia: A$200 an hour guaranteed for six months." "Ha! As if!"
- G'day from the future [Fiction], who `okoye`: "Nadia's last day. She leaves a card on your desk: "Sorry, not sorry. Come and visit.""
- Last partner standing [real, S23 S43], who `deed` (The partnership deed, "Clause 31: last partner standing"): "You're the last partner standing. Every lease, loan and redundancy is now yours alone, with unlimited liability. The brass plate has one name on it."
- Year-end title: "Survived. Technically." Game-over titles: "Burnt out" (You), "Unlimited liability" (the bank), "Nobody came in" (Team), "Special measures" (Safety), "Contract terminated" (Patients).
- £130.07: the global sum per weighted patient, 2026/27. Source: DHSC, GMS Statement of Financial Entitlements Directions 2026 (S3); BMA (S2).
- 15%: employer National Insurance, with no Employment Allowance for GP practices. Sources: BMA (S19), HMRC (S20).
- −17%: GP partners under 40 in England, in the 15 months to September 2025. Source: Institute for Government, Performance Tracker 2025 (S83).
- £164,200: the average GP partner's income before tax, 2024/25. Source: NHS England Digital (S8).

## The engine (read `trailer/t-engine.js`, it is short)

A scene is one file that calls `TR.css(...)` for its styles (prefix every class with the scene's id, like `.s3-...`) and `TR.scene({...})`:

```js
TR.scene({
  id: 's3-year', title: 'The year', dur: 22,
  lines: ['What is seen and said, in one or two short sentences each, for the chapter list under the player.'],
  fadeIn: 0, fadeOut: 0,          // optional, seconds, fades the whole scene from and to black
  build(root) { /* make the DOM once; keep references on root */ },
  update(lt, root) { /* set everything from lt, 0..dur */ }
});
```

Rules that keep the film deterministic (the MP4 is captured frame by frame, and viewers can scrub backwards):

- `update(lt)` must set every animated property from `lt` alone: no state carried over from the previous frame, no `Date`, no `Math.random` (use `TR.rnd(seed)`), no CSS animations or transitions, no timers.
- Write through the change-only helpers (`TR.pose`, `TR.text`, `TR.html`, `TR.cam`, `TR.facade`, `TR.hudSet`, `TR.brass`) so frames stay cheap. Keep each frame under about 16 ms (`--check` reports the slowest).
- Build DOM once in `build`; don't rebuild it every frame.

Helpers: `TR.seg(x, a, b)` progress 0..1; `TR.kf(x, [[t, v], ...], ease)` keyframes for numbers or objects of numbers; `TR.window(x, a, b, fadeIn, fadeOut)` in-hold-out opacity; `TR.type(text, p)` typewriter; `TR.ease.{lin,in,out,inOut,back}`; `TR.el(tag, cls, html, parent)`; `TR.place(el, {x, y, w, h})`; `TR.pose(el, {x, y, s, r, o})` transform and opacity.

The surgery front: `TR.facade(el, {st, cash, month, ratio, lo, closed, geraldGone, partners})` redraws it from a world state (see `TR.world`). `TR.cam(el, cam)` places it; `TR.street(el, cam)` paints a full-width street behind it that lines up (sky, stars, pavement, road). Camera presets `TR.CAM.FULL` and `TR.CAM.LEFT`; `TR.camLerp`, `TR.camOn(fx, fy, w, sx, sy)` to zoom on a point, `TR.camPt(cam, fx, fy)` to find a facade point on the stage. `TR.WINDOWS` gives each window's box in facade units (320 × 250).

What the front shows, from the game's rules (so you can drive it):

- Window light: a meter at 55 or more is bright, 35 to 54 warm, 19 to 34 dim, 18 or less dark. The office follows the bank: bright in credit, warm down to half the overdraft limit (−£37.5k), dim beyond.
- Staff room people: 4 at Team 65+, 3 at 45+, 2 at 25+, else 1. Your room: you slump at You below 35. Treatment room: a red warning sign at Safety below 35. Office: a red letter on Bev's desk when the bank is below zero.
- `ratio` is appointments against demand. The queue outside: none at 1.0 or more, 1 below 1.0, 3 below 0.95, 5 below 0.88, 7 below 0.8. The waiting room fills (3 to 6 people) as it falls. Rain falls in December to February (`month` 7 to 10 counts as winter) when there's a queue.
- `closed: true` draws the building shut, with CLOSED / ASK THE ICB on the door.

Components drawn like the game: `TR.cardHTML({who, title, text, tag, stamp})` (a card with the portrait, name, role, a red stamp such as `OCT · 1/3`, the title and a tag pill); `TR.hud(el)` then `TR.hudSet(el, {st, cash, month})` (the HUD strip: name, month, the 12 month pills and five meters); `TR.brass(el, [{n, engrave, strike, o}])` (the brass plate: engrave reveals a name, strike draws a line through it).

## Continuity

Scenes cut or fade into each other. Where the front carries on across a cut, it must match exactly.

- **s1 ends / s2 starts / s2 ends / s3 starts**: `TR.CAM.FULL`, every window lit (`lo` not set), `TR.world()` defaults (Patients 48, Team 52, You 64, Safety 52, bank £30k, month 0, ratio 1, both partners active), the brass plate under the front with all three names, no captions or callouts on screen. Draw the brass plate exactly as s1 does: `TR.place(el, {x: cam.x, y: cam.y + 250 * cam.w / 320, w: cam.w})`.
- **s3** moves from `TR.CAM.FULL` to `TR.CAM.LEFT` in its first second as the HUD strip slides down from the top, and the brass plate slides away. It ends on `TR.CAM.LEFT` in February 2027 (month 10) with Patients 33, Team 39, You 25, Safety 34, bank −£78k, ratio 0.84, raining.
- **s4** cuts in on the brass plate close up, in the same February night (Patients 33, Team 39, You 25, Safety 34, bank −£78k, ratio 0.84: dim windows, rain), and fades out to black over its last 0.6 s.
- **s5** fades in and out (0.4 s each).
- **s6** fades in from black. **s7** may cut or cross from s6's last frame; it holds its final frame still for the last 1.5 s.

### s3: the year, beat by beat

Six cards, one after another, dealt onto the right half of the stage (the front sits on the left at `TR.CAM.LEFT`, the HUD strip across the top). Each card deals in, holds long enough to read its title and first line, and then the meters move: the HUD bars and numbers slide to the next values and the front changes with them. The month pills tick through the year. Trim card text to its first sentence or two if needed, but keep the words as given.

| Beat | Month shown | Card | Meters after it (Patients, Team, You, Safety, bank, ratio) |
|---|---|---|---|
| start | April (0) | | 48, 52, 64, 52, £30k, 1.00 |
| 1 | April (0) | Contract day | 46, 50, 60, 51, £24k, 0.98 |
| 2 | June (2) | Monday, 8:02am | 42, 47, 55, 49, £12k, 0.93 |
| 3 | July (3) | The fish tank (choice: write Gerald a risk assessment) | 42, 49, 54, 50, £12k, 0.95 |
| 4 | October (6) | Four thousand letters | 40, 43, 44, 38, −£34k, 0.90 |
| 5 | December (8) | Queue in the rain | 33, 39, 33, 34, −£78k, 0.84 |
| 6 | February (10) | Payroll day (choice: sign the personal guarantee) | 33, 39, 25, 34, −£78k, 0.84 |

On the two choice cards the meters move by exactly the game's effects for the choice taken (the risk assessment: Team +2, You −1, Safety +1; the guarantee: You −8). The bank passes the £75k overdraft limit in December, because that is what deals Payroll day in the game.

The card's red stamp shows the month (`APR`, `JUN`, `JUL`, `OCT`, `DEC`, `FEB`). By the end: the queue is five long in the rain, you are slumped, the treatment room has its warning sign, Bev has a red letter.

### s4: the brass plate

1. The plate, close up and large, in front of the dim front at night: Dr Ashworth · Dr Hartley · Dr Okoye.
2. "Six months' notice" (Dr Hartley). A stamp or kicker `SEPTEMBER`. His name is struck through.
3. "G'day from the future" (Dr Okoye; you may open with a glimpse of "Just a joke", the Perth advert). A kicker `NOVEMBER`. Her name is struck through.
4. The partnership deed: "Last partner standing", with its line about unlimited liability. One name left on the plate. The other windows may go dark around yours. Fade to black.

### s5: the numbers are real

A dark screen (the game's dark paper, `#0D1712`, may carry the game's diagonal hatch). A kicker line: "The practice is fictional. The numbers are real." Then three figures, one at a time, each big (Bricolage 800), with one line saying what it is and a small mono source line: £130.07, 15%, −17% (see Facts). Figures may count up.

### s6: two endings

31 March 2027, or before it. Two fronts side by side: one lit, under a gold banner "Survived. Technically."; one closed (`closed: true`) under a red banner "Burnt out". Then the Partners' Board, the game's honours board (dark wood `#5A3B24` to `#4A2F1C`, gold `#E4C66E` Georgia title "The Partners' Board", italic "Those who served. Some briefly."), with three or four rows: portrait, "Dr Name", practice and how it ended, months served. Use Dr Ashworth, Riverside Surgery, and fictional surnames from `DICE_LAST`, practices from `PRACTICES`, endings from the list above. The line: "How long can you last?"

### s7: end card

The logo as the title screen sets it: "Last / Partner / Standing" in Bricolage Grotesque 800, "Standing" underlined in yellow (`#F2D449`), the small red rotated "Rx" stamp after "Partner". Under it: "A year on England's 2026/27 GP contract, then as many more as you can survive." Then the address, big and clear: `last-partner-standing.vercel.app`, with "Free, in your browser." Small print: "Fictional practices and people. Real rules. Not affiliated with the NHS, the BMA or any government body." It may sit on the night street with the lit front small beside it, or on the game's paper green (`#E3EDE1` with the hatch). The last 1.5 s are still.

## Checking your scene

```sh
node last-partner-standing/tools/trailer-render.mjs --only s3 --check                 # every frame at 10 fps, forwards and backwards: page errors, slowest frame
node last-partner-standing/tools/trailer-render.mjs --only s3 --scene s3 --every 0.5 --sheet /path/sheet.png   # contact sheets, 24 frames each
node last-partner-standing/tools/trailer-render.mjs --only s3 --at 1,5.5,12 --out /path/dir                    # full-size frames
node last-partner-standing/tools/trailer-render.mjs --only s1,s3 --list               # with another scene, to compare the cut
```

`--only` assembles just the scenes you name (each file then starts at time 0 in that page), so someone else's half-written scene can't break yours. Without `--only` it assembles every scene in `scenes/`.
