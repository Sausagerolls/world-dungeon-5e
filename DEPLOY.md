# Deploying the World Dungeon website

The website is plain static files: HTML, CSS and JavaScript. No database, no server code, no build step on the server.

## Build

```
python3 tools/build_pdf.py     # optional: refresh the PDFs first
python3 tools/build_sheet.py   # optional: refresh the character sheet and GM tracker
python3 tools/build_site.py    # builds site/
```

Rebuild after any change to the markdown files. The site and the PDFs are made from the same files, so they always match.

## Upload

Copy the **contents** of `site/` into your Apache document root (or a subfolder such as `/var/www/html/worlddungeon/`):

```
rsync -av --delete site/ user@yourserver:/var/www/html/worlddungeon/
```

Every link is relative, so it works in the root or in any subfolder.

## Protect the GM area

The player side is `site/`. Everything GM-only (loot tables, achievements, relics, enemy loot, floor guides, and the GM search index) is in `site/gm/`. Protect that folder with a password:

1. Create a password file **outside** the web root:
   ```
   sudo htpasswd -c /etc/apache2/.htpasswd-worlddungeon gm
   ```
2. On the server, rename `gm/htaccess-example.txt` to `gm/.htaccess`, and check that `AuthUserFile` points to the file from step 1.
3. Make sure Apache allows it. In your site config, the folder needs `AllowOverride AuthConfig` (or `All`), then reload Apache:
   ```
   sudo systemctl reload apache2
   ```

Players browsing the site never load GM content: the player search only indexes player pages, and GM cross-references show as plain text on player pages.

## What is in site/

| Path | What it is |
|------|------------|
| `index.html` | Player home page |
| `create.html` | Step-by-step crawler creation guide (saves in the browser; prints; exports JSON) |
| `*.html` | One page per player rules chapter |
| `downloads.html`, `downloads/` | Player PDFs and the character sheet |
| `gm/` | GM-only pages, GM PDFs and the GM search index |
| `assets/` | Stylesheet, scripts, search index and Crawler Skill data |
| `robots.txt` | Asks search engines to skip `/gm/` (not a security measure: use the password) |

## Hosting with Tabletop Forge (the sheet and the rules together)

A Tabletop Forge server can serve both the Crawler Sheet (`/crawler/`) and the player rules site (`/rules/`), linked to each other. This is how the live server runs.

1. Run `tools/sync_sheet_to_ttf.sh [path/to/ttf]`. It copies `app/` into the TTF checkout's `frontend/crawler-sheet/` and builds the player rules site (no GM area, linked to the sheet) into its `rules-site/`.
2. Upload both to the server. A rules-only change needs nothing else: `rules-site/` is mounted into the frontend container.
3. For sheet changes, rebuild the frontend image (`docker compose build frontend && docker compose up -d frontend`). Its Dockerfile builds the sheet after the main app.

The site builder's hosting switches: `WD_SHEET_URL` (link every page to the sheet), `WD_NO_GM=1` (leave the GM area out) and `WD_SITE_OUT` (build somewhere other than `site/`).

The GM area is not hosted this way. Use the Apache steps above for it, or ask for nginx password protection.
