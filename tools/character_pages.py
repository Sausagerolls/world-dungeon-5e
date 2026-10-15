"""Character sheet pages (core stats, features, magic) for the Crawler Character Sheet.

Used by build_sheet.py. These pages replace the standard 5e character sheet.
"""

ABILITIES = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]
SKILLS = [
    ("Acrobatics", "Dex"), ("Animal Handling", "Wis"), ("Arcana", "Int"), ("Athletics", "Str"),
    ("Deception", "Cha"), ("History", "Int"), ("Insight", "Wis"), ("Intimidation", "Cha"),
    ("Investigation", "Int"), ("Medicine", "Wis"), ("Nature", "Int"), ("Perception", "Wis"),
    ("Performance", "Cha"), ("Persuasion", "Cha"), ("Religion", "Int"), ("Sleight of Hand", "Dex"),
    ("Stealth", "Dex"), ("Survival", "Wis"),
]

CHAR_CSS = """
.hdpool{display:grid; grid-template-columns:1fr 1fr; gap:.6mm 2mm; margin-top:.8mm; font:600 6.6pt "Menlo",monospace; color:#5d5a66}
.hdpool b{color:#1c1b24}
.lvlog td{height:5.05mm !important; font-size:6.8pt}
.lvlog td.n{font:700 6.6pt "Menlo",monospace; color:#9a96a3; text-align:center}
.lvlog td.c{text-align:center}
.page{overflow:hidden}
.page > .foot{margin-top:auto}
.cs-head{display:grid; grid-template-columns:auto 1fr; gap:6mm; align-items:end; border-bottom:3px solid #1c1b24; padding-bottom:2mm; position:relative}
.cs-head::after{content:""; position:absolute; left:0; bottom:-3px; width:30mm; height:3px; background:#d81b60}
.cs-fields{display:grid; grid-template-columns:2.2fr 1fr .8fr; gap:1.6mm 3mm}
.cs-fields .field div{height:5.6mm}
.ministrip{display:flex; gap:4mm; align-items:center; margin:2.4mm 0; font:700 6.8pt "Menlo",monospace; letter-spacing:.06em; flex-wrap:nowrap}
.ministrip .bx{display:inline-block; width:9mm; height:6mm; border:1.3px solid #1c1b24; border-radius:1mm; vertical-align:middle; margin-left:1mm}
.cs-grid{display:grid; grid-template-columns:30mm 58mm 1fr; gap:4mm}
.abil{border:1.4px solid #1c1b24; border-radius:2mm; text-align:center; padding:1.6mm 0 2mm; margin-bottom:3mm; background:#fff}
.abil .an{font:700 6.6pt "Avenir Next Condensed",sans-serif; text-transform:uppercase; letter-spacing:.06em}
.abil .sc{width:15mm; height:15mm; margin:1mm auto; border:1px solid #cfc9bb; border-radius:1.2mm}
.abil .md{width:11mm; height:6mm; margin:0 auto; border:1.2px solid #d81b60; border-radius:3mm; font:700 5pt "Menlo",monospace; color:#d81b60; padding-top:.4mm}
.capnote{font:700 6pt "Menlo",monospace; color:#5d5a66; text-align:center; line-height:1.4}
.panel{border:1.2px solid #1c1b24; border-radius:2mm; padding:2mm 2.4mm; margin-bottom:2.4mm; background:#fff}
.panel h3{font:700 7.8pt "Avenir Next Condensed",sans-serif; text-transform:uppercase; color:#00808a; letter-spacing:.05em; margin:0 0 1.2mm}
.prow{display:flex; align-items:center; gap:1.4mm; font-size:7.8pt; height:5.6mm; border-bottom:1px solid #eee9de}
.prow:last-child{border-bottom:0}
.dot{width:2.8mm; height:2.8mm; border:1.1px solid #1c1b24; border-radius:50%; flex:none}
.dia{width:2.6mm; height:2.6mm; border:1.1px solid #00808a; transform:rotate(45deg); flex:none; margin:0 .3mm}
.val{width:7mm; border-bottom:1px solid #1c1b24; height:3.6mm; flex:none}
.prow small{color:#8a8693; font:600 5.6pt "Menlo",monospace; margin-left:auto}
.legendline{font:600 5.6pt "Menlo",monospace; color:#8a8693; margin-top:.8mm}
.big3{display:grid; grid-template-columns:1fr 1fr 1fr; gap:2mm; margin-bottom:2.4mm}
.bigbox{border:1.4px solid #1c1b24; border-radius:2mm; text-align:center; padding:1mm 0 1.2mm; background:#fff}
.bigbox .an{font:700 6.4pt "Avenir Next Condensed",sans-serif; text-transform:uppercase}
.bigbox .sp{height:10mm}
.ac{border-radius:2mm 2mm 7mm 7mm}
.hp{display:grid; grid-template-columns:1fr 1fr; gap:1.6mm}
.lab{font:700 6pt "Menlo",monospace; color:#5d5a66; letter-spacing:.08em}
.wbox{border:1px solid #cfc9bb; border-radius:1.2mm; height:9mm; margin-top:.6mm}
.wbox.tall{height:13mm}
.circles{display:flex; gap:1mm; margin-top:.8mm}
.circles span{width:3.4mm; height:3.4mm; border:1.1px solid #1c1b24; border-radius:50%}
.sqs{display:flex; gap:1mm; margin-top:.8mm; flex-wrap:wrap}
.sqs span{width:3.4mm; height:3.4mm; border:1.1px solid #1c1b24; border-radius:.6mm}
.atk{width:100%; border-collapse:collapse; font-size:7.2pt}
.atk th{background:#1c1b24; color:#fff; font:700 6.4pt "Avenir Next Condensed",sans-serif; text-transform:uppercase; text-align:left; padding:.9mm 1.2mm}
.atk td{height:5.6mm; border-bottom:1px solid #d9d4c7; border-left:1px solid #eee9de; padding:0 1mm; background:#fff !important}
.atk td.k{font:700 6.8pt "Avenir Next Condensed",sans-serif; text-transform:uppercase; color:#5d5a66; white-space:nowrap}
.pre{font-size:7.1pt; line-height:1.35}
.pre div{display:flex; gap:1.4mm; align-items:flex-start; padding:.55mm 0; border-bottom:1px solid #eee9de}
.pre div:last-child{border-bottom:0}
.pre b{white-space:nowrap}
.pre .sq{flex:none; width:3mm; height:3mm; margin-top:.4mm}
.lines2 div{border-bottom:1px solid #d9d4c7; height:5.4mm}
.ranks{display:inline-flex; gap:.7mm}
.ranks span{width:3.4mm; height:3.4mm; border:1px solid #1c1b24; border-radius:.5mm; font:700 4.2pt "Menlo",monospace; display:flex; align-items:center; justify-content:center; color:#9a96a3}
.ms{display:inline-flex; gap:1.2mm; align-items:center; font:700 5.6pt "Menlo",monospace; color:#5d5a66}
.ms span.sq{width:3mm; height:3mm}
.slots9{display:grid; grid-template-columns:repeat(9,1fr); gap:1.4mm}
.slots9 div{border:1px solid #cfc9bb; border-radius:1.2mm; text-align:center; padding:.8mm 0}
.slots9 b{font:700 7pt "Avenir Next Condensed",sans-serif; display:block}
.slots9 .sqs{justify-content:center; gap:.6mm}
.slots9 .sqs span{width:2.6mm; height:2.6mm}
"""


def char_header(title):
    return f"""
<div class="cs-head">
  <div><div class="kick">WORLD DUNGEON · CRAWLER CHARACTER SHEET</div><h1>{title}</h1></div>
  <div class="cs-fields">
    <div class="field">CRAWLER NAME<div></div></div>
    <div class="field">LEVEL<div></div></div>
    <div class="field">FLOOR<div></div></div>
    <div class="field">CLASS (CRAWLER UNTIL FLOOR 3)<div></div></div>
    <div class="field">RACE (FLOOR 3+)<div></div></div>
    <div class="field">BACKGROUND<div></div></div>
  </div>
</div>"""


def foot(name):
    return (f'<div class="foot"><span>Fan-made homebrew inspired by Dungeon Crawler Carl</span>'
            f'<span>Page 0 of 0 · {name}</span></div>')


def core_page():
    abil = "".join(f'<div class="abil"><div class="an">{a}</div><div class="sc"></div><div class="md">MOD</div></div>'
                   for a in ABILITIES)
    saves = "".join(f'<div class="prow"><span class="dot"></span><span class="val"></span>{a}</div>' for a in ABILITIES)
    skills = "".join(f'<div class="prow"><span class="dot"></span><span class="dia"></span><span class="val"></span>{n}<small>{ab}</small></div>'
                     for n, ab in SKILLS)
    passives = "".join(f'<div class="prow"><span class="val"></span>Passive {n}</div>' for n in ("Perception", "Insight", "Investigation"))
    rank = "<span class='ranks'>" + "".join(f"<span>{r}</span>" for r in ("I", "II", "III", "IV", "V")) + "</span>"
    attacks = "".join(f"<tr><td></td><td></td><td>{rank}</td><td></td><td></td></tr>" for _ in range(10))
    circles10 = "".join("<span></span>" for _ in range(10))
    return f"""
<section class="page">
  {char_header("Crawler")}
  <div class="ministrip">
    <span>PROF. BONUS<span class="bx"></span></span>
    <span>INSPIRATION<span class="bx" style="width:6mm"></span></span>
    <span>UNSPENT STAT POINTS<span class="bx"></span></span>
    <span>UNSPENT SKILL PICKS<span class="bx"></span></span>
    <span>AUDIENCE</span><span class="circles" style="margin:0">{circles10}</span>
    <span class="pk"><span class="sq"></span> PK</span>
  </div>
  <div class="cs-grid">
    <div>{abil}<div class="capnote">NO CAP ON SCORES<br>MOD = (SCORE − 10) ÷ 2,<br>ROUNDED DOWN<br>8–9: −1 · 10–11: +0<br>12–13: +1 · 20: +5</div></div>
    <div>
      <div class="panel"><h3>Saving throws</h3>{saves}</div>
      <div class="panel"><h3>Skills</h3>{skills}
        <div class="legendline">&#9679; proficient &nbsp; &#9670; expertise</div></div>
      <div class="panel">{passives}</div>
      <div class="panel"><h3>Senses, resistances, immunities</h3><div class="lines2"><div></div><div></div><div></div><div></div></div></div>
    </div>
    <div>
      <div class="big3">
        <div class="bigbox ac"><div class="an">Armor Class</div><div class="sp"></div></div>
        <div class="bigbox"><div class="an">Initiative</div><div class="sp"></div></div>
        <div class="bigbox"><div class="an">Speed</div><div class="sp"></div></div>
      </div>
      <div class="panel"><h3>Hit points</h3>
        <div class="hp">
          <div><span class="lab">MAXIMUM</span><div class="wbox"></div></div>
          <div><span class="lab">TEMPORARY</span><div class="wbox"></div></div>
        </div>
        <span class="lab">CURRENT</span><div class="wbox tall"></div>
        <div class="hp" style="margin-top:1.6mm">
          <div><span class="lab">HIT DICE (LEFT / TOTAL)</span>
            <div class="hdpool">{"".join(f'<span><b>{d}</b> ___/___</span>' for d in ("d6", "d8", "d10", "d12"))}</div></div>
          <div><span class="lab">DEATH SAVES</span>
            <div class="ms" style="margin-top:1mm">SUCCESS <span class="circles" style="margin:0"><span></span><span></span><span></span></span></div>
            <div class="ms" style="margin-top:1mm">FAILURE &nbsp;<span class="circles" style="margin:0"><span></span><span></span><span></span></span></div></div>
        </div>
      </div>
      <div class="panel"><h3>Mana (all spells)</h3>
        <div class="hp" style="grid-template-columns:1fr 1fr 1fr 1.3fr">
          <div><span class="lab">TOME</span><div class="wbox" style="height:6.5mm"></div></div>
          <div><span class="lab">CLASS</span><div class="wbox" style="height:6.5mm"></div></div>
          <div><span class="lab">MAX</span><div class="wbox" style="height:6.5mm"></div></div>
          <div><span class="lab">CURRENT</span><div class="wbox" style="height:6.5mm"></div></div>
        </div>
        <div class="hp" style="grid-template-columns:1fr 1fr; margin-top:1.2mm">
          <div class="ms">PACT MANA (WARLOCK) &nbsp;___ / ___</div>
          <div class="ms">6TH–9TH USED <span class="sqs" style="margin:0"><span></span><span></span><span></span><span></span></span></div>
        </div>
      </div>
      <div class="panel"><h3>Conditions and exhaustion</h3>
        <div class="lines2"><div></div></div>
        <div class="ms" style="margin-top:1.4mm">EXHAUSTION <span class="sqs" style="margin:0">{"<span></span>" * 6}</span>
          &nbsp; WILL TO LIVE <span class="sqs" style="margin:0"><span></span><span></span></span></div>
      </div>
      <table class="atk">
        <colgroup><col style="width:31%"><col style="width:12%"><col style="width:13%"><col style="width:24%"><col></colgroup>
        <thead><tr><th>Attacks and explosives</th><th>Atk / DC</th><th>Rank</th><th>Damage / type</th><th>Traits, notes</th></tr></thead>
        <tbody>{attacks}</tbody>
      </table>
      <div class="panel" style="margin-top:2.4mm"><h3>Coin purse (gold pieces only)</h3>
        <div class="hp" style="grid-template-columns:1.1fr 1fr">
          <div><span class="lab">GP</span><div class="wbox tall"></div></div>
          <div class="lines2"><div></div><div></div><div></div></div>
        </div>
        <div class="legendline">No weight, no slot. Spills on death with your inventory. Prices under 1 gp round up to 1 gp.</div>
      </div>
    </div>
  </div>
  {foot("Crawler")}
</section>"""


def features_page():
    skill_rows = "".join(
        "<tr><td></td><td></td><td></td><td><span class='ms'>"
        + "".join(f"{n}<span class='sq'></span>" for n in (1, 5, 10, 15, 20))
        + "</span></td><td></td></tr>" for _ in range(11))
    pre = [
        ("Scrappy", "Unarmed 1d4, improvised 1d6/1d8, thrown 20/60."),
        ("Will to Live", "Bonus action: heal 1d8 + level. 1 use (2 at 8th) per rest."),
        ("Run Away! (2nd)", "Bonus action Dash or Disengage."),
        ("Inclination (3rd)", "Bruiser · Skulker · Bulwark · Dabbler: ________"),
        ("Hard to Kill (4th)", "Drop to 1 HP instead of 0. 1 per long rest."),
        ("Hardened (5th)", "Extra Attack or Arcane Edge: ________"),
        ("Danger Sense (7th)", "Advantage on Dex saves vs. effects you can see."),
    ]
    pre_html = "".join(f'<div><span class="sq"></span><span><b>{n}.</b> {t}</span></div>' for n, t in pre)
    core = [
        ("Interface", "Status bars, Inspect (bonus action, 60 ft), notifications. No map."),
        ("Inventory", "20 + level slots. Store/retrieve: free interaction, then bonus action."),
        ("Stat Point", "+1 every level. No cap on ability scores."),
        ("Skill Pick", "Every odd level: Learn, Train, Training Montage or Drill."),
        ("Learning by Doing", "No armor penalties. Unproficient weapons: half PB."),
    ]
    core_html = "".join(f'<div><span><b>{n}.</b> {t}</span></div>' for n, t in core)
    armor = "".join(f'<span class="ms"><span class="sq"></span>{a}</span>' for a in ("Light", "Medium", "Heavy", "Shields"))
    weapons = "".join(f'<span class="ms"><span class="sq"></span>{a}</span>' for a in ("Simple", "Martial", "Firearms", "Improvised"))
    return f"""
<section class="page">
  {char_header("Features")}
  <table class="atk" style="margin-top:3mm">
    <colgroup><col style="width:24%"><col style="width:10%"><col style="width:7%"><col style="width:26%"><col></colgroup>
    <thead><tr><th>Crawler Skill</th><th>Key ability</th><th>Level</th><th>Milestones gained</th><th>Notes (scaling, uses)</th></tr></thead>
    <tbody>{skill_rows}</tbody>
  </table>
  <div class="cols2" style="grid-template-columns:1fr 1fr; gap:4mm; margin-top:3mm">
    <div>
      <div class="panel pre"><h3>Crawler Core (always)</h3>{core_html}</div>
      <div class="panel pre"><h3>Survivor features (kept after Floor 3)</h3>{pre_html}</div>
      <div class="panel"><h3>Class and race features (from Floor 3)</h3><div class="lines2">{"<div></div>" * 4}</div></div>
      <div class="panel faith"><h3>Faith (optional Gods module)</h3>
        <div style="display:flex;gap:2mm;align-items:flex-end"><span class="lab">GOD</span><div class="lines2" style="flex:1"><div></div></div>
          <span class="lab">FAVOR</span><span style="display:inline-block;width:10mm;height:5mm;border:1.2px solid #1c1b24;border-radius:1mm"></span></div>
        <div style="display:flex;gap:2.2mm;align-items:center;margin:1.4mm 0 1mm"><span class="lab">RANK</span>
          {"".join(f'<span class="ms"><span class="sq"></span>{r}</span>' for r in ("Initiate", "Devotee 5", "Zealot 15", "Chosen 30"))}</div>
        <div style="display:flex;gap:1.6mm;align-items:center;margin-bottom:1mm"><span class="lab">LAPSES</span>
          {"".join(f'<span class="ms"><span class="sq"></span>{n}</span>' for n in range(1, 6))}<span class="legendline" style="margin:0">Warning · Cold · Displeasure · Wrath · Forsaken</span></div>
        <div class="legendline" style="margin:0 0 .6mm">Rite each day +1 · Offering each floor +3 · Great Deed +5. Missed Rite or Offering, or a broken Taboo = 1 Lapse. Clean floor = −1.</div>
        <div style="display:flex;gap:2mm;align-items:flex-end"><span class="lab">BOONS</span><div class="lines2" style="flex:1"><div></div></div></div>
        <div style="display:flex;gap:2mm;align-items:flex-end"><span class="lab">APOSTATE OF</span><div class="lines2" style="flex:1"><div></div></div></div>
      </div>
    </div>
    <div>
      <div class="panel"><h3>Proficiencies and languages</h3>
        <div class="lab">ARMOR</div><div style="display:flex;gap:3mm;margin:.8mm 0 1.6mm">{armor}</div>
        <div class="lab">WEAPONS</div><div style="display:flex;gap:3mm;margin:.8mm 0 1mm">{weapons}</div>
        <div class="lines2"><div></div></div>
        <div class="lab" style="margin-top:1.6mm">TOOLS</div><div class="lines2"><div></div><div></div></div>
        <div class="lab" style="margin-top:1.6mm">LANGUAGES</div><div class="lines2"><div></div><div></div></div>
      </div>
      <div class="panel"><h3>Achievements and titles</h3><div class="lines2">{"<div></div>" * 5}</div></div>
      <div class="panel"><h3>Before the dungeon</h3>
        <div class="lab">WHERE WERE YOU WHEN THE WORLD ENDED?</div><div class="lines2"><div></div><div></div></div>
        <div class="lab" style="margin-top:1.4mm">WHAT WERE YOU WEARING? POCKET ITEM?</div><div class="lines2"><div></div><div></div></div>
        <div class="lab" style="margin-top:1.4mm">ALLIES, SPONSORS, GRUDGES</div><div class="lines2"><div></div><div></div></div>
      </div>
    </div>
  </div>
  {foot("Features")}
</section>"""


def magic_page():
    ranks = "".join(f"<span>{r}</span>" for r in ("I", "II", "III", "IV", "V"))
    first = (f"<tr><td style='font-weight:700'>Heal Self</td><td>1st</td><td>Crawler</td><td>—</td><td><span class='ranks'>{ranks}</span></td><td>1</td>"
             "<td style='font-size:6.6pt'>Always 1st level, always 1 mana. Heal 1d8 per rank. Bonus action from Rank III.</td></tr>")
    tome_rows = first + "".join(f"<tr><td></td><td></td><td></td><td></td><td><span class='ranks'>{ranks}</span></td><td></td><td></td></tr>" for _ in range(31))
    costs = {1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 9, 7: 10, 8: 11, 9: 13}
    slots = "".join(f'<div><b>{n}{"st" if n == 1 else "nd" if n == 2 else "rd" if n == 3 else "th"}</b>'
                    f'<span style="font:800 11pt \'Avenir Next Condensed\',sans-serif;color:#d81b60">{c}</span>'
                    f'{"<span class=sqs><span></span></span>" if n >= 6 else ""}</div>' for n, c in costs.items())
    return f"""
<section class="page">
  {char_header("Magic")}
  <div class="ministrip">
    <span>INT DC (8 + PB + INT)<span class="bx"></span></span>
    <span>INT ATTACK<span class="bx"></span></span>
    <span>CLASS ABILITY<span class="bx" style="width:12mm"></span></span>
    <span>CLASS DC<span class="bx"></span></span>
    <span>CLASS ATTACK<span class="bx"></span></span>
  </div>
  <div class="ministrip">
    <span>TOME LIMIT (LEVEL ÷ 2, UP)<span class="bx"></span></span>
    <span>CASTER LEVEL<span class="bx"></span></span>
    <span>MAX SPELL LEVEL<span class="bx"></span></span>
    <span>PACT LEVEL<span class="bx"></span></span>
  </div>
  <table class="atk">
    <colgroup><col style="width:27%"><col style="width:7%"><col style="width:13%"><col style="width:7%"><col style="width:16%"><col style="width:7%"><col></colgroup>
    <thead><tr><th>Tome spell or cantrip</th><th>Level</th><th>Source</th><th>Abil.</th><th>Rank</th><th>Mana</th><th>Notes (range, effect, concentration)</th></tr></thead>
    <tbody>{tome_rows}</tbody>
  </table>
  <div class="legendline">Every spell you know goes here. Source: Tome, your class, a feat or a species. Read from a tome = Intelligence; from a class = its ability; from a feat, species or god = the ability it names. A spell always costs its own level; ranks (II at level 3, III at 5, IV at 9, V at 13) make it stronger. No preparing.</div>
  <div class="panel"><h3>Mana costs (no spell slots)</h3><div class="slots9">{slots}</div>
    <div class="legendline">One spell each of 6th, 7th, 8th and 9th level per long rest. Short rest: regain half your tome mana. Pact mana: full on any rest, cast at pact level (+1 rank per level above the spell).</div></div>
  {foot("Magic")}
</section>"""


def pet_page():
    abil = "".join(f'<div class="abil" style="margin:0;padding:1mm 0 1.2mm"><div class="an">{a[:3]}</div>'
                   f'<div class="sc" style="width:11mm;height:9mm"></div><div class="md">MOD</div></div>' for a in ABILITIES)
    attacks = "".join("<tr><td></td><td></td><td></td><td></td></tr>" for _ in range(5))
    upg = "".join(f"<tr><td class='k'>Level {lv}</td><td></td></tr>" for lv in (4, 8, 12, 16, 20, 24, 28, 32))
    evo = "".join("<tr><td></td></tr>" for _ in range(4))
    hatch = "".join("<span></span>" for _ in range(24))
    stored = "".join("<tr><td></td><td></td><td></td><td></td></tr>" for _ in range(3))
    return f"""
<section class="page">
  {char_header("Pet")}
  <div class="cs-fields" style="grid-template-columns:2fr 2fr .8fr 1fr 1.4fr; margin-top:3mm">
    <div class="field">PET NAME<div></div></div>
    <div class="field">CREATURE<div></div></div>
    <div class="field">CR<div></div></div>
    <div class="field">SIZE<div></div></div>
    <div class="field">HOW YOU GOT IT<div></div></div>
  </div>
  <div class="cols2" style="grid-template-columns:1fr 1fr; gap:4mm; margin-top:3mm">
    <div>
      <div class="big3">
        <div class="bigbox ac"><div class="an">AC (+ bond)</div><div class="sp"></div></div>
        <div class="bigbox"><div class="an">Speed</div><div class="sp"></div></div>
        <div class="bigbox"><div class="an">Bond (your PB)</div><div class="sp"></div></div>
      </div>
      <div class="panel"><h3>Hit points</h3>
        <div class="hp">
          <div><span class="lab">MAX (4 × YOUR LEVEL MIN)</span><div class="wbox"></div></div>
          <div><span class="lab">CURRENT</span><div class="wbox"></div></div>
        </div>
        <div class="hp" style="margin-top:1.4mm">
          <div><span class="lab">HIT DICE</span><div class="wbox" style="height:6.5mm"></div></div>
          <div><span class="lab">DEATH SAVES</span>
            <div class="ms" style="margin-top:1mm">SUCCESS <span class="circles" style="margin:0"><span></span><span></span><span></span></span></div>
            <div class="ms" style="margin-top:1mm">FAILURE &nbsp;<span class="circles" style="margin:0"><span></span><span></span><span></span></span></div></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:1.6mm;margin-bottom:2.4mm">{abil}</div>
      <div class="panel"><h3>Senses, skills, resistances</h3><div class="lines2"><div></div><div></div><div></div></div></div>
      <div class="panel"><h3>Hatchling (first 24 floor turns: half HP, half damage)</h3><span class="sqs">{hatch}</span></div>
    </div>
    <div>
      <table class="atk">
        <colgroup><col style="width:36%"><col style="width:14%"><col style="width:26%"><col></colgroup>
        <thead><tr><th>Pet attacks and actions</th><th>Atk / DC</th><th>Damage</th><th>Notes</th></tr></thead>
        <tbody>{attacks}</tbody>
      </table>
      <div class="panel" style="margin-top:2.4mm"><h3>Upgrades and tricks (one at each level)</h3>
        <table class="atk"><colgroup><col style="width:24%"><col></colgroup><tbody>{upg}</tbody></table></div>
      <div class="panel"><h3>Evolutions</h3><table class="atk"><tbody>{evo}</tbody></table></div>
    </div>
  </div>
  <table class="atk" style="margin-top:1mm">
    <colgroup><col style="width:30%"><col style="width:30%"><col style="width:12%"><col></colgroup>
    <thead><tr><th>Stored pets (Pet Carrier or safe room)</th><th>Creature</th><th>HP</th><th>Where</th></tr></thead>
    <tbody>{stored}</tbody>
  </table>
  <div class="legendline">Command: bonus action (Pet Trainer 5: part of your Attack action; Leash of Command: no action). Uncommanded pets Dodge. Heal Self does not work on pets.</div>
  <div class="cols2" style="grid-template-columns:1fr 1fr; gap:4mm; margin-top:2.4mm">
    <div class="panel"><h3>Pet gear (barding, collar, leash, carrier)</h3><div class="lines2">{"<div></div>" * 4}</div></div>
    <div class="panel"><h3>Personality, quirks, favorite snacks</h3><div class="lines2">{"<div></div>" * 4}</div></div>
  </div>
  {foot("Pet")}
</section>"""


def levels_page():
    classes = "".join("<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" for _ in range(5))

    def log_rows(start):
        rows = []
        for lv in range(start, start + 32):
            pick = "<span class='sq' style='width:3mm;height:3mm'></span>" if lv % 2 else "<span style='color:#cfc9bb'>—</span>"
            rows.append(f"<tr><td class='n'>{lv}</td><td></td><td></td><td></td>"
                        f"<td class='c'><span class='sq' style='width:3mm;height:3mm'></span></td><td class='c'>{pick}</td></tr>")
        return "".join(rows)

    def log_table(start):
        return f"""<table class="atk lvlog">
      <colgroup><col style="width:10%"><col style="width:36%"><col style="width:13%"><col style="width:13%"><col style="width:14%"><col style="width:14%"></colgroup>
      <thead><tr><th>Lvl</th><th>Class taken</th><th>HD</th><th>HP</th><th>Stat pt</th><th>Pick</th></tr></thead>
      <tbody>{log_rows(start)}</tbody></table>"""

    return f"""
<section class="page">
  {char_header("Levels")}
  <div class="panel" style="margin-top:3mm"><h3>Your classes (one level at a time; levels 21+ in a class are prestige levels)</h3>
    <table class="atk">
      <colgroup><col style="width:22%"><col style="width:24%"><col style="width:11%"><col style="width:11%"><col style="width:9%"><col></colgroup>
      <thead><tr><th>Class</th><th>Subclass</th><th>Class level</th><th>Prestige</th><th>Hit die</th><th>Casting (full / half / third / pact / none)</th></tr></thead>
      <tbody><tr><td class="k">Crawler (Floors 1–2)</td><td>—</td><td></td><td>—</td><td>d8</td><td>Tome mana only</td></tr>{classes}</tbody>
    </table>
    <div class="legendline">Hit dice: Crawler levels d8 · Sorcerer, Wizard d6 · Bard, Cleric, Druid, Monk, Rogue, Warlock d8 · Fighter, Paladin, Ranger d10 · Barbarian d12. Floor 3 class levels keep d8.</div>
  </div>
  <div class="cols2" style="grid-template-columns:1fr 1fr; gap:4mm">
    {log_table(1)}
    {log_table(33)}
  </div>
  <div class="legendline">Each level: one class level, its hit die, its HP (roll or fixed + Con), 1 Stat Point. Odd levels also give a Skill Pick. Write prestige levels as, e.g., Fighter P3. Past level 64: use a second sheet.</div>
  {foot("Levels")}
</section>"""
