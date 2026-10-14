---
type: rule
id: tome-magic
name: Tome Magic
version: 0.1
status: draft
related: [crawler, crawler-skills, mana]
---

# Tome Magic

Any crawler can learn magic from **spell tomes** found in loot boxes, on mobs, and in shops. Tome magic sits beside class spellcasting. Both use the same mana pool (see `mana`).

## Learning a Tome

- Reading a tome takes **1 minute**. When you finish, the tome crumbles and you know the spell permanently.
- A tome spell can be from any class spell list.
- **Spell level limit.** You can learn a tome spell only if its level is no higher than **half your character level, rounded up** (maximum 9th).
- **Intelligence requirement.** Your Intelligence score must be at least **10 + the spell's level**. You can still read a tome you do not qualify for. It crumbles, and you gain nothing except a mocking System notification.
- There is no limit to the number of tome spells you can know.

## Casting Tome Spells

- **Spellcasting ability:** Intelligence.
- **Spell save DC:** 8 + your proficiency bonus + your Intelligence modifier.
- **Spell attack modifier:** your proficiency bonus + your Intelligence modifier.
- **Components:** Verbal and somatic components work as normal. Mana replaces material components, unless the component has a gold cost or is consumed.
- Concentration, casting time, and ritual rules work as normal. You can cast a tome spell as a ritual without spending mana if it has the ritual tag.

### Mana

Tome spells are cast with **mana**, from the same pool as every other spell (see `mana`). Your **tome mana** (character level + Intelligence modifier) is the part of the pool every crawler has, even without a spellcasting class. Costs are the standard mana costs: 2 for a 1st-level spell, up to 13 for 9th.

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
- It does not count against any limit on spells you know.

## Spell Ranks

Tomes are not unique. If you read a tome for a spell you already know, the spell gains **one rank** (Rank I when first learned, up to **Rank V**).

- Each rank above I casts the spell **one spell level higher** for no extra mana. For example, a 1st-level spell at Rank III costs 2 mana but has the effect of a 3rd-level casting.
- The effective level cannot exceed 9th, and cannot exceed your spell level limit.
- Cantrips do not gain ranks. A duplicate cantrip tome gives 1 Stat Point instead (Intelligence only).

## Tome Magic and Class Casters

- If a tome spell is on your class's spell list, you can cast it with your class spellcasting ability instead of Intelligence. It does not count against your prepared or known spells.
- A wizard can copy a tome into their spellbook instead of learning it. The tome crumbles, and the spell does not become a tome spell.

## Designer Notes

- Tome mana alone is small on purpose: tome magic is a utility and burst option for non-casters. At 10th level with Intelligence 18 it is 14. Casters add their class mana on top.
- Spell ranks make duplicate tomes a good find, not a disappointment.
- Watch for ranked crowd-control spells at low levels. The spell level limit is the main guard.
