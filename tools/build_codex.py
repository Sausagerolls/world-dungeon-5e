#!/usr/bin/env python3
"""Build one Class Codex PDF per class: pdf/Codex-<Class>.pdf

Usage: python3 tools/build_codex.py [Class ...]   (tools/build_pdf.py runs it too)

A codex is the whole class for the World Dungeon in one book:
  1. The <Class> in the World Dungeon: core traits, Floor 3, hit points, mana,
     spells and Rank Ups, prestige levels, and classes/codex/<class>.md (the
     World Dungeon changes, written for this setting).
  2. Class features, with the class table.
  3. Subclasses, with their spells as World Dungeon replacements.
  4. Class options (invocations, metamagic, manoeuvres), where the class has them.
  5. Spells: the class's World Dungeon spells A to Z.

PRIVATE: parts 2 to 4 are Player's Handbook text, read from a Tabletop Forge
checkout at build time (tools/codex_dump.mjs, TTF_SRC). The text is never
written into this repo, and the PDFs must only be hosted on the Tabletop Forge
server, never in a GitHub release or the public site zip (see DEPLOY.md).
"""
import json
import math
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_pdf as bp  # noqa: E402
import spells_data as sd  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
ORD = ["Cantrip", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"]
COST = {1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 9, 7: 10, 8: 11, 9: 13}
AB = {"STR": "Strength", "DEX": "Dexterity", "CON": "Constitution", "INT": "Intelligence", "WIS": "Wisdom", "CHA": "Charisma"}
PRIMARY = {"Barbarian": "Strength", "Bard": "Charisma", "Cleric": "Wisdom", "Druid": "Wisdom", "Fighter": "Strength or Dexterity",
           "Monk": "Dexterity and Wisdom", "Paladin": "Strength and Charisma", "Ranger": "Dexterity and Wisdom", "Rogue": "Dexterity",
           "Sorcerer": "Charisma", "Warlock": "Charisma", "Wizard": "Intelligence"}
THIRD = {"Fighter": "Eldritch Knight", "Rogue": "Arcane Trickster"}
THIRD_PREPARED = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]

# Features the Tabletop Forge tables leave out (2024 class tables), in our own words.
ASI_TEXT = ("You gain the Ability Score Improvement feat or another feat you qualify for. In the World Dungeon this is on top of "
            "the Stat Point every character level gives (Crawler Core).")
EXTRA_FEATURES = {
    "Fighter": [(11, "Two Extra Attacks", "You can attack three times, instead of once, when you take the Attack action on your turn."),
                (13, "Indomitable (two uses)", "You can use Indomitable twice before a long rest."),
                (17, "Action Surge (two uses)", "You can use Action Surge twice before a rest, but only once on a turn."),
                (17, "Indomitable (three uses)", "You can use Indomitable three times before a long rest."),
                (20, "Three Extra Attacks", "You can attack four times, instead of once, when you take the Attack action on your turn.")],
    "Sorcerer": [(10, "Metamagic", "You learn two more Metamagic options."), (17, "Metamagic", "You learn two more Metamagic options.")],
}
ASI_LEVELS = {"Fighter": [4, 6, 8, 12, 14, 16], "Rogue": [4, 8, 10, 12, 16]}


def rules_tables():
    js = (ROOT / "app/src/rules.js").read_text()
    grab = lambda n: [int(x) for x in re.search(rf"const {n} = \[([^\]]+)\]", js).group(1).split(",")]
    return grab("CLASS_MANA"), grab("MAX_SPELL")


CLASS_MANA, MAX_SPELL = rules_tables()


def load_ttf():
    try:
        out = subprocess.run(["node", str(ROOT / "tools/codex_dump.mjs")], check=True, capture_output=True, text=True)
    except (OSError, subprocess.CalledProcessError) as e:
        print(f"  Class Codex skipped: could not read Tabletop Forge class data ({getattr(e, 'stderr', '') or e})")
        return None
    return json.loads(out.stdout)


# ── Spell names in class text become World Dungeon spells ─────────────────
# One-word spell names that are also ordinary game words ("Dim Light", "Fly Speed",
# "Words of Creation"): these are only renamed where the text is plainly about the spell.
AMBIGUOUS = {"Light", "Shield", "Resistance", "Fly", "Jump", "Slow", "Haste", "Heal", "Message", "Friends", "Darkness", "Daylight",
             "Sanctuary", "Gate", "Silence", "Blur", "Web", "Aid", "Alarm", "Creation", "Divination", "Command", "Harm", "Knock",
             "Bane", "Bless", "Guidance", "Darkvision", "Sleep", "Fear", "Mending", "Augury", "Identify", "Confusion", "Blink",
             "Maze", "Wish", "Teleport", "Regenerate", "Resurrection", "Foresight", "Simulacrum"}
SLOT_WORDS = [
    (r"without (?:expending |using )?(?:a |any )?(?:spell |Pact Magic |pact )?slots?", "without spending mana"),
    (r"(?:by )?expending a Pact Magic slot", "by spending Pact Mana (your pact level's cost)"),
    (r"Pact Magic slots?", "Pact Mana"),
]
WD_SLOT_NOTE = ("> *World Dungeon: spell slots are mana here. Spend or regain the mana cost of the slot's level "
                "(see Converting Class Features in `mana`).*")
def spell_renamer(spells):
    pairs = {}
    for s in spells:
        for r in s["replaces"]:
            pairs[r["name"]] = s["name"]
    for r in sd.extra_replacements():
        pairs[r["from"]] = r["to"]
    pairs = {k: v for k, v in pairs.items() if k != v}
    names = sorted(pairs, key=len, reverse=True)
    # Names that are safe to replace anywhere: several words, or one word that is never a game term.
    multi = [n for n in names if " " in n or "'" in n or "/" in n or n not in AMBIGUOUS]
    single = [n for n in names if n not in multi]
    multi_re = re.compile(r"(?<![\w'])(" + "|".join(re.escape(n) for n in multi) + r")(?![\w'])")
    one = "|".join(re.escape(n) for n in single)
    # A one-word name only counts as a spell next to "cast", "the ... spell" and the like.
    single_re = re.compile(rf"(?:(?<=\bcast )|(?<=\bcasts )|(?<=\bcasting )|(?<=\bcast the )|(?<=\blearn )|(?<=\bknow the ))({one})\b"
                           rf"|\b({one})(?= (?:spell|cantrip)s?\b| prepared\b| recommended\b)")

    def rename(text):
        held = []

        def keep(name):
            held.append(f"*{pairs[name]}*")
            return f"\x00{len(held) - 1}\x00"
        text = multi_re.sub(lambda m: keep(m.group(1)), text)
        text = single_re.sub(lambda m: keep(m.group(1) or m.group(2)), text)
        return re.sub(r"\x00(\d+)\x00", lambda m: held[int(m.group(1))], text)
    return rename, pairs


def md_text(text, rename):
    """Tabletop Forge feature text as markdown paragraphs."""
    text = rename(str(text or "").replace("*", "\\*"))
    for pat, rep in SLOT_WORDS:
        text = re.sub(pat, rep, text)
    note = WD_SLOT_NOTE if re.search(r"\bslots?\b", text) else ""
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    out = []
    for p in paras:
        lines = [ln.strip() for ln in p.split("\n") if ln.strip()]
        for ln in lines:
            if ln.startswith("•") or ln.startswith("- "):
                out.append("- " + ln.lstrip("•- ").strip())
            else:
                m = re.match(r"([A-Z][\w' ,()/-]{1,40}?)\.\s+(.+)", ln)
                out.append(f"**{m.group(1)}.** {m.group(2)}" if m and len(m.group(1).split()) <= 6 else ln)
        out.append("")
    if note:
        out += [note, ""]
    return "\n".join(out).strip()


# ── Pieces of the World Dungeon chapter ───────────────────────────────────
def class_menu_row(cls):
    md = (ROOT / "rules/class-selection.md").read_text()
    m = re.search(rf"^\| \*\*{cls}\*\* \| ([^|]+) \| ([^|]+) \| ([^|]+) \|", md, re.M)
    return [x.strip() for x in m.groups()] if m else ["", "", ""]


def prestige_block(cls):
    md = (ROOT / "rules/prestige-levels.md").read_text()
    m = re.search(rf"^### {cls}\n(.*?)(?=^### |^## )", md, re.M | re.S)
    return m.group(1).strip() if m else ""


def codex_changes(cls):
    md = (ROOT / "classes/codex" / f"{cls.lower()}.md").read_text()
    md = re.sub(r"^---.*?---\s*", "", md, flags=re.S)
    return re.sub(r"^# .*\n", "", md, count=1).strip()


def invocations_section():
    md = (ROOT / "spells/replacements.md").read_text()
    m = re.search(r"^## Eldritch Invocations\n(.*?)(?=^## )", md, re.M | re.S)
    return "## Eldritch Invocations\n\n" + m.group(1).strip() if m else ""


def third_rows():
    rows = []
    for lv in range(3, 21):
        cl = math.ceil(lv / 3)
        rows.append(f"| {lv} | {3 if lv >= 10 else 2} | {THIRD_PREPARED[lv - 1]} | {CLASS_MANA[cl]} | {ORD[min(4, MAX_SPELL[cl])]} |")
    return rows


def world_chapter(cls, data, spells):
    caster, menu = data["casterKind"], class_menu_row(cls)
    skills = next((c for c in data["choices"] if c["id"] == "class-skills"), None)
    saves = " and ".join(AB[a] for a in data["saves"])
    armor = ", ".join(data["armor"]) + (" armor" if data["armor"] else "None")
    out = [f"# The {cls} in the World Dungeon", ""]
    if menu[2]:
        out += [f"> *{menu[2].strip(chr(34))}* (the System's pitch)", ""]
    out += [f"This codex is the whole {cls.lower()} for the World Dungeon: the World Dungeon rules first, then every class feature, "
            "every subclass and every spell, already converted. Where the class text and the World Dungeon changes disagree, the changes win.", "",
            "## Core Traits", "", "| Trait | |", "|---|---|",
            f"| Primary ability | {PRIMARY[cls]} |", f"| Hit die | {data['hitDie']} per {cls.lower()} level |",
            f"| Saving throws | {saves} |",
            f"| Skills | Choose {skills['pick_count']}: {', '.join(skills['from'])} |" if skills else "| Skills | See class features |",
            f"| Weapons | {', '.join(data['weapons'])} weapons |", f"| Armor | {armor} |"]
    if data["spellAbility"]:
        out.append(f"| Spellcasting ability | {AB[data['spellAbility']]} |")
    if menu[0]:
        out.append(f"| Spellcasting (World Dungeon) | {menu[0]} |")
    if menu[1]:
        out.append(f"| Good fit for | {menu[1]} |")
    out += ["", "## Becoming a " + cls, "",
            f"Crawlers choose a class on **Floor 3** (see `class-selection`). Taking the {cls.lower()} at character level N makes you an "
            f"N-level {cls.lower()} at once: you gain every {cls.lower()} feature from 1st level to N, and your subclass if N is 3 or higher.",
            "", "- You keep everything Crawler: Crawler Core, survivor features, Crawler Skills, Stat Points, tome spells, loot and achievements.",
            f"- Your saving throws become the {cls.lower()}'s. You add its armor, weapon, tool and skill proficiencies to your own.",
            "- Where a survivor feature overlaps a class feature (Extra Attack, Danger Sense, duplicate proficiencies), use the overlap rules in `crawler`.",
            f"- You get a Bronze **Class Box** with {cls.lower()} gear (see `box-tables`).", "",
            "## Hit Points", "",
            f"Do not recalculate your hit points on Floor 3. Your levels so far keep their d8 Hit Dice. Each level you take in this class afterwards "
            f"gives a {data['hitDie']} Hit Die and hit points for it (roll, or take the fixed value), plus your Constitution modifier.", ""]
    if caster in ("full", "half", "pact"):
        out += ["## Mana and Spells", "",
                "Spellcasting classes in the World Dungeon cast with **mana**, not spell slots (see `mana`). Every spell you know is a tome spell "
                "(see `tome-magic`).", ""]
        if caster == "pact":
            out += ["- **Pact Mana.** A separate small pool that comes back on a short or long rest. It always casts at your pact level (table below). "
                    "A World Dungeon spell cast with Pact Mana gains one rank for each level the pact level is above the spell's level."]
        else:
            out += [f"- **Class mana.** Your {cls.lower()} levels add class mana to your mana pool (table below). It adds to the tome mana every crawler has."]
        out += [f"- **Learning spells.** Learn spells from the World Dungeon {cls} list (the *Spells* chapter of this codex). The Cantrips and Prepared "
                "Spells columns are how many you know. You never prepare spells.",
                "- **Changing spells.** When you gain a level in this class, you can replace one spell it taught you. The new spell starts at Rank I.",
                f"- **Rank Ups.** Each {cls.lower()} level at which the class teaches spells gives one Rank Up for a spell it taught you (see *Spell Ranks* in `tome-magic`).",
                "- **Ranks, not upcasting.** A World Dungeon spell always costs the mana of its own level. Ranks II to V (gated at character levels 3, 5, 9 and 13) make it stronger.",
                "- **Granted spells.** Spells a feature or subclass names become their World Dungeon replacements, shown in this codex (see `spells-replacements`).",
                "- **Converting features.** A feature that spends or restores spell slots uses mana instead (see *Converting Class Features* in `mana`).", ""]
    elif cls in THIRD:
        out += [f"## {THIRD[cls]} Mana and Spells", "",
                f"Only the {THIRD[cls]} casts spells. It is a third caster: its {cls.lower()} levels add class mana (caster level = {cls.lower()} level ÷ 3, rounded up), "
                "and it learns spells from the World Dungeon **Wizard** list, up to 4th level. It gains one Rank Up for each "
                f"{cls.lower()} level from 3rd on. See `mana` and `tome-magic`.", "",
                f"| {cls} level | Cantrips | Spells known | Class mana | Max spell level |", "|---|---|---|---|---|", *third_rows(), ""]
    out += ["## World Dungeon Changes", "", re.sub(r"^## Changes\n+", "", codex_changes(cls)), ""]
    if cls == "Warlock":
        out += [invocations_section(), ""]
    out += ["## Prestige Levels", "",
            f"After 20th level in the {cls.lower()}, further levels in it are **prestige levels** (see `prestige-levels`): your hit die and scaling every level, "
            "a prestige feature at every odd prestige level, and an Epic Boon or 2 Stat Points at every even one.", "",
            prestige_block(cls), ""]
    return "\n".join(out)


def features_chapter(cls, data, rename):
    sub_levels = sorted({f["level"] for s in data["subclasses"][:4] for f in s["features"]})
    has_options = {g["label"].split()[-1].lower() for g in data["options"]}
    feats = [f for f in data["features"] if not (f["name"].endswith("Options") and has_options)]
    rows = {lv: [] for lv in range(1, 21)}
    for f in feats:
        rows[f["level"]].append(f["name"])
    for lv in ASI_LEVELS.get(cls, [4, 8, 12, 16]):
        rows[lv].append("Ability Score Improvement")
    for lv, name, _ in EXTRA_FEATURES.get(cls, []):
        rows[lv].append(name)
    for lv in sub_levels:
        rows[lv].append("Subclass feature")
    caster, lv_data = data["casterKind"], data["levels"]
    head, cols = ["Level", "PB", "Features"], []
    if caster in ("full", "pact"):
        cols = ["Cantrips", "Prepared"]
    elif caster == "half":
        cols = ["Prepared"]
    if caster in ("full", "half"):
        cols += ["Class mana", "Max spell"]
    elif caster == "pact":
        cols += ["Pact mana", "Pact level"]
    out = [f"# {cls} Class Features", "", data["blurb"], "", "## The " + cls + " Table", "",
           "| " + " | ".join(head + cols) + " |", "|" + "---|" * (len(head) + len(cols))]
    for lv in range(1, 21):
        d = lv_data[lv - 1]
        cells = [str(lv), f"+{d['pb']}", ", ".join(rows[lv]) or "—"]
        for c in cols:
            cells.append({"Cantrips": str(d["cantrips"] or "—"), "Prepared": str(d["prepared"] or "—"),
                          "Class mana": str(d["mana"] or "—"), "Max spell": ORD[d["maxSpell"]] if d["maxSpell"] else "—",
                          "Pact mana": str((d["pact"] or {}).get("mana", "—")), "Pact level": ORD[(d["pact"] or {}).get("level", 0)]}[c])
        out.append("| " + " | ".join(cells) + " |")
    out += ["", "## Features", ""]
    entries = [(f["level"], f["name"], f.get("desc", "")) for f in feats]
    entries += [(lv, "Ability Score Improvement", ASI_TEXT) for lv in ASI_LEVELS.get(cls, [4, 8, 12, 16])]
    entries += EXTRA_FEATURES.get(cls, [])
    entries.append((3, f"{cls} Subclass", f"You choose a {cls.lower()} subclass (see the Subclasses chapter). You gain its features at "
                    f"{cls.lower()} levels {', '.join(str(x) for x in sub_levels)}."))
    for lv, name, desc in sorted(entries, key=lambda e: e[0]):
        out += [f"### {name}", f"*Level {lv}*", "", md_text(desc, rename), ""]
    if data["notes"]:
        pass  # Tabletop Forge app notes: not rules.
    return "\n".join(out)


def subclasses_chapter(cls, data, rename, rmap):
    out = [f"# {cls} Subclasses", "",
           f"Choose one at 3rd level. Subclass spells are written into your tome as the World Dungeon spells shown, for free; they don't count "
           "against the spells you learn (see `spells-replacements`).", ""]
    for s in data["subclasses"]:
        out += [f"## {s['name']}", "", s["blurb"], ""]
        if s["spells"]:
            out += ["### Subclass Spells", "", f"| {cls} level | Original spell | World Dungeon spell |", "|---|---|---|"]
            for row in s["spells"]:
                for n in row["names"]:
                    r = rmap.get(n.lower())
                    wd = f"{r['name']}{'' if r['rank'] == 1 else ' (Rank ' + 'I II III IV V'.split()[r['rank'] - 1] + ')'}" if r else "Ask your GM"
                    out.append(f"| {row['level']} | {n} | {wd} |")
            out.append("")
        if s["learnable"]:
            names = sorted({n for row in s["learnable"] for n in row["names"]})
            wd = sorted({rmap[n.lower()]["name"] for n in names if n.lower() in rmap})
            out += ["### Extra Spells You Can Learn", "", ", ".join(wd) + ".", ""]
        for f in sorted(s["features"], key=lambda f: f["level"]):
            out += [f"### {f['name']}", f"*Level {f['level']}*", "", md_text(f.get("desc", ""), rename), ""]
    return "\n".join(out)


def options_chapter(cls, data, rename):
    if not data["options"]:
        return None
    out = [f"# {cls} Options", ""]
    for g in data["options"]:
        out += [f"## {g['label']}", ""]
        for it in sorted(g["items"], key=lambda x: x["name"]):
            pre = re.sub(r"^\w+:\s*", "", it["prereq"]).replace("#c", "") if it["prereq"] else ""
            out += [f"### {it['name']}", f"*Prerequisite: {rename(pre)}*" if pre else "", "", md_text(it["desc"], rename), ""]
    return "\n".join(out)


def spells_chapter(cls, spells_md, max_level=9, list_cls=None):
    list_cls = list_cls or cls
    mine = sorted((b for b in spells_md if list_cls in b[1] and b[0] <= max_level), key=lambda b: re.sub(r"[^a-z0-9]", "", b[2].lower()))
    if not mine:
        return None
    rows = []
    for lv in range(0, max_level + 1):
        names = sorted(n for l, _, n, _ in mine if l == lv)
        if names:
            rows.append(f"| {ORD[lv]} | {COST.get(lv, 'Free')} | {', '.join(names)} |")
    who = f"{THIRD[cls]}s learn" if cls in THIRD else f"{cls}s learn"
    out = [f"# {cls} Spells", "",
           f"{who} spells from the World Dungeon {list_cls} list{', up to 4th level' if max_level == 4 else ''}. Each spell's table shows what every rank does, "
           "and it always costs the mana of its own level. Cantrips are free, with a minimum rank of II at 5th level, III at 11th and IV at 17th.", "",
           "## Spell List", "", "| Level | Mana | Spells |", "|---|---|---|", *rows, ""]
    letter = None
    for b in mine:
        first = b[2][0].upper() if b[2][0].isalpha() else "0–9"
        if first != letter:
            out += [f"## {first}", ""]
            letter = first
        out += [b[3], ""]
    return "\n".join(out)


def granted_spells_chapter(cls, spells_md):
    """Monks: only the Warrior of Shadow's spells."""
    names = {"Monk": ["Lights Out", "Cardboard Cutout"]}.get(cls)
    if not names:
        return None
    blocks = [b[3] for b in spells_md if b[2] in names]
    return (f"# {cls} Spells\n\nMonks don't learn spells. A Warrior of Shadow knows these two (see *World Dungeon Changes*).\n\n"
            + "\n\n".join(blocks) + "\n")


def book_for(cls, data, spells, spells_md, rename, rmap):
    texts, chapters = {}, []

    def add(key, md, css, blurb):
        if md:
            texts[key] = md
            chapters.append((key, css, blurb))
    add("world", world_chapter(cls, data, spells), "rules", "Core traits, Floor 3, hit points, mana and spells, World Dungeon changes, prestige levels.")
    add("features", features_chapter(cls, data, rename), "rules", "The class table and every class feature from 1st to 20th level.")
    add("subclasses", subclasses_chapter(cls, data, rename, rmap), "rules",
        f"{len(data['subclasses'])} subclasses, with their spells as World Dungeon replacements.")
    add("options", options_chapter(cls, data, rename), "rules", "Every option the class picks from.")
    if cls in THIRD:
        add("spells", spells_chapter(cls, spells_md, 4, "Wizard"), "items", f"The {THIRD[cls]}'s spells: the Wizard list up to 4th level, A to Z.")
    elif data["casterKind"] != "none":
        add("spells", spells_chapter(cls, spells_md), "items", f"Every World Dungeon {cls.lower()} spell, A to Z, with its ranks.")
    else:
        add("spells", granted_spells_chapter(cls, spells_md), "items", "The only spells the class can know.")
    menu = class_menu_row(cls)
    bp.HUDS[f"codex-{cls}"] = f"""
  <div class="hud">
    <div class="note">CLASS SELECTED</div>
    <div class="big">{cls}</div>
    <div class="line">{menu[2].strip('"')}</div>
    <div class="stats"><span>HIT DIE <b>{data['hitDie'].upper()}</b></span><span>SUBCLASSES <b>{len(data['subclasses'])}</b></span><span>MAGIC <b>{menu[0].upper() or 'NONE'}</b></span></div>
  </div>"""
    return {
        "out": f"Codex-{cls}.pdf",
        "title": f"{cls} Codex",
        "footer": f"{cls.upper()} CODEX  ·  WORLD DUNGEON",
        "version_from": f"classes/codex/{cls.lower()}.md",
        "kicker": "WORLD DUNGEON · CLASS CODEX",
        "cover_title": f"{cls}<br><span>Codex</span>",
        "sub": f"The whole {cls.lower()} for the World Dungeon: World Dungeon rules, every class feature, every subclass and every spell, in one book.",
        "hud": f"codex-{cls}",
        "chapters": chapters,
        "texts": texts,
        "how": ("Start with <strong>The " + cls + " in the World Dungeon</strong>: it says what is different here. Spell names in the class text "
                "are already the World Dungeon spells, in <em>italics</em>."),
    }


def main(classes=None):
    data = load_ttf()
    if data is None:
        return
    bp.OUT_DIR.mkdir(exist_ok=True)
    spells = sd.load_spells()
    rmap = sd.replacement_map(spells)
    rename, _ = spell_renamer(spells)
    import build_spellbooks
    spells_md = build_spellbooks.spell_blocks()
    for cls in classes or list(data):
        bp.build(book_for(cls, data[cls], spells, spells_md, rename, rmap))


if __name__ == "__main__":
    main(sys.argv[1:] or None)
