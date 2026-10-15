#!/usr/bin/env python3
"""Build the printable tracker sheets.

Usage: python3 tools/build_sheet.py
Output:
  pdf/Crawler-Character-Sheet.pdf  full character sheet (replaces the 5e sheet): core stats, features,
                                   magic, inventory, floor timer, loot box grid, box log, crafting
  pdf/GM-Floor-Tracker.pdf  one reusable page per floor for the GM

Box types are read from loot/box-tables.md, so the sheet stays in sync with the tables.
"""
import re

from character_pages import CHAR_CSS, core_page, features_page, levels_page, magic_page, faith_page, pet_page
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "pdf" / "Crawler-Character-Sheet.pdf"
GM_OUT = ROOT / "pdf" / "GM-Floor-Tracker.pdf"
WARNINGS = {24, 12, 6, 1}
# Row top (turns left) -> floors whose timer starts on that row. One row = one dungeon day (24 floor turns).
TIMER_STARTS = {240: "Floor 17", 216: "Floors 15–16", 192: "Floors 13–14", 168: "Floors 11–12", 144: "Floors 9–10",
                120: "Floors 7–8", 96: "Floors 5–6", 72: "Floors 3–4", 48: "Floors 1–2"}
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# (rarity, checkboxes per cell, header colour)
RARITIES = [
    ("Bronze", 8, "#c58a5a"),
    ("Silver", 8, "#aab2bd"),
    ("Gold", 6, "#e3b33a"),
    ("Legendary", 4, "#9b5de5"),
    ("Celestial", 1, "#4fd1c5"),
]

# Short reminder of what each box holds.
HINTS = {
    "Adventurer": "Potions, mana, gear",
    "Demolitionist": "Explosives",
    "Firearms": "Guns and rounds",
    "Swordsman": "Melee weapons",
    "Archer": "Bows and arrows",
    "Pugilist": "Unarmed gear",
    "Armory": "Armor and shields",
    "Chatter": "Charisma items",
    "Shadow": "Stealth and theft",
    "Tome": "Spell tomes, mana",
    "Skill": "Skill books",
    "Pet": "Pet items",
    "Divine": "Gifts from the gods",
    "Fan": "From the audience",
    "Spicy": "Saucy rewards",
    "Murder": "Poisons, assassin gear",
    "Boss": "Boss loot + trophy",
    "Class": "Class gear",
    "Mystery": "Random box type",
}


def box_types():
    md = (ROOT / "loot" / "box-tables.md").read_text()
    return [m.group(1) for m in re.finditer(r"^## (.+) Box$", md, re.M)]


CSS = """
@page{size:A4; margin:11mm 11mm 10mm}
*{box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact}
body{margin:0; color:#1c1b24; font:9pt/1.3 "Iowan Old Style","Palatino",Georgia,serif; background:#fff}
.page{break-after:page; height:276mm; display:flex; flex-direction:column}
.page:last-child{break-after:auto}
.disp{font-family:"Avenir Next Condensed","Futura","Helvetica Neue",sans-serif; text-transform:uppercase}
.mono{font-family:"Menlo",monospace}
header{display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #1c1b24; padding-bottom:2mm; position:relative}
header::after{content:""; position:absolute; left:0; bottom:-3px; width:30mm; height:3px; background:#d81b60}
.kick{font:700 7pt "Menlo",monospace; letter-spacing:.28em; color:#d81b60}
h1{font:800 25pt/1 "Avenir Next Condensed","Futura",sans-serif; text-transform:uppercase; margin:1mm 0 0}
.fields{display:grid; grid-template-columns:62mm 18mm 18mm; gap:2mm 3mm}
.field{font:700 6.5pt "Menlo",monospace; letter-spacing:.1em; color:#5d5a66}
.field div{border-bottom:1px solid #1c1b24; height:6.5mm}
.strip{display:flex; gap:6mm; align-items:center; margin:3mm 0 2.5mm; font:700 7pt "Menlo",monospace; letter-spacing:.1em}
.meter{display:flex; gap:1.3mm}
.meter span{width:5mm; height:5mm; border:1.2px solid #1c1b24; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:5.5pt; color:#aaa}
.pk{display:flex; align-items:center; gap:1.5mm}
.sq{display:inline-block; width:3.7mm; height:3.7mm; border:1.1px solid #1c1b24; border-radius:.6mm; background:#fff}
.legend{margin-left:auto; display:flex; gap:4mm; align-items:center; color:#5d5a66}
.legend svg{vertical-align:middle}
table{width:100%; border-collapse:collapse; table-layout:fixed}
th{font:700 8pt "Avenir Next Condensed","Futura",sans-serif; text-transform:uppercase; letter-spacing:.06em; color:#111; padding:1.6mm 1mm; text-align:center}
th.type{text-align:left; background:#1c1b24; color:#fff; padding-left:2mm}
td{border-bottom:1px solid #d9d4c7; padding:0 1mm; height:10.9mm; vertical-align:middle}
td.type{padding-left:2mm; border-left:3px solid #1c1b24}
td.type b{display:block; font:700 10pt/1.05 "Avenir Next Condensed","Futura",sans-serif; text-transform:uppercase}
td.type small{font-size:6.6pt; color:#6d6976}
tr:nth-child(even) td{background:#f6f4ee}
td.cell{text-align:center; border-left:1px solid #e6e1d6}
.boxes{display:inline-grid; grid-auto-flow:column; grid-template-rows:repeat(2,3.7mm); gap:1mm 1.1mm}
.boxes.one{grid-template-rows:3.7mm}
td.cel{background:repeating-linear-gradient(135deg,#fff 0 2mm,#eefbf9 2mm 4mm) !important}
.how{margin-top:auto; display:grid; grid-template-columns:1fr 1fr; gap:3mm; font-size:7.6pt; padding-top:2.5mm}
.how div{background:#f6f4ee; border-radius:1.5mm; padding:2.2mm 3mm}
.how b.h{font:700 7.5pt "Avenir Next Condensed",sans-serif; text-transform:uppercase; color:#00808a; letter-spacing:.06em; display:block; margin-bottom:.6mm}
.log th{background:#1c1b24; color:#fff; text-align:left; padding-left:2mm; font-size:7.5pt}
.log td{height:9.4mm; border-bottom:1px solid #cfc9bb; border-left:1px solid #e6e1d6}
.log tr:nth-child(even) td{background:#fff}
.log td.ck{text-align:center}
.track{border-collapse:separate; border-spacing:0 1.2mm; width:auto}
.track td{border:0; height:auto; padding:0 1mm 0 0; background:none !important}
.track td.lbl{font:700 6.5pt "Menlo",monospace; color:#5d5a66; width:22mm; text-align:right; padding-right:1.5mm; white-space:nowrap; line-height:1.15}
.track td.lbl small{display:block; font:700 5.4pt "Menlo",monospace; color:#00808a}
.track td.start{font:700 6pt "Menlo",monospace; color:#00808a; padding-left:2mm; white-space:nowrap}
.tb{display:inline-flex; width:5.9mm; height:7.4mm; border:1.1px solid #1c1b24; border-radius:.8mm; margin-right:.6mm;
  align-items:flex-start; justify-content:flex-end; padding:.3mm .5mm; font:600 4.6pt "Menlo",monospace; color:#9a96a3; background:#fff}
.tb.w{border-color:#d81b60; border-width:2px; color:#d81b60; background:#fff3f7}
.tb.gap{margin-right:1.8mm}
.cols2{display:grid; grid-template-columns:1.25fr 1fr; gap:5mm; margin-top:2mm}
.ref h3{font:700 8.5pt "Avenir Next Condensed",sans-serif; text-transform:uppercase; color:#00808a; margin:0 0 1mm; letter-spacing:.05em}
.ref table{margin-bottom:2.5mm; font-size:7.3pt}
.ref td{height:auto; padding:.9mm 1.2mm}
.ref th{font-size:6.8pt; padding:1mm 1.2mm; background:#1c1b24; color:#fff; text-align:left}
.ref p{font-size:7.4pt; margin:0 0 2mm}
.flog td{height:5.3mm; font-size:8pt}
.flog th{background:#1c1b24; color:#fff; font-size:7pt; text-align:left; padding-left:1.5mm}
.notes td{height:7.3mm}
.lines{border-bottom:1px solid #cfc9bb; height:6.6mm}
.mini{display:flex; gap:.9mm}
.mini span{flex:none; display:block; width:3.4mm; height:3.4mm; border:1px solid #1c1b24; border-radius:50%}
.box2{background:#f6f4ee; border-radius:1.5mm; padding:2mm 2.5mm; margin-bottom:2.5mm}
.box2 table td{background:none !important; border-bottom:1px solid #ddd6c8}
.box2 table td:first-child{width:46%; white-space:nowrap}
.box2 table.party td:last-child{text-align:right}
.party .mini{gap:.7mm}
.party .mini span{width:3.1mm; height:3.1mm}
.gmlow .box2{padding:1.6mm 2.2mm; margin-bottom:1.8mm}
.gmlow .ref td{padding:.6mm 1.2mm}
.gmlow .ref table{margin-bottom:1.6mm}
.inv .ih{font:700 8pt "Avenir Next Condensed",sans-serif; text-transform:uppercase; color:#00808a; margin:0 0 1mm}
.inv table td{height:6mm; border-bottom:1px solid #d9d4c7; background:none !important}
.inv .eq td.k, .inv .mats td.k{font:700 7.5pt "Avenir Next Condensed",sans-serif; text-transform:uppercase; color:#5d5a66}
.inv .mats th{font-size:7pt; background:none; color:#5d5a66; padding:.6mm}
.inv .mats td{border-left:1px solid #e6e1d6; height:6.4mm}
.inv .slots th{background:#1c1b24; color:#fff; font-size:7pt; text-align:left; padding:1.2mm 1.5mm}
.inv .slots td{height:5.55mm; border-left:1px solid #e6e1d6}
.inv .slots td.n{font:600 6.5pt "Menlo",monospace; color:#9a96a3; text-align:center}
.inv .slots tr:nth-child(even) td{background:#f6f4ee !important}
.gmf{grid-template-columns:52mm 18mm 28mm !important}
.foot{font:6.5pt "Menlo",monospace; color:#8a8693; margin-top:2mm; display:flex; justify-content:space-between}
"""

SLASH = '<svg width="11" height="11"><rect x=".5" y=".5" width="10" height="10" rx="1.5" fill="#fff" stroke="#1c1b24"/><line x1="2" y1="9" x2="9" y2="2" stroke="#d81b60" stroke-width="1.6"/></svg>'
CROSS = ('<svg width="11" height="11"><rect x=".5" y=".5" width="10" height="10" rx="1.5" fill="#fff" stroke="#1c1b24"/>'
         '<line x1="2" y1="9" x2="9" y2="2" stroke="#d81b60" stroke-width="1.6"/><line x1="2" y1="2" x2="9" y2="9" stroke="#1c1b24" stroke-width="1.6"/></svg>')


def header(title):
    return f"""
<header>
  <div><div class="kick">WORLD DUNGEON · SYSTEM INTERFACE</div><h1>{title}</h1></div>
  <div class="fields">
    <div class="field">CRAWLER<div></div></div>
    <div class="field">LEVEL<div></div></div>
    <div class="field">FLOOR<div></div></div>
  </div>
</header>"""


def grid_page(types):
    heads = "".join(f'<th style="background:{c}">{r}</th>' for r, _, c in RARITIES)
    rows = []
    for t in types:
        cells = []
        for rarity, n, _ in RARITIES:
            cls = "boxes one" if n <= 2 else "boxes"
            squares = "".join('<span class="sq"></span>' for _ in range(n))
            extra = " cel" if rarity == "Celestial" else ""
            cells.append(f'<td class="cell{extra}"><span class="{cls}">{squares}</span></td>')
        rows.append(f'<tr><td class="type"><b>{t}</b><small>{HINTS.get(t, "")}</small></td>{"".join(cells)}</tr>')
    meter = "".join(f"<span>{i}</span>" for i in range(1, 11))
    return f"""
<section class="page">
  {header("Loot Box Tracker")}
  <div class="strip">
    <span>AUDIENCE METER</span><span class="meter">{meter}</span>
    <span class="pk"><span class="sq"></span> PLAYER KILLER</span>
    <span class="legend">{SLASH} earned &nbsp; {CROSS} opened</span>
  </div>
  <table>
    <colgroup><col style="width:21%"><col style="width:19%"><col style="width:19%"><col style="width:16%"><col style="width:13%"><col style="width:12%"></colgroup>
    <thead><tr><th class="type">Box type</th>{heads}</tr></thead>
    <tbody>{"".join(rows)}</tbody>
  </table>
  <div class="how">
    <div><b class="h">Tracking boxes</b>When the System gives you a box, draw a <b>/</b> in an empty square of that box type and rarity. When you open it in a safe room, cross it into an <b>X</b>. Any square with only a slash is a box waiting to be opened.</div>
    <div><b class="h">Opening boxes</b>Only in a <b>safe room</b>, one action each. Boxes are bound to you and lost if you die. Bronze 1 roll · Silver 2 · Gold 2 · Legendary 3 · Celestial: relic + 2. When the Audience Meter hits 10, you get a Fan Box: clear it and start again.</div>
  </div>
  <div class="foot"><span>Fan-made homebrew inspired by Dungeon Crawler Carl</span><span>Page 1 of 2 · Box grid</span></div>
</section>"""


def log_page():
    rows = "".join("<tr><td></td><td></td><td></td><td></td><td class='ck'><span class='sq'></span></td><td></td></tr>" for _ in range(24))
    return f"""
<section class="page">
  {header("Box Log")}
  <div class="strip"><span>Write each box as you earn it. Tick it when opened, and note what you got.</span></div>
  <table class="log">
    <colgroup><col style="width:9%"><col style="width:27%"><col style="width:15%"><col style="width:12%"><col style="width:8%"><col style="width:29%"></colgroup>
    <thead><tr><th>Floor</th><th>Achievement / reason</th><th>Box type</th><th>Rarity</th><th>Open</th><th>Loot</th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
  <div class="foot"><span>Fan-made homebrew inspired by Dungeon Crawler Carl</span><span>Page 2 of 2 · Box log</span></div>
</section>"""


def timer_track():
    rows = []
    for day in range(10, 0, -1):
        top = day * 24
        cells = []
        for i in range(24):
            n = top - i
            cls = "tb w" if n in WARNINGS else "tb"
            if i in (5, 11, 17):
                cls += " gap"
            cells.append(f'<span class="{cls}">{n}</span>')
        start = f'<small>&#9654; {TIMER_STARTS[top]} start</small>' if top in TIMER_STARTS else ""
        rows.append(f'<tr><td class="lbl">{top}–{top - 23}{start}</td><td style="white-space:nowrap">{"".join(cells)}</td></tr>')
    return f'<table class="track"><tbody>{"".join(rows)}</tbody></table>'


REF_TABLES = """
<h3>Floor turn costs (1 turn ≈ 1 hour)</h3>
<table><tbody>
<tr><td>Explore a new area</td><td>1</td></tr>
<tr><td>Travel through explored areas</td><td>1 per 2</td></tr>
<tr><td>A fight + looting</td><td>1</td></tr>
<tr><td>Search or harvest</td><td>1</td></tr>
<tr><td>Short rest</td><td>1</td></tr>
<tr><td>Shop / open boxes (safe room)</td><td>1</td></tr>
<tr><td>Craft at a workbench</td><td>By recipe</td></tr>
<tr><td>Long rest (safe room only)</td><td>8</td></tr>
</tbody></table>
<h3>Ambush Check (short rest outside a safe room)</h3>
<table><tbody>
<tr><td>Quiet · Normal · Dangerous · Boss</td><td>d20 ≤ 4 · 8 · 12 · auto</td></tr>
<tr><td>Hidden camp (Stealth DC 13) / barricade / watch</td><td>−3 / −2 / −2</td></tr>
<tr><td>Loud noise last turn / 6 or fewer turns left</td><td>+4 / +4</td></tr>
</tbody></table>
<h3>Going down early: Audience</h3>
<table><tbody>
<tr><td>&gt;75% left · 50–75% · 25–50% · &lt;25%</td><td>−3 · −2 · −1 · 0</td></tr>
<tr><td>Final floor turn</td><td>+1 and <i>Just in Time</i></td></tr>
</tbody></table>
"""


def player_timer_page():
    rows = "".join(f"<tr><td>{n}</td><td></td><td></td><td></td><td></td></tr>" for n in range(1, 19))
    return f"""
<section class="page">
  {header("Floor Timer")}
  <div class="strip"><span>Each box is one floor turn; the number is the time left. Each row is one dungeon day. Cross a box as each turn passes.</span></div>
  {timer_track()}
  <p style="font-size:7.3pt;margin:1mm 0 0">On arrival, cross out every row above your floor's start row (&#9654;). <b style="color:#d81b60">Pink boxes</b> are the System's warnings: 24, 12, 6 and 1 turns left. At 6, safe rooms close to new arrivals.</p>
  <div class="cols2" style="grid-template-columns:1fr 1fr">
    <div class="ref">{REF_TABLES}</div>
    <table class="flog">
      <colgroup><col style="width:14%"><col style="width:18%"><col style="width:18%"><col style="width:26%"><col style="width:24%"></colgroup>
      <thead><tr><th>Floor</th><th>Level in</th><th>Level out</th><th>Turns left on exit</th><th>Audience ±</th></tr></thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
  <div class="foot"><span>Fan-made homebrew inspired by Dungeon Crawler Carl</span><span>Page 1 of 5 · Floor timer</span></div>
</section>"""


def inventory_page():
    def slot_rows(start, n):
        return "".join(f"<tr><td class='n'>{i}</td><td></td><td></td></tr>" for i in range(start, start + n))
    equip = "".join(f"<tr><td class='k'>{k}</td><td></td></tr>" for k in
                    ("Armor", "Shield / off hand", "Main hand", "Worn", "Worn", "Attuned 1", "Attuned 2", "Attuned 3"))
    tiers = "".join(f"<th>T{t}</th>" for t in range(1, 5))
    mats = "".join(f"<tr><td class='k'>{m}</td>{'<td></td>' * 4}<td></td></tr>" for m in ("Monster Part", "Scrap", "Essence", "Trophy Part"))
    ticks = "".join('<span class="sq" style="margin-right:.8mm"></span>' for _ in range(8))
    train = "".join(f"<tr><td></td><td style='white-space:nowrap'>{ticks}</td></tr>" for _ in range(4))
    return f"""
<section class="page inv">
  {header("Inventory")}
  <div class="strip"><span>GOLD: COIN PURSE, PAGE 1</span><span>SLOTS USED ____ / ____ (20 + level + expanders)</span><span>BOSS TROPHIES ________</span></div>
  <div class="cols2" style="grid-template-columns:1fr 1fr">
    <div>
      <div class="box2"><h3 class="ih">Equipped (not in inventory)</h3><table class="eq"><colgroup><col style="width:34%"><col></colgroup><tbody>{equip}</tbody></table></div>
      <div class="box2"><h3 class="ih">Crafting materials (write the count; note flavors)</h3>
        <table class="mats"><colgroup><col style="width:26%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col></colgroup>
        <thead><tr><th></th>{tiers}<th>Flavors</th></tr></thead><tbody>{mats}</tbody></table></div>
      <div class="box2"><h3 class="ih">Learning by Doing (tick a fight; 3 simple/light, 5 martial/firearm/medium/shield, 8 heavy)</h3>
        <table class="eq"><colgroup><col style="width:44%"><col></colgroup><tbody>{train}</tbody></table></div>
      <div class="box2"><h3 class="ih">Notes: keys, quest items, things to sell</h3>
        <table class="eq"><tbody>{"<tr><td></td></tr>" * 6}</tbody></table></div>
    </div>
    <div>
      <table class="slots"><colgroup><col style="width:9%"><col style="width:73%"><col style="width:18%"></colgroup>
        <thead><tr><th>#</th><th>Item (one slot)</th><th>Qty</th></tr></thead><tbody>{slot_rows(1, 32)}</tbody></table>
    </div>
  </div>
  <table class="slots" style="margin-top:2mm">
    <colgroup><col style="width:4.5%"><col style="width:36.5%"><col style="width:9%"><col style="width:4.5%"><col style="width:36.5%"><col style="width:9%"></colgroup>
    <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>#</th><th>Item</th><th>Qty</th></tr></thead>
    <tbody>{"".join(f"<tr><td class='n'>{i}</td><td></td><td></td><td class='n'>{i + 8}</td><td></td><td></td></tr>" for i in range(33, 41))}</tbody>
  </table>
  <div class="foot"><span>Fan-made homebrew inspired by Dungeon Crawler Carl</span><span>Page 2 of 5 · Inventory</span></div>
</section>"""


def crafting_page():
    prog = "".join('<span class="sq" style="width:3.4mm;height:3.4mm;margin-right:.5mm"></span>' for _ in range(24))
    rows = "".join(f"<tr><td></td><td></td><td class='ck'><span class='sq'></span></td><td class='ck'><span class='sq'></span></td><td></td><td style='white-space:nowrap'>{prog}</td></tr>" for _ in range(16))
    return f"""
<section class="page">
  {header("Crafting Projects")}
  <div class="strip"><span>Work on a project at any safe room workbench. Tick one progress box per floor turn. You can stop and pick up again later.</span></div>
  <table class="log">
    <colgroup><col style="width:20%"><col style="width:9%"><col style="width:6%"><col style="width:6%"><col style="width:7%"><col style="width:52%"></colgroup>
    <thead><tr><th>Item</th><th>Rarity</th><th>Gold</th><th>Mats</th><th>Turns</th><th>Progress (one box per floor turn)</th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
  <div class="how" style="margin-top:3mm">
    <div><b class="h">Field or workbench</b>Field items: one batch (up to your PB) during any short rest. Everything else: a safe room workbench. During a long rest you can spend 2 of its 8 turns crafting.</div>
    <div><b class="h">Helpers and materials</b>Up to two helpers with the same tool divide the turns. Break one material into three of the tier below at any time. Projects longer than 24 turns: use two rows.</div>
  </div>
  <div class="foot"><span>Fan-made homebrew inspired by Dungeon Crawler Carl</span><span>Page 5 of 5 · Crafting</span></div>
</section>"""


def gm_page():
    party = "".join(f'<tr><td><div class="lines" style="height:4.2mm"></div></td><td><span class="mini">{"<span></span>" * 10}</span></td><td><span class="sq"></span></td></tr>' for _ in range(6))
    found = [f"Safe room {i}" for i in range(1, 5)] + [f"Stairwell {i}" for i in range(1, 4)] + ["Neighborhood boss"] * 3 + ["Floor boss"]
    places = "".join(f'<tr><td>{k}</td><td><div class="lines" style="height:3.8mm"></div></td><td><span class="sq"></span></td></tr>' for k in found)
    days = "".join(f'<tr><td>Day {d}</td><td><div class="lines" style="height:4.2mm"></div></td></tr>' for d in range(1, 11))
    costs = REF_TABLES.split("<h3>Going down early")[0].replace("<h3>Floor turn costs (1 turn ≈ 1 hour)</h3>", "<h3>Turn costs</h3>")
    return f"""
<section class="page">
  <header>
    <div><div class="kick">WORLD DUNGEON · GM SCREEN</div><h1>Floor Tracker</h1></div>
    <div class="fields gmf">
      <div class="field">FLOOR / THEME<div></div></div>
      <div class="field">TIMER<div></div></div>
      <div class="field">SAFE ROOM RUN<div></div></div>
    </div>
  </header>
  <div class="strip"><span>Cross boxes at the end of each scene. Read pink boxes and each new day out as System announcements. One line per day in the day log.</span></div>
  {timer_track()}
  <div class="cols2 gmlow" style="grid-template-columns:1fr 1fr; margin-top:2mm">
    <div class="ref">
      <div class="box2"><h3>Day log</h3><table class="party"><colgroup><col style="width:16%"><col></colgroup><tbody>{days}</tbody></table></div>
      {costs}
    </div>
    <div class="ref">
      <div class="box2"><h3>Party · Audience Meter · Player Killer</h3>
        <table class="party"><colgroup><col style="width:30%"><col style="width:58%"><col style="width:12%"></colgroup><tbody>{party}</tbody></table></div>
      <div class="box2"><h3>Found and killed</h3>
        <table class="party"><colgroup><col style="width:42%"><col style="width:46%"><col style="width:12%"></colgroup><tbody>{places}</tbody></table></div>
      <p><b>Going down early:</b> &gt;75% left −3 · 50–75% −2 · 25–50% −1 · final turn +1. <b>Safe room run:</b> every 24 turns in a row costs 1 Audience. <b>Collapse:</b> anyone not in a stairwell dies (or <i>Last Chance</i>, DC 20 Con).</p>
    </div>
  </div>
  <div class="foot"><span>Fan-made homebrew inspired by Dungeon Crawler Carl</span><span>Copy one page per floor</span></div>
</section>"""


def print_pdf(doc, out):
    out.parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        p = Path(tmp) / "sheet.html"
        p.write_text(doc)
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        "--print-to-pdf-no-header", f"--print-to-pdf={out}", p.as_uri()],
                       check=True, capture_output=True)
    print(f"Wrote {out}")


def page(title, body):
    return (f'<!doctype html><html><head><meta charset="utf-8"><title>{title}</title><style>{CSS}{CHAR_CSS}</style></head>'
            f"<body>{body}</body></html>")


def main():
    pages = [core_page(), features_page(), levels_page(), magic_page(), faith_page(), pet_page(), inventory_page(), player_timer_page(),
             grid_page(box_types()), log_page(), crafting_page()]
    pages = [re.sub(r"Page \d+ of \d+", f"Page {i} of {len(pages)}", p) for i, p in enumerate(pages, 1)]
    print_pdf(page("Crawler Character Sheet", "".join(pages)), OUT)
    print_pdf(page("GM Floor Tracker", gm_page()), GM_OUT)


if __name__ == "__main__":
    main()
