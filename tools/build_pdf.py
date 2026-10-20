#!/usr/bin/env python3
"""Build a styled PDF handbook from the setting's markdown design files.

Usage: python3 tools/build_pdf.py
Output: one PDF per book in BOOKS, written to pdf/

Needs only Python 3 and Google Chrome (used headless to print the HTML).
"""
import html
import json
import re
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Each book: output name, cover, contents blurbs, and chapters as (file, css class).
BOOKS = [
    {
        "out": "The-Crawler.pdf",
        "title": "The Crawler",
        "footer": "THE CRAWLER  ·  WORLD DUNGEON",
        "version_from": "classes/crawler.md",
        "kicker": "WORLD DUNGEON · CLASS HANDBOOK",
        "cover_title": "The<br><span>Crawler</span>",
        "sub": "The base class every survivor starts with, and the Crawler Skills they grow on the way down. A D&amp;D 5e setting.",
        "hud": "crawler",
        "chapters": [
            ("classes/crawler.md", "class", "Character creation, Crawler Core, survivor features (levels 1–9, kept for good), Inclinations."),
            ("classes/crawler-skills.md", "skills", "Skill rules, the Limit Breaker feat, and 45 Crawler Skills in five categories."),
            ("rules/class-selection.md", "rules", "How a crawler picks a class, and what they keep."),
            ("rules/race-selection.md", "rules", "No race before Floor 3, then any 2024 species, with all its choices."),
            ("rules/tome-magic.md", "rules", "Learning spells from tomes, and spell ranks."),
            ("rules/mana.md", "rules", "One mana pool for all magic: class mana by caster level, Pact Mana for warlocks, converting slot features."),
            ("rules/weapon-ranks.md", "rules", "Weapon ranks I to V, traits, upgrading and reforging, and Heavy Hands."),
            ("rules/leveling.md", "rules", "Floor pacing, proficiency bonus, and levels beyond 20."),
            ("rules/prestige-levels.md", "items", "Levels past 20 in one class: scaling, Epic Boons and five prestige features for each class."),
            ("rules/surviving-the-crawl.md", "rules", "The player's view of the Audience Meter, achievements, loot boxes and looting."),
            ("rules/safe-rooms-and-timer.md", "rules", "Floor turns, resting and Ambush Checks, safe rooms, the floor timer, stairwells, and going down early."),
            ("rules/patches.md", "rules", "The System patches the game mid-crawl: hotfixes, patch notes, its promises, and Bug Bounties."),
        ],
        "how": ("Every crawler builds up three things as they level: <strong>Stat Points</strong> (+1 to an ability every level), "
                "<strong>Skill Picks</strong> (learn or train a Crawler Skill at 1st level and every 5th level), and <strong>Crawler Skills</strong> "
                "(which the GM also levels up when you use them well). On Floor 3 they bolt a real class on top."),
    },
    {
        "out": "Spells.pdf",
        "title": "Spells",
        "footer": "SPELLS  ·  WORLD DUNGEON",
        "version_from": "spells/spell-lists.md",
        "kicker": "WORLD DUNGEON · PLAYER HANDBOOK",
        "cover_title": "Magic<br><span>Missile!</span>",
        "sub": "Over two hundred World Dungeon spells with fixed Rank I to V effects, the class spell lists, and the replacement for every spell a class, species or feat grants.",
        "hud": "spells",
        "chapters": [
            ("spells/spell-lists.md", "tables", "The World Dungeon spell list for each class, and the Replacement Index."),
            ("spells/replacements.md", "rules", "How granted spells work: species, class features, subclasses and feats."),
            ("spells/spells-a-z.md", "items", "All 235 spells in alphabetical order, each with its Rank I to V table."),
        ],
        "how": ("Every World Dungeon spell has five <strong>ranks</strong>. Its table says exactly what each rank does, and it always costs "
                "the mana of its own level. Duplicate tomes and class <strong>Rank Ups</strong> raise ranks; your character level gates them."),
    },
    {
        "out": "Gods.pdf",
        "title": "Gods",
        "footer": "GODS  ·  WORLD DUNGEON",
        "version_from": "rules/gods.md",
        "kicker": "WORLD DUNGEON · OPTIONAL MODULE",
        "cover_title": "Pray<br><span>Harder</span>",
        "sub": "Worship, Favor and Lapses, eight major gods with their Rites, Boons and Smites, and divine gear.",
        "hud": "gods",
        "chapters": [
            ("rules/gods.md", "rules", "Joining a religion, Favor and ranks, Devotions, Lapses and Atonement, leaving a religion, shrines and temples."),
            ("gods/pantheon.md", "rules", "The eight major gods: vows, Devotions, Taboos, Boons, Lapse punishments and Apostate's Smites."),
            ("items/divine-gear.md", "items", "Holy symbols, Indulgence Coupons, the Gauntlet of the Grudging Peace, and gear for each god."),
        ],
        "how": ("Pick a god in <strong>The Pantheon</strong>, take its vow at a shrine, and keep its <strong>Rites</strong>. "
                "Every missed Rite is a <strong>Lapse</strong>, and Lapses get worse. Leaving is allowed. The god will smite you on the way out."),
    },
    {
        "out": "Gods-Stat-Blocks.pdf",
        "title": "Gods and Minor Deities",
        "footer": "GODS AND MINOR DEITIES  ·  WORLD DUNGEON",
        "version_from": "gods/stat-blocks.md",
        "kicker": "WORLD DUNGEON · GM HANDBOOK",
        "cover_title": "Divine<br><span>Intervention</span>",
        "sub": "Stat blocks for the avatars of the eight major gods, and eleven minor deities.",
        "hud": "gods",
        "chapters": [("gods/stat-blocks.md", "floor", "")],
    },
    {
        "out": "Quests.pdf",
        "title": "Quests",
        "footer": "QUESTS  ·  WORLD DUNGEON",
        "version_from": "rules/quests.md",
        "kicker": "WORLD DUNGEON · PLAYER HANDBOOK",
        "cover_title": "Quest<br><span>Accepted</span>",
        "sub": "The quest log, difficulty and length, rewards, failing quests, questlines, and divine quests from your god.",
        "hud": "quests",
        "chapters": [("rules/quests.md", "rules", "")],
    },
    {
        "out": "Quest-Builder.pdf",
        "title": "Quest Builder",
        "footer": "QUEST BUILDER  ·  WORLD DUNGEON",
        "version_from": "quests/quest-builder.md",
        "kicker": "WORLD DUNGEON · GM HANDBOOK",
        "cover_title": "Side<br><span>Quests</span>",
        "sub": "Build quests in eight steps: givers, objectives, stars, deadlines, rewards and fallout, questlines, divine quests for every god, and Floor 1 quests.",
        "hud": "quests",
        "chapters": [
            ("quests/quest-builder.md", "rules", "Eight steps, random tables, setting the stars, deadlines, rewards, fallout, questlines, divine quests, the Quest Card."),
            ("quests/divine-quests.md", "rules", "Divine quests for each of the eight gods, ★ to ★★★★★, Atonement quests and divine questlines."),
            ("quests/floor-1-quests.md", "rules", "Quests for every Floor 1 neighbourhood, System Quests, a dare, and a four-link questline."),
        ],
        "how": ("Build a quest with the <strong>eight steps</strong>, rate it in <strong>stars</strong>, pay it from the "
                "<strong>Rewards</strong> tables, and decide its <strong>fallout</strong> before you hand it out. "
                "Divine quests are ready to use for each god."),
    },
    {
        "out": "Loot-and-Achievements.pdf",
        "title": "Loot and Achievements",
        "footer": "LOOT AND ACHIEVEMENTS  ·  WORLD DUNGEON",
        "version_from": "rules/loot-boxes.md",
        "kicker": "WORLD DUNGEON · GM HANDBOOK",
        "cover_title": "Loot<br><span>Boxes</span>",
        "sub": "Achievements, the Audience Meter, 19 loot box types with d100 tables, explosives, firearms, and the Celestial relics.",
        "hud": "loot",
        "chapters": [
            ("rules/loot-boxes.md", "rules", "Earning boxes, rarity from Bronze to Celestial, rolling loot, the Player Killer mark."),
            ("rules/achievements.md", "tables", "Achievement tiers, the Audience Meter, and 54 example achievements."),
            ("loot/box-tables.md", "tables", "A d100 table for each of the 19 box types, with each type's Celestial relic."),
            ("items/celestial-relics.md", "items", "Game-breaking unique relics, and the General Relics table."),
        ],
        "how": ("When a crawler earns an <strong>achievement</strong>, pick a <strong>box type</strong> that fits the deed and a "
                "<strong>rarity</strong> from its tier. In a safe room, roll a <strong>d100</strong> on that box's table. "
                "Loot found on bodies is in the separate <strong>Enemy Loot</strong> handbook. <em>Italic</em> item names are setting items, defined in "
                "the separate <strong>Explosives</strong>, <strong>Firearms</strong> and <strong>Dungeon Items</strong> handbooks."),
    },
    {
        "out": "Crafting-and-Shops.pdf",
        "title": "Crafting and Shops",
        "footer": "CRAFTING AND SHOPS  ·  WORLD DUNGEON",
        "version_from": "rules/crafting.md",
        "kicker": "WORLD DUNGEON · PLAYER HANDBOOK",
        "cover_title": "Build It,<br><span>Buy It</span>",
        "sub": "Crafting with dungeon materials, every recipe from pipe bombs to vorpal swords, and the shops in every safe room.",
        "hud": "crafting",
        "chapters": [
            ("rules/crafting.md", "rules", "Tools, materials, field and workbench crafting, magic item costs, and Crawler Skill bonuses."),
            ("items/crafting-recipes.md", "tables flow", "Recipes for explosives, firearms, dungeon items, standard magic items and spell scrolls."),
            ("rules/safe-room-shops.md", "rules", "Shop types, stock by floor, prices, materials, recipes, selling, services and discounts."),
        ],
        "how": ("Find what you want to make in the <strong>recipe</strong> chapter. Gather the <strong>gold</strong>, the "
                "<strong>materials</strong> (from bodies, boxes and shops) and the <strong>floor turns</strong>. Field items can be made "
                "on any short rest; everything else needs a safe room <strong>workbench</strong>."),
    },
    {
        "out": "Pets.pdf",
        "title": "Pets",
        "footer": "PETS  ·  WORLD DUNGEON",
        "version_from": "rules/pets.md",
        "kicker": "WORLD DUNGEON · PLAYER HANDBOOK",
        "cover_title": "Who's a<br><span>Good Boy?</span>",
        "sub": "Getting a pet, commanding it in a fight, upgrades and evolutions, Pet Egg hatch tables, and taming.",
        "hud": "pets",
        "chapters": [("rules/pets.md", "rules", "")],
    },
    {
        "out": "Floor-1.pdf",
        "title": "Floor 1",
        "footer": "FLOOR 1  ·  WORLD DUNGEON",
        "version_from": "floors/floor-1/overview.md",
        "kicker": "WORLD DUNGEON · GM FLOOR GUIDE",
        "cover_title": "Floor<br><span>One</span>",
        "sub": "Seven neighbourhoods with encounter tables, boss rooms, hints, mechanics and stat blocks, plus the floor boss.",
        "hud": "floor1",
        "chapters": [
            ("floors/floor-1/overview.md", "rules", "The floor at a glance, how to run encounters, bosses, hints and rewards."),
            ("floors/floor-1/neighbourhoods.md", "floor", "The seven neighbourhoods and Club Stairwell: encounters, boss rooms, mechanics, hints and stat blocks."),
            ("quests/floor-1-quests.md", "rules", "Quests for every neighbourhood, System Quests, a dare, and the questline The Clown Who Wasn't There."),
        ],
        "how": ("Each neighbourhood has a <strong>d12 encounter table</strong> for its corridors and rooms, a <strong>boss room</strong> "
                "with its mechanics, and <strong>hints</strong> to plant on the way in. Monster Manual creatures use the "
                "<strong>2025 Monster Manual</strong>; custom creatures' stat blocks sit at the end of their neighbourhood."),
    },
    {
        "out": "Enemy-Loot.pdf",
        "title": "Enemy Loot",
        "footer": "ENEMY LOOT  ·  WORLD DUNGEON",
        "version_from": "loot/enemy-loot.md",
        "kicker": "WORLD DUNGEON · GM HANDBOOK",
        "cover_title": "Loot the<br><span>Bodies</span>",
        "sub": "Coin and d100 drop tables for 12 creature types across four tiers, plus monster parts, scrap and essence.",
        "hud": "enemy",
        "chapters": [("loot/enemy-loot.md", "tables", "")],
    },
    {
        "out": "Explosives.pdf",
        "title": "Explosives",
        "footer": "EXPLOSIVES  ·  WORLD DUNGEON",
        "version_from": "items/explosives.md",
        "kicker": "WORLD DUNGEON · ITEM HANDBOOK",
        "cover_title": "Things That<br><span>Go Boom</span>",
        "sub": "Rules for throwing, setting and surviving bombs, 23 explosives from Firecracker Bundle to Mini Sun, and explosive gear.",
        "hud": "explosives",
        "chapters": [("items/explosives.md", "items", "")],
    },
    {
        "out": "Firearms.pdf",
        "title": "Firearms",
        "footer": "FIREARMS  ·  WORLD DUNGEON",
        "version_from": "items/firearms.md",
        "kicker": "WORLD DUNGEON · ITEM HANDBOOK",
        "cover_title": "Lock &amp;<br><span>Load</span>",
        "sub": "Firearm rules and properties, special rounds, 16 guns, magic firearms, and gun gear.",
        "hud": "firearms",
        "chapters": [("items/firearms.md", "items", "")],
    },
    {
        "out": "Dungeon-Items.pdf",
        "title": "Dungeon Items",
        "footer": "DUNGEON ITEMS  ·  WORLD DUNGEON",
        "version_from": "items/dungeon-items.md",
        "kicker": "WORLD DUNGEON · ITEM HANDBOOK",
        "cover_title": "Dungeon<br><span>Items</span>",
        "sub": "Every setting item found in loot boxes and on bodies: potions, pet gear, divine gifts, Spicy and Murder loot, and troll prizes.",
        "hud": "items",
        "chapters": [("items/dungeon-items.md", "items", "")],
    },
]

# Cross-reference ids shown in backticks in the markdown.
XREF = {
    "crawler": "The Crawler",
    "crawler-skills": "Crawler Skills",
    "class-selection": "Floor 3 Class Selection",
    "race-selection": "Floor 3 Race Selection",
    "tome-magic": "Tome Magic",
    "mana": "Mana",
    "leveling": "Leveling",
    "loot-boxes": "Loot Boxes",
    "enemy-loot": "Enemy Loot",
    "pets": "Pets",
    "prestige-levels": "Prestige Levels",
    "floor-1-overview": "Floor 1 Overview",
    "floor-1-neighbourhoods": "The Neighbourhoods",
    "crafting": "Crafting",
    "crafting-recipes": "Crafting Recipes",
    "safe-room-shops": "Safe Room Shops",
    "surviving-the-crawl": "The Show Must Go On",
    "safe-rooms-and-timer": "Safe Rooms and the Floor Timer",
    "achievements": "Achievements",
    "box-tables": "Loot Box Tables",
    "explosives": "Explosives",
    "firearms": "Firearms",
    "dungeon-items": "Dungeon Items",
    "celestial-relics": "Celestial Relics",
    "weapon-ranks": "Weapon Ranks",
    "gods": "Gods and Worship",
    "pantheon": "The Pantheon",
    "divine-gear": "Divine Gear",
    "god-stat-blocks": "Gods and Minor Deities",
    "quests": "Quests",
    "quest-builder": "Quest Builder",
    "divine-quests": "Divine Quests",
    "floor-1-quests": "Floor 1 Quests",
    "building-mobs": "Building Mobs",
    "spell-lists": "Spell Lists",
    "spells-replacements": "Granted Spells and Replacements",
    "spells-a-z": "Spells A to Z",
}

# H2 sections laid out in two columns of cards.
SKILL_COLUMNS = {"Combat", "Survival", "Utility", "Showmanship", "Magic", "Breaking the Cap"}
ITEM_NO_COLUMNS = {"Explosive Rules", "Quick Reference", "Firearm Rules", "Firearms Table", "Rules", "General Relics",
                   "Prestige Rules", "Designer Notes"}


def use_columns(text, css):
    if css == "skills":
        return text in SKILL_COLUMNS
    # Letter headings in the A to Z spell list stay one column: spell tables need the width.
    return css == "items" and text not in ITEM_NO_COLUMNS and not re.fullmatch(r"[A-Z]|0–9", text)


def xref(match):
    key = match.group(1)
    name = XREF.get(key) or key.replace("-", " ").title()
    return f'<span class="xref">{name}</span>'


def inline(text):
    text = text.replace("\\*", "\x00")  # escaped asterisk: keep it literal
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", xref, text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    return text.replace("\x00", "*")


def table(rows):
    cells = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
    head, body = cells[0], cells[2:]
    keyval = all(not h for h in head)
    out = [f'<table class="{"kv" if keyval else "grid"}">']
    if not keyval:
        out.append("<thead><tr>" + "".join(f"<th>{inline(h)}</th>" for h in head) + "</tr></thead>")
    out.append("<tbody>")
    for r in body:
        out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
    out.append("</tbody></table>")
    return "\n".join(out)


def list_item(text):
    m = re.match(r"\*\*Level (\d+) — (.+?)\*\*\s*(.*)", text)
    if m:
        lvl, name, rest = m.groups()
        return (f'<li class="ms"><span class="lv"><small>LV</small>{lvl}</span>'
                f'<div><strong>{inline(name)}</strong> {inline(rest)}</div></li>')
    return f"<li>{inline(text)}</li>"


def convert(md, kicker, css):
    md = re.sub(r"\A---\n.*?\n---\n", "", md, flags=re.S)
    lines = md.split("\n")
    out, para = [], []
    state = {"entry": False, "cols": False}

    def flush():
        if para:
            out.append(f"<p>{inline(' '.join(para))}</p>")
            para.clear()

    def close_entry():
        if state["entry"]:
            out.append("</section>")
            state["entry"] = False

    def close_cols():
        close_entry()
        if state["cols"]:
            out.append("</div>")
            state["cols"] = False

    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if not s:
            flush()
            i += 1
            continue
        h = re.match(r"^(#{1,4}) (.+)$", s)
        if h:
            flush()
            lvl, text = len(h.group(1)), h.group(2)
            if lvl == 1:
                close_cols()
                out.append(f'<header class="chapter-head"><div class="kicker">{kicker}</div>'
                           f"<h1>{inline(text)}</h1></header>")
            elif lvl == 2:
                close_cols()
                cat = "cat" if css == "skills" and use_columns(text, css) and text != "Breaking the Cap" else ""
                out.append(f'<h2 class="{cat}">{inline(text)}</h2>')
                if use_columns(text, css):
                    out.append('<div class="cols">')
                    state["cols"] = True
                elif css == "tables" and text not in ("Rules", "Example Achievements"):
                    out.append('<div class="keep">')
                    state["cols"] = True
            elif lvl == 3:
                close_entry()
                extra = ""
                if text.startswith("Stat Block: "):
                    text, extra = text[len("Stat Block: "):], " statblock"
                out.append(f'<section class="entry{extra}"><h3>{inline(text)}</h3>')
                state["entry"] = True
                # A bold-only line right after the heading is the metadata line.
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1
                meta = re.match(r"^\*\*(.+)\*\*$", lines[j].strip()) if j < len(lines) else None
                if meta and "**" not in meta.group(1):
                    parts = [c.strip() for c in meta.group(1).split("·") if c.strip() != "Crawler Skill"]
                    chips = "".join(f"<span>{inline(c)}</span>" for c in parts)
                    out.append(f'<div class="meta">{chips}</div>')
                    i = j
            else:
                out.append(f"<h4>{inline(text)}</h4>")
            i += 1
            continue
        if s == "---":
            flush()
            close_entry()
            i += 1
            continue
        if s.startswith(">"):
            flush()
            block = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                block.append(lines[i].strip()[1:].strip())
                i += 1
            text = " ".join(block)
            kind = "system" if text.startswith('*"') or text.startswith("**Inspect") else "note"
            out.append(f'<blockquote class="{kind}">{inline(text)}</blockquote>')
            continue
        if s.startswith("|"):
            flush()
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(lines[i])
                i += 1
            out.append(table(rows))
            continue
        if re.match(r"^(- |\d+\. )", s):
            flush()
            ordered = bool(re.match(r"^\d+\. ", s))
            items = []
            while i < len(lines) and re.match(r"^(- |\d+\. )", lines[i].strip()):
                items.append(re.sub(r"^(- |\d+\. )", "", lines[i].strip()))
                i += 1
            tag = "ol" if ordered else "ul"
            cls = ' class="milestones"' if items and items[0].startswith("**Level ") else ""
            out.append(f"<{tag}{cls}>" + "".join(list_item(t) for t in items) + f"</{tag}>")
            continue
        kv = re.match(r"^\*([A-Za-z ]+):\*\s*(.*)$", s)
        if kv:
            flush()
            out.append(f'<p class="kvline"><span class="k">{kv.group(1)}</span>{inline(kv.group(2))}</p>')
            i += 1
            continue
        para.append(s)
        i += 1
    flush()
    close_cols()
    return f'<article class="chapter {css}">' + "\n".join(out) + "</article>"


def version_of(md):
    m = re.search(r"^version:\s*(\S+)", md, re.M)
    return m.group(1) if m else "?"


CSS = r"""
:root{
  --ink:#1c1b24; --muted:#5d5a66; --paper:#ffffff; --rule:#d9d4c7;
  --pink:#d81b60; --teal:#00808a; --gold:#b8892a; --zebra:#f2efe7;
  --panel:#15141c; --cyan:#72f0dc;
  --display:"Avenir Next Condensed","Futura","Helvetica Neue",sans-serif;
  --body:"Iowan Old Style","Palatino","Georgia",serif;
  --mono:"Menlo","Monaco",monospace;
}
@page{
  size:A4; margin:17mm 15mm 18mm 15mm;
  @bottom-left{content:"FOOTER_TEXT"; font:600 7pt "Avenir Next Condensed",sans-serif; letter-spacing:.18em; color:#8a8693;}
  @bottom-right{content:counter(page); font:700 8pt "Menlo",monospace; color:#d81b60;}
}
@page cover{margin:0; @bottom-left{content:none} @bottom-right{content:none}}
*{box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact}
html,body{margin:0; background:var(--paper); color:var(--ink)}
body{font:9.4pt/1.47 var(--body)}
strong{font-weight:700}
em{font-style:italic}

/* ---------- cover ---------- */
.cover{page:cover; height:297mm; width:210mm; position:relative; overflow:hidden; color:#fff;
  background:
    radial-gradient(ellipse at 75% 20%, rgba(216,27,96,.45), transparent 55%),
    radial-gradient(ellipse at 10% 90%, rgba(0,128,138,.5), transparent 55%),
    repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 9mm),
    repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, transparent 1px 9mm),
    #0f0e15;
  padding:26mm 20mm; break-after:page}
.cover .top{font:600 9pt var(--mono); letter-spacing:.3em; color:var(--cyan)}
.cover h1{font:800 64pt/0.9 var(--display); letter-spacing:.02em; text-transform:uppercase; margin:52mm 0 4mm}
.cover h1 span{color:var(--pink)}
.cover .sub{font:500 15pt/1.3 var(--display); color:#d8d4e4; max-width:140mm}
.hud{position:absolute; left:20mm; right:20mm; bottom:44mm; border:1.4px solid rgba(114,240,220,.55);
  border-radius:3mm; padding:6mm 7mm; background:rgba(10,10,16,.6); font:9pt var(--mono); color:#d9fff8}
.hud .row{display:flex; align-items:center; gap:4mm; margin:2.2mm 0}
.hud .lbl{width:18mm; color:var(--cyan); letter-spacing:.15em}
.hud .bar{flex:1; height:3.2mm; border-radius:2mm; background:rgba(255,255,255,.1); overflow:hidden}
.hud .bar i{display:block; height:100%}
.hud .hp i{width:100%; background:linear-gradient(90deg,#e0245e,#ff6f91)}
.hud .mp i{width:35%; background:linear-gradient(90deg,#1f8bff,#72f0dc)}
.hud .val{width:16mm; text-align:right}
.hud .stats{display:flex; gap:8mm; margin-top:4mm; padding-top:3mm; border-top:1px dashed rgba(114,240,220,.35); color:#bfeee6}
.hud .stats b{color:#fff}
.cover .foot{position:absolute; left:20mm; right:20mm; bottom:16mm; font:8pt/1.5 var(--mono); color:#9a96a8}

/* ---------- contents ---------- */
.toc{break-after:page; padding-top:10mm}
.toc h2{font:800 26pt var(--display); text-transform:uppercase; margin:0 0 8mm; border:0; color:var(--ink)}
.toc ol{list-style:none; padding:0; margin:0}
.toc li{display:grid; grid-template-columns:24mm 1fr 16mm; padding:4mm 0; border-bottom:1px solid var(--rule)}
.toc .n{font:700 9pt var(--mono); color:var(--pink); padding-top:1.5mm}
.toc .t{font:700 15pt var(--display); text-transform:uppercase}
.toc .d{font-size:9pt; color:var(--muted)}
.toc .p{font:800 15pt var(--display); color:var(--pink); text-align:right; align-self:center}
.toc .how{margin-top:12mm; padding:5mm 6mm; background:var(--zebra); border-radius:2mm; font-size:9pt}
.toc .how h3{font:700 11pt var(--display); text-transform:uppercase; margin:0 0 2mm; color:var(--teal)}

/* ---------- chapters ---------- */
.chapter{break-before:page}
.chapter-head{border-bottom:3px solid var(--ink); margin-bottom:5mm; padding-bottom:2mm; position:relative}
.chapter-head::after{content:""; position:absolute; left:0; bottom:-3px; width:32mm; height:3px; background:var(--pink)}
.kicker{font:700 8pt var(--mono); letter-spacing:.3em; text-transform:uppercase; color:var(--pink)}
h1{font:800 34pt/1 var(--display); text-transform:uppercase; margin:1mm 0 0; letter-spacing:.01em}
h2{font:700 16pt/1.1 var(--display); text-transform:uppercase; color:var(--teal); letter-spacing:.03em;
  border-bottom:1.2px solid var(--teal); padding-bottom:1mm; margin:7mm 0 3mm; break-after:avoid}
h2.cat{break-before:page; margin-top:0}
h3{font:700 12pt/1.15 var(--display); text-transform:uppercase; letter-spacing:.03em; margin:5mm 0 1.2mm;
  padding-left:2.6mm; border-left:3.2px solid var(--pink); break-after:avoid}
h4{font:700 10.5pt var(--display); text-transform:uppercase; color:var(--gold); margin:4mm 0 1mm; break-after:avoid}
p{margin:0 0 2.2mm}
ul,ol{margin:0 0 2.6mm; padding-left:5mm}
li{margin:0 0 1mm}
ul li::marker{color:var(--pink)}
ol li::marker{color:var(--pink); font:700 8.5pt var(--mono)}
.xref{font-variant:small-caps; font-weight:700; color:var(--teal); letter-spacing:.02em}

.meta{display:flex; flex-wrap:wrap; gap:1.2mm; margin:0 0 2mm}
.meta span{font:600 6.8pt/1 var(--mono); text-transform:uppercase; letter-spacing:.06em; padding:1.1mm 1.6mm;
  border-radius:1mm; background:#ebe7dc; color:#4a4654}
.meta span:first-child{background:var(--pink); color:#fff}

.kvline{font-size:8.9pt; margin:0 0 1.3mm}
.kvline .k{display:inline-block; font:700 6.8pt var(--mono); text-transform:uppercase; letter-spacing:.08em;
  color:var(--teal); margin-right:1.6mm}

ul.milestones{list-style:none; padding:0; margin:2mm 0 0}
ul.milestones li.ms{display:grid; grid-template-columns:9mm 1fr; gap:2mm; margin:0 0 1.6mm; font-size:9pt}
.lv{display:flex; flex-direction:column; align-items:center; justify-content:center; height:8.2mm; border-radius:1.4mm;
  background:var(--ink); color:#fff; font:800 11pt/1 var(--display)}
.lv small{font:600 5.2pt var(--mono); letter-spacing:.1em; color:var(--cyan); margin-bottom:.4mm}
li.ms:nth-child(2) .lv{background:var(--teal)}
li.ms:nth-child(3) .lv{background:#6a3fa0}
li.ms:nth-child(4) .lv{background:var(--pink)}
li.ms:nth-child(5) .lv{background:linear-gradient(135deg,#b8892a,#f5c542); color:#1c1b24}
li.ms:nth-child(5) .lv small{color:#1c1b24}

table{width:100%; border-collapse:collapse; margin:2mm 0 3.5mm; font-size:8.7pt; break-inside:avoid}
table.grid thead th{background:var(--ink); color:#fff; font:700 8pt var(--display); text-transform:uppercase;
  letter-spacing:.05em; text-align:left; padding:1.6mm 2mm}
table td{padding:1.4mm 2mm; vertical-align:top; border-bottom:1px solid var(--rule)}
table.grid tbody tr:nth-child(even) td{background:var(--zebra)}
table.kv td:first-child{width:34%; font:700 8.4pt var(--display); text-transform:uppercase; letter-spacing:.03em; color:var(--teal)}
table.kv{border-top:2px solid var(--ink)}

blockquote{margin:3mm 0 4mm; break-inside:avoid}
blockquote.system{background:var(--panel); color:var(--cyan); font:9.5pt/1.5 var(--mono); padding:4.5mm 5.5mm 4mm;
  border-radius:2mm; border-left:4px solid var(--pink)}
blockquote.system::before{content:"SYSTEM MESSAGE"; display:block; font:700 6.5pt var(--mono); letter-spacing:.25em;
  color:var(--pink); margin-bottom:1.5mm}
blockquote.system em{font-style:normal}
blockquote.note{background:#f8efd9; border-left:3px solid var(--gold); padding:2.6mm 4mm; font-size:9pt}

/* class chapter: feature blocks */
.chapter.class .entry, .chapter.rules .entry{break-inside:auto}

/* skills chapter: two-column cards */
.cols{column-count:2; column-gap:5mm}
.cols .entry{break-inside:avoid; background:#fbfaf6; border:1px solid var(--rule); border-radius:2mm;
  padding:3mm 3.4mm 2.2mm; margin:0 0 4mm; display:inline-block; width:100%}
.cols .entry h3{margin-top:0}
.cols p{font-size:9pt}
.cols .entry ul{padding-left:4mm; font-size:9pt}

/* table-heavy chapters */
.chapter.tables table{font-size:7.9pt}
.chapter.tables table td{padding:1.2mm 1.6mm}
.chapter.tables table.grid thead th{font-size:7.4pt; padding:1.4mm 1.6mm}
.chapter.tables table td:first-child{white-space:nowrap; font-weight:700}
.chapter.tables h2{margin-top:6mm}
.keep{break-inside:avoid}
.chapter.floor h2 ~ h2{break-before:page; margin-top:0}
.chapter.floor h2{font-size:20pt}
.chapter.floor h2 + p em{color:var(--pink)}
.chapter.floor .entry h3{font-size:13pt}
.statblock{background:#fbfaf6; border:1px solid var(--rule); border-top:3px solid var(--pink); border-radius:2mm;
  padding:3mm 4mm 2mm; margin:0 0 5mm; break-inside:avoid}
.statblock h3{margin-top:0; font-size:14pt}
.statblock table{margin:1.5mm 0 2mm}
.statblock h4{margin:2.5mm 0 .8mm}
.statblock ul{padding-left:4mm}
.statblock{font-size:8.6pt}
.statblock table{font-size:7.9pt}
.statblock table td{padding:.6mm 1.6mm}
.statblock table.grid thead th{padding:.9mm 1.6mm; font-size:7.2pt}
.statblock table.kv td:first-child{width:22%; font-size:7.4pt}
.statblock li{margin:0 0 .6mm; font-size:8.4pt}
.statblock p{margin:0 0 1.2mm}
.chapter.flow table{break-inside:auto}
.chapter.flow tr{break-inside:avoid}

/* loot notification on cover */
.hud .note{font:700 8pt var(--mono); letter-spacing:.25em; color:var(--pink); margin-bottom:2mm}
.hud .big{font:800 20pt/1.1 var(--display); text-transform:uppercase; color:#fff; margin-bottom:1.5mm}
.hud .line{color:#d9fff8; margin:1mm 0}
.tiers{display:flex; gap:2mm; margin-top:4mm}
.tiers span{flex:1; text-align:center; padding:1.6mm 0; border-radius:1.2mm; font:700 7.5pt var(--mono); letter-spacing:.12em; color:#111}
"""


HUDS = {
    "bestiary": """
  <div class="hud">
    <div class="note">INSPECT · LEVEL 3 NEIGHBOURHOOD BOSS</div>
    <div class="big">Chief Kaboomba</div>
    <div class="row"><span class="lbl">HP</span><span class="bar hp"><i style="width:100%"></i></span><span class="val">71 / 71</span></div>
    <div class="line">Grand Marshal of the Fireworks Festival. The Festival is today. You are the fireworks.</div>
    <div class="stats"><span>MOB TIER <b>BOSS</b></span><span>XP <b>100</b></span><span>THREAT <b>EXPLOSIVE</b></span></div>
  </div>""",
    "floor1": """
  <div class="hud">
    <div class="note">FLOOR 1 · TIMER 48:00:00</div>
    <div class="big">Welcome, Crawler!</div>
    <div class="line">Seven neighbourhoods. Seven bosses. One very large bouncer. The stairs are that way.</div>
    <div class="stats"><span>LEVELS <b>1 → 12</b></span><span>SAFE ROOMS <b>5</b></span><span>STAIRWELLS <b>4</b></span><span>LLAMAS <b>BAD</b></span></div>
  </div>""",
    "pets": """
  <div class="hud">
    <div class="note">PET · ALLOSAURUS (CR 2) · HATCHED FLOOR 3</div>
    <div class="row"><span class="lbl">HP</span><span class="bar hp"><i style="width:85%"></i></span><span class="val">41 / 48</span></div>
    <div class="line">Upgrades: Tough, Sharp, Trick (Fetch). The audience rating for your pet is higher than yours.</div>
    <div class="stats"><span>BOND <b>+4</b></span><span>COMMAND <b>BONUS ACTION</b></span><span>STATUS <b>VERY GOOD BOY</b></span></div>
  </div>""",
    "crafting": """
  <div class="hud">
    <div class="note">WORKBENCH · SAFE ROOM 3</div>
    <div class="big">Frag Grenade ×2</div>
    <div class="row"><span class="lbl">BUILD</span><span class="bar hp"><i style="width:100%"></i></span><span class="val">1 / 1</span></div>
    <div class="stats"><span>GOLD <b>75 GP</b></span><span>MATERIALS <b>SCRAP (T1) ×1</b></span><span>REQ <b>DEMOLITIONIST 3</b></span></div>
  </div>""",
    "enemy": """
  <div class="hud">
    <div class="note">LOOT · GOBLIN SKIRMISHER (CR 1/4)</div>
    <div class="line">Coin: 7 gp · Pipe Bomb ×2 · Junk (half a sandwich)</div>
    <div class="line">The System notes: the goblin had a family. They also had pipe bombs.</div>
    <div class="stats"><span>TABLE <b>HUMANOID</b></span><span>TIER <b>1</b></span><span>ROLL <b>84</b></span></div>
  </div>""",
    "explosives": """
  <div class="hud">
    <div class="note">WARNING · LIVE ORDNANCE</div>
    <div class="big">Frag Grenade ×4</div>
    <div class="line">Area 20 ft · Dex DC 13 · 5d6 piercing · Trigger: impact</div>
    <div class="line">The System reminds you: friendly fire is always on.</div>
  </div>""",
    "firearms": """
  <div class="hud">
    <div class="row"><span class="lbl">AMMO</span><span class="bar hp"><i style="width:60%"></i></span><span class="val">18 / 30</span></div>
    <div class="row"><span class="lbl">HEAT</span><span class="bar mp"><i></i></span><span class="val">LOW</span></div>
    <div class="stats"><span>WEAPON <b>ASSAULT RIFLE</b></span><span>DMG <b>2d8</b></span><span>RANGE <b>120/480</b></span><span>MODE <b>BURST</b></span></div>
  </div>""",
    "items": """
  <div class="hud">
    <div class="note">INVENTORY</div>
    <div class="line">Stat Potion ×2 · Pocket Expander · Pet Treats ×3 · Fan Mail</div>
    <div class="line">A Single Sock <span style="color:#ff8ad1">(troll prize)</span> · Golden Toilet <span style="color:#ff8ad1">(10 slots)</span></div>
    <div class="stats"><span>SLOTS <b>27 / 29</b></span><span>WEIGHT <b>0 LB</b></span><span>STATUS <b>CLUTTERED</b></span></div>
  </div>""",
    "quests": """
  <div class="hud">
    <div class="note">NEW QUEST</div>
    <div class="big">Party Pooper ★★</div>
    <div class="line">It is Pippa's birthday. Please find her cake. It is in the ball pit. The ball pit is not empty.</div>
    <div class="stats"><span>LENGTH <b>SHORT</b></span><span>DEADLINE <b>8 TURNS</b></span><span>REWARD <b>80 GP</b></span><span>PENALTY <b>NONE</b></span></div>
  </div>""",
    "gods": """
  <div class="hud">
    <div class="note">DIVINE NOTIFICATION</div>
    <div class="big">Embrix has noticed you</div>
    <div class="line">You put out a fire. On camera. Lapses: 1. Please do not do that again.</div>
    <div class="stats"><span>GOD <b>EMBRIX</b></span><span>FAVOR <b>12</b></span><span>RANK <b>DEVOTEE</b></span><span>LAPSES <b>1 / 5</b></span></div>
  </div>""",
    "spells": """
  <div class="hud">
    <div class="note">NEW SPELL RANK</div>
    <div class="big">Magic Missile · Rank III</div>
    <div class="line">Five darts. They bend around corners now. The audience is thrilled. The goblins are not.</div>
    <div class="stats"><span>LEVEL <b>1ST</b></span><span>COST <b>2 MANA</b></span><span>RANK <b>III / V</b></span><span>SOURCE <b>TOME</b></span></div>
  </div>""",
    "crawler": """
  <div class="hud">
    <div class="row"><span class="lbl">HP</span><span class="bar hp"><i></i></span><span class="val">8 / 8</span></div>
    <div class="row"><span class="lbl">MANA</span><span class="bar mp"><i></i></span><span class="val">1 / 3</span></div>
    <div class="stats"><span>LEVEL <b>1</b></span><span>CLASS <b>NONE</b></span><span>FLOOR <b>1</b></span><span>STAT PTS <b>1</b></span><span>SKILL PICKS <b>1</b></span></div>
  </div>""",
    "loot": """
  <div class="hud">
    <div class="note">NEW ACHIEVEMENT</div>
    <div class="big">Remodeler</div>
    <div class="line">You destroyed an entire building. The building had it coming.</div>
    <div class="line">Reward: <b style="color:#f5c542">GOLD DEMOLITIONIST BOX</b> · Open in a safe room.</div>
    <div class="tiers"><span style="background:#c58a5a">BRONZE</span><span style="background:#c9ced6">SILVER</span><span style="background:#f5c542">GOLD</span><span style="background:#b377ff">LEGENDARY</span><span style="background:linear-gradient(90deg,#72f0dc,#fff,#ff8ad1)">CELESTIAL</span></div>
  </div>""",
}


def cover(book, version):
    today = date.today().strftime("%d %B %Y")
    return f"""
<section class="cover">
  <div class="top">{book["kicker"]}</div>
  <h1>{book["cover_title"]}</h1>
  <div class="sub">{book["sub"]}</div>
  {HUDS[book["hud"]]}
  <div class="foot">Fan-made homebrew inspired by <i>Dungeon Crawler Carl</i>. For home games only.<br>Draft {version} · {today}</div>
</section>"""


def toc(book, titles, pages):
    lis = "".join(f'<li><span class="n">CH. {n}</span><div><div class="t">{t}</div><div class="d">{c[2]}</div></div>'
                  f'<span class="p">{pages.get(n, "")}</span></li>'
                  for n, (t, c) in enumerate(zip(titles, book["chapters"]), 1))
    return f"""
<section class="toc">
  <h2>Contents</h2>
  <ol>{lis}</ol>
  <div class="how"><h3>How to read this book</h3>{book["how"]} Names in
  <span class="xref">small capitals</span> point to another chapter.</div>
</section>"""


def print_pdf(doc, out_pdf):
    with tempfile.TemporaryDirectory() as tmp:
        html_path = Path(tmp) / "book.html"
        html_path.write_text(doc)
        if "--html" in sys.argv:
            out_pdf.with_suffix(".html").write_text(doc)
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        "--print-to-pdf-no-header", f"--print-to-pdf={out_pdf}", html_path.as_uri()],
                       check=True, capture_output=True)


def chapter_pages(pdf, count):
    """Find the page each chapter starts on, by reading the PDF text with PDFKit (macOS)."""
    try:
        result = subprocess.run(["swift", str(ROOT / "tools" / "page_text.swift"), str(pdf)],
                                check=True, capture_output=True, text=True)
        texts = json.loads(result.stdout)
    except (OSError, subprocess.CalledProcessError, json.JSONDecodeError):
        print("  (could not read page numbers; contents left without them)")
        return {}
    pages = {}
    for n in range(1, count + 1):
        for i, t in enumerate(texts):
            if re.search(rf"\bchapter {n}\b", t, re.I):
                pages[n] = i + 1
                break
    return pages


def build(book):
    chapters, titles = [], []
    for n, (path, css, _) in enumerate(book["chapters"], 1):
        # A book can carry generated chapters as text (see build_spellbooks.py).
        md = book["texts"][path] if path in book.get("texts", {}) else (ROOT / path).read_text()
        m = re.search(r"^# (.+)$", md, re.M)
        titles.append(m.group(1) if m else path)
        chapters.append(convert(md, f"Chapter {n}", css))
    version = version_of((ROOT / book["version_from"]).read_text())
    css = CSS.replace("FOOTER_TEXT", book["footer"])
    out_pdf = OUT_DIR / book["out"]

    def render(pages):
        contents = toc(book, titles, pages) if len(chapters) > 1 else ""
        doc = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{book["title"]}</title>'
               f"<style>{css}</style></head><body>{cover(book, version)}{contents}{''.join(chapters)}</body></html>")
        print_pdf(doc, out_pdf)

    render({})
    if len(chapters) > 1:
        # Second pass: the contents page has a fixed size, so page numbers do not move.
        render(chapter_pages(out_pdf, len(chapters)))
    print(f"Wrote {out_pdf}")


def bestiary_book():
    """Bestiary.pdf: the Building Mobs guide, then every stat block (see bestiary.py)."""
    import bestiary
    return {
        "out": "Bestiary.pdf",
        "title": "Bestiary",
        "footer": "BESTIARY  ·  WORLD DUNGEON",
        "version_from": "bestiary/building-mobs.md",
        "kicker": "WORLD DUNGEON · GM HANDBOOK",
        "cover_title": "The<br><span>Bestiary</span>",
        "sub": "How to build mobs and NPC crawlers, the CR guide past CR 30, and every stat block in the World Dungeon.",
        "hud": "bestiary",
        "chapters": [
            ("bestiary/building-mobs.md", "rules", "The stat block, the Crawl fields, Mob Tiers, the CR guide, NPC crawlers and their fighting styles."),
            ("bestiary/all.md", "floor", "Every stat block: Floor 1, NPC crawlers, gods and minor deities."),
        ],
        "texts": {"bestiary/all.md": bestiary.bestiary_book_text(bestiary.load_all())},
        "how": ("Every stat block is a 5e (2024) stat block plus the <strong>Crawl fields</strong>: Mob Tier and XP, level, "
                "loot, where it is found, and its <strong>Inspect</strong> text. Bosses add their box, trophy and achievements."),
    }


def main():
    OUT_DIR.mkdir(exist_ok=True)
    for book in BOOKS + [bestiary_book()]:
        build(book)
    import build_spellbooks  # one printable spellbook per class
    build_spellbooks.main()
    import build_codex  # private Class Codex PDFs (Tabletop Forge server only)
    build_codex.main()


if __name__ == "__main__":
    main()
