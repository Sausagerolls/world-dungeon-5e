#!/usr/bin/env python3
"""World Dungeon items for the Crawler Sheet's item library (app: World Dungeon tab).

Read from items/firearms.md, items/explosives.md, items/dungeon-items.md and
items/divine-gear.md, in the item shape Tabletop Forge uses (item_type,
damage_entries, properties, weapon_range, weapon_category...), so the sheet's
Combat tab can roll them. Celestial relics stay GM-only and are left out.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 2024 Player's Handbook weapons (SRD 5.2): damage, type, properties, range, category.
BASE = {
    "club": ("1d4", "Bludgeoning", "Light", "", "Simple"), "dagger": ("1d4", "Piercing", "Finesse, Light, Thrown", "20/60", "Simple"),
    "greatclub": ("1d8", "Bludgeoning", "Two-Handed", "", "Simple"), "handaxe": ("1d6", "Slashing", "Light, Thrown", "20/60", "Simple"),
    "javelin": ("1d6", "Piercing", "Thrown", "30/120", "Simple"), "light hammer": ("1d4", "Bludgeoning", "Light, Thrown", "20/60", "Simple"),
    "mace": ("1d6", "Bludgeoning", "", "", "Simple"), "quarterstaff": ("1d6", "Bludgeoning", "Versatile (1d8)", "", "Simple"),
    "sickle": ("1d4", "Slashing", "Light", "", "Simple"), "spear": ("1d6", "Piercing", "Thrown, Versatile (1d8)", "20/60", "Simple"),
    "light crossbow": ("1d8", "Piercing", "Ammunition, Loading, Two-Handed", "80/320", "Simple"), "shortbow": ("1d6", "Piercing", "Ammunition, Two-Handed", "80/320", "Simple"),
    "sling": ("1d4", "Bludgeoning", "Ammunition", "30/120", "Simple"), "battleaxe": ("1d8", "Slashing", "Versatile (1d10)", "", "Martial"),
    "flail": ("1d8", "Bludgeoning", "", "", "Martial"), "glaive": ("1d10", "Slashing", "Heavy, Reach, Two-Handed", "", "Martial"),
    "greataxe": ("1d12", "Slashing", "Heavy, Two-Handed", "", "Martial"), "greatsword": ("2d6", "Slashing", "Heavy, Two-Handed", "", "Martial"),
    "halberd": ("1d10", "Slashing", "Heavy, Reach, Two-Handed", "", "Martial"), "lance": ("1d10", "Piercing", "Heavy, Reach, Two-Handed", "", "Martial"),
    "longsword": ("1d8", "Slashing", "Versatile (1d10)", "", "Martial"), "maul": ("2d6", "Bludgeoning", "Heavy, Two-Handed", "", "Martial"),
    "morningstar": ("1d8", "Piercing", "", "", "Martial"), "pike": ("1d10", "Piercing", "Heavy, Reach, Two-Handed", "", "Martial"),
    "rapier": ("1d8", "Piercing", "Finesse", "", "Martial"), "scimitar": ("1d6", "Slashing", "Finesse, Light", "", "Martial"),
    "shortsword": ("1d6", "Piercing", "Finesse, Light", "", "Martial"), "trident": ("1d8", "Piercing", "Thrown, Versatile (1d10)", "20/60", "Martial"),
    "warhammer": ("1d8", "Bludgeoning", "Versatile (1d10)", "", "Martial"), "war pick": ("1d8", "Piercing", "Versatile (1d10)", "", "Martial"),
    "whip": ("1d4", "Slashing", "Finesse, Reach", "", "Martial"), "hand crossbow": ("1d6", "Piercing", "Ammunition, Light, Loading", "30/120", "Martial"),
    "heavy crossbow": ("1d10", "Piercing", "Ammunition, Heavy, Loading, Two-Handed", "100/400", "Martial"),
    "longbow": ("1d8", "Piercing", "Ammunition, Heavy, Two-Handed", "150/600", "Martial"),
}
TYPES = "acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder"


def plain(t):
    t = re.sub(r"`([^`]+)`", r"\1", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t)
    return re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"\1", t)


def slug(n):
    return re.sub(r"[^a-z0-9]+", "-", n.lower()).strip("-")


def entries(path):
    """(name, meta line, body text) for each ### entry."""
    md = (ROOT / path).read_text()
    out = []
    for block in re.split(r"\n### ", md)[1:]:
        block = re.split(r"\n## |\n---", block)[0].strip()
        lines = block.split("\n")
        name, meta = lines[0].strip(), (lines[1].strip().strip("*") if len(lines) > 1 else "")
        body = "\n".join(l for l in lines[2:]).strip()
        out.append((name, meta, plain(body)))
    return out


def rarity_of(meta):
    m = re.search(r"Common|Uncommon|Rare|Very rare|Legendary|Artifact", meta)
    return m.group(0) if m else ""


def extra_damage(text):
    """'+1d8 lightning damage', 'an extra 2d6 necrotic damage', 'plus 2d8 thunder damage'."""
    return [{"damage": m.group(1), "damage_type": m.group(2).title()}
            for m in re.finditer(rf"(?:\+|extra |plus )(\d+d\d+) ({TYPES}) damage", text, re.I)]


def weapon_from(base, item, text):
    dmg, typ, props, rng, cat = BASE[base]
    item.update(item_type="weapon", properties=props, weapon_range=rng, weapon_category=cat,
                damage_entries=[{"damage": dmg, "damage_type": typ}] + extra_damage(text))
    plus = re.search(r"\bA (?:pink )?\+(\d) |\+(\d) to attack and damage", text)
    if plus:
        item["attack_bonus_misc"] = item["damage_bonus_misc"] = int(plus.group(1) or plus.group(2))
    return item


def firearms():
    md = (ROOT / "items/firearms.md").read_text()
    table = md.split("## Firearms Table", 1)[1].split("\n---\n", 1)[0]
    notes = {n: b for n, _, b in entries("items/firearms.md")}
    guns = {}
    for row in table.strip().split("\n")[2:]:
        c = [x.strip() for x in row.strip("|").split("|")]
        if len(c) < 6:
            continue
        name, rarity, dmg, rng, props, cost = c
        d = re.match(rf"(\d+d\d+) ({TYPES})", dmg, re.I)
        rl = re.search(r"reload (\d+)", props)
        guns[name.lower()] = dict(id=f"wd-{slug(name)}", name=name, item_type="weapon", rarity=rarity, weapon_category="Firearms",
                                  damage_entries=[{"damage": d.group(1), "damage_type": d.group(2).title()}] if d else [],
                                  weapon_range=rng, properties=props, reload=int(rl.group(1)) if rl else None, cost=cost,
                                  description=notes.get(name, ""), source="Firearms")
    out = list(guns.values())
    for name, meta, body in entries("items/firearms.md"):
        if name.lower() in guns or not meta or "Firearm" not in meta or name.startswith("+1"):
            if meta.startswith(("Gear", "Firearm gear", "Armor", "Attachment", "Ammunition")) or name in ("Box of Rounds",):
                pass
            if name.lower() in guns or name.startswith("+1") or "Firearm" not in meta:
                continue
        base = next((g for g in sorted(guns, key=len, reverse=True) if g in body.lower()), None)
        it = dict(id=f"wd-{slug(name)}", name=name, rarity=rarity_of(meta), description=body, source="Firearms", weapon_category="Firearms")
        if base:
            b = guns[base]
            it.update(item_type="weapon", damage_entries=list(b["damage_entries"]) + extra_damage(body), weapon_range=b["weapon_range"],
                      properties=b["properties"], reload=b["reload"])
        d = re.search(rf"^(\d+d\d+) ({TYPES}) damage", body, re.I) or re.search(rf"\. (\d+d\d+) ({TYPES}) damage, range", body, re.I)
        if not base and d:
            rng = re.search(r"range ([\d,]+/[\d,]+)", body)
            rl = re.search(r"reload (\d+)", body)
            it.update(item_type="weapon", damage_entries=[{"damage": d.group(1), "damage_type": d.group(2).title()}],
                      weapon_range=rng.group(1) if rng else "", reload=int(rl.group(1)) if rl else None, properties="")
        plus = re.search(r"\bA \+(\d) ", body)
        if plus:
            it["attack_bonus_misc"] = it["damage_bonus_misc"] = int(plus.group(1))
        it.setdefault("item_type", "gear")
        out.append(it)
    for name, meta, body in entries("items/firearms.md"):
        if meta and not meta.startswith("Firearm ·") and "Firearm" not in meta.split("·")[0] and name not in guns and name.lower() not in guns:
            if "## Gun Gear" in (ROOT / "items/firearms.md").read_text().split(f"### {name}")[0][-3000:] or meta.startswith(("Gear", "Ammunition", "Armor", "Attachment", "Wondrous")):
                kind = "ammo" if "Ammunition" in meta or "Rounds" in name else "armor" if meta.startswith("Armor") else "gear"
                out.append(dict(id=f"wd-{slug(name)}", name=name, item_type=kind, rarity=rarity_of(meta), description=body, source="Firearms"))
    return out


def explosives():
    out = []
    for name, meta, body in entries("items/explosives.md"):
        if not meta.startswith("Explosive"):
            continue
        d = re.search(rf"Damage:\s*(\d+d\d+) ({TYPES})", body, re.I)
        dc = re.search(r"DC (\d+)", body)
        out.append(dict(id=f"wd-{slug(name)}", name=name, item_type="explosive", rarity=rarity_of(meta), qty=1, description=body,
                        damage_entries=[{"damage": d.group(1), "damage_type": d.group(2).title()}] if d else [],
                        save_dc=int(dc.group(1)) if dc else None, source="Explosives"))
    return out


def gear_list(path, source):
    out = []
    for name, meta, body in entries(path):
        if not meta or meta.startswith(("Event", "Troll prize")) and source == "Dungeon Items" and "Troll" not in meta:
            pass
        kind = meta.split("·")[0].strip().lower()
        it = dict(id=f"wd-{slug(name)}", name=name, rarity=rarity_of(meta), description=body, source=source,
                  attunement="attunement" in meta.lower())
        base = next((b for b in sorted(BASE, key=len, reverse=True) if re.search(rf"\b{b}\b", (meta + " " + body).lower())), None)
        if kind.startswith("weapon") and base:
            weapon_from(base, it, body)
            alt = re.search(r"it deals (\d+d\d+) ({TYPES}) damage plus (\d+d\d+) ({TYPES}) damage", body, re.I)
            if alt:  # a weapon with its own damage (Rubber Chicken of Smiting)
                it["damage_entries"] = [{"damage": alt.group(1), "damage_type": alt.group(2).title()}, {"damage": alt.group(3), "damage_type": alt.group(4).title()}]
        elif kind.startswith("weapon"):
            it["item_type"] = "gear"  # knuckles and the like: they change unarmed strikes
        elif kind.startswith("armor"):
            it["item_type"] = "armor"
            ac = re.search(r"AC (\d+) \+ Dex", body)
            if ac:
                it.update(ac_base=int(ac.group(1)), armor_category="Light")
            if "shield" in kind:
                it.update(armor_category="Shield", ac_base=2, ac_bonus=1 if "+1" in body else 0)
        elif kind.startswith("potion"):
            it["item_type"] = "potion"
        elif kind.startswith("ammunition"):
            it["item_type"] = "ammo"
        elif kind.startswith("explosive"):
            it["item_type"] = "explosive"
        else:
            it["item_type"] = "gear"
        if name == "Weapon Upgrade Kit":
            for r, rare in (("II", "Uncommon"), ("III", "Uncommon"), ("IV", "Rare"), ("V", "Rare")):
                out.append(dict(it, id=f"wd-weapon-upgrade-kit-{r.lower()}", name=f"Weapon Upgrade Kit (Rank {r})", rarity=rare,
                                kit_rank=["", "I", "II", "III", "IV", "V"].index(r), item_type="gear"))
            continue
        out.append(it)
    return out


def load_items():
    items = firearms() + explosives() + gear_list("items/dungeon-items.md", "Dungeon Items") + gear_list("items/divine-gear.md", "Divine Gear")
    seen, out = set(), []
    for it in items:
        if it["id"] in seen:
            continue
        seen.add(it["id"])
        out.append({k: v for k, v in it.items() if v not in (None, "")})
    return out


if __name__ == "__main__":
    items = load_items()
    from collections import Counter
    print(len(items), Counter(i["item_type"] for i in items))
    for i in items:
        if i["item_type"] == "weapon":
            print(i["name"], i.get("damage_entries"), i.get("attack_bonus_misc", ""), i.get("source"))
