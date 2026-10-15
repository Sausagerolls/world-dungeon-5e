#!/usr/bin/env python3
"""Build one printable spellbook PDF per class: pdf/Spellbook-<Class>.pdf

Usage: python3 tools/build_spellbooks.py [Class ...]   (tools/build_pdf.py runs it too)

Each book holds a quick reference (costs, ranks, the class list) and every
World Dungeon spell on that class's list, copied from spells/*.md.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_pdf as bp  # noqa: E402
import spells_data as sd  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
ORD = ["Cantrips", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"]
COST = {1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 9, 7: 10, 8: 11, 9: 13}

PITCH = {
    "Bard": "Heckle, Laugh Track, Screensaver and a song for every crisis.",
    "Cleric": "Holy Mackerel, Phantom Folding Chair, Mosh Pit and a lot of healing.",
    "Druid": "Lego Floor, Murder Hornets, Abduction Beam and friends with fur.",
    "Paladin": "Smackdown, Signature Move, Brand Deal and a horse that comes back.",
    "Ranger": "Quest Marker, Tripwire, Bullet Hell and a nose for trouble.",
    "Sorcerer": "Mystery Box, Kaboom, Fast Forward and raw, reckless power.",
    "Warlock": "Pact Beam, Jinx, Clapback and a contract you didn't read.",
    "Wizard": "Magic Missile, Clockwork Triplicate, Delete and the biggest list in the dungeon.",
}
NOTES = {
    "Wizard": "Eldritch Knights (Fighter) and Arcane Tricksters (Rogue) learn their spells from this list too.",
    "Bard": "From 10th level, Magical Secrets also opens the Cleric, Druid and Wizard lists (those spellbooks).",
    "Paladin": "Paladins learn spells up to 5th level.",
    "Ranger": "Rangers learn spells up to 5th level.",
    "Warlock": "Mystic Arcanum spells (6th to 9th level) come from this list too.",
}
GROUPS = [("Cantrips", [0]), ("1st-Level Spells", [1]), ("2nd-Level Spells", [2]), ("3rd-Level Spells", [3]),
          ("4th-Level Spells", [4]), ("5th-Level Spells", [5]), ("6th- to 9th-Level Spells", [6, 7, 8, 9])]


def spell_blocks():
    """(level, classes, markdown) for every spell, in book order."""
    out = []
    for f in sd.SPELL_FILES:
        md = (ROOT / "spells" / f"{f}.md").read_text()
        for block in re.split(r"\n### ", md)[1:]:
            block = block.split("\n## ")[0].strip()
            sp = sd.parse_spell(block, f)
            out.append((sp["level"], sp["classes"], sp["name"], "### " + block))
    return out


def quick_reference(cls, blocks):
    mine = [b for b in blocks if cls in b[1]]
    rows = []
    for lv in range(10):
        names = sorted(n for l, _, n, _ in mine if l == lv)
        if names:
            rows.append(f"| {ORD[lv]} | {COST.get(lv, 'Free')} | {', '.join(names)} |")
    note = f"\n> *{NOTES[cls]}*\n" if cls in NOTES else ""
    return f"""---
type: spells
id: spellbook-{cls.lower()}
name: {cls} Spellbook
---

# Quick Reference

These are the World Dungeon spells a {cls.lower()} can learn. Each time your class lets you learn a spell, choose one from this book (see `tome-magic`). Write each spell into your tome with its rank.

## How Spells Work

- **Mana.** A spell always costs the mana of **its own level**, at every rank. You never cast a World Dungeon spell at a higher level. Cantrips are free.
- **Ranks.** Every spell has five ranks. Its table says what each rank does, and each rank includes everything from the ranks below it unless it says otherwise.
- **Gaining ranks.** Read a duplicate tome (+1 rank), or spend a **Rank Up**: you get one for each {cls.lower()} level at which your class teaches spells.
- **Rank gates.** Rank II needs character level 3, Rank III level 5, Rank IV level 9 and Rank V level 13. A rank you can't take yet waits until you reach the level.
- **Cantrips** have a minimum rank by character level: Rank II at 5th, Rank III at 11th, Rank IV at 17th.
- **Granted spells.** Spells your subclass or species names become their World Dungeon replacements (see `spells-replacements`).

## {cls} Spell List

| Level | Mana | Spells |
|-------|------|--------|
{chr(10).join(rows)}
{note}
## Spells Known

Tick a box each time a spell gains a rank.

| Spell | Level | Source | Rank |
|-------|-------|--------|------|
""" + "\n".join("|  |  |  | ☐ I · ☐ II · ☐ III · ☐ IV · ☐ V |" for _ in range(22)) + "\n"


def book_for(cls, blocks):
    texts, chapters = {}, []
    texts["quick"] = quick_reference(cls, blocks)
    chapters.append(("quick", "tables", "Costs, ranks, the full list, and a page to note the spells you know."))
    for title, levels in GROUPS:
        mine = [b for b in blocks if cls in b[1] and b[0] in levels]
        if not mine:
            continue
        body = []
        for lv in levels:
            these = [b[3] for b in mine if b[0] == lv]
            if not these:
                continue
            if len(levels) > 1:
                body.append(f"## {ORD[lv]} Level\n\nEvery {ORD[lv]}-level spell costs **{COST[lv]} mana** at every rank.")
            body.extend(these)
        cost = "Free." if levels == [0] else f"{COST[levels[0]]} mana at every rank." if len(levels) == 1 else "9 to 13 mana."
        intro = "" if len(levels) > 1 else (f"Every {ORD[levels[0]]}-level spell costs **{COST[levels[0]]} mana** at every rank." if levels[0] else
                                            "Cantrips cost no mana. Your character level sets a minimum rank: II at 5th, III at 11th, IV at 17th.")
        key = f"lv{levels[0]}"
        texts[key] = f"# {title}\n\n{intro}\n\n" + "\n\n".join(body) + "\n"
        chapters.append((key, "items", f"{len(mine)} spells. {cost}"))
    bp.HUDS[f"spellbook-{cls}"] = f"""
  <div class="hud">
    <div class="note">CLASS SPELLBOOK</div>
    <div class="big">{cls}</div>
    <div class="line">{PITCH[cls]}</div>
    <div class="stats"><span>SPELLS <b>{sum(1 for b in blocks if cls in b[1])}</b></span><span>RANKS <b>I–V</b></span><span>SOURCE <b>CLASS</b></span></div>
  </div>"""
    return {
        "out": f"Spellbook-{cls}.pdf",
        "title": f"{cls} Spellbook",
        "footer": f"{cls.upper()} SPELLBOOK  ·  WORLD DUNGEON",
        "version_from": "spells/spell-lists.md",
        "kicker": "WORLD DUNGEON · PRINTABLE SPELLBOOK",
        "cover_title": f"{cls}<br><span>Spellbook</span>",
        "sub": f"Every World Dungeon spell a {cls.lower()} can learn, with its Rank I to V table. Print it, punch it, keep it in your folder.",
        "hud": f"spellbook-{cls}",
        "chapters": chapters,
        "texts": texts,
        "how": ("Find a spell in the <strong>Quick Reference</strong> list, then turn to its level. Each spell's table shows what every "
                "<strong>rank</strong> does. It always costs the mana of its own level."),
    }


def main(classes=None):
    bp.OUT_DIR.mkdir(exist_ok=True)
    blocks = spell_blocks()
    for cls in classes or sd.CLASSES:
        bp.build(book_for(cls, blocks))


if __name__ == "__main__":
    main(sys.argv[1:] or None)
