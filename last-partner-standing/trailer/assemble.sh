#!/bin/sh
# Assemble the trailer page from trailer/ and the game's own data and drawings in src/.
#   sh trailer/assemble.sh OUT              standalone page (doctype, head, link previews): what the website serves
#   sh trailer/assemble.sh --artifact OUT   Claude Artifact source (the publish step adds doctype and head)
# build.sh calls this for last-partner-standing-trailer.html; tools/trailer-render.mjs calls it for a temporary copy.
CALLER=$(pwd)
cd "$(dirname "$0")"
MODE=play
if [ "$1" = "--artifact" ]; then MODE=artifact; shift; fi
OUT="$1"
[ -n "$OUT" ] || { echo "usage: sh trailer/assemble.sh [--artifact] OUT" >&2; exit 1; }
case "$OUT" in /*) ;; *) OUT="$CALLER/$OUT" ;; esac
# TRAILER_SCENES narrows the scenes (tools/trailer-render.mjs --only); normally every scenes/s*.js, in name order
SCENES=${TRAILER_SCENES:-$(ls scenes/s*.js | sort)}
JS="../src/c-data.js ../src/c3-art.js t-engine.js $SCENES t-boot.js"
{
  if [ "$MODE" = play ]; then
    SITE=https://last-partner-standing.vercel.app
    DESC='75 seconds of general practice: a new GP partner, five lit windows, a year of cards and one name left on the brass plate. The trailer for Last Partner Standing, the free browser game.'
    IMG=https://gp-games.vercel.app/last-partner-standing/trailer-poster.png
    ICON=$(base64 < ../src/icon.svg | tr -d '\n')
    printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    printf '<meta name="theme-color" content="#E3EDE1" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#0D1712" media="(prefers-color-scheme: dark)">\n'
    printf '<meta name="description" content="%s">\n<link rel="canonical" href="%s/trailer">\n' "$DESC" "$SITE"
    printf '<meta property="og:type" content="video.other">\n<meta property="og:site_name" content="Last Partner Standing">\n<meta property="og:url" content="%s/trailer">\n<meta property="og:title" content="Last Partner Standing: the trailer">\n<meta property="og:description" content="%s">\n' "$SITE" "$DESC"
    printf '<meta property="og:image" content="%s">\n<meta property="og:image:width" content="1280">\n<meta property="og:image:height" content="720">\n<meta property="og:image:alt" content="The Riverside Surgery front at night with its five windows lit, under the Last Partner Standing title.">\n' "$IMG"
    printf '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Last Partner Standing: the trailer">\n<meta name="twitter:description" content="%s">\n<meta name="twitter:image" content="%s">\n' "$DESC" "$IMG"
    printf '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,%s">\n<link rel="apple-touch-icon" href="/last-partner-standing/apple-touch-icon.png">\n' "$ICON"
    cat t-head.html
    printf '</head>\n<body>\n'
  else
    cat t-head.html
  fi
  cat t-body.html
  printf '<script>\n'
  cat $JS
  printf '</script>\n'
  if [ "$MODE" = play ]; then printf '</body>\n</html>\n'; fi
} > "$OUT"
