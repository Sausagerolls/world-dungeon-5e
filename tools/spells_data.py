#!/usr/bin/env python3
"""Read the World Dungeon spells from spells/spells-a-z.md, and write spells/spell-lists.md.

Usage: python3 tools/spells_data.py   (writes spells/spell-lists.md)

Every spell file uses the same entry shape:

    ### Name
    **1st level · Evocation · Sorcerer, Wizard**      (or **Cantrip · ...**)
    *Replaces:* Magic Missile, Arcane Eye (Rank II)
    *Casting time:* ... · *Range:* ... · *Components:* ... · *Duration:* ...
    description paragraphs and bullet lists
    | Rank | Effect | table, rows I to V
    > *"System note"*

spells/replacements.md adds a table of extra replacements (spells from other
books) in the same "Original | World Dungeon spell" shape.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPELL_FILES = ["spells-a-z"]
CLASSES = ["Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"]
ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5}
ORD = ["Cantrips", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"]
ABILITIES = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def plain(text):
    """Markdown inline marks off, for the app."""
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    return re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"\1", text)


def replaces_list(text):
    out = []
    for part in re.split(r",\s*(?![^()]*\))", text.strip()):
        m = re.match(r"(.+?)\s*\(Rank (I|II|III|IV|V)\)\s*$", part.strip())
        name, rank = (m.group(1), ROMAN[m.group(2)]) if m else (part.strip(), 1)
        if name:
            out.append({"name": name, "rank": rank})
    return out


def parse_spell(block, source):
    lines = block.split("\n")
    name = lines[0].strip()
    head = re.match(r"\*\*(Cantrip|(\d)(?:st|nd|rd|th) level) · (\w+) · (.+?)\*\*", lines[1].strip()) if len(lines) > 1 else None
    if not head:
        raise ValueError(f"{source}: bad header for {name!r}")
    level = 0 if head.group(1) == "Cantrip" else int(head.group(2))
    classes = [c.strip() for c in head.group(4).split(",")]
    for c in classes:
        if c not in CLASSES:
            raise ValueError(f"{source}: {name}: unknown class {c!r}")
    sp = {"id": f"wd-{slug(name)}", "name": name, "level": level, "school": head.group(3), "classes": classes,
          "allowed_classes": ", ".join(classes), "replaces": [], "ranks": [], "note": "", "wd": True}
    desc = []
    for line in lines[2:]:
        s = line.strip()
        if not s:
            if desc and desc[-1] != "":
                desc.append("")
            continue
        if s.startswith("*Replaces:*"):
            sp["replaces"] = replaces_list(s[len("*Replaces:*"):])
        elif s.startswith("*Casting time:*"):
            for part in s.split(" · "):
                m = re.match(r"\*(.+?):\*\s*(.+)", part.strip())
                if m:
                    key = {"Casting time": "casting_time", "Range": "range_area", "Components": "components", "Duration": "duration"}[m.group(1)]
                    sp[key] = m.group(2).strip()
        elif s.startswith("|"):
            cells = [c.strip() for c in s.strip("|").split("|")]
            if cells[0] in ROMAN:
                sp["ranks"].append(plain(cells[1]))
        elif s.startswith(">"):
            sp["note"] = plain(s.lstrip("> ").strip()).strip('"“”')
        else:
            desc.append(plain(s[2:] if s.startswith("- ") else s) if not s.startswith("- ") else "• " + plain(s[2:]))
    sp["description"] = "\n".join(desc).strip().replace("\n\n\n", "\n\n")
    # Bullet lines sit under their lead-in paragraph without a blank line.
    sp["description"] = re.sub(r"\n\n(?=• )", "\n", sp["description"])
    if len(sp["ranks"]) != 5:
        raise ValueError(f"{source}: {name}: {len(sp['ranks'])} ranks, expected 5")
    for key in ("casting_time", "range_area", "components", "duration"):
        if key not in sp:
            raise ValueError(f"{source}: {name}: missing {key}")
    comp = sp.pop("components")
    sp["comp_v"], sp["comp_s"] = bool(re.search(r"\bV\b", comp)), bool(re.search(r"\bS\b", comp))
    mat = re.search(r"\bM \((.+)\)", comp)
    sp["comp_m"], sp["comp_m_text"] = bool(mat), mat.group(1) if mat else ""
    sp["ritual"] = "ritual" in sp["casting_time"].lower()
    sp["concentration"] = sp["duration"].lower().startswith("concentration")
    text = sp["description"] + " " + sp["ranks"][0]
    if re.search(r"ranged spell attack", text, re.I):
        sp["attack_save"] = "Ranged spell attack"
    elif re.search(r"melee spell attack", text, re.I):
        sp["attack_save"] = "Melee spell attack"
    else:
        m = re.search(r"(" + "|".join(ABILITIES) + r") saving throw", text)
        sp["attack_save"] = f"{m.group(1)} save" if m else ""
        sp["save_ability"] = m.group(1)[:3].upper() if m else ""
    return sp


def load_spells():
    spells = []
    for f in SPELL_FILES:
        md = (ROOT / "spells" / f"{f}.md").read_text()
        for block in re.split(r"\n### ", md)[1:]:
            spells.append(parse_spell(block.split("\n## ")[0].strip(), f))
    names = [s["name"].lower() for s in spells]
    dupes = {n for n in names if names.count(n) > 1}
    if dupes:
        raise ValueError(f"duplicate spell names: {sorted(dupes)}")
    return spells


def extra_replacements():
    """The 'More Replacements' table in spells/replacements.md."""
    md = (ROOT / "spells" / "replacements.md").read_text()
    out = []
    section = md.split("## More Replacements", 1)[-1]
    for line in section.split("\n"):
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 2 and line.strip().startswith("|") and cells[0] not in ("Original spell", "") and not set(cells[0]) <= set("-:"):
            target = replaces_list(cells[1])[0]
            for orig in cells[0].split(";"):
                out.append({"from": orig.strip(), "to": target["name"], "rank": target["rank"]})
    return out


def replacement_map(spells):
    """Original spell name (lower case) -> {name, rank}."""
    by_name = {s["name"].lower(): s for s in spells}
    out = {}
    for s in spells:
        for r in s["replaces"]:
            key = r["name"].lower()
            if key in out and out[key]["name"] != s["name"]:
                raise ValueError(f"{r['name']} is replaced by both {out[key]['name']} and {s['name']}")
            out[key] = {"name": s["name"], "rank": r["rank"]}
    for r in extra_replacements():
        if r["to"].lower() not in by_name:
            raise ValueError(f"replacements.md: unknown World Dungeon spell {r['to']!r}")
        key = r["from"].lower()
        if key in out and out[key]["name"] != by_name[r["to"].lower()]["name"]:
            raise ValueError(f"{r['from']} is replaced by both {out[key]['name']} and {r['to']}")
        out[key] = {"name": by_name[r["to"].lower()]["name"], "rank": r["rank"]}
    return out


RANK_NAME = {1: "", 2: " (Rank II)", 3: " (Rank III)", 4: " (Rank IV)", 5: " (Rank V)"}


def write_lists(spells):
    lines = ["---", "type: spells", "id: spell-lists", "name: World Dungeon Spell Lists", "version: 0.1", "status: draft",
             "related: [tome-magic, spells-replacements]", "---", "", "# Spell Lists", "",
             "> *\"Your class menu, now with 100% more puns.\"*", "",
             "These lists replace the class spell lists of the Player's Handbook. When your class lets you learn a spell, choose it from your class's list here. "
             "A spell tome holds a spell from any of these lists. *This page is generated from the spell files by `tools/spells_data.py`.*", ""]
    for cls in CLASSES:
        mine = [s for s in spells if cls in s["classes"]]
        lines += [f"## {cls}", "", "| Level | Spells |", "|-------|--------|"]
        for lv in range(10):
            row = sorted(s["name"] for s in mine if s["level"] == lv)
            if row:
                lines.append(f"| {ORD[lv]} | {', '.join(row)} |")
        lines.append("")
    lines += ["## Replacement Index", "",
              "Every Player's Handbook spell that a class, subclass, species or feat grants by name, and the World Dungeon spell you get instead. "
              "A rank in brackets is the rank you start it at (see `spells-replacements`).", "",
              "| Original spell | World Dungeon spell | Level |", "|----------------|---------------------|-------|"]
    by_name = {s["name"]: s for s in spells}
    rmap = replacement_map(spells)
    for orig in sorted(rmap):
        r = rmap[orig]
        shown = next((x["name"] for s in spells for x in s["replaces"] if x["name"].lower() == orig), None) \
            or next(x["from"] for x in extra_replacements() if x["from"].lower() == orig)
        lines.append(f"| {shown} | {r['name']}{RANK_NAME[r['rank']]} | {ORD[by_name[r['name']]['level']].rstrip('s')} |")
    (ROOT / "spells" / "spell-lists.md").write_text("\n".join(lines) + "\n")
    return len(rmap)


if __name__ == "__main__":
    sp = load_spells()
    n = write_lists(sp)
    counts = ", ".join(f"{ORD[lv]} {sum(1 for s in sp if s['level'] == lv)}" for lv in range(10))
    print(f"{len(sp)} spells ({counts}); {n} replacements; wrote spells/spell-lists.md")
