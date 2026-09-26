# GP-Games

## last-partner-standing/

A single-page vanilla JS game with no dependencies. The only build step is concatenation.

- Edit the files in `src/`, then run `sh last-partner-standing/build.sh`. It writes two files, both committed. Never hand-edit them.
  - `last-partner-standing.html` is the Claude Artifact source. It has no doctype, head or body tags, because the Artifact publish step adds them.
  - `last-partner-standing-play.html` is the standalone copy, with doctype, charset and viewport. Players open this one.
- Check the layout on phones as well as desktop. Below 640px the month plan gets a fixed Start bar, the staff list starts collapsed and the mini-games hide the meters. On touch screens the keyboard hints are hidden.
- After changing numbers, events or the engine, run the balance check: `node last-partner-standing/tools/simulate.mjs 200` (optional arguments: `suburb|town|city|all` and `random|smart|both`). It plays whole years headlessly and reports survival, endings, profit share and final meters.
- Deploy: the Vercel project `gp-games` (team john-g-projects) is linked to this GitHub repo. A push to `main` deploys to production at https://gp-games.vercel.app. A push to any other branch builds a preview, which can be promoted to production from Vercel. `vercel deploy --prod --yes` from the repo root still works by hand. Commit the rebuilt HTML, because Vercel doesn't run `build.sh`.
  - `vercel.json` rewrites `/` and `/last-partner-standing` to the playable file.
  - `.vercelignore` keeps source, tools and docs out of the deployment.
  - The website is an installable app: `manifest.webmanifest` and the icons (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, rendered by `tools/og-card.mjs`), and `sw.js`, served at `/sw.js` by a rewrite so it controls the whole site. It fetches the page fresh when online and serves the cached copy offline; it never caches the leaderboard. It registers only on vercel.app over https, not in the Artifact. Bump `CACHE` in `sw.js` if its caching rules change.
  - Rebuild before deploying.
  - Link previews: `build.sh` writes Open Graph and `twitter:card` (`summary_large_image`) tags into the playable file, plus the favicon and `apple-touch-icon.png`, both from `src/icon.svg` (a GP with a stethoscope standing on the logo's yellow line). The preview image is `last-partner-standing/og.png` (1200×630), rendered from `tools/og-card.html` by `node last-partner-standing/tools/og-card.mjs` (needs Playwright; set `CHROMIUM` to a Chromium path). `og:url` is https://last-partner-standing.vercel.app and the image URL points at gp-games. Re-render and commit the PNGs if the card changes.
  - https://last-partner-standing.vercel.app (the Vercel project `last-partner-standing`) is a proxy. It holds only `vercel-proxy/last-partner-standing/vercel.json`, which rewrites every request to https://gp-games.vercel.app. So it always serves whatever `gp-games` is serving, and a push to `main` updates both addresses. Don't deploy the game to that project. Only redeploy it if the proxy file changes (see `vercel-proxy/README.md`).
- Leaderboard database (endless mode added the `months` column, migration `lps_scores_months`; the board has a "Longest serving" tab, and runs that end after year one can post their months from the game-over screen): the Supabase project `rttvlxawjidhneljhglk` (organisation GP Games, region eu-west-1), applied as the migration `lps_scores_leaderboard`. `last-partner-standing/supabase/lps_scores.sql` creates the table, row-level security (anyone can read and insert; nobody can update or delete), sanity checks on values, a server-set timestamp and a limit of 30 posts a minute. Scores are computed in the browser, so they can be faked. Names pass a word filter twice: `nameOk()` in `h3-board.js` and `lps_name_ok()` in the database (migration `lps_scores_name_filter`). Keep the two word lists the same. Ambiguous words only match as whole words, so real surnames like Wankhede, Nazim and Draper get through. To remove a name by hand, run `delete from public.lps_scores where id = …` in the Supabase SQL editor. The title screen has a Privacy explainer.
- Save games (`lps-save-v2`), best scores (`lps-best-v1`) and the Partners' Board (`lps-board-v1`) live in `localStorage`. A save made at a year end can be resumed, so the player can still carry on into the next year. Every access is wrapped in try/catch. Bump the save key if the state shape changes.

### src files

`build.sh` joins these into one script, in this order (`c3-art.js` comes after `c2-minidata.js`, and `f5-events7.js` after `f4-events6.js`):

- `a-head.html`: title, the Google Fonts link and all the CSS. Colours are tokens on `:root`, overridden for dark mode by both the `prefers-color-scheme` media query and `[data-theme]`.
- `c-data.js`: the sourced 2026/27 constants (`P`), practices, staff roles with costs that include employer NI and pension, projects, the cast, meter icons, headlines, `SOURCES` and `GLOSSARY`.
- `c2-minidata.js`: Docman Dash, 8am Rush and Walkround items.
- `c3-art.js`: everything drawn, as SVG in code. Profile silhouettes (`LOOKS` for the cast, `PLAYER_LOOKS` and `PLAYER_COLOURS` for the player, `SIL_OBJ` for objects such as the bank or Gerald's bowl), built by `portraitSVG(key)` from a head, a body, a hair shape and accessories. Also the surgery front (`facadeSVG`, `brassPlate`), the year brief (`briefHTML`), the Partners' Board (`partnersBoardHTML`) and the share picture (`shareSVG`, `openShareImage`). The style follows No. 10: Full Confidence: flat dark silhouettes on cream tiles, lamp-lit windows at night. Our own drawings and palette, not theirs.
- `d-events1.js`: story arcs (scheduled): partners, CQC, QOF year end.
- `e-events2.js`: patient, team and wellbeing cards.
- `f-events3.js`: money, safety and systems cards. These include the clinical system outage (paper notes, handwritten FP10s, no records; a continuity kit sets `flags.bcp` and softens later outages), ICB-pushed Windows updates, and medicine shortages (Medicine Supply Notifications and Serious Shortage Protocols).
- `f2-events4.js`: the real calendar (contract day, pay awards, patient survey, headline, flu, winter), real-rule cards, crisis cards and the other endings.
- `f3-events5.js`: CQC myths and oddities from CQC's own GP mythbusters (Gavin the consultant, Gerald the fish tank, furosemide, curtains, knitted ducks, carpet, DBS), the draft-report challenge and the Walkround mini-game card. `cqcPrep(n)` banks credit that `runCQC` adds to Safe and, halved, to Well-led.
- `f5-events7.js`: the long haul: cards gated by `pmin` (see Pressure below), such as the AI scribe, the ICB merger, Sandra retiring, the Ombudsman, the locum chambers, Parkside and Apex coming back, plus the three-year review (`review_3y`, `review3y()`).
- `f4-events6.js`: demand from outside the building: the PSA rush after a celebrity diagnosis, testosterone requests after a menopause documentary (with an option to set up a PCN women's health hub), the ICB closing community dermatology, and patients on hospital waiting lists asking for expedite letters. The Mounjaro card (news of new guidance, no LCS) is in `e-events2.js`.
- `g-engine.js`: state `S`, month flow, the money model (`calc`), where meters are heading (`targets`), state-driven incidents and delayed consequences (`monthEnd`).
- `g2-endings.js`: CQC ratings, game overs, other endings, year-end accounts and the partner's own tax and pension (`personalTax`), and saving.
- `h-ui.js`: helpers (`explain()` for expandable explainers, `srcLinks()`), HUD, title, month plan and cards.
- `h2-screens.js`: month report, endings, overlays (how to play, glossary, sources) and input handling via event delegation on `data-act`.
- `h3-board.js`: the shared leaderboard. It reads and posts scores in the Supabase table `lps_scores` through its REST API, using the project URL and publishable key in `BOARD`. With `BOARD.url` empty, it stays hidden. It shows on the year-end screen, the title screen and in the menu. Inside a Claude Artifact the network is blocked, so it points players to the website.
- `i-mini.js`: the three mini-games (Docman Dash, The 8am Rush, The Walkround), then boot.

### How consequences work

- **Meters drift.** Each month every meter moves a fixed fraction (`DRIFT`) toward a target set by the practice's situation: capacity against demand, the inbox, reception and rooms, pay, hours worked, reputation and winter. `targets()` returns each target with its reasons, which the planner shows in "Where things are heading".
- **One-off effects fade; lasting ones don't.** Plain `fx` values jolt a meter and then drift back. `aim` moves the target itself, permanently or for a while through a `mod` with `aim`.
- **Delayed effects.** `later: [{in, p, fx, note}]` plants a consequence that may land `in` months later with probability `p`. Its `note` appears under "What came of it" in the month report. Seeds must be plain data, not functions, so they survive saving.
- **State-driven incidents.** `incidents()` rolls month-end events from the state, for example a missed result when the inbox is high or a resignation when morale is low. Each note says "Because…".
- **The ICB contract process.** The patients crisis card is a remedial notice (`flags.remedialAt`). If Patients is below 30 a month later, a breach notice follows. Once notice has been served, three month-ends in a row with Patients below the practice's `accessLine` (16 in the city, 10 elsewhere; counted in `flags.lowAccess`) make the ICB terminate the contract (`forceOver = 'patients'`). The month report warns after two.
- **Crises before game over.** A meter at 18 or below, the bank past its overdraft limit, or being the last partner queues a one-off crisis card first.
- **Other endings.** Setting `S.exit` in a choice (`sold`, `merged`, `salaried`, `emigrated`, `handback`) ends the game after the outcome card.
- **Mergers when money runs out.** The payroll crisis card (`lifeline`) offers a merger with Parkside (70% it goes through, otherwise the bank extends the limit by £20k), and `p_merger_again` comes up, weighted, whenever the bank is past half its overdraft limit.
- **Crisis cards can fail.** The lifeline, the month off, the 5% pay rise and the remedial locums each have an `alt` gamble (15–35%, highest for city locums) where the rescue only half works.
- **Neglect costs money.** In `calc`, vaccination and enhanced-service income is scaled by `serviceF` (capacity against demand, 0.45 to 1.03), and a `cover` cost grows when Team is below 45 or Safety below 35 (sickness cover and incidents). Patients below 35 makes people leave the list each month. A CQC Requires improvement costs £6k and Inadequate £15k.
- **Twists.** `newGame` schedules one late-year twist in months 6–9: `twist_ill` (a partner off sick, chosen by `illPartner()`), `twist_fire` (£38k fire doors) or `twist_flood` (two rooms lost). They are in `f4-events6.js`.
- **Goals and the weekly challenge.** Each year gets one `GOALS` entry (`S.goal`), shown in the HUD; meeting it adds `GOAL_BONUS` (40) to the score. The weekly challenge (`weeklyChallenge()`) seeds `Math.random` from the ISO week (`S.rng`, mulberry32), so everyone that week gets the same goal, twist and luck. It is always the brutal city practice (Canal Street). Scores post with `week`, and the board's "This week" tab shows that week's city scores. Normal games keep the browser's random numbers.
- **Helping new players.** In April the Locum and Team sections sit closed under "More options". "Suggest a plan" (`suggestPlan()`) sets sessions, cover and a project with reasons. The city (brutal) has no Suggest button. The month report has "Same plan, start May →" (`nextgo`), your average week so far this year (`S.hoursTotal`) against the 48-hour Working Time Regulations limit, which doesn't cover self-employed partners, a "What's driving the practice" panel (the three biggest pulls from `targets()`), and delayed consequences say which card they came from. From October, a warning box appears when You is heading below 42 before the winter.
- **The look.** Every card shows the speaker's silhouette, framed in their colour. On the title screen the player picks a silhouette, a colour and a name (the dice button rolls a surname); these are `S.look` and appear as "you", in your room on the surgery front, on the Partners' Board and in the share picture.
- **The surgery front.** The month plan opens with the practice at night (`facadeSVG`). Each window is a meter: office (Bank), staff room (Team), your room (You), waiting room (Patients), treatment room (Safety). Lights dim as a meter falls, the people inside change (fewer in the staff room, you slumped at your desk, a warning sign in the treatment room, a red letter on Bev's desk when overdrawn), and a queue forms outside when appointments run short, with rain in winter. Tapping a window (`data-act="win"`) shows what is pulling that meter. The brass plate lists the partners and strikes through those who left. The game-over screen shows the building closed.
- **Endless mode.** After 31 March the year-end screen offers "Carry on: year 2". `continueYear()` keeps the practice, staff, list, cash and meters, resets the accounts and QOF, refreshes the card pool (one-off story arcs and last-chance crises stay used), moves everything timed by month back 12 (mods, delayed consequences, new registrations, ICB notices), schedules the calendar again with a `year_new` card, a twist and a new goal. Each extra year (`S.yr`) raises demand by `YEAR_DEMAND` (10%), funding by `YEAR_FUNDING` (2%), staff costs by `YEAR_STAFF` (5%), running costs by `YEAR_RUNNING` (3%) and lowers where You settles by `YEAR_YOU` (5). `monthsServed()` counts the whole run.
- **Take over the practice.** After a game over, "Take over →" (`takeOver()`) brings in a new partner with a rolled name and look, where the last one fell: same staff, list, cash and month, with just enough rescue to reopen (You back to 70, the failed meter to at least 32, ICB notices cleared, crisis cards available again). The old partner goes on the brass plate struck through (`S.lineage`), and a `takeover` card opens the next month. Months are counted per partner from `S.startAt`; `S.gen` counts partners.
- **Pressure.** `pressure()` is years served plus partners fallen plus a half for each meter below 30. Cards with `pmin` are only dealt once pressure reaches it, so later years and struggling practices get harsher cards.
- **The three-year review.** In years 3, 6 and 9 (`S.yr % 3 === 2`) the review card comes in September. Passing needs no meter below 35 and a good average (preparation, CQC rating and the bank count): praise, a £15,000 grant and a lift. A middling result passes with conditions; failing brings a six-month ICB improvement plan.
- **The 8am pace.** An optional 45-second timer per card (`CARD_SECONDS`), off by default, toggled on the title screen and in the menu and stored in `lps-settings-v1`. If it runs out, a random allowed choice is taken (never an exit) with a small penalty to You, Team and Patients (`timeUp()`).
- **The number to beat.** The title, year-end and game-over screens say how long partners on the leaderboard last on average, from the Supabase function `lps_stats()` (migration `lps_stats`, shown once at least 10 runs have months), next to the real figure: partners under 40 in England fell by 17% in 15 months to September 2025 (Institute for Government, `S83`). There is no published average length of a GP partnership; about 6.5% of GPs leave each year.
- **The Partners' Board and the brief.** Every run gets a line on a wooden honours board in this browser (`plaque()`), sorted by months served: silhouette, name, practice and how it ended. The year-end and game-over screens show four numbers (time as a partner, personal best, most fragile and strongest meter), the board and a "Share a picture" button that draws a 1200×675 PNG on a canvas and offers to share or save it.
- **Score.** Mostly meters, CQC and QOF, plus `clamp(annualK-120, -60, 60) * 0.35` for money and the goal bonus. Sensible play scores about 400 in the suburb and town and 250 in the city; random play about 210–240.
- **Hidden relationships.** `S.icb` and `S.rep` (0–100) shape patient satisfaction, recruitment, bids and ICB behaviour. The report explains them.
- **Money timing.** The global sum is paid on the weighted list. QOF pays 80% of last year's value monthly, and the balance is reconciled at year end (due by June). The partners' pension contributions are paid monthly on top of drawings, and personal tax is shown at the end.

### Event format

Event fields:

- `id`, `who` (a `CAST` key), `title`, `text` (string or function)
- `tag`: `real`, `rule`, `story` or `speculative`
- `src`: `SOURCES` ids
- `info`: the "What's real here?" explainer
- `cond()`, `months[]`, `w` (weight, number or function)
- `arc` (only appears when scheduled)
- `rep` and `max` (repeatable)
- `kind: 'mini'` with `game`
- `after()`, which runs after any choice
- `choices[]`

Choice fields:

- `t` (label, string or function), `fx` (object or function), `o` (outcome, string or function)
- `later[]`, delayed consequences for the main outcome
- `alt: {p, fx, o, run}`, a gamble that replaces the main outcome with probability `p`
- `need()` and `why`, which disable the choice
- `run()` for custom logic. It may return `{o, html}`.
- `play: 1`, which starts the mini-game

`fx` keys:

- `patients`, `team`, `you`, `safety` (clamped 0–100)
- `cash` (£k, counts as profit or loss), `capital` (£k, moves the bank without touching profit)
- `qof` (%; gains shrink near 100), `inbox`, `list`
- `demand` and `admin` (persistent % modifiers)
- `rooms`, `okoye` (Nadia's risk of leaving), `icb`, `rep`
- `aim: {meter: n}`, a lasting shift in where a meter settles
- `staff: {role: n}`, `flags: {}`
- `sched: [[id, monthsFromNow]]`
- `mod: {id, label, months, at, fx, capAdd, capMul, demand, rooms, away, aim, hours}`
- `later: [...]`

Text placeholders: `{surgery}`, `{place}`, `{paper}`, `{name}`, `{qof}`, `{inbox}`, `{list}`.

### Writing rules

These come from the scoping work behind this game.

- Real rules and numbers; fictional people, practices and companies. No named politicians.
- Humour punches up at systems and paperwork, never at patients or reception staff.
- Where the BMA and the government disagree, show both framings.
- Clinical content stays generic. The mini-games say they are not clinical guidance.
- Any card built on a real figure or rule gets `tag`, `src` and `info`. Future policy is tagged `speculative`.

### Balance

The last run of `tools/simulate.mjs 400` (after the neglect costs, twists and goals, September 2026) covered 2,400 years:

| Practice | Random play survived | Sensible play survived | Sensible play profit share | Sensible play take-home | Sensible play QOF |
|---|---|---|---|---|---|
| Suburb | 59% | 100% | £147k | £72k | 93% |
| Town | 45% | 100% | £155k | £75k | 93% |
| City | 6% | 92% | £139k | £69k | 93% |

- Burnout in January and February is the most common game over.
- Random play in the town still takes a slightly bigger profit share than sensible play (about £165k against £155k), because the sensible player pays for locums. That's realistic; the score rewards the quality instead.
- The city was rebalanced in September 2026: it starts with a care coordinator and a social prescriber, £40k in the bank against a £110k overdraft, lower overheads and slightly lower demand. It also carries a small extra drag on You. Sensible play now ends with patients around 39, mostly Good from CQC (about a third Requires improvement) and the bank within its overdraft.
- Random-play survival moves by about 5 points between runs.
- The city must be able to beat a sensible player. With `accessLine: 16`, about 5% of sensible city years end with the ICB terminating the contract, mostly in February or March.
- The city was made harder again: demand 0.104 contacts per patient a week (deprived areas consult more), £25k in the bank against a £95k overdraft, lower starting meters, recruitment at 0.7 of the town's success rate, and `turnover: 0.14`. That's a 14% monthly chance that a receptionist, nurse or HCA leaves regardless of morale (`incidents()`). Sensible play survives, but most years end "Survived. Technically.", with patients around 18, 80% Requires improvement and 12% Inadequate.
- The city is under-doctored on purpose. `gpCap: 3000` stops salaried GP recruitment beyond one full-time GP per 3,000 patients (`gpHeadroom()`). That's like the worst-covered parts of Kent; the worst whole ICB, North West London, is about 1 per 2,750. Your own sessions count as one full-time GP, so they never block a hire. The city starts at about 1 per 2,800, already past the cap, so no salaried GP can be recruited even after one leaves, and partnership adverts rarely find anyone. Locums are capped at 4 sessions a week there (`locumMax`). Sensible play still survives, but ends with patients around 27 and mostly Requires improvement from CQC.
- ARRS roles share `ARRS_CAP` = 6 PCN-funded places, counting open adverts. When they're full, Recruit is disabled and a note under the role says why (it used to be a hover tooltip only, invisible on phones).
- Staffing is calibrated to the England workforce figures for August 2026 (per 10,000 patients: about 4.6 fully qualified GPs, 2.6 nurses, 2.9 other practice clinical staff and 12.3 admin and reception staff). The Team panel's "How you compare with England" shows the player's practice against these averages (`BENCH` and `benchmark()`). Receptionists are needed at 1 per 1,600 patients.
- Rooms are booked by the session. Each consulting room gives 9 sessions a week (`ROOM_SESSIONS`). `ROLES[r].room` is the room sessions a role books each week: GPs one per clinical session, nurses 8, pharmacists and paramedics 4. Receptionists, care coordinators, social prescribers and GP assistants book none. Starting rooms: suburb 7, town 7, city 8. Nine, not ten, because a room has ten core half-days a week (Monday to Friday mornings and afternoons), less one for double-bookings, cleaning and meetings. The one-off project `meetingroom` (also a choice on the rooms card) adds a room for £4,000.
- Evening and Saturday overtime clinics (`plan.extra`, 0 to `OT_MAX` = 4 a week): your own staff at about £320 a session (`OT_SESSION`) for 12 appointments (`OT_APPTS`), no room needed because they're outside core hours, but each weekly session lowers where Team settles by 1.5. Cheaper than locums (£477 for 14 appointments, no paperwork done).
- A strategy test with the simulator (town, sensible play): filling the ARRS cap instead of hiring a salaried GP raises the profit share by about £10k but costs about 10 points of patient satisfaction. A third nurse helps patients and the city's CQC rating most for little money. Skipping ARRS costs about £10k.
- The real 2024/25 average partner profit was £164,200.
- Endless mode (`node last-partner-standing/tools/simulate.mjs 200 all smart endless`, up to 10 years, after the long-haul cards and the three-year review): sensible play lasts a median of about 45 months in the suburb and 41 in the town, almost always ending when the bank runs out, and about 20 months in the city, mostly ending with the ICB. Random play lasts about a year. The simulator treats the new merger and sale cards (`p_merger_again`, `p_apex_again`) as exits it avoids.
