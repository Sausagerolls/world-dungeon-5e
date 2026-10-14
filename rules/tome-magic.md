---
type: rule
id: tome-magic
name: Tome Magic
version: 0.2
status: draft
related: [crawler, crawler-skills, mana, class-selection]
---

# Tome Magic

> *"Your System Tome holds every spell you will ever know. It is waterproof, fireproof and, unfortunately, sarcasm-proof."*

In the World Dungeon, **every spell you know is a tome spell**. It is written into your **System Tome**, part of The Interface, and you cast it with **mana** (see `mana`). There is no separate class spellcasting: no spells-known list, no prepared spells, no spellbook. When a class, feat or species trait would teach you a spell, you learn a tome spell instead.

## Your Tome

- You know every spell in your tome **permanently**, and every one of them is always ready to cast. Nothing is prepared each day.
- Each tome spell has a **source**: a spell tome you read, a class, a feat, a species trait, an item or a Crawler Skill. Write it next to the spell on your sheet. The source decides which spells you may learn, the level limit, and your spellcasting ability for that spell.
- There is no limit to the number of tome spells you can know.

## Ways to Learn a Spell

| Source | Which spells | Level limit | Intelligence requirement | Spellcasting ability |
|--------|--------------|-------------|--------------------------|----------------------|
| **Reading a spell tome** | Any class spell list | Half your character level, rounded up | 10 + the spell's level | Intelligence |
| **Your class** | Your class's spell list (and any list a class feature opens) | Your class's maximum spell level | None | Your class's spellcasting ability |
| **A feat, species trait or other feature** | The spells the feature names or lets you choose | None | None | The ability the feature names |

### Reading a Spell Tome

Spell tomes are found in loot boxes, on mobs and in shops.

- Reading a tome takes **1 minute**. When you finish, the tome crumbles and the spell is written into your tome.
- A tome can hold a spell from any class spell list.
- **Spell level limit.** You can learn a spell from a tome only if its level is no higher than **half your character level, rounded up** (maximum 9th).
- **Intelligence requirement.** Your Intelligence score must be at least **10 + the spell's level**. You can still read a tome you do not qualify for. It crumbles, and you gain nothing except a mocking System notification.
- If you read a tome for a spell you already know, from any source, the spell gains a rank instead (see *Spell Ranks*).

### Learning from Your Class

Whenever your class would let you learn a spell, prepare a spell, or add a spell to a spellbook, you **learn a tome spell from that class's spell list** instead.

- **How many.** Use your class table's **Cantrips** and **Prepared Spells** columns. Each time a number goes up, learn that many new cantrips or spells. At Floor 3 class selection you learn the full number for your class level at once.
- **Which levels.** Up to your class's **maximum spell level** (see the *Class Mana* table in `mana`). Half casters stop at 5th level and third casters at 4th. Warlocks learn up to their pact level, and their Mystic Arcanum spells at the usual levels.
- **Granted spells.** A spell your class or subclass says you "always have prepared" (subclass spell lists, a Ranger's *Hunter's Mark*, a Paladin's *Divine Smite*) is written into your tome for free. It does not count against your numbers.
- **Changing spells.** When you gain a level in a class, you can replace one spell you learned from that class with another spell of a level you could learn from the same list (a cantrip only for a cantrip). Spells from tomes, feats and species traits cannot be replaced this way.
- **Extra lists.** A feature that adds spells from other lists (a Bard's Magical Secrets, a Lore Bard's Magical Discoveries) lets you learn those as class tome spells too.
- **Multiclassing.** Each class teaches its own spells at its own class level. Write the class next to each spell.

### Learning from Feats, Species and Other Features

Feats (*Magic Initiate*, *Fey Touched*, *Shadow Touched*, *Ritual Caster*, *Telekinetic*), species traits (the High Elf cantrip, a Tiefling's Fiendish Legacy) and features such as the Dabbler Inclination teach spells too.

- You learn the spells **straight away**, as tome spells, when you gain the feature. The tome spell level limit and the Intelligence requirement **do not apply**. A 1st-level crawler with *Magic Initiate* knows a 1st-level spell from day one, and a crawler who takes *Fey Touched* knows *misty step* even if their own limit would not reach 2nd level yet.
- **Spellcasting ability:** the one the feature names. If it lets you choose (Intelligence, Wisdom or Charisma), choose when you gain it.
- **Free casts.** If the feature lets you cast a spell once without a spell slot, you can cast it **once per long rest without spending mana**. "Casting it with spell slots you have" means casting it with mana as normal.
- If the feature lets you change the spell later (when you gain a level, after a long rest), you can.

## Casting Tome Spells

- **Spell save DC:** 8 + your proficiency bonus + the spell's spellcasting ability modifier.
- **Spell attack modifier:** your proficiency bonus + the spell's spellcasting ability modifier.
- **One ability per spell.** A spell you read from a tome uses Intelligence, but if the spell is also on the list of a class you have, you can use that class's spellcasting ability instead.
- **Mana.** Spend the mana cost of the level you cast the spell at (see `mana`). Cantrips are free.
- **Casting at a higher level.** You can cast any tome spell at a higher level by paying that level's cost, up to your **maximum spell level**: the higher of your tome spell level limit and your class's maximum spell level.
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

Tomes are not unique. If you read a tome for a spell you already know, from any source, the spell gains **one rank** (Rank I when first learned, up to **Rank V**).

- Each rank above I casts the spell **one spell level higher** for no extra mana. For example, a 1st-level spell at Rank III costs 2 mana but has the effect of a 3rd-level casting.
- The effective level cannot exceed 9th, and cannot exceed your maximum spell level.
- Cantrips do not gain ranks. A duplicate cantrip tome gives 1 Stat Point instead (Intelligence only).

## Spellbooks and Class Features

- **Wizards** do not keep a separate spellbook. A feature that mentions your spellbook means your tome. A wizard who reads a tome holding a wizard spell can learn it up to their class's maximum spell level, ignoring the tome spell level limit (the Intelligence requirement still applies).
- A feature that refers to your "prepared spells" or "spells known" means the spells you learned from that class.
- A feature that refers to "spell slots" uses mana instead (see *Converting Class Features* in `mana`).

## Designer Notes

- **One list, one pool.** Every spell lives in the same tome and uses the same mana, so a player tracks one list instead of three. Classes still decide how many spells you learn and how high they go.
- **No preparing.** Casters know every spell they have learned. This is part of the power trip, on purpose.
- **Feats are a shortcut.** A feat or species trait is a reliable way to get a spell early, without finding a tome or meeting its Intelligence requirement.
- **Magic Crawler Skills.** *Tome Scholar*, *Signature Spell* and the other Magic Crawler Skills apply to every tome spell, which now includes class spells. They are strong on a full caster. Scale encounters to match.
- Tome mana alone is small on purpose: tome magic is a utility and burst option for non-casters. At 10th level with Intelligence 18 it is 14. Casters add their class mana on top.
- Spell ranks make duplicate tomes a good find, not a disappointment.
- Watch for ranked crowd-control spells at low levels. The spell level limit is the main guard.
