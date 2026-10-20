#!/usr/bin/env python3
"""Collect every World Dungeon stat block into the Bestiary.

Sources (see bestiary/building-mobs.md):
  floors/floor-1/neighbourhoods.md   Floor 1 mobs and bosses
  gods/stat-blocks.md                gods and minor deities
  bestiary/**/*.md                   stat blocks made with the Mob Builder

Each "### Stat Block: Name" section is parsed into a dict with the raw
markdown (for the PDF and the builder's Clone) and structured fields (for the
Bestiary filters and the builder). build_site.py renders the HTML;
build_pdf.py makes Bestiary.pdf from bestiary_book().
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = [
    ("floors/floor-1/neighbourhoods.md", "floor-1-neighbourhoods", "Floor 1"),
    ("gods/stat-blocks.md", "god-stat-blocks", "Gods and Minor Deities"),
]
GUIDE = "bestiary/building-mobs.md"
TIERS = ["Trash", "Standard", "Elite", "Boss", "Floor Boss", "Deity"]
XP = {"Trash": 5, "Standard": 10, "Elite": 25, "Boss": 100, "Floor Boss": 200, "Deity": 1000}
AB = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]


def slugify(text):
    text = re.sub(r"<[^>]+>", "", text).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def cr_value(cr):
    cr = str(cr).strip()
    if "/" in cr:
        a, b = cr.split("/")
        return int(a) / int(b)
    try:
        return float(cr)
    except ValueError:
        return 0.0


def num(text):
    m = re.search(r"[−-]?\d+", str(text).replace("−", "-"))
    return int(m.group(0).replace("−", "-")) if m else 0


def split_blocks(md):
    """Yield (h2 context, block markdown) for each stat block."""
    md = re.sub(r"\A---\n.*?\n---\n", "", md, flags=re.S)
    lines = md.split("\n")
    h2, cur, out = "", None, []
    for line in lines:
        if line.startswith("## "):
            if cur:
                out.append((cur[0], "\n".join(cur[1]).strip()))
                cur = None
            h2 = line[3:].strip()
            continue
        if line.startswith("### "):
            if cur:
                out.append((cur[0], "\n".join(cur[1]).strip()))
                cur = None
            if line.startswith("### Stat Block: "):
                cur = (h2, [line])
            continue
        if line.strip() == "---" and cur:
            out.append((cur[0], "\n".join(cur[1]).strip()))
            cur = None
            continue
        if cur:
            cur[1].append(line)
    if cur:
        out.append((cur[0], "\n".join(cur[1]).strip()))
    return out


def parse_block(md):
    lines = md.split("\n")
    name = lines[0][len("### Stat Block: "):].strip()
    f = {"name": name, "meta": "", "flavour": "", "kv": {}, "scores": [10] * 6, "saves": [], "crawl": {},
         "inspect": "", "sections": []}
    i = 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i < len(lines) and re.match(r"^\*\*.+\*\*$", lines[i].strip()):
        f["meta"] = lines[i].strip()[2:-2]
        i += 1
    flav, section = [], None
    while i < len(lines):
        s = lines[i].strip()
        if s.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            rows = [r for r in rows if not all(re.fullmatch(r":?-+:?", c) or c == "" for c in r)]
            if rows and rows[0][:1] == [""] and len(rows[0]) > 2 and rows[0][1] == "STR":
                for r in rows[1:]:
                    key = r[0].strip("*")
                    if key == "Score":
                        f["scores"] = [num(c) for c in r[1:7]]
                    elif key.startswith("Mod"):
                        for a, c in zip(AB, r[1:7]):
                            parts = [num(x) for x in c.split("/")]
                            if len(parts) == 2 and parts[0] != parts[1]:
                                f["saves"].append(a)
            else:
                for r in rows:
                    if len(r) >= 2:
                        key = r[0].strip("*").strip()
                        if key in ("Mob Tier", "Level", "Loot", "Found"):
                            f["crawl"][key] = r[1]
                        elif key:
                            f["kv"][key] = r[1]
            continue
        if s.startswith(">"):
            q = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                q.append(lines[i].strip()[1:].strip())
                i += 1
            text = " ".join(q)
            m = re.match(r'^\*\*Inspect:?\*\*\s*\*?"?(.*?)"?\*?$', text)
            if m:
                f["inspect"] = m.group(1)
            continue
        h = re.match(r"^#### (.+)$", s)
        if h:
            section = {"title": h.group(1).strip(), "entries": [], "text": ""}
            f["sections"].append(section)
            i += 1
            continue
        if s:
            if section is None:
                flav.append(s)
            else:
                e = re.match(r"^- \*\*(.+?)\.\*\*\s*(.*)$", s)
                if e:
                    section["entries"].append({"name": e.group(1), "text": e.group(2)})
                elif s.startswith("- ") and section["entries"]:
                    section["entries"][-1]["text"] += "\n" + s
                else:
                    section["text"] = (section["text"] + "\n\n" + s).strip()
        i += 1
    f["flavour"] = " ".join(flav)
    return f


def describe(f, context, source_title, slug, path):
    meta = [p.strip() for p in f["meta"].split("·")]
    size_type = meta[0] if meta else ""
    size, _, ctype = size_type.partition(" ")
    cr = next((p[3:] for p in meta if p.startswith("CR ")), f["kv"].get("CR", "0").split(" ")[0])
    role = next((p for p in meta[1:] if p in ("Boss", "Floor Boss", "Crawler")), "")
    tier_text = f["crawl"].get("Mob Tier", "")
    tier = next((t for t in sorted(TIERS, key=len, reverse=True) if tier_text.startswith(t)), "")
    floor = 0
    m = re.search(r"Floor (\d+)", f["crawl"].get("Found", "") + " " + source_title)
    if m:
        floor = int(m.group(1))
    kind = "deity" if tier == "Deity" else "crawler" if role == "Crawler" else "mob"
    lvl = f["crawl"].get("Level", "")
    return {
        "id": slugify(f["name"]),
        "name": f["name"],
        "kind": kind,
        "tier": tier,
        "xp": XP.get(tier, 0),
        "level": lvl,
        "levelNum": num(lvl) if re.search(r"\d", lvl) else None,
        "cr": cr,
        "crNum": cr_value(cr),
        "size": size,
        "type": re.sub(r"\s*\(.*\)", "", ctype).strip(),
        "typeFull": ctype,
        "role": role,
        "floor": floor,
        "area": re.sub(r"^\d+\.\s*", "", context).replace(": The Floor Boss", ""),
        "found": f["crawl"].get("Found", ""),
        "source": {"title": source_title, "page": slug, "anchor": slugify(f["name"]), "file": path},
        "fields": f,
    }


def load_all():
    mobs = []
    for path, slug, title in SOURCES:
        for ctx, md in split_blocks((ROOT / path).read_text()):
            d = describe(parse_block(md), ctx, title, slug, path)
            d["md"] = md
            mobs.append(d)
    for p in sorted((ROOT / "bestiary").rglob("*.md")):
        rel = str(p.relative_to(ROOT))
        if rel == GUIDE:
            continue
        for ctx, md in split_blocks(p.read_text()):
            d = describe(parse_block(md), ctx, "Bestiary", "bestiary", rel)
            d["md"] = md
            if not d["floor"]:
                m = re.search(r"floor-(\d+)", rel)
                d["floor"] = int(m.group(1)) if m else 0
            mobs.append(d)
    seen = set()
    for d in mobs:
        while d["id"] in seen:
            d["id"] += "-x"
        seen.add(d["id"])
    return mobs


def group_of(d):
    if d["kind"] == "deity":
        return "Gods and Minor Deities"
    if d["kind"] == "crawler":
        return "NPC Crawlers"
    return f"Floor {d['floor']}" if d["floor"] else "Other Mobs"


def bestiary_book_text(mobs):
    """The Bestiary chapter of Bestiary.pdf: every stat block, grouped and sorted."""
    order = lambda g: (0, int(g.split()[1])) if g.startswith("Floor ") else (1, 0) if g == "Other Mobs" else (2, 0) if g == "NPC Crawlers" else (3, 0)
    groups = {}
    for d in mobs:
        groups.setdefault(group_of(d), []).append(d)
    out = ["---", "type: bestiary", "id: bestiary", "name: Bestiary", "version: 0.1", "status: draft", "---", "",
           "# Bestiary", "", "Every stat block in the World Dungeon, by floor, then NPC crawlers, then the gods. "
           "Within a group, mobs are sorted by Mob Tier, then name. Bosses' room mechanics and hints are in their floor guide.", ""]
    for g in sorted(groups, key=order):
        out += [f"## {g}", ""]
        for d in sorted(groups[g], key=lambda d: (TIERS.index(d["tier"]) if d["tier"] in TIERS else 9, d["name"])):
            out += [d["md"], "", "---", ""]
    return "\n".join(out)


if __name__ == "__main__":
    ms = load_all()
    for d in ms:
        print(f"{d['name']:40} {d['kind']:8} {d['tier']:10} L{d['level']:4} CR {d['cr']:4} F{d['floor']} {d['area'][:30]}")
    print(len(ms))
