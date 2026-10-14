#!/usr/bin/env python3
"""Build the static World Dungeon website from the setting's markdown files.

Usage: python3 tools/build_site.py
Output: site/  (upload the contents to your Apache web root; see DEPLOY.md)

Player pages go in site/, GM-only pages in site/gm/ (protect that folder with
.htaccess; an example is generated). PDFs from pdf/ are copied into downloads.

Hosting it next to the Crawler Sheet (see tools/sync_sheet_to_ttf.sh):
  WD_SHEET_URL=../crawler/  link every page to the sheet app
  WD_NO_GM=1                leave the GM area out (and its link)
  WD_SITE_OUT=path          build somewhere other than site/
"""
import html
import json
import os
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_pdf as bp  # noqa: E402  (reuses the markdown converter)

ROOT = Path(__file__).resolve().parent.parent
SITE = Path(os.environ["WD_SITE_OUT"]) if os.environ.get("WD_SITE_OUT") else ROOT / "site"
SHEET_URL = os.environ.get("WD_SHEET_URL", "")
NO_GM = os.environ.get("WD_NO_GM") == "1"
ASSETS = Path(__file__).resolve().parent / "site"

# (slug, source file, nav group, converter css class)
PLAYER = [
    ("crawler", "classes/crawler.md", "Your Crawler", "class"),
    ("crawler-skills", "classes/crawler-skills.md", "Your Crawler", "skills"),
    ("class-selection", "rules/class-selection.md", "Your Crawler", "rules"),
    ("race-selection", "rules/race-selection.md", "Your Crawler", "rules"),
    ("leveling", "rules/leveling.md", "Your Crawler", "rules"),
    ("prestige-levels", "rules/prestige-levels.md", "Your Crawler", "items"),
    ("tome-magic", "rules/tome-magic.md", "Magic", "rules"),
    ("mana", "rules/mana.md", "Magic", "rules"),
    ("surviving-the-crawl", "rules/surviving-the-crawl.md", "The Crawl", "rules"),
    ("safe-rooms-and-timer", "rules/safe-rooms-and-timer.md", "The Crawl", "rules"),
    ("pets", "rules/pets.md", "The Crawl", "rules"),
    ("crafting", "rules/crafting.md", "Crafting and Shops", "rules"),
    ("crafting-recipes", "items/crafting-recipes.md", "Crafting and Shops", "tables flow"),
    ("safe-room-shops", "rules/safe-room-shops.md", "Crafting and Shops", "rules"),
    ("explosives", "items/explosives.md", "Items", "items"),
    ("firearms", "items/firearms.md", "Items", "items"),
    ("dungeon-items", "items/dungeon-items.md", "Items", "items"),
]
GM = [
    ("loot-boxes", "rules/loot-boxes.md", "Rewards", "rules"),
    ("achievements", "rules/achievements.md", "Rewards", "tables"),
    ("box-tables", "loot/box-tables.md", "Rewards", "tables"),
    ("celestial-relics", "items/celestial-relics.md", "Rewards", "items"),
    ("enemy-loot", "loot/enemy-loot.md", "Rewards", "tables"),
    ("floor-1-overview", "floors/floor-1/overview.md", "Floor 1", "rules"),
    ("floor-1-neighbourhoods", "floors/floor-1/neighbourhoods.md", "Floor 1", "floor"),
]
PLAYER_PDFS = [
    ("The-Crawler.pdf", "The Crawler", "Class, Crawler Skills, class selection, magic, mana, leveling, prestige, the crawl"),
    ("Crawler-Character-Sheet.pdf", "Crawler Character Sheet", "10-page sheet: stats, features, levels, magic, pet, inventory, timer, boxes, crafting"),
    ("Crafting-and-Shops.pdf", "Crafting and Shops", "Crafting rules, every recipe, safe room shops"),
    ("Pets.pdf", "Pets", "Getting, raising and evolving pets"),
    ("Explosives.pdf", "Explosives", "Explosive rules and items"),
    ("Firearms.pdf", "Firearms", "Firearm rules, guns and gear"),
    ("Dungeon-Items.pdf", "Dungeon Items", "Every other setting item"),
]
GM_PDFS = [
    ("Floor-1.pdf", "Floor 1", "Neighbourhoods, encounters, boss rooms, stat blocks"),
    ("Loot-and-Achievements.pdf", "Loot and Achievements", "Loot boxes, achievements, box tables, relics"),
    ("Enemy-Loot.pdf", "Enemy Loot", "Coin and drop tables by creature type"),
    ("GM-Floor-Tracker.pdf", "GM Floor Tracker", "One page per floor: timer, party, bosses"),
]

TITLE_TO_ID = {name: key for key, name in bp.XREF.items()}


def slugify(text):
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text).lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-") or "section"


def page_title(md):
    m = re.search(r"^# (.+)$", md, re.M)
    return m.group(1).strip() if m else "Untitled"


def postprocess(body, is_gm):
    """Add heading ids, turn cross-references into links, wrap tables for scrolling."""
    seen, toc = set(), []

    def add_id(m):
        level, attrs, inner = m.group(1), m.group(2), m.group(3)
        sid = slugify(inner)
        while sid in seen:
            sid += "-x"
        seen.add(sid)
        if level in ("2", "3"):
            toc.append((level, re.sub(r"<[^>]+>", "", inner), sid))
        return f'<h{level}{attrs} id="{sid}">{inner}</h{level}>'

    body = re.sub(r"<h([234])([^>]*)>(.*?)</h\1>", add_id, body)

    gm_ids = {s for s, *_ in GM}
    player_ids = {s for s, *_ in PLAYER}

    def link(m):
        name = m.group(1)
        key = TITLE_TO_ID.get(name)
        if key in player_ids:
            href = ("../" if is_gm else "") + f"{key}.html"
            return f'<a class="xref" href="{href}">{name}</a>'
        if key in gm_ids:
            if is_gm:
                return f'<a class="xref" href="{key}.html">{name}</a>'
            return f'<span class="xref" title="GM section">{name}</span>'
        return m.group(0)

    body = re.sub(r'<span class="xref">(.*?)</span>', link, body)
    body = re.sub(r"(<table.*?</table>)", r'<div class="tablewrap">\1</div>', body, flags=re.S)
    return body, toc


def search_entries(body, page, url):
    entries = []
    parts = re.split(r'(<h[23][^>]*id="[^"]+"[^>]*>.*?</h[23]>)', body)
    for i in range(1, len(parts), 2):
        m = re.search(r'id="([^"]+)"[^>]*>(.*?)</h', parts[i])
        text = re.sub(r"<[^>]+>", " ", parts[i + 1] if i + 1 < len(parts) else "")
        text = re.sub(r"\s+", " ", html.unescape(text)).strip()
        entries.append({"t": html.unescape(re.sub(r"<[^>]+>", "", m.group(2))), "p": page,
                        "u": f"{url}#{m.group(1)}", "s": text[:400]})
    return entries


def nav_html(active, is_gm):
    up = "../" if is_gm else ""
    parts = ([f'<a class="cta" href="{up}{SHEET_URL}" target="_blank" rel="noopener">Open the Crawler Sheet</a>'] if SHEET_URL else []) + [
             f'<a class="{"" if SHEET_URL else "cta"}" href="{up}create.html">{"Creation guide" if SHEET_URL else "Create a crawler"}</a>',
             f'<a href="{up}index.html"{" class=active" if active == "home" else ""}>Home</a>']
    groups = {}
    for slug, src, group, _ in PLAYER:
        groups.setdefault(group, []).append((slug, src))
    for group, items in groups.items():
        parts.append(f"<h4>{group}</h4>")
        for slug, src in items:
            title = page_title((ROOT / src).read_text())
            cls = ' class="active"' if slug == active and not is_gm else ""
            parts.append(f'<a href="{up}{slug}.html"{cls}>{html.escape(title)}</a>')
    parts.append(f'<h4>Downloads</h4><a href="{up}downloads.html"{" class=active" if active == "downloads" else ""}>Rulebooks and sheets</a>')
    if is_gm:
        gm_groups = {}
        for slug, src, group, _ in GM:
            gm_groups.setdefault(group, []).append((slug, src))
        parts.append('<h4>GM only</h4><a href="index.html"' + (' class="active"' if active == "gm-home" else "") + ">GM home</a>"
                     + '<a href="dungeon-builder.html"' + (' class="active"' if active == "dungeon-builder" else "") + ">Dungeon Builder</a>")
        for group, items in gm_groups.items():
            parts.append(f"<h4>GM · {group}</h4>")
            for slug, src in items:
                title = page_title((ROOT / src).read_text())
                cls = ' class="active"' if slug == active else ""
                parts.append(f'<a href="{slug}.html"{cls}>{html.escape(title)}</a>')
    return '<nav class="side">' + "".join(parts) + "</nav>"


def page(title, body, active, is_gm=False, toc=None, scripts=(), noindex=False, styles=()):
    up = "../" if is_gm else ""
    toc_html = ""
    if toc:
        links = "".join(f'<a class="l{lv}" href="#{sid}">{html.escape(t)}</a>' for lv, t, sid in toc)
        toc_html = f'<aside class="toc"><h4>On this page</h4>{links}</aside>'
    gm_toggle = (f'<a class="gm-link" href="{up}index.html">PLAYER SIDE</a>' if is_gm
                 else "" if NO_GM else '<a class="gm-link" href="gm/index.html">GM AREA</a>')
    banner = ('<div class="gm-banner">GM ONLY · Players, look away. Spoilers, loot tables and boss secrets ahead.</div>'
              if is_gm else "")
    search_src = "search-gm.js" if is_gm else f"{up}assets/search.js"
    extra = "".join(f'<script src="{s}"></script>' for s in scripts)
    robots = '<meta name="robots" content="noindex,nofollow">' if (noindex or is_gm) else ""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{robots}
<title>{html.escape(title)} · World Dungeon</title>
<link rel="stylesheet" href="{up}assets/style.css">{"".join(f'<link rel="stylesheet" href="{x}">' for x in styles)}
</head>
<body class="{'gm' if is_gm else 'player'}" data-base="{up}">
<header class="topbar">
  <button class="menu-btn" type="button" aria-label="Menu">☰</button>
  <a class="brand" href="{up}{'gm/' if is_gm else ''}index.html"><b>World Dungeon</b><span>{'GM AREA' if is_gm else 'CRAWLER RULES'}</span></a>
  <div class="search"><input type="search" placeholder="Search{' everything' if is_gm else ' the rules'} (press /)" aria-label="Search"><div class="results"></div></div>
  {gm_toggle}
</header>
<div class="layout{'' if toc_html else ' no-toc'}">
{nav_html(active, is_gm)}
<main>{banner}{body}</main>
{toc_html}
</div>
<script src="{search_src}"></script>
{extra}
<script src="{up}assets/app.js"></script>
</body>
</html>
"""


def build_rule_pages(pages, is_gm, index):
    out_dir = SITE / "gm" if is_gm else SITE
    for slug, src, group, css in pages:
        md = (ROOT / src).read_text()
        title = page_title(md)
        body = bp.convert(md, group, css)
        body, toc = postprocess(body, is_gm)
        (out_dir / f"{slug}.html").write_text(page(title, body, slug, is_gm, toc))
        url = ("gm/" if is_gm else "") + f"{slug}.html"
        index.extend(search_entries(body, title, url))


def skills_data():
    md = (ROOT / "classes/crawler-skills.md").read_text()
    skills = []
    for sec in re.split(r"\n## ", md)[1:]:
        cat = sec.split("\n", 1)[0].strip()
        if cat not in ("Combat", "Survival", "Utility", "Showmanship", "Magic"):
            continue
        for block in re.split(r"\n### ", sec)[1:]:
            lines = [l.strip() for l in block.split("\n")]
            name = lines[0]
            meta = next((l for l in lines[1:] if l.startswith("**")), "")
            key = re.search(r"Key ability: ([^·*]+)", meta)
            cue = next((l for l in lines if l.startswith("*GM cue:*")), "")
            scaling = next((l for l in lines if l.startswith("*Scaling:*")), "")
            intro = " ".join(l for l in lines[2:] if l and not l.startswith(("*", "-", "**", "---")))
            ms = []
            for l in lines:
                m = re.match(r"- \*\*Level (\d+) — (.+?)\*\*\s*(.*)", l)
                if m:
                    ms.append({"lv": m.group(1), "name": bp.inline(m.group(2)), "text": bp.inline(m.group(3))})
            skills.append({"name": name, "cat": cat, "key": key.group(1).strip() if key else "",
                           "cue": bp.inline(cue.replace("*GM cue:*", "").strip()),
                           "scaling": bp.inline(scaling.replace("*Scaling:*", "").strip()),
                           "intro": bp.inline(intro), "ms": ms})
    return skills


def home_page():
    cards = ([(SHEET_URL, "Crawler Sheet app", "Build and play your crawler on your phone. It saves to your GM's Tabletop Forge and rolls for you.")] if SHEET_URL else []) + [
        ("create.html", "Create a crawler", "Step-by-step: ability scores, proficiencies, your first Crawler Skill, gear, and a printable summary."),
        ("crawler.html", "The Crawler", "The base class every survivor starts with."),
        ("crawler-skills.html", "Crawler Skills", "45 trained skills from Demolitionist to Pet Trainer."),
        ("class-selection.html", "Floor 3 class selection", "Pick any Player's Handbook class, and keep everything Crawler."),
        ("race-selection.html", "Floor 3 race selection", "No race until Floor 3, then any species, with all its choices."),
        ("mana.html", "Mana", "One mana pool for every spell. No spell slots."),
        ("safe-rooms-and-timer.html", "Safe rooms and the timer", "Resting, Ambush Checks, the floor collapse, stairwells."),
        ("surviving-the-crawl.html", "The Show Must Go On", "The audience, achievements and loot boxes from your side."),
        ("pets.html", "Pets", "Eggs, taming, upgrades and evolutions."),
        ("crafting.html", "Crafting", "Turn monster parts and scrap into bombs, guns and magic."),
        ("downloads.html", "Downloads", "Every rulebook as a PDF, and the character sheet."),
    ]
    newtab = ' target="_blank" rel="noopener"'
    grid = "".join(f'<a class="card" href="{u}"{newtab if SHEET_URL and u == SHEET_URL else ""}><b>{t}</b><span>{d}</span></a>' for u, t, d in cards)
    body = f"""
<section class="hero">
  <div class="k">WORLD DUNGEON · A D&amp;D 5E SETTING</div>
  <h1>Welcome,<br><span>Crawler.</span></h1>
  <p>Earth is gone. You're in the dungeon now, on camera, in whatever you were wearing. Here's how to survive it.</p>
  <div class="btns">{f'<a class="btn primary" href="{SHEET_URL}" target="_blank" rel="noopener">Open the Crawler Sheet</a>' if SHEET_URL else '<a class="btn primary" href="create.html">Create your crawler</a>'}<a class="btn ghost" href="crawler.html">Read the rules</a></div>
</section>
<blockquote class="system"><em>"Welcome, Crawler. Your ordinary life has ended. Your new one will probably be shorter."</em></blockquote>
<h2 id="start">Start here</h2>
<div class="cards">{grid}</div>
<p class="hint">Fan-made homebrew inspired by <i>Dungeon Crawler Carl</i>. For home games only.</p>"""
    return page("Home", body, "home")


def downloads_page(pdfs, is_gm):
    rows = "".join(f'<a href="downloads/{f}"><span><b>{t}</b><br><small>{d}</small></span><small>PDF</small></a>'
                   for f, t, d in pdfs if (SITE / ("gm" if is_gm else "") / "downloads" / f).exists())
    return f'<div class="downloads">{rows}</div>'


def gm_home():
    cards = [
        ("dungeon-builder.html", "Dungeon Builder", "Turn your physical tiles and props into a floor map: neighbourhoods, boss rooms, safe rooms, stairwells. Prints on A4 or at scale."),
        ("floor-1-neighbourhoods.html", "Floor 1", "Neighbourhoods, encounter tables, boss rooms with hints, stat blocks."),
        ("box-tables.html", "Loot box tables", "d100 tables for all 19 box types. Click Roll."),
        ("enemy-loot.html", "Enemy loot", "Coin and drops for 12 creature types."),
        ("achievements.html", "Achievements", "Tiers, the Audience Meter, 54 examples."),
        ("loot-boxes.html", "Loot boxes", "Rarity, earning boxes, the Player Killer mark."),
        ("celestial-relics.html", "Celestial relics", "Game-breaking unique relics."),
    ]
    grid = "".join(f'<a class="card" href="{u}"><b>{t}</b><span>{d}</span></a>' for u, t, d in cards)
    body = f"""<header class="chapter-head"><div class="kicker">GM area</div><h1>Behind the curtain</h1></header>
<p>Everything players should not read: floor guides, boss mechanics, loot tables and the achievement list. Tables with a die in the first column have a <b>Roll</b> button.</p>
<h2 id="sections">Sections</h2><div class="cards">{grid}</div>
<h2 id="downloads">GM downloads</h2>{downloads_page(GM_PDFS, True)}"""
    return page("GM area", body, "gm-home", is_gm=True)


def dungeon_builder_page():
    body = """<header class="chapter-head"><div class="kicker">GM tool</div><h1>Dungeon Builder</h1></header>
<p class="hint">Tell it which tiles and props you own, name your neighbourhoods, and it lays out a floor you can build on the table: each neighbourhood with a boss room, plus safe rooms and stairwells. Print it on one A4 page, or at scale across as many sheets as it needs.</p>
<div id="wd-builder"></div>"""
    return page("Dungeon Builder", body, "dungeon-builder", is_gm=True, scripts=("../assets/dungeon.js",), styles=("../assets/dungeon.css",))


def create_page():
    body = """<header class="chapter-head"><div class="kicker">Character creation</div><h1>Create a crawler</h1></header>
<p class="hint">Six quick steps. Everything saves in your browser as you go, so you can come back later.</p>""" + (f'<p class="hint"><b>Playing with a Tabletop Forge GM?</b> <a href="{SHEET_URL}" target="_blank" rel="noopener">The Crawler Sheet</a> walks you through the same steps, keeps your crawler on the server and rolls your dice.</p>' if SHEET_URL else "") + """
<ul class="steps"></ul>
<div class="wiz"><section id="step-host" class="step on"></section><aside class="summary"></aside></div>"""
    return page("Create a crawler", body, "create", scripts=("assets/skills.js", "assets/create.js"))


HTACCESS = """# Password-protect the GM area.
# 1. Create a password file OUTSIDE your web root, for example:
#      htpasswd -c /etc/apache2/.htpasswd-worlddungeon gm
# 2. Set AuthUserFile below to that path.
# 3. Rename this file to .htaccess (your Apache config needs "AllowOverride AuthConfig").
AuthType Basic
AuthName "World Dungeon GM Area"
AuthUserFile /etc/apache2/.htpasswd-worlddungeon
Require valid-user
"""


def main():
    if SITE.exists():
        shutil.rmtree(SITE)
    (SITE / "assets").mkdir(parents=True)
    if not NO_GM:
        (SITE / "gm" / "downloads").mkdir(parents=True)
    (SITE / "downloads").mkdir()
    for f in ("style.css", "app.js", "create.js", "dungeon.js", "dungeon.css"):
        shutil.copy(ASSETS / f, SITE / "assets" / f)
    for f, *_ in PLAYER_PDFS:
        if (ROOT / "pdf" / f).exists():
            shutil.copy(ROOT / "pdf" / f, SITE / "downloads" / f)
    for f, *_ in ([] if NO_GM else GM_PDFS):
        if (ROOT / "pdf" / f).exists():
            shutil.copy(ROOT / "pdf" / f, SITE / "gm" / "downloads" / f)

    player_index, gm_index = [], []
    build_rule_pages(PLAYER, False, player_index)
    if not NO_GM:
        build_rule_pages(GM, True, gm_index)

    (SITE / "index.html").write_text(home_page())
    (SITE / "create.html").write_text(create_page())
    dl = ('<header class="chapter-head"><div class="kicker">Downloads</div><h1>Rulebooks and sheets</h1></header>'
          "<p>Every player rulebook as a printable PDF, and the Crawler Character Sheet.</p>" + downloads_page(PLAYER_PDFS, False))
    (SITE / "downloads.html").write_text(page("Downloads", dl, "downloads"))
    if not NO_GM:
        (SITE / "gm" / "index.html").write_text(gm_home())
        (SITE / "gm" / "dungeon-builder.html").write_text(dungeon_builder_page())

    (SITE / "assets" / "search.js").write_text("window.SEARCH_INDEX=" + json.dumps(player_index) + ";")
    if not NO_GM:
        (SITE / "gm" / "search-gm.js").write_text("window.SEARCH_INDEX=" + json.dumps(player_index + gm_index) + ";")
    (SITE / "assets" / "skills.js").write_text("window.CRAWLER_SKILLS=" + json.dumps(skills_data()) + ";")
    if not NO_GM:
        (SITE / "gm" / "htaccess-example.txt").write_text(HTACCESS)
    (SITE / "robots.txt").write_text("User-agent: *\nDisallow: /gm/\n")
    count = len(list(SITE.rglob("*.html")))
    print(f"Wrote {SITE} ({count} pages, {len(player_index)} player and {len(gm_index)} GM search entries)")


if __name__ == "__main__":
    main()
