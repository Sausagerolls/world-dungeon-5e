# Writes gods/stat-blocks.md (the major gods and minor deities) from the data below. Run: python3 tools/build_god_stat_blocks.py
import re, math
PB = {9:4,10:4,11:4,12:4,13:5,14:5,15:5,16:5,17:6,18:6,19:6,20:6,21:7,22:7,23:7,24:7,25:8,26:8,27:8,28:8,29:9,30:9}
XP = {9:5000,10:5900,11:7200,12:8400,13:10000,14:11500,15:13000,16:15000,17:18000,18:20000,19:22000,20:25000,21:33000,22:41000,23:50000,24:62000,25:75000,26:90000,27:105000,28:120000,29:135000,30:155000}
DIE = {"Tiny":4,"Small":6,"Medium":8,"Large":10,"Huge":12,"Gargantuan":20}
AB = ["STR","DEX","CON","INT","WIS","CHA"]
SK = {"Perception":"WIS","Insight":"WIS","Stealth":"DEX","Deception":"CHA","Persuasion":"CHA","Intimidation":"CHA","Arcana":"INT","History":"INT","Religion":"INT","Survival":"WIS","Athletics":"STR","Acrobatics":"DEX","Performance":"CHA","Investigation":"INT","Sleight of Hand":"DEX","Medicine":"WIS","Nature":"INT"}
m = lambda s: (s - 10) // 2
sg = lambda n: f"+{n}" if n >= 0 else f"−{-n}"

def fill(text, c):
    pb = PB[c["cr"]]; sc = dict(zip(AB, c["scores"]))
    def hit(mm): return sg(m(sc[mm.group(1)]) + pb)
    def dc(mm): return str(8 + pb + m(sc[mm.group(1)]))
    def dmg(mm):
        n, d, ab = int(mm.group(1)), int(mm.group(2)), mm.group(3)
        bonus = m(sc[ab]) if ab else 0
        avg = int(n * (d + 1) / 2) + bonus
        return f"{avg} ({n}d{d}{' + ' + str(bonus) if bonus > 0 else (' − ' + str(-bonus) if bonus < 0 else '')})"
    text = re.sub(r"\{hit:(\w+)\}", hit, text)
    text = re.sub(r"\{dc:(\w+)\}", dc, text)
    text = re.sub(r"\{(\d+)d(\d+)(?:\+(\w+))?\}", dmg, text)
    return text

def ungod(text, c):
    """The gods' stat blocks say the god's name, not 'the avatar'."""
    if not c.get("short"):
        return text
    sh = c["short"]
    cap = sh[0].upper() + sh[1:]
    text = re.sub(r"(^|\. |\*\* )The avatar", lambda m: m.group(1) + cap, text)
    text = text.replace("the avatar's", f"{sh}'s").replace("The avatar's", f"{cap}'s").replace("the avatar", sh).replace("The avatar", cap)
    return text.replace("its worshippers", f"{sh}'s worshippers")


def block(c):
    pb = PB[c["cr"]]; sc = dict(zip(AB, c["scores"])); con = m(sc["CON"])
    n = c["hd"]; die = DIE[c["size"]]
    hp = int(n * (die + 1) / 2) + n * con
    out = [f"### Stat Block: {c['name']}", f"**{c['size']} {c['type']} · {c['align']} · CR {c['cr']}**", "", c["intro"], "",
           "| | |", "|---|---|", f"| **AC** | {c['ac']} |", f"| **HP** | {hp} ({n}d{die} + {n*con}) |", f"| **Speed** | {c['speed']} |",
           f"| **Initiative** | {sg(m(sc['DEX']) + pb)} ({10 + m(sc['DEX']) + pb}) |", "",
           "| | STR | DEX | CON | INT | WIS | CHA |", "|---|---|---|---|---|---|---|",
           "| **Score** | " + " | ".join(str(sc[a]) for a in AB) + " |",
           "| **Mod / Save** | " + " | ".join(f"{sg(m(sc[a]))} / {sg(m(sc[a]) + (pb if a in c['saves'] else 0))}" for a in AB) + " |", "",
           "| | |", "|---|---|"]
    if c.get("skills"):
        sk = []
        for s in c["skills"]:
            exp = s.endswith("*"); s = s.rstrip("*")
            sk.append(f"{s} {sg(m(sc[SK[s]]) + pb * (2 if exp else 1))}")
        out.append(f"| **Skills** | {', '.join(sk)} |")
    for k in ("Vulnerabilities", "Resistances", "Immunities"):
        if c.get(k): out.append(f"| **{k}** | {c[k]} |")
    pp = 10 + m(sc["WIS"]) + (pb * (2 if "Perception*" in c.get("skills", []) else 1) if any(s.startswith("Perception") for s in c.get("skills", [])) else 0)
    out.append(f"| **Senses** | {c['senses']}; Passive Perception {pp} |")
    out.append(f"| **Languages** | {c['langs']} |")
    out.append(f"| **CR** | {c['cr']} (XP {XP[c['cr']]:,}{', or ' + format(XP[c['cr']] + XP[c['cr']] // 5, ',') + ' in lair' if c.get('lair') else ''}; PB +{pb}) |")
    for title, key in (("Traits", "traits"), ("Actions", "actions"), ("Bonus Actions", "bonus"), ("Reactions", "reactions"), ("Legendary Actions", "legendary")):
        if c.get(key):
            out += ["", f"#### {title}", ""]
            if key == "legendary":
                out += [ungod(fill(c["legend_intro"], c), c), ""]
            out += [f"- **{nm}.** {ungod(fill(tx, c), c)}" for nm, tx in c[key]]
    return "\n".join(out) + "\n"

AVATAR_TRAITS = lambda god: [
    ("Godhood", f"This is {god} in person. It can't be charmed, frightened, polymorphed or banished. If it drops to 0 hit points, {god} is slain, for good (see *Slaying a God* in `gods`)."),
    ("Legendary Resistance (4/Day, or 5/Day in Lair)", f"If {god} fails a saving throw, it can choose to succeed instead."),
    ("Magic Resistance", f"{god[0].upper() + god[1:]} has advantage on saving throws against spells and other magical effects."),
    ("Knows Its Own", f"{god[0].upper() + god[1:]} knows the name, Favor and Lapses of every worshipper within 1 mile, and can't be surprised by them."),
]

GODS = [
 dict(name="Mother Moldra, the Rot Queen", short="Moldra", size="Gargantuan", type="Celestial (Plant)", align="Neutral", cr=26, hd=24, ac=21, speed="30 ft., burrow 30 ft.",
  scores=[26,10,30,18,26,22], saves=["CON","WIS","CHA"], skills=["Perception*","Nature","Medicine"],
  Resistances="Bludgeoning, Piercing, Slashing", Immunities="Necrotic, Poison; Charmed, Frightened, Poisoned", senses="Blindsight 120 ft., Tremorsense 120 ft.", langs="All, telepathy 1 mile", lair=True,
  intro="A walking hill of rot: a mother-shape of soft fungus and old bones, crowned with glowing mushrooms. Wherever she steps, things grow, and things die.",
  traits=AVATAR_TRAITS("Moldra") + [("Spore Cloud", "Each creature that starts its turn within 20 feet of the avatar makes a DC {dc:CON} Constitution saving throw or has the Poisoned condition until the start of its next turn. Moldra's worshippers are immune.")],
  actions=[("Multiattack", "The avatar makes three Rotting Slam attacks. It can replace one of them with Feed the Mother."),
   ("Rotting Slam", "*Melee Attack Roll:* {hit:STR}, reach 15 ft. *Hit:* {4d10+STR} Bludgeoning damage plus {3d10} Necrotic damage, and the target's hit point maximum drops by the Necrotic damage until it finishes a long rest."),
   ("Feed the Mother", "Each creature in a 30-foot cone makes a DC {dc:CON} Constitution saving throw. *Failure:* {12d10} Necrotic damage, and a creature that dies is overgrown and rises as a Fungal Thrall under the avatar's control. *Success:* Half damage."),
   ("Compost (Recharge 5–6)", "The ground in a 60-foot radius turns to rot. Each creature of the avatar's choice there makes a DC {dc:WIS} Strength saving throw. *Failure:* {10d10} Necrotic damage and the Restrained condition (escape DC {dc:WIS}). *Success:* Half damage only.")],
  bonus=[("Regrow", "The avatar regains 30 hit points if it is touching soil, rot or a corpse.")],
  legend_intro="The avatar can take 3 legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.",
  legendary=[("Grasping Rot", "One creature within 60 feet makes a DC {dc:WIS} Strength saving throw or is pulled 30 feet toward the avatar and Restrained until the end of its next turn."),
   ("Bloom", "The avatar regains 20 hit points, and a 20-foot radius around it becomes Difficult Terrain."),
   ("Smite the Faithless (Costs 2 Actions)", "One apostate or non-worshipper within 120 feet takes {6d10} Necrotic damage, no save.")]),
 dict(name="Embrix the Unquenched", short="Embrix", size="Huge", type="Celestial", align="Chaotic Good", cr=27, hd=26, ac=22, speed="50 ft., fly 80 ft. (hover)",
  scores=[28,20,26,16,18,28], saves=["DEX","CON","CHA"], skills=["Perception","Intimidation*","Performance*"],
  Immunities="Fire, Radiant; Blinded, Exhaustion", Resistances="Bludgeoning, Piercing, Slashing", senses="Truesight 120 ft.", langs="All, telepathy 1 mile", lair=True,
  intro="A golden giant made of fire, posing. Always posing. His hair is a bonfire and his smile is a stage light.",
  traits=AVATAR_TRAITS("Embrix") + [("Burning Glory", "The avatar sheds bright light in a 60-foot radius and dim light for 60 more feet. A creature that touches it or hits it with a melee attack takes {3d10} Fire damage."),
   ("Showstopper", "Creatures have disadvantage on saving throws against the avatar's fire while it is being watched by an audience of 10 or more (the System counts viewers).")],
  actions=[("Multiattack", "The avatar makes three Blazing Blade attacks, or two and one Sunlance."),
   ("Blazing Blade", "*Melee Attack Roll:* {hit:STR}, reach 15 ft. *Hit:* {4d10+STR} Slashing damage plus {4d6} Fire damage."),
   ("Sunlance", "*Ranged Attack Roll:* {hit:CHA}, range 300 ft. *Hit:* {8d10+CHA} Radiant damage, and the target has the Blinded condition until the start of the avatar's next turn."),
   ("Grand Finale (Recharge 5–6)", "Fire explodes from the avatar in a 60-foot radius. Each creature in it makes a DC {dc:CHA} Dexterity saving throw. *Failure:* {18d10} Fire damage. *Success:* Half damage. Fire resistance doesn't apply.")],
  legend_intro="The avatar can take 3 legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.",
  legendary=[("Pose", "The avatar moves up to half its fly speed and flexes. Each creature within 30 feet that can see it makes a DC {dc:CHA} Wisdom saving throw or has the Frightened condition until the end of its next turn."),
   ("Flare", "The avatar makes one Sunlance attack."),
   ("Smite the Faithless (Costs 2 Actions)", "One apostate or non-worshipper within 120 feet takes {6d10} Fire damage, no save, and catches fire (1d10 Fire damage at the start of each of its turns until it uses an action to put itself out).")]),
 dict(name="Saint Payola, Patron of Sponsors", short="Saint Payola", size="Large", type="Celestial", align="Lawful Neutral", cr=25, hd=30, ac=22, speed="40 ft., fly 60 ft.",
  scores=[18,22,24,26,22,30], saves=["DEX","WIS","CHA"], skills=["Deception*","Insight*","Persuasion*","Perception"],
  Resistances="Force, Psychic; Bludgeoning, Piercing, Slashing", Immunities="Charmed, Frightened", senses="Truesight 120 ft.", langs="All, telepathy 1 mile", lair=True,
  intro="A smiling saint in a suit of gold leaf, trailing a halo of floating price tags. She never raises her voice. She doesn't have to.",
  traits=AVATAR_TRAITS("Saint Payola") + [("Everything Has a Price", "Any creature that makes a deal with the avatar is bound by it as if by *Terms of Service* (DC {dc:CHA}, no save while the deal is honored)."),
   ("Retainer", "The avatar can't be attacked by a creature that owes it money, unless that creature first succeeds on a DC {dc:CHA} Charisma saving throw (a new save each turn).")],
  actions=[("Multiattack", "The avatar makes three Gilded Touch attacks, or uses Collect twice."),
   ("Gilded Touch", "*Melee Attack Roll:* {hit:CHA}, reach 10 ft. *Hit:* {5d10+CHA} Force damage, and the target loses gold equal to the damage."),
   ("Collect", "One creature within 120 feet makes a DC {dc:CHA} Charisma saving throw. *Failure:* {10d10} Force damage, and one magic item it carries (her choice) teleports into the avatar's hand. *Success:* Half damage only."),
   ("Hostile Takeover (Recharge 5–6)", "Each creature of the avatar's choice within 60 feet makes a DC {dc:CHA} Wisdom saving throw or has the Charmed condition for 1 minute. A charmed creature fights for the avatar. It repeats the save at the end of each of its turns.")],
  legend_intro="The avatar can take 3 legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.",
  legendary=[("Fine Print", "One creature within 60 feet has disadvantage on its next saving throw."),
   ("Buyback", "The avatar regains 25 hit points, or ends one condition on itself."),
   ("Smite the Faithless (Costs 2 Actions)", "One apostate or non-worshipper within 120 feet takes {6d10} Force damage, no save, and loses 10% of its gold.")]),
 dict(name="Thrumm, the Thunder That Remembers", short="Thrumm", size="Gargantuan", type="Celestial", align="Chaotic Neutral", cr=27, hd=24, ac=22, speed="60 ft., fly 120 ft. (hover)",
  scores=[30,16,28,14,22,20], saves=["STR","CON","WIS"], skills=["Perception*","Survival*","Intimidation"],
  Immunities="Lightning, Thunder; Deafened, Frightened", Resistances="Bludgeoning, Piercing, Slashing", senses="Truesight 120 ft.", langs="All, telepathy 1 mile", lair=True,
  intro="A storm with antlers and a hunter's spear, its voice a rolling thunderclap. A list of names circles it in burning letters, and the list is long.",
  traits=AVATAR_TRAITS("Thrumm") + [("The List", "The avatar always knows the location of every creature on its worshippers' Grudge Lists within 1 mile. It has advantage on attack rolls against them.")],
  actions=[("Multiattack", "The avatar makes three Stormspear attacks."),
   ("Stormspear", "*Melee or Ranged Attack Roll:* {hit:STR}, reach 20 ft. or range 120/480 ft. *Hit:* {4d10+STR} Piercing damage plus {4d10} Lightning damage. The spear returns to its hand."),
   ("Thunderclap", "Each creature within 60 feet makes a DC {dc:CON} Constitution saving throw. *Failure:* {10d10} Thunder damage, and the Deafened and Prone conditions. *Success:* Half damage only."),
   ("Storm of Grudges (Recharge 5–6)", "Up to six creatures the avatar can see within 300 feet are struck by lightning. Each makes a DC {dc:CON} Dexterity saving throw. *Failure:* {12d10} Lightning damage. *Success:* Half damage.")],
  legend_intro="The avatar can take 3 legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.",
  legendary=[("Hunt", "The avatar moves up to its speed without provoking opportunity attacks."),
   ("Spear", "The avatar makes one Stormspear attack."),
   ("Smite the Faithless (Costs 2 Actions)", "One apostate or non-worshipper within 120 feet takes {6d10} Lightning damage, no save.")]),
 dict(name="Nyx-Ra, the Quiet Dark", short="Nyx-Ra", size="Huge", type="Celestial", align="Neutral", cr=26, hd=26, ac=21, speed="40 ft., fly 60 ft. (hover)",
  scores=[20,26,24,24,30,22], saves=["DEX","INT","WIS"], skills=["Stealth*","Insight*","Perception*"],
  Immunities="Necrotic, Psychic; Charmed, Frightened, Unconscious", Resistances="Bludgeoning, Piercing, Slashing", senses="Truesight 120 ft.", langs="All (only whispers), telepathy 1 mile", lair=True,
  intro="A tall figure of folded darkness with one closed eye. The room goes quiet when she arrives. Nobody decides to stop talking. They just do.",
  traits=AVATAR_TRAITS("Nyx-Ra") + [("Silence", "No sound can be made within 30 feet of the avatar, except by the avatar. Creatures there can't cast spells with verbal components."),
   ("Unseen", "The avatar is Invisible while it is in dim light or darkness.")],
  actions=[("Multiattack", "The avatar makes three Endnote attacks. It can replace one with Lull."),
   ("Endnote", "*Melee Attack Roll:* {hit:DEX}, reach 10 ft. *Hit:* {4d10+DEX} Necrotic damage plus {3d10} Psychic damage, and the target can't regain hit points until the start of the avatar's next turn."),
   ("Lull", "One creature within 60 feet makes a DC {dc:WIS} Wisdom saving throw or has the Unconscious condition for 1 minute (it wakes if it takes damage)."),
   ("Lights Out Forever (Recharge 5–6)", "Magical darkness fills a 60-foot radius for 1 minute. Each creature in it makes a DC {dc:WIS} Wisdom saving throw. *Failure:* {14d10} Psychic damage, and it forgets the last minute. *Success:* Half damage.")],
  legend_intro="The avatar can take 3 legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.",
  legendary=[("Fade", "The avatar teleports up to 60 feet to a space in dim light or darkness."),
   ("Shh", "One creature within 60 feet makes a DC {dc:WIS} Constitution saving throw or can't speak or cast spells with verbal components until the end of its next turn."),
   ("Smite the Faithless (Costs 2 Actions)", "One apostate or non-worshipper within 120 feet takes {6d10} Psychic damage, no save.")]),
 dict(name="The Brass Warden", short="the Warden", size="Gargantuan", type="Construct (Celestial)", align="Lawful Neutral", cr=27, hd=26, ac=25, speed="40 ft.",
  scores=[30,8,30,18,24,20], saves=["STR","CON","WIS"], skills=["Insight*","Perception","Athletics*"],
  Immunities="Poison, Psychic; Charmed, Frightened, Paralyzed, Petrified, Poisoned, Prone", Resistances="Bludgeoning, Piercing, Slashing, Force", senses="Truesight 120 ft.", langs="All, telepathy 1 mile", lair=True,
  intro="A brass titan with a door where its face should be, and a key the size of a bridge. It walks slowly. It doesn't need to walk fast. Nothing gets past it.",
  traits=AVATAR_TRAITS("the Warden") + [("The Wall", "The avatar can't be moved against its will. Creatures can't move through its space or within 5 feet of it without its permission."),
   ("Oathkeeper", "The avatar knows when a creature within 120 feet breaks a promise. That creature has disadvantage on attack rolls against it.")],
  actions=[("Multiattack", "The avatar makes three Key attacks, or two Key attacks and one Sentence."),
   ("Key", "*Melee Attack Roll:* {hit:STR}, reach 20 ft. *Hit:* {5d10+STR} Bludgeoning damage, and the target has the Prone condition."),
   ("Sentence", "One creature within 120 feet makes a DC {dc:WIS} Charisma saving throw. *Failure:* {8d10} Radiant damage, and the creature is Restrained by brass shackles for 1 minute (it repeats the save at the end of each of its turns). *Success:* Half damage only."),
   ("Lockdown (Recharge 5–6)", "Every door, gate and wall within 1 mile locks. Each creature of the avatar's choice within 60 feet makes a DC {dc:WIS} Strength saving throw. *Failure:* {12d10} Force damage, and its speed is 0 until the end of its next turn. *Success:* Half damage.")],
  reactions=[("Shield Wall", "When a creature within 30 feet of the avatar is hit by an attack, the avatar takes the hit instead.")],
  legend_intro="The avatar can take 3 legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.",
  legendary=[("Step", "The avatar moves up to half its speed."),
   ("Key", "The avatar makes one Key attack."),
   ("Smite the Faithless (Costs 2 Actions)", "One apostate or non-worshipper within 120 feet takes {6d10} Radiant damage, no save.")]),
 dict(name="Wobblegob, the Laughing God", short="Wobblegob", size="Huge", type="Fey (Celestial)", align="Chaotic Neutral", cr=25, hd=26, ac=20, speed="50 ft., fly 50 ft., climb 50 ft.",
  scores=[24,26,24,18,16,30], saves=["DEX","CON","CHA"], skills=["Acrobatics*","Performance*","Deception*","Sleight of Hand*"],
  Immunities="Psychic; Charmed, Frightened, Grappled, Restrained", Resistances="Bludgeoning, Piercing, Slashing, Thunder", senses="Truesight 120 ft.", langs="All, honking, telepathy 1 mile", lair=True,
  intro="Something huge in a polka-dot suit, with too many arms and a smile that keeps changing shape. It honks when it is happy. It is always happy.",
  traits=AVATAR_TRAITS("Wobblegob") + [("Comedic Timing", "When a creature within 120 feet rolls a 1 on a d20, the avatar can roll on Wobblegob's Gag table (see `pantheon`) and choose where it happens."),
   ("Slippery", "The avatar ignores Difficult Terrain and can move through other creatures' spaces.")],
  actions=[("Multiattack", "The avatar makes three Mallet attacks, or two Mallet attacks and one Gag."),
   ("Mallet", "*Melee Attack Roll:* {hit:STR}, reach 15 ft. *Hit:* {4d10+STR} Bludgeoning damage plus {3d10} Thunder damage, and the target is pushed 20 feet."),
   ("Gag", "The avatar rolls on the Gag table twice and chooses where each happens, within 120 feet."),
   ("The Big Joke (Recharge 5–6)", "Each creature of the avatar's choice within 60 feet makes a DC {dc:CHA} Wisdom saving throw. *Failure:* {14d10} Psychic damage, and the creature is Incapacitated with laughter until the end of its next turn. *Success:* Half damage.")],
  reactions=[("Banana Peel", "When a creature within 60 feet moves, the avatar makes it make a DC {dc:DEX} Dexterity saving throw or fall Prone and end its move.")],
  legend_intro="The avatar can take 3 legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.",
  legendary=[("Pratfall", "The avatar teleports up to 60 feet."),
   ("Honk", "Each creature within 30 feet makes a DC {dc:CHA} Constitution saving throw or has the Deafened condition and drops what it is holding."),
   ("Smite the Faithless (Costs 2 Actions)", "One apostate or non-worshipper within 120 feet takes {6d10} Bludgeoning damage, no save, from a falling anvil.")]),
 dict(name="Hearthmother Tuul", short="Tuul", size="Huge", type="Celestial", align="Neutral Good", cr=25, hd=28, ac=20, speed="40 ft.",
  scores=[24,14,28,20,30,24], saves=["CON","WIS","CHA"], skills=["Insight*","Medicine*","Perception"],
  Immunities="Cold, Radiant; Charmed, Frightened", Resistances="Bludgeoning, Piercing, Slashing", senses="Truesight 120 ft.", langs="All, telepathy 1 mile", lair=True,
  intro="A broad, warm grandmother made of hearth-glow and flour, with an apron of woven light and a ladle like a scepter. She smells like bread. She hits like a truck.",
  traits=AVATAR_TRAITS("Hearthmother Tuul") + [("Hearth Glow", "The avatar's allies within 30 feet regain 10 hit points at the start of each of their turns."),
   ("Mother's Wrath", "The avatar has advantage on attack rolls against a creature that has reduced any creature to 0 hit points in the last minute.")],
  actions=[("Multiattack", "The avatar makes three Ladle attacks. It can replace one with Feed."),
   ("Ladle", "*Melee Attack Roll:* {hit:STR}, reach 15 ft. *Hit:* {4d10+STR} Bludgeoning damage plus {3d10} Radiant damage."),
   ("Feed", "One creature within 30 feet regains {8d10+WIS} hit points and ends one condition on itself."),
   ("Cold Shoulder (Recharge 5–6)", "All warmth leaves a 60-foot radius. Each creature of the avatar's choice in it makes a DC {dc:WIS} Constitution saving throw. *Failure:* {14d10} Cold damage, and it can't regain hit points until the end of its next turn. *Success:* Half damage.")],
  legend_intro="The avatar can take 3 legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.",
  legendary=[("Come Here, Dear", "One willing creature within 120 feet teleports to a space next to the avatar and regains 20 hit points."),
   ("Ladle", "The avatar makes one Ladle attack."),
   ("Smite the Faithless (Costs 2 Actions)", "One apostate or non-worshipper within 120 feet takes {6d10} Cold damage, no save.")]),
]

MINOR = [
 dict(name="Prince Fen of the Spores", size="Large", type="Celestial (Plant)", align="Neutral", cr=16, hd=22, ac=18, speed="30 ft., burrow 20 ft.",
  scores=[22,12,24,14,20,18], saves=["CON","WIS"], skills=["Perception","Nature"],
  Resistances="Bludgeoning, Piercing", Immunities="Necrotic, Poison; Poisoned", senses="Tremorsense 60 ft.", langs="Common, Sylvan, telepathy 120 ft.",
  intro="Moldra's eldest son: a sulky young god in a cloak of puffballs, who badly wants a religion of his own. He hires crawlers to spread his spores to new floors. Some of them come back.",
  traits=[("Minor Deity", "Prince Fen can't be killed for good in the dungeon: at 0 hit points he rots away and regrows on the next floor. He can grant one Boon, at the Devotee rank, to a crawler who does him a favor (GM's choice from Moldra's list), for one floor."),
          ("Spore Halo", "Creatures that start their turn within 10 feet of him make a DC {dc:CON} Constitution saving throw or are Poisoned until the start of their next turn.")],
  actions=[("Multiattack", "Prince Fen makes two Rot Lash attacks and uses Spore Burst."),
   ("Rot Lash", "*Melee Attack Roll:* {hit:STR}, reach 15 ft. *Hit:* {3d10+STR} Bludgeoning damage plus {2d10} Necrotic damage."),
   ("Spore Burst", "A 20-foot-radius sphere within 90 feet fills with spores. Each creature there makes a DC {dc:CON} Constitution saving throw. *Failure:* {6d10} Poison damage and the Poisoned condition for 1 minute. *Success:* Half damage only.")],
  reactions=[("Puffball", "When Prince Fen takes damage, spores burst: each creature within 5 feet takes {2d10} Poison damage.")]),
 dict(name="Cinder, Herald-Hound of Embrix", size="Large", type="Celestial (Elemental)", align="Chaotic Good", cr=14, hd=20, ac=18, speed="60 ft.",
  scores=[22,18,22,8,16,14], saves=["DEX","CON"], skills=["Perception*","Survival"],
  Immunities="Fire; Exhaustion", senses="Darkvision 120 ft.", langs="Understands Common and Celestial, can't speak",
  intro="Embrix's hunting dog, a good boy made of coals. He goes ahead of his master to light the way and to fetch apostates. He is very excited to see you. That is the problem.",
  traits=[("Minor Deity", "At 0 hit points Cinder collapses into embers and returns to Embrix. A crawler who feeds him something on fire can ask him to guide them to the nearest stairwell (once per floor)."),
          ("Burning Body", "A creature that touches Cinder or hits him with a melee attack takes {2d10} Fire damage.")],
  actions=[("Multiattack", "Cinder makes two Bite attacks."),
   ("Bite", "*Melee Attack Roll:* {hit:STR}, reach 10 ft. *Hit:* {3d10+STR} Piercing damage plus {2d10} Fire damage. If the target is Large or smaller, it has the Prone condition."),
   ("Flame Bark (Recharge 5–6)", "Cinder barks fire in a 60-foot cone. Each creature there makes a DC {dc:CON} Dexterity saving throw. *Failure:* {10d10} Fire damage. *Success:* Half damage.")],
  bonus=[("Zoomies", "Cinder takes the Dash action.")]),
 dict(name="The Repo Man", size="Medium", type="Celestial", align="Lawful Neutral", cr=15, hd=24, ac=19, speed="30 ft., teleport (see Bonus Actions)",
  scores=[18,20,20,18,18,20], saves=["DEX","WIS","CHA"], skills=["Insight*","Investigation*","Intimidation","Perception"],
  Resistances="Force, Psychic; Bludgeoning, Piercing, Slashing", Immunities="Charmed", senses="Truesight 60 ft.", langs="All",
  intro="Saint Payola's collector: a polite figure in a grey suit, with a clipboard and no face. He arrives when a debt to the Saint is overdue. He leaves when it is paid, one way or another.",
  traits=[("Minor Deity", "At 0 hit points the Repo Man files a report and vanishes; another one arrives on the next floor. Paying him what is owed makes him leave at once, and he says thank you."),
          ("Itemized", "The Repo Man knows every item a creature carries, and its value, the moment he sees it.")],
  actions=[("Multiattack", "The Repo Man makes three Clipboard attacks."),
   ("Clipboard", "*Melee Attack Roll:* {hit:DEX}, reach 5 ft. *Hit:* {3d8+DEX} Force damage."),
   ("Seize Assets", "One creature within 60 feet makes a DC {dc:CHA} Charisma saving throw. *Failure:* one item it carries (not armor it wears) teleports into the Repo Man's briefcase. The item comes back when the debt is paid.")],
  bonus=[("Next Appointment", "The Repo Man teleports up to 60 feet to a space he can see.")]),
 dict(name="Little Thrumm, the Echo", size="Medium", type="Celestial", align="Chaotic Neutral", cr=13, hd=20, ac=17, speed="40 ft., fly 60 ft.",
  scores=[18,20,18,12,16,14], saves=["DEX","CON"], skills=["Perception*","Survival*","Stealth"],
  Immunities="Thunder; Deafened", Resistances="Lightning", senses="Blindsight 60 ft.", langs="Common, Celestial",
  intro="Thrumm's daughter: a lean young huntress who repeats the last word anyone says to her, louder. She keeps her own Grudge List, and she has never crossed a name off it without a fight.",
  traits=[("Minor Deity", "At 0 hit points she becomes a fading echo and returns to her father. A crawler on Thrumm's side can ask her to hunt one creature with them for a floor."),
          ("Echo", "When a creature within 60 feet casts a spell, Little Thrumm can repeat its last word: the caster takes {2d10} Thunder damage.")],
  actions=[("Multiattack", "Little Thrumm makes three Javelin attacks."),
   ("Javelin", "*Melee or Ranged Attack Roll:* {hit:DEX}, reach 5 ft. or range 60/240 ft. *Hit:* {2d10+DEX} Piercing damage plus {2d8} Thunder damage. The javelin returns to her hand."),
   ("Boom", "Each creature within 20 feet makes a DC {dc:CON} Constitution saving throw. *Failure:* {6d10} Thunder damage and pushed 20 feet. *Success:* Half damage only.")]),
 dict(name="Hush, the Sleepwalker", size="Medium", type="Celestial (Undead)", align="Neutral", cr=17, hd=24, ac=19, speed="30 ft., fly 30 ft. (hover)",
  scores=[12,24,20,20,24,16], saves=["DEX","WIS"], skills=["Stealth*","Perception*"],
  Resistances="Bludgeoning, Piercing, Slashing", Immunities="Necrotic, Psychic; Charmed, Exhaustion, Frightened, Unconscious", senses="Truesight 60 ft.", langs="Understands all, speaks only in whispers",
  intro="A child-sized figure in a nightgown who walks with its eyes closed. Nyx-Ra sends it to collect secrets from crawlers who sleep in the open. Wake it, and it remembers you.",
  traits=[("Minor Deity", "At 0 hit points Hush falls asleep for good, until the next floor. Whispering it a true secret makes it leave you alone for a night."),
          ("Quiet", "Hush makes no sound and is Invisible in dim light and darkness.")],
  actions=[("Multiattack", "Hush makes two Lullaby Touch attacks and uses Steal a Dream."),
   ("Lullaby Touch", "*Melee Attack Roll:* {hit:DEX}, reach 5 ft. *Hit:* {4d8+DEX} Psychic damage, and the target makes a DC {dc:WIS} Wisdom saving throw or has the Unconscious condition until it takes damage."),
   ("Steal a Dream", "An Unconscious creature within 30 feet takes {6d10} Psychic damage, and Hush learns one of its secrets.")]),
 dict(name="Bailiff Nine", size="Large", type="Construct", align="Lawful Neutral", cr=18, hd=22, ac=22, speed="30 ft.",
  scores=[26,10,24,10,16,12], saves=["STR","CON"], skills=["Athletics*","Perception"],
  Resistances="Bludgeoning, Piercing, Slashing", Immunities="Poison, Psychic; Charmed, Frightened, Poisoned", senses="Truesight 60 ft.", langs="Understands all, speaks only to read charges",
  intro="The Brass Warden's ninth bailiff, a riveted brass officer with a lantern for a head and shackles at its belt. The first eight are still out on assignment.",
  traits=[("Minor Deity", "At 0 hit points Bailiff Nine is recalled for repairs and returns on the next floor. It stops pursuing a target who surrenders and makes amends (the Warden's Atonement)."),
          ("Warrant", "Bailiff Nine always knows the direction of an apostate of the Warden on the same floor.")],
  actions=[("Multiattack", "Bailiff Nine makes two Truncheon attacks and one Shackle attack."),
   ("Truncheon", "*Melee Attack Roll:* {hit:STR}, reach 10 ft. *Hit:* {3d10+STR} Bludgeoning damage plus {2d8} Radiant damage."),
   ("Shackle", "*Melee Attack Roll:* {hit:STR}, reach 10 ft. *Hit:* The target has the Grappled condition (escape DC {dc:STR}) and the Restrained condition while grappled.")],
  reactions=[("Stand Your Ground", "When a creature within 10 feet tries to move away, Bailiff Nine makes one Shackle attack against it.")]),
 dict(name="Gigglesnort, the Least Joke", size="Small", type="Fey", align="Chaotic Neutral", cr=12, hd=26, ac=17, speed="40 ft., climb 40 ft.",
  scores=[10,22,18,14,12,22], saves=["DEX","CHA"], skills=["Acrobatics*","Sleight of Hand*","Performance*"],
  Immunities="Psychic; Charmed", senses="Darkvision 60 ft.", langs="Common, honking",
  intro="Wobblegob's smallest, least funny joke, sent out to practice. It wears a tiny clown wig and a big grudge about bad reviews. If nobody laughs at its act, it gets violent.",
  traits=[("Minor Deity", "At 0 hit points Gigglesnort pops like a balloon and reinflates on the next floor. Laughing at its act (a DC 15 Wisdom save to keep a straight face, failed on purpose) keeps it friendly for an hour."),
          ("Slapstick", "Gigglesnort can take the Disengage or Hide action as a bonus action.")],
  actions=[("Multiattack", "Gigglesnort makes two Squeaky Hammer attacks and one Pie attack."),
   ("Squeaky Hammer", "*Melee Attack Roll:* {hit:DEX}, reach 5 ft. *Hit:* {3d8+DEX} Bludgeoning damage, and a loud squeak: the target can't take reactions until the start of its next turn."),
   ("Pie", "*Ranged Attack Roll:* {hit:DEX}, range 30/60 ft. *Hit:* {2d8+CHA} Psychic damage, and the target has the Blinded condition until the end of its next turn."),
   ("Encore (Recharge 5–6)", "Gigglesnort rolls on Wobblegob's Gag table three times and chooses where each happens, within 60 feet.")]),
 dict(name="Grandma Crumb", size="Small", type="Celestial", align="Neutral Good", cr=11, hd=24, ac=16, speed="25 ft.",
  scores=[14,14,18,16,22,18], saves=["CON","WIS"], skills=["Insight*","Medicine*","Perception"],
  Immunities="Cold, Radiant", senses="Truesight 30 ft.", langs="All",
  intro="Tuul's kitchen spirit: a tiny old woman made of flour, who appears in safe rooms where nobody has eaten in a while. She cooks. You eat. You don't argue.",
  traits=[("Minor Deity", "At 0 hit points she sighs and dusts away. A crawler who shares a meal with her gains the benefit of Tuul's Comfort Food boon until the end of the floor."),
          ("Second Helping", "Creatures who eat Grandma Crumb's cooking regain 4d8 hit points and end the Poisoned condition (once per long rest).")],
  actions=[("Multiattack", "Grandma Crumb makes two Rolling Pin attacks."),
   ("Rolling Pin", "*Melee Attack Roll:* {hit:WIS}, reach 5 ft. *Hit:* {3d8+WIS} Bludgeoning damage, and the target has disadvantage on its next attack roll (it feels ashamed)."),
   ("You'll Catch Your Death", "One creature within 60 feet that has harmed someone in a safe room makes a DC {dc:WIS} Constitution saving throw. *Failure:* {8d10} Cold damage. *Success:* Half damage.")],
  bonus=[("Eat Something", "One creature within 30 feet regains {3d8+WIS} hit points.")]),
 dict(name="Saint Lostsock", size="Tiny", type="Celestial", align="Chaotic Neutral", cr=9, hd=30, ac=17, speed="20 ft., fly 40 ft.",
  scores=[4,20,16,18,20,16], saves=["DEX","WIS"], skills=["Investigation*","Perception*","Stealth*"],
  Immunities="Charmed", senses="Truesight 60 ft.", langs="All",
  intro="An independent demigod of lost things: a single grey sock with a halo. It knows where everything that was ever lost has gone. It has no religion, because nobody takes it seriously. It would very much like a worshipper.",
  traits=[("Minor Deity", "At 0 hit points Saint Lostsock is lost (it turns up again later, somewhere obvious). Once per floor, a crawler who offers it a sock can ask where one lost thing is; it answers truthfully."),
          ("Finders Keepers", "Saint Lostsock can take one object a creature has dropped or put down within 60 feet, as a bonus action. The object turns up in a random place on the floor.")],
  actions=[("Static Shock", "*Ranged Attack Roll:* {hit:WIS}, range 60 ft. *Hit:* {4d10+WIS} Lightning damage."),
   ("Lost", "One creature within 30 feet makes a DC {dc:WIS} Wisdom saving throw. *Failure:* it forgets where it is going and moves in a random direction on its next turn, and one item it carries goes missing (it turns up in its other pocket an hour later).")]),
 dict(name="Vorkath, the God Nobody Remembers", size="Huge", type="Celestial", align="Neutral Evil", cr=20, hd=24, ac=20, speed="40 ft., fly 60 ft.",
  scores=[26,14,26,22,20,24], saves=["STR","CON","CHA"], skills=["Arcana*","History*","Deception","Perception"],
  Resistances="Bludgeoning, Piercing, Slashing; Necrotic", Immunities="Psychic; Charmed, Frightened", senses="Truesight 120 ft.", langs="All, in a language nobody speaks any more",
  intro="A god whose religion died out a thousand seasons ago, now a cracked statue that walks. Vorkath is desperate for worshippers. He offers great power for very small favors, and the favors get bigger. The GM can let Vorkath become a ninth major god, built around whatever the players do for him.",
  traits=[("Minor Deity", "At 0 hit points Vorkath crumbles into rubble and reassembles on the next floor. If a crawler takes his vow, he gains a new domain of the GM's choice and grows in power with every worshipper."),
          ("Legendary Resistance (2/Day)", "If Vorkath fails a saving throw, he can choose to succeed instead."),
          ("Forgotten", "Creatures that see Vorkath forget him 1 minute after he leaves their sight, unless they worship him.")],
  actions=[("Multiattack", "Vorkath makes two Crumbling Fist attacks and uses Remember Me."),
   ("Crumbling Fist", "*Melee Attack Roll:* {hit:STR}, reach 15 ft. *Hit:* {4d10+STR} Bludgeoning damage plus {2d10} Necrotic damage."),
   ("Remember Me", "One creature within 60 feet makes a DC {dc:CHA} Wisdom saving throw. *Failure:* {8d10} Psychic damage, and it has the Charmed condition until the end of its next turn, during which it must use its action to praise Vorkath aloud. *Success:* Half damage only.")]),
 dict(name="The Unpaid Intern of the Gods", size="Medium", type="Celestial", align="Lawful Neutral", cr=10, hd=20, ac=16, speed="30 ft. (always running)",
  scores=[12,18,16,16,14,14], saves=["DEX","CON"], skills=["Investigation","Perception","Acrobatics*"],
  Immunities="Exhaustion", Resistances="Psychic", senses="Truesight 30 ft.", langs="All",
  intro="Every god uses the same intern. Nobody remembers hiring them. They carry messages, smites, coffee and paperwork between the heavens and the dungeon, and they are all out of patience.",
  traits=[("Minor Deity", "At 0 hit points the Intern clocks out and someone else in an identical lanyard turns up next floor. Any god's worshipper can hand them a message (or an Indulgence Coupon) for their god."),
          ("Delivery", "The Intern can carry one smite on behalf of any god. Once per day, they can make an Apostate's Smite land at 4d10 damage, no save.")],
  actions=[("Multiattack", "The Intern makes two Stapler attacks."),
   ("Stapler", "*Melee or Ranged Attack Roll:* {hit:DEX}, reach 5 ft. or range 30/90 ft. *Hit:* {3d8+DEX} Piercing damage."),
   ("Coffee Run (Recharge 5–6)", "The Intern moves up to 90 feet without provoking opportunity attacks, and spills scalding coffee on each creature it passes: DC {dc:DEX} Dexterity saving throw or {6d8} Fire damage.")]),
]

head = """---
type: stat-blocks
id: god-stat-blocks
name: Gods and Minor Deities (Stat Blocks)
version: 0.1
status: draft
related: [gods, pantheon, divine-gear]
---

# Gods and Minor Deities

> *"Ladies, gentlemen and things: tonight, for one night only, a god walks the World Dungeon. Place your bets."*

GM only. These are the gods themselves. They rarely come into the dungeon in person: to smite an apostate, to answer a Great Deed, to defend a temple, to settle a grudge with a rival, or for a ratings event the System has been advertising for weeks. When they do, they can bleed, and they can die (see *Slaying a God* in `gods`).

**Minor deities** are lesser gods, divine children, servants and leftovers. They have no religion to join (see `gods`), but they can be bargained with, hired, fought or befriended, and each can do a crawler one small divine favor.

## Running a God Fight

- **Gods are CR 25 to 27.** Before the deep floors, a god in person is a set piece to survive, not to win: it has a goal (smite one apostate, guard a shrine, test a Chosen), and it leaves when the goal is done, unless the crawlers make it stay.
- **Smite the Faithless.** Every god can smite apostates and non-worshippers as a legendary action. Its own worshippers are never the target unless they have 4 or more Lapses.
- **Lairs.** A god's temple is its lair. In its lair a god has 5 uses of Legendary Resistance, and the CR shows the lair XP.
- **Meeting.** Seeing a god in person, or talking with a minor deity, counts as **meeting** that god, and the god makes the crawler a **Divine Offer** (see *Meeting a God* in `gods`).
- **Slaying a god** ends its religion (see `gods`). It is the biggest thing a crawler can do in the World Dungeon: a Celestial-tier achievement, every rival god's attention, and every surviving follower's hatred.

## The Major Gods

"""
out = head + "\n".join(block(c) for c in GODS) + "\n## Minor Deities\n\nOne stat block each, CR 9 to 20. Each has a **Minor Deity** trait: what happens when it is beaten, and the one favor it can do for a crawler.\n\n" + "\n".join(block(c) for c in MINOR)
open(__import__("pathlib").Path(__file__).resolve().parent.parent / "gods/stat-blocks.md", "w").write(out)
print(len(GODS), len(MINOR), len(out.split()))
