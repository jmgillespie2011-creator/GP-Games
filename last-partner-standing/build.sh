#!/bin/sh
# Assemble the game from src/
#  last-partner-standing.html  - Artifact source (the publish step adds doctype/head)
#  last-partner-standing-play.html - standalone copy to open directly in any browser
cd "$(dirname "$0")"
OUT=last-partner-standing.html
cat src/a-head.html > "$OUT"
printf '<div id="app"></div>\n<script>\n' >> "$OUT"
cat src/c-data.js src/d-events1.js src/e-events2.js src/f-events3.js src/g-engine.js src/h-ui.js src/i-mini.js >> "$OUT"
printf '</script>\n' >> "$OUT"

PLAY=last-partner-standing-play.html
printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' > "$PLAY"
cat src/a-head.html >> "$PLAY"
printf '</head>\n<body>\n<div id="app"></div>\n<script>\n' >> "$PLAY"
cat src/c-data.js src/d-events1.js src/e-events2.js src/f-events3.js src/g-engine.js src/h-ui.js src/i-mini.js >> "$PLAY"
printf '</script>\n</body>\n</html>\n' >> "$PLAY"
