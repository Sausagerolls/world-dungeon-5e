#!/usr/bin/env python3
"""Copy the mobs saved from the Mob Builder into the bestiary/ folder.

The Mob Builder's "Save to Bestiary" button keeps stat blocks on the
Tabletop Forge server (/api/world-dungeon/mobs). This writes each one to the
file the builder chose (bestiary/crawlers/... or bestiary/floor-N/...), so
they go into Bestiary.pdf and can be committed.

Usage: python3 tools/pull_saved_mobs.py <server url>
   or: WD_API=<server url> python3 tools/pull_saved_mobs.py
"""
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    base = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("WD_API", "")).rstrip("/")
    if not base:
        sys.exit("Give the Tabletop Forge server's address, e.g. python3 tools/pull_saved_mobs.py https://your-server")
    with urllib.request.urlopen(f"{base}/api/world-dungeon/mobs", timeout=20) as r:
        rows = json.load(r)
    n = 0
    for row in rows:
        data = row.get("data") or {}
        rel = data.get("file") or f"bestiary/saved/{re.sub(r'[^a-z0-9]+', '-', row['name'].lower()).strip('-')}.md"
        path = (ROOT / rel).resolve()
        if ROOT / "bestiary" not in path.parents:
            print(f"Skipped {row['name']}: odd file path {rel}")
            continue
        text = data.get("text") or f"# {row['name']}\n\n{data.get('md', '')}\n"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text if text.endswith("\n") else text + "\n")
        n += 1
        print(f"Wrote {rel}")
    print(f"{n} saved mob{'s' if n != 1 else ''} pulled from {base}")


if __name__ == "__main__":
    main()
