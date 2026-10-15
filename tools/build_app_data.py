#!/usr/bin/env python3
"""Write app/src/generated/setting.json from the setting's markdown.

Usage: python3 tools/build_app_data.py   (the app's `npm run build` runs it first)

Only World Dungeon content goes in here, including the World Dungeon spells
(spells/*.md). Class, race, feat and background data comes from Tabletop Forge
at build time, and items (and other-book spells) from the Tabletop Forge server
at runtime. Nothing is written to Tabletop Forge.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_pdf as bp  # noqa: E402
import build_site as bs  # noqa: E402
import spells_data as sd  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app" / "src" / "generated" / "setting.json"


def prestige():
    md = (ROOT / "rules/prestige-levels.md").read_text()
    out = {}
    for block in re.split(r"\n### ", md.split("## Class Prestige Features", 1)[1])[1:]:
        name = block.split("\n", 1)[0].strip()
        scaling = re.search(r"\*Scaling:\*\s*(.+)", block)
        feats = []
        for m in re.finditer(r"- \*\*(I|II|III|IV|V) — (.+?)\.\*\*\s*(.+)", block):
            feats.append({"rank": m.group(1), "name": m.group(2), "text": bp.inline(m.group(3))})
        out[name] = {"scaling": bp.inline(scaling.group(1)) if scaling else "", "features": feats}
    return out


def box_types():
    md = (ROOT / "loot/box-tables.md").read_text()
    return [m.group(1) for m in re.finditer(r"^## (.+) Box$", md, re.M)]


def main():
    spells = sd.load_spells()
    sd.write_lists(spells)
    data = {
        "skills": bs.skills_data(),
        # World Dungeon spells with their rank tables, and original name -> replacement.
        "spells": spells,
        "spellMap": sd.replacement_map(spells),
        "prestige": prestige(),
        "boxTypes": box_types(),
        "rarities": ["Bronze", "Silver", "Gold", "Legendary", "Celestial"],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, indent=1))
    print(f"Wrote {OUT} ({len(data['skills'])} skills, {len(spells)} spells, {len(data['prestige'])} prestige classes, {len(data['boxTypes'])} box types)")


if __name__ == "__main__":
    main()
