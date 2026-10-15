#!/bin/sh
# Deploy the Crawler Sheet and the rules site to the live Tabletop Forge server.
#
# Usage: tools/deploy_ttf.sh
#   1. tools/sync_sheet_to_ttf.sh  (copy the sheet source, build the rules site)
#   2. rsync rules-site/ and frontend/crawler-sheet/ to the server
#   3. rebuild and restart the frontend container
#
# Server details come from ~/Desktop/dnd-vtt/.deploy-env (DEPLOY_HOST,
# DEPLOY_USER, DEPLOY_PASSWORD); needs sshpass when a password is set.
set -e
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TTF_ROOT="$HOME/Desktop/dnd-vtt"
TTF="$TTF_ROOT/restored-live"
REMOTE=/mnt/user/appdata/TableTopForge

"$HERE/tools/sync_sheet_to_ttf.sh" "$TTF"

set -a; . "$TTF_ROOT/.deploy-env"; set +a
export SSHPASS="$DEPLOY_PASSWORD"
DEST="$DEPLOY_USER@$DEPLOY_HOST"

sshpass -e rsync -a --delete "$TTF/rules-site/" "$DEST:$REMOTE/rules-site/"
sshpass -e rsync -a --delete --exclude node_modules "$TTF/frontend/crawler-sheet/" "$DEST:$REMOTE/frontend/crawler-sheet/"
sshpass -e ssh "$DEST" "cd $REMOTE && docker compose build frontend && docker compose up -d frontend"
echo "Deployed to $DEPLOY_HOST"
