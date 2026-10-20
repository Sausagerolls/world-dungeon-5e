---
type: rule
id: building-mobs
name: Building Mobs
version: 0.1
status: draft
related: [leveling, enemy-loot, loot-boxes, achievements, floor-1-neighbourhoods, god-stat-blocks]
---

# Building Mobs

> *"Every monster in the World Dungeon has been lovingly designed, tested and approved by the System. Mostly approved. Some of them were approved after they ate the testers."*

GM only. This is how a World Dungeon stat block is put together: a normal 5e (2024) stat block, plus the **Crawl fields** that tie it into XP, loot, Inspect and the show. The **Mob Builder** in the GM area does the maths for you, and the **Bestiary** collects every stat block in the setting in one searchable place.

---

## The Stat Block

Every stat block has the usual 5e parts, in this order:

1. **Name** and the **metadata line**: size, creature type, alignment, CR, and its role if it is a boss (*Boss*, *Floor Boss*) or an NPC crawler (*Crawler*).
2. A line or two of **description**.
3. **AC, HP, Speed, Initiative.**
4. **Ability scores**, with each modifier and saving throw.
5. **Skills, Vulnerabilities, Resistances, Immunities, Senses, Languages, CR.** The CR line also gives the creature's 5e **encounter XP** (for building balanced fights) and its proficiency bonus. Encounter XP is not the XP crawlers earn.
6. **Traits, Actions, Bonus Actions, Reactions, Legendary Actions**, as needed.

Save DCs are 8 + proficiency bonus + the ability modifier, and attack bonuses are proficiency bonus + the ability modifier.

## The Crawl Fields

After the CR line comes a second table, and then the sections that make it a World Dungeon creature.

| Field | What to write |
|-------|---------------|
| **Mob Tier** | Trash, Standard, Elite, Boss, Floor Boss or Deity, with its XP (see *Mob Tiers*). |
| **Level** | The level the System shows when a crawler Inspects it. A label, not a rule: use the crawler level the mob is meant for. |
| **Loot** | Its creature type and tier on the `enemy-loot` tables, and any notes. Bosses roll one tier higher and give a Boss Box. |
| **Found** | Floor, neighbourhood, and how it usually turns up (packs of 3–6, a boss's court, a wandering patrol). |
| **Inspect** | What a crawler sees when they Inspect it: a quote in the System's voice. Name and level first, then one joke and one true hint. |

Then, as needed:

| Section | What to write |
|---------|---------------|
| **Drops** | Special items it carries, on top of its enemy loot roll (Monster Parts, keys, a Boss Trophy). |
| **Boss** | Bosses only: the Boss Box (rarity and type), the Boss Trophy, the achievements for beating it, and where its boss room mechanics and hints are. |
| **Tactics** | How it fights, who it targets first, and when it runs. |
| **Audience** | Ways of beating it that the audience loves (Audience points; see `achievements`). |
| **Voice** | A line it says, or a System announcement about it. |

NPC crawlers have four more sections: **Crawler** (identity), **Fame**, **Gear** and **Roleplay** (see *NPC Crawlers*).

### Mob Tiers

A mob's tier is its role in the fight, not its CR (see `leveling`):

| Mob Tier | What it is | XP |
|----------|------------|----|
| **Trash** | Fodder in packs, minions, a boss's adds. Dies in a hit or two. | 5 |
| **Standard** | An ordinary monster in an ordinary fight. | 10 |
| **Elite** | Elite and named mobs, mini-bosses, lieutenants, hostile crawlers. | 25 |
| **Boss** | A neighbourhood boss, or any boss with a Boss Box. | 100 |
| **Floor Boss** | The boss guarding the main stairwell. | 200 |
| **Deity** | A god, an avatar, a herald or a minor deity. | 1,000 |

The same creature can be a different tier in a different fight. Write the tier it usually has, and change it on the day if it needs it.

### Writing Inspect Text

Inspect is the System talking, so it is smug, helpful and a little cruel. Keep it to one or two lines:

- **Name. Level. Role.** *"Sweeper Bot. Level 2."* Add *Neighbourhood Boss*, *Floor Boss* or *Elite* where it fits.
- **One joke.** *"It has decided you are litter."*
- **One true hint**, if you're feeling generous. *"Dry use only."*

---

## The CR Guide

Use this table to check a stat block. Pick the CR you want, and compare the creature's AC, hit points, attack bonus (or save DC) and damage per round over three rounds. If a number is well off, its CR moves: each step of HP or damage away from the row is roughly one CR, and each 2 points of AC or attack bonus away is roughly one CR. The Mob Builder does this check as you type.

| CR | AC | Hit Points | Attack | Damage / Round | Save DC | Encounter XP |
|----|----|------------|--------|----------------|---------|--------------|
| 0 | 13 | 1–6 | +3 | 0–1 | 13 | 10 |
| 1/8 | 13 | 7–35 | +3 | 2–3 | 13 | 25 |
| 1/4 | 13 | 36–49 | +3 | 4–5 | 13 | 50 |
| 1/2 | 13 | 50–70 | +3 | 6–8 | 13 | 100 |
| 1 | 13 | 71–85 | +3 | 9–14 | 13 | 200 |
| 2 | 13 | 86–100 | +3 | 15–20 | 13 | 450 |
| 3 | 13 | 101–115 | +4 | 21–26 | 13 | 700 |
| 4 | 14 | 116–130 | +5 | 27–32 | 14 | 1,100 |
| 5 | 15 | 131–145 | +6 | 33–38 | 15 | 1,800 |
| 6 | 15 | 146–160 | +6 | 39–44 | 15 | 2,300 |
| 7 | 15 | 161–175 | +6 | 45–50 | 15 | 2,900 |
| 8 | 16 | 176–190 | +7 | 51–56 | 16 | 3,900 |
| 9 | 16 | 191–205 | +7 | 57–62 | 16 | 5,000 |
| 10 | 17 | 206–220 | +7 | 63–68 | 16 | 5,900 |
| 11 | 17 | 221–235 | +8 | 69–74 | 17 | 7,200 |
| 12 | 17 | 236–250 | +8 | 75–80 | 17 | 8,400 |
| 13 | 18 | 251–265 | +8 | 81–86 | 18 | 10,000 |
| 14 | 18 | 266–280 | +8 | 87–92 | 18 | 11,500 |
| 15 | 18 | 281–295 | +8 | 93–98 | 18 | 13,000 |
| 16 | 18 | 296–310 | +9 | 99–104 | 18 | 15,000 |
| 17 | 19 | 311–325 | +10 | 105–110 | 19 | 18,000 |
| 18 | 19 | 326–340 | +10 | 111–116 | 19 | 20,000 |
| 19 | 19 | 341–355 | +10 | 117–122 | 19 | 22,000 |
| 20 | 19 | 356–400 | +10 | 123–140 | 19 | 25,000 |
| 21 | 19 | 401–445 | +11 | 141–158 | 20 | 33,000 |
| 22 | 19 | 446–490 | +11 | 159–176 | 20 | 41,000 |
| 23 | 19 | 491–535 | +11 | 177–194 | 20 | 50,000 |
| 24 | 19 | 536–580 | +12 | 195–212 | 21 | 62,000 |
| 25 | 19 | 581–625 | +12 | 213–230 | 21 | 75,000 |
| 26 | 19 | 626–670 | +12 | 231–248 | 21 | 90,000 |
| 27 | 19 | 671–715 | +13 | 249–266 | 22 | 105,000 |
| 28 | 19 | 716–760 | +13 | 267–284 | 22 | 120,000 |
| 29 | 19 | 761–805 | +13 | 285–302 | 22 | 135,000 |
| 30 | 19 | 806–850 | +14 | 303–320 | 23 | 155,000 |

### Past CR 30

Crawlers keep levelling long after the Monster Manual runs out (see `leveling`), so the guide keeps going. For each CR above 30:

- **Hit points** +45 (CR 31 is 851–895, CR 40 is 1,256–1,300).
- **Damage per round** +15 (CR 31 is 318–335, CR 40 is 453–470).
- **AC, attack bonus and save DC** +1 every 3 CRs (CR 33 is AC 20, +15, DC 24; CR 60 is AC 29, +24, DC 33).
- **Encounter XP** +20,000 per CR. **Proficiency bonus** +1 every 4 CRs (+9 at CR 29–32, +10 at 33–36, and so on).

| CR | AC | Hit Points | Attack | Damage / Round | Save DC |
|----|----|------------|--------|----------------|---------|
| 35 | 20 | 1,031–1,075 | +15 | 378–395 | 24 |
| 40 | 22 | 1,256–1,300 | +17 | 453–470 | 26 |
| 50 | 25 | 1,706–1,750 | +20 | 603–620 | 29 |
| 60 | 29 | 2,156–2,200 | +24 | 753–770 | 33 |
| 80 | 35 | 3,056–3,100 | +30 | 1,053–1,070 | 39 |
| 100 | 42 | 3,956–4,000 | +37 | 1,353–1,370 | 46 |
| 120 | 49 | 4,856–4,900 | +44 | 1,653–1,670 | 53 |

These numbers are for playtest. Deep-floor crawlers have huge ability scores (see *GM Notes* in `leveling`), so expect to push AC and saves up if the fights feel soft.

---

## NPC Crawlers

Other crawlers are the most dangerous things in the dungeon: they have loot boxes, Crawler Skills, a plan, and a camera crew. Build them as monster-style stat blocks, scaled by their level.

- **Level** is their crawler level, which Inspect shows. Their CR is about **0.6 × their level** (a level 10 crawler is about CR 6; a level 100 crawler about CR 60).
- **Ability scores** start from 15, 14, 13, 12, 10, 8, and add one Stat Point per level, mostly to their style's main abilities.
- **Hit points** are their level in Hit Dice (d6 to d12 by style) plus Constitution.
- **Attacks** follow their style. Martial crawlers get extra attacks at levels 5, 11 and 20, and one more every 40 levels after that.
- **Mob Tier** is usually **Elite** (25 XP). A party leader or a famous crawler can be a **Boss**.
- **Killing one** gives a Murder Box, and their inventory spills out (see `loot-boxes` and `enemy-loot`).

### Fighting Styles

The Mob Builder has a preset for each style. Pick one, set the level and floor, and it fills in the stat block, gear and tactics, ready to edit.

| Style | Main abilities | Plays like | Signature tricks |
|-------|----------------|------------|------------------|
| **Bruiser / Tank** | STR, CON | Heavy armor and a shield, soaks hits, holds the line. | Taunt, Shield Slam, Hard to Kill |
| **Brawler** | STR, DEX | Fists, kicks and suplexes. Fast and grabby. | Flurry, Suplex, Iron Fist |
| **Sharpshooter / Gunslinger** | DEX, WIS | Bows, crossbows and firearms from range. | Dead Eye, Called Shot, Quick Draw |
| **Demolitionist** | DEX, INT | Throws, plants and remote-detonates explosives. | Bomb Bandolier, Cook the Fuse, Blast Shield |
| **Tome Caster** | INT, CON | A tome full of spells and a big mana pool. | Signature Spell, Mana Shield, Counter-Read |
| **Healer / Support** | WIS, CON | Keeps the party up and buffs them. | Patch Up, Rally, Blessed Bandage |
| **Skirmisher / Assassin** | DEX, CHA | Stealth, poison and backstabs; hit and run. | Backstab, Vanish, Poisoned Blade |
| **Pet Master** | WIS, CHA | Fights alongside a pet with its own mini stat block. | Sic 'Em, Pet Swap, Protect the Pet |
| **Elemental Blaster** | INT, DEX | Fire, cold and lightning; areas and big numbers. | Elemental Bolt, Burst, Overcharge |
| **Controller / Illusionist** | CHA, INT | Charm, fear, walls and illusions; splits the party. | Hypnotic Pattern, Mirror Image, Wall |
| **Necromancer / Summoner** | INT, WIS | Raises or summons minions (Trash, worth no XP). | Raise Minions, Bone Shield, Command |
| **Battle Mage / Divine Champion** | STR, CHA | Armor, a weapon and spells; smites and god-given powers. | Smite, Spellblade, Divine Shield |

### Gear by Floor

Presets choose gear that fits the floor the crawler is on, from the Explosives, Firearms and Dungeon Items handbooks:

| Floors | Gear | Unopened boxes |
|--------|------|----------------|
| 1–2 | Improvised and simple weapons, junk pistols, Common explosives, work clothes and scrap armor. | 1–2 Bronze |
| 3–5 | Martial weapons (rank II), Uncommon firearms and explosives, medium armor, a class box item. | 1 Bronze, 1 Silver |
| 6–9 | Rank III weapons, Rare firearms and explosives, heavy armor or a +1 item. | 1–2 Silver |
| 10–14 | Rank IV named weapons, Very rare gear, +2 items. | 1 Silver, 1 Gold |
| 15–18 | Rank V weapons, Legendary gear, a relic or two. | 1–2 Gold |

---

## Saving a Stat Block

The Mob Builder makes a markdown file. To add it to the Bestiary:

1. Click **Download .md** in the builder.
2. Put the file in the `bestiary` folder of the World Dungeon files, in a folder for its floor (`bestiary/floor-2/` and so on, or `bestiary/crawlers/` for NPC crawlers).
3. Rebuild the site (`python3 tools/build_site.py`) and the PDFs.

The Bestiary also shows every stat block in the Floor 1 guide and the gods' stat blocks. Those stay in their own files: edit them there.
