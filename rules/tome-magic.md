---
type: rule
id: tome-magic
name: Tome Magic
version: 0.3
status: draft
related: [crawler, crawler-skills, mana, class-selection, spell-lists, spells-replacements]
---

# Tome Magic

> *"Your System Tome holds every spell you will ever know. It is waterproof, fireproof and, unfortunately, sarcasm-proof."*

In the World Dungeon, **every spell you know is a tome spell**. It is written into your **System Tome**, part of The Interface, and you cast it with **mana** (see `mana`). There is no separate class spellcasting: no spells-known list, no prepared spells, no spellbook. When a class, feat or species trait would teach you a spell, you learn a tome spell instead.

## Your Tome

- You know every spell in your tome **permanently**, and every one of them is always ready to cast. Nothing is prepared each day.
- Each tome spell has a **source**: a spell tome you read, a class, a feat, a species trait, an item or a Crawler Skill. Write it next to the spell on your sheet. The source decides which spells you may learn, the level limit, and your spellcasting ability for that spell.
- There is no limit to the number of tome spells you can know.

### World Dungeon Spells

The World Dungeon has **its own spells**, written for the System: *Magic Missile*, *Puddle Jumper*, *Clockwork Triplicate*, *Protective Shell* and about two hundred more (see the spell chapters and `spell-lists`). Each one has a fixed **Rank I to V** table that says exactly what it does at each rank.

- **Class lists.** The World Dungeon lists in `spell-lists` replace the Player's Handbook class spell lists.
- **Granted spells.** A class, subclass, species or feat that names a Player's Handbook spell gives you its World Dungeon replacement instead (see `spells-replacements`).
- **Tomes.** Spell tomes in loot boxes and shops hold World Dungeon spells.

## Ways to Learn a Spell

| Source | Which spells | Level limit | Intelligence requirement | Spellcasting ability |
|--------|--------------|-------------|--------------------------|----------------------|
| **Reading a spell tome** | Any World Dungeon spell list | Half your character level, rounded up | 10 + the spell's level | Intelligence |
| **Your class** | Your class's spell list (and any list a class feature opens) | Your class's maximum spell level | None | Your class's spellcasting ability |
| **A feat, species trait or other feature** | The spells the feature names or lets you choose | None | None | The ability the feature names |

### Reading a Spell Tome

Spell tomes are found in loot boxes, on mobs and in shops.

- Reading a tome takes **1 minute**. When you finish, the tome crumbles and the spell is written into your tome.
- A tome can hold a spell from any World Dungeon spell list (see `spell-lists`).
- **Spell level limit.** You can learn a spell from a tome only if its level is no higher than **half your character level, rounded up** (maximum 9th).
- **Intelligence requirement.** Your Intelligence score must be at least **10 + the spell's level**. You can still read a tome you do not qualify for. It crumbles, and you gain nothing except a mocking System notification.
- If you read a tome for a spell you already know, from any source, the spell gains a rank instead (see *Spell Ranks*).

### Learning from Your Class

Whenever your class would let you learn a spell, prepare a spell, or add a spell to a spellbook, you **learn a tome spell from that class's World Dungeon spell list** (see `spell-lists`) instead.

- **How many.** Use your class table's **Cantrips** and **Prepared Spells** columns. Each time a number goes up, learn that many new cantrips or spells. At Floor 3 class selection you learn the full number for your class level at once.
- **Which levels.** Up to your class's **maximum spell level** (see the *Class Mana* table in `mana`). Half casters stop at 5th level and third casters at 4th. Warlocks learn up to their pact level, and their Mystic Arcanum spells at the usual levels.
- **Granted spells.** A spell your class or subclass says you "always have prepared" (subclass spell lists, a Ranger's *Hunter's Mark*, a Paladin's *Divine Smite*) is written into your tome for free, as its World Dungeon replacement (*Quest Marker*, *Smackdown*; see `spells-replacements`). It does not count against your numbers.
- **Changing spells.** When you gain a level in a class, you can replace one spell you learned from that class with another spell of a level you could learn from the same list (a cantrip only for a cantrip). The new spell starts at Rank I; ranks the old spell had are lost. Spells from tomes, feats and species traits cannot be replaced this way.
- **Rank Ups.** Each class level you gain in a class that teaches you spells also gives you one **Rank Up** for a spell that class taught you (see *Spell Ranks*).
- **Extra lists.** A feature that adds spells from other lists (a Bard's Magical Secrets, a Lore Bard's Magical Discoveries) lets you learn spells from those World Dungeon lists as class tome spells too.
- **Multiclassing.** Each class teaches its own spells at its own class level. Write the class next to each spell.

### Learning from Feats, Species and Other Features

Feats (*Magic Initiate*, *Fey Touched*, *Shadow Touched*, *Ritual Caster*, *Telekinetic*), species traits (the High Elf cantrip, a Tiefling's Fiendish Legacy) and features such as the Dabbler Inclination teach spells too.

- A feature that names a spell gives you its World Dungeon replacement. A feature that lets you choose picks from the World Dungeon lists (see `spells-replacements`).
- You learn the spells **straight away**, as tome spells, when you gain the feature. The tome spell level limit and the Intelligence requirement **do not apply**. A 1st-level crawler with *Magic Initiate* knows a 1st-level spell from day one, and a crawler who takes *Fey Touched* knows *misty step* even if their own limit would not reach 2nd level yet.
- **Spellcasting ability:** the one the feature names. If it lets you choose (Intelligence, Wisdom or Charisma), choose when you gain it.
- **Free casts.** If the feature lets you cast a spell once without a spell slot, you can cast it **once per long rest without spending mana**. "Casting it with spell slots you have" means casting it with mana as normal.
- If the feature lets you change the spell later (when you gain a level, after a long rest), you can.

## Casting Tome Spells

- **Spell save DC:** 8 + your proficiency bonus + the spell's spellcasting ability modifier.
- **Spell attack modifier:** your proficiency bonus + the spell's spellcasting ability modifier.
- **One ability per spell.** A spell you read from a tome uses Intelligence, but if the spell is also on the list of a class you have, you can use that class's spellcasting ability instead.
- **Mana.** A World Dungeon spell always costs the mana of **its own level**, at every rank (see `mana`). Cantrips are free.
- **No casting at a higher level.** World Dungeon spells get stronger through **ranks**, not by paying more mana. Heal Self works the same way.
- **Pact Mana.** A warlock who casts a World Dungeon spell with Pact Mana pays the pact level's cost, and the spell is cast **one rank higher for each level the pact level is above the spell's level** (up to Rank V). This ignores the rank gates.
- **Rituals.** You can cast a tome spell with the ritual tag as a ritual without spending mana.
- **Components:** Verbal and somatic components work as normal. Mana replaces material components, unless the component has a gold cost or is consumed.
- Concentration and casting time work as normal.

### Mana

Every tome spell uses the same mana pool. Your **tome mana** (character level + Intelligence modifier) is the part of the pool every crawler has, even without a spellcasting class. Spellcasting classes add **class mana** on top (see `mana`). Costs are the standard mana costs: 2 for a 1st-level spell, up to 13 for 9th.

## Heal Self

Every crawler starts with this tome spell at **Rank I**. It is the System's welcome gift, and the only spell most crawlers will ever cast.

### Heal Self
**Tome spell · 1st level · Every crawler · Known from 1st level**

- **Casting time:** 1 action
- **Range:** Self
- **Components:** V (you have to say "heal" out loud; the System insists)
- **Duration:** Instantaneous

You regain **1d8 hit points per rank** (1d8 at Rank I, up to 5d8 at Rank V). No modifier is added.

- **Always 1 mana.** Heal Self always costs **1 mana**, so a crawler with no magic talent can still cast it at 1st level.
- **Always 1st level.** Heal Self cannot be cast at a higher level. It gets stronger only through ranks.
- **Ranks.** Reading a Heal Self tome raises its rank, up to Rank V. Ranks work differently for Heal Self than for other tome spells:

| Rank | Healing | Casting time |
|------|---------|--------------|
| I | 1d8 | 1 action |
| II | 2d8 | 1 action |
| III | 3d8 | Bonus action |
| IV | 4d8 | Bonus action |
| V | 5d8 | Bonus action |

Heal Self tomes are common in Bronze boxes and cheap in shops (50 gp).
- It does not count against any number of spells your class lets you learn.

## Spell Ranks

Every World Dungeon spell has five ranks. You learn a spell at **Rank I**. Its table says what each rank does, and each rank includes everything from the ranks below it unless it says otherwise. Ranks are the only way a World Dungeon spell gets stronger.

### Gaining Ranks

- **Duplicate tomes.** Reading a tome for a spell you already know, from any source, gives it **one rank** (two with *Tome Scholar* 10, see `crawler-skills`). This works for cantrips too. A duplicate tome for a spell already at Rank V gives 1 Stat Point instead (Intelligence only).
- **Class Rank Ups.** Each class level you gain in a class that teaches you spells (at a level where its class table has Prepared Spells) gives one Rank Up. Spend it straight away on one spell that class taught you, including its granted spells. At Floor 3 class selection you gain one Rank Up for each class level you take at once.
- **Granted ranks.** Some granted spells start above Rank I (see `spells-replacements`).

### Rank Gates

You can raise a spell to a rank only when your **character level** is high enough:

| Rank | II | III | IV | V |
|------|----|-----|----|---|
| **Character level** | 3rd | 5th | 9th | 13th |

A rank you can't take yet waits: a tome read early or a Rank Up spent early is kept, and the rank turns on when you reach the level. Granted ranks and Pact Mana ignore the gates.

### Cantrips

Your character level sets each cantrip's **minimum rank**: Rank II at 5th level, Rank III at 11th and Rank IV at 17th, the same steps at which cantrips get stronger in the Player's Handbook. Duplicate tomes and Rank Ups can push a cantrip above its minimum, within the rank gates.

### Heal Self

Heal Self keeps its own table (see *Heal Self*). It has no rank gates and can't take class Rank Ups.

### Spells from Other Books

Your GM can allow a spell that has no World Dungeon version, such as one from a tome found in a strange place. It follows the old rule: each rank above I casts it **one spell level higher** for no extra mana, up to your maximum spell level and 9th, and you can cast it at a higher level by paying that level's cost.

## Spellbooks and Class Features

- **Wizards** do not keep a separate spellbook. A feature that mentions your spellbook means your tome. A wizard who reads a tome holding a wizard spell can learn it up to their class's maximum spell level, ignoring the tome spell level limit (the Intelligence requirement still applies).
- A feature that refers to your "prepared spells" or "spells known" means the spells you learned from that class.
- A feature that refers to "spell slots" uses mana instead (see *Converting Class Features* in `mana`).

## Designer Notes

- **One list, one pool.** Every spell lives in the same tome and uses the same mana, so a player tracks one list instead of three. Classes still decide how many spells you learn and how high they go.
- **No preparing.** Casters know every spell they have learned. This is part of the power trip, on purpose.
- **Feats are a shortcut.** A feat or species trait is a reliable way to get a spell early, without finding a tome or meeting its Intelligence requirement.
- **Fixed ranks.** Before World Dungeon spells, a rank simply meant "cast one level higher for free", which was hard to read at the table. Every spell now says exactly what each rank does. Ranks roughly match casting one level higher per rank, with extra tricks at Ranks III and V.
- **Magic Crawler Skills.** *Tome Scholar*, *Signature Spell* and the other Magic Crawler Skills apply to every tome spell, which now includes class spells. They are strong on a full caster. Scale encounters to match.
- Tome mana alone is small on purpose: tome magic is a utility and burst option for non-casters. At 10th level with Intelligence 18 it is 14. Casters add their class mana on top.
- Spell ranks make duplicate tomes a good find, not a disappointment.
- Watch for ranked crowd-control spells at low levels. The rank gates and the spell level limit are the guards.
