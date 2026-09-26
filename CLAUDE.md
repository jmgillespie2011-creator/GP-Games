# GP-Games

## last-partner-standing/

A single-page vanilla JS game with no dependencies. The only build step is concatenation.

- Edit the files in `src/`, then run `sh last-partner-standing/build.sh`. It writes two files, both committed. Never hand-edit them.
  - `last-partner-standing.html` is the Claude Artifact source. It has no doctype, head or body tags, because the Artifact publish step adds them.
  - `last-partner-standing-play.html` is the standalone copy, with doctype, charset and viewport. Players open this one.
- After changing numbers, events or the engine, run the balance check: `node last-partner-standing/tools/simulate.mjs 200` (optional arguments: `suburb|town|city|all` and `random|smart|both`). It plays whole years headlessly and reports survival, endings, profit share and final meters.
- Deploy: `vercel deploy --prod --yes` from the repo root. It goes to the Vercel project `gp-games` (team john-g-projects), live at https://gp-games.vercel.app.
  - `vercel.json` rewrites `/` and `/last-partner-standing` to the playable file.
  - `.vercelignore` keeps source, tools and docs out of the deployment.
  - Rebuild before deploying.
  - Never deploy to the separate Vercel project `last-partner-standing`, which is a different build of the game.
- Save games (`lps-save-v2`) and best scores (`lps-best-v1`) live in `localStorage`. Every access is wrapped in try/catch. Bump the save key if the state shape changes.

### src files

`build.sh` joins these into one script, in this order:

- `a-head.html`: title, the Google Fonts link and all the CSS. Colours are tokens on `:root`, overridden for dark mode by both the `prefers-color-scheme` media query and `[data-theme]`.
- `c-data.js`: the sourced 2026/27 constants (`P`), practices, staff roles with costs that include employer NI and pension, projects, the cast, meter icons, headlines, `SOURCES` and `GLOSSARY`.
- `c2-minidata.js`: Docman Dash and 8am Rush items.
- `d-events1.js`: story arcs (scheduled): partners, CQC, QOF year end.
- `e-events2.js`: patient, team and wellbeing cards.
- `f-events3.js`: money, safety and systems cards.
- `f2-events4.js`: the real calendar (contract day, pay awards, patient survey, headline, flu, winter), real-rule cards, crisis cards and the other endings.
- `g-engine.js`: state `S`, month flow, the money model (`calc`), where meters are heading (`targets`), state-driven incidents and delayed consequences (`monthEnd`).
- `g2-endings.js`: CQC ratings, game overs, other endings, year-end accounts and the partner's own tax and pension (`personalTax`), and saving.
- `h-ui.js`: helpers (`explain()` for expandable explainers, `srcLinks()`), HUD, title, month plan and cards.
- `h2-screens.js`: month report, endings, overlays (how to play, glossary, sources) and input handling via event delegation on `data-act`.
- `i-mini.js`: the two mini-games, then boot.

### How consequences work

- **Meters drift.** Each month every meter moves a fixed fraction (`DRIFT`) toward a target set by the practice's situation: capacity against demand, the inbox, reception and rooms, pay, hours worked, reputation and winter. `targets()` returns each target with its reasons, which the planner shows in "Where things are heading".
- **One-off effects fade; lasting ones don't.** Plain `fx` values jolt a meter and then drift back. `aim` moves the target itself, permanently or for a while through a `mod` with `aim`.
- **Delayed effects.** `later: [{in, p, fx, note}]` plants a consequence that may land `in` months later with probability `p`. Its `note` appears under "What came of it" in the month report. Seeds must be plain data, not functions, so they survive saving.
- **State-driven incidents.** `incidents()` rolls month-end events from the state, for example a missed result when the inbox is high or a resignation when morale is low. Each note says "Because…".
- **Crises before game over.** A meter at 18 or below, the bank past its overdraft limit, or being the last partner queues a one-off crisis card first.
- **Other endings.** Setting `S.exit` in a choice (`sold`, `merged`, `salaried`, `emigrated`, `handback`) ends the game after the outcome card.
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

The last run of `tools/simulate.mjs 200` covered 1,200 years:

| Practice | Random play survived | Sensible play survived | Sensible play profit share | Sensible play take-home | Sensible play QOF |
|---|---|---|---|---|---|
| Suburb | 62% | 100% | £155k | £74k | 94% |
| Town | 54% | 100% | £146k | £72k | 93% |
| City | 40% | 100% | £118k | £62k | 91% |

- Burnout in January and February is the most common game over.
- Sensible play in the city ends with patients around 33, mostly "Requires improvement" from CQC and the bank deep in overdraft.
- The real 2024/25 average partner profit was £164,200.
