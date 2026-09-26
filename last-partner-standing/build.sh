#!/bin/sh
# Assemble the game from src/
#  last-partner-standing.html  - Artifact source (the publish step adds doctype/head)
#  last-partner-standing-play.html - standalone copy to open directly in any browser
cd "$(dirname "$0")"
JS="src/c-data.js src/c2-minidata.js src/d-events1.js src/e-events2.js src/f-events3.js src/f2-events4.js src/f3-events5.js src/f4-events6.js src/g-engine.js src/g2-endings.js src/h-ui.js src/h2-screens.js src/h3-board.js src/i-mini.js"
OUT=last-partner-standing.html
cat src/a-head.html > "$OUT"
printf '<div id="app"></div>\n<script>\n' >> "$OUT"
cat $JS >> "$OUT"
printf '</script>\n' >> "$OUT"

PLAY=last-partner-standing-play.html
printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' > "$PLAY"
DESC='A survival game about one year as a new GP partner in England, on real 2026/27 contract figures.'
printf '<meta name="theme-color" content="#E3EDE1" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#0D1712" media="(prefers-color-scheme: dark)">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Last Partner">\n<meta name="format-detection" content="telephone=no">\n' >> "$PLAY"
printf '<meta name="description" content="%s">\n<meta property="og:title" content="Last Partner Standing">\n<meta property="og:description" content="%s">\n' "$DESC" "$DESC" >> "$PLAY"
cat src/a-head.html >> "$PLAY"
printf '</head>\n<body>\n<div id="app"></div>\n<script>\n' >> "$PLAY"
cat $JS >> "$PLAY"
printf '</script>\n</body>\n</html>\n' >> "$PLAY"
