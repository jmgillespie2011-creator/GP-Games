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
DESC='One year as a new GP partner on the real 2026/27 contract. Keep your patients, your team, the practice, the bank and yourself alive until March. Free, in your browser.'
printf '<meta name="theme-color" content="#E3EDE1" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#0D1712" media="(prefers-color-scheme: dark)">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Last Partner">\n<meta name="format-detection" content="telephone=no">\n' >> "$PLAY"
# Link previews (Twitter/X, Facebook, WhatsApp, Slack). The card is og.png, made by tools/og-card.mjs.
# The image URL points straight at gp-games; the page URL is the address we share.
SITE=https://last-partner-standing.vercel.app
IMG=https://gp-games.vercel.app/last-partner-standing/og.png
ALT='The Last Partner Standing title next to a January month report: patients 31, team 54, you 19, safety 58, bank minus £71k.'
printf '<meta name="description" content="%s">\n<link rel="canonical" href="%s/">\n' "$DESC" "$SITE" >> "$PLAY"
printf '<meta property="og:type" content="website">\n<meta property="og:site_name" content="Last Partner Standing">\n<meta property="og:url" content="%s/">\n<meta property="og:title" content="Last Partner Standing">\n<meta property="og:description" content="%s">\n' "$SITE" "$DESC" >> "$PLAY"
printf '<meta property="og:image" content="%s">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="%s">\n' "$IMG" "$ALT" >> "$PLAY"
printf '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Last Partner Standing">\n<meta name="twitter:description" content="%s">\n<meta name="twitter:image" content="%s">\n<meta name="twitter:image:alt" content="%s">\n' "$DESC" "$IMG" "$ALT" >> "$PLAY"
# The icon: src/icon.svg (a GP standing on the logo's yellow line), inlined as the favicon.
ICON=$(base64 < src/icon.svg | tr -d '\n')
printf '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,%s">\n<link rel="apple-touch-icon" href="/last-partner-standing/apple-touch-icon.png">\n' "$ICON" >> "$PLAY"
cat src/a-head.html >> "$PLAY"
printf '</head>\n<body>\n<div id="app"></div>\n<script>\n' >> "$PLAY"
cat $JS >> "$PLAY"
printf '</script>\n</body>\n</html>\n' >> "$PLAY"
