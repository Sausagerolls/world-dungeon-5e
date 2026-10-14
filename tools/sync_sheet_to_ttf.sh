#!/bin/sh
# Copy the Crawler Sheet source and the player rules site into a Tabletop
# Forge checkout, which serves them at /crawler/ and /rules/.
#
# Usage: tools/sync_sheet_to_ttf.sh [path/to/ttf]
#   default: ~/Desktop/dnd-vtt/restored-live (the live source tree)
#
#   frontend/crawler-sheet/  sheet source; the frontend Docker image builds it.
#                            Its own vite.config.js is never overwritten.
#   rules-site/              the built rules site, linked to the sheet, with
#                            the GM area at /rules/gm/ (open, no password).
#                            Mounted into the frontend
#                            container, so a rules change needs no rebuild.
set -e
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TTF="${1:-$HOME/Desktop/dnd-vtt/restored-live}"
python3 "$HERE/tools/build_app_data.py"
mkdir -p "$TTF/frontend/crawler-sheet"
rsync -a --delete --exclude vite.config.js --exclude README.md "$HERE/app/src" "$HERE/app/index.html" "$TTF/frontend/crawler-sheet/"
WD_SITE_OUT="$TTF/rules-site" WD_SHEET_URL=../crawler/ python3 "$HERE/tools/build_site.py"
echo "Synced the sheet to $TTF/frontend/crawler-sheet and the rules site to $TTF/rules-site"
