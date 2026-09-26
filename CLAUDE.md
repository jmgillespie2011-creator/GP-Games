# GP-Games

## last-partner-standing/

A single-page vanilla JS game with no dependencies. The only build step is concatenation.

- Edit the files in `src/`, then run `sh last-partner-standing/build.sh`. It writes two files, both committed. Never hand-edit them.
  - `last-partner-standing.html` is the Claude Artifact source. It has no doctype, head or body tags, because the Artifact publish step adds them.
  - `last-partner-standing-play.html` is the standalone copy, with doctype, charset and viewport. Players open this one.
- Save games and best scores live in `localStorage` (`lps-save-v1`, `lps-best-v1`). Every access is wrapped in try/catch.

### src files

`build.sh` joins these into one script, in this order:

- `a-head.html`: title, the Google Fonts link and all the CSS. Colours are tokens on `:root`, overridden for dark mode by both the `prefers-color-scheme` media query and `[data-theme]`.
- `c-data.js`: constants. Months, seasonal demand, practices, staff roles, projects, the cast, meter icons, newspaper headlines and the mini-game items.
- `d-events1.js`: story-arc events, which only appear when scheduled.
- `e-events2.js`: patient, team and wellbeing events.
- `f-events3.js`: money, safety and systems events.
- `g-engine.js`: the state `S`, the month flow, the simulation (`calc`, `forecast`, `monthEnd`), CQC, endings and saving.
- `h-ui.js`: rendering for every screen, plus input handling through event delegation on `data-act`.
- `i-mini.js`: Docman Dash and The 8am Rush, then boot.

### Event format

Event fields:

- `id`, `who` (a `CAST` key), `title`, `text`
- `cond()`, `months[]`, `w` (draw weight)
- `arc` (only appears when scheduled)
- `rep` and `max` (repeatable, up to `max` times)
- `kind: 'mini'` with `game` for mini-games
- `after()`, which runs after any choice
- `choices[]`

Choice fields:

- `t` (label), `fx` (an object or a function), `o` (outcome text)
- `alt: {p, fx, o, run}`, a gamble that replaces the main outcome with probability `p`
- `need()` and `why`, which disable the choice
- `run()` for custom logic. It may return `{o, html}`.
- `play: 1`, which starts the event's mini-game

`fx` keys:

- `patients`, `team`, `you`, `safety` (clamped 0–100)
- `cash` (£k), `qof` (%), `inbox`, `list`
- `demand` and `admin` (persistent % modifiers)
- `rooms`
- `okoye` (Nadia's risk of leaving)
- `staff: {role: n}`, `flags: {}`
- `sched: [[id, monthsFromNow]]`
- `mod: {id, label, months, at, fx, capAdd, capMul, demand, rooms, away}` (a temporary monthly modifier)

Text placeholders: `{surgery}`, `{place}`, `{paper}`, `{name}`, `{qof}`, `{inbox}`, `{list}`.

### Balance

The balance was checked with an in-browser simulation of 90 full years: a random policy against a sensible heuristic, 15 games of each per practice.

- Random play survived 11 of 15 suburb games, 4 of 15 town and 0 of 15 inner city.
- Sensible play survived almost every game.

Afterwards, QOF gain and CQC "Outstanding" were made harder. That change hasn't been re-simulated.
