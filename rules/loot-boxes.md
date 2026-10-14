---
type: rule
id: loot-boxes
name: Loot Boxes
version: 0.1
status: draft
related: [achievements, box-tables, explosives, firearms, dungeon-items, celestial-relics]
---

# Loot Boxes

> *"Congratulations, Crawler! You have earned a Bronze Adventurer Box. Please try not to cry when you open it."*

Loot boxes are the System's main reward. Crawlers earn them from achievements, boss kills, the audience, and their worst decisions. Every box has a **type**, which sets what kind of loot is inside, and a **rarity**, which sets how good it is.

---

## Earning Boxes

| Source | Box |
|--------|-----|
| **Achievement** | The GM awards a box that fits the deed, at the achievement's tier (see `achievements`). |
| **Boss kill** | A Boss Box for each crawler who helped, plus the boss's trophy. |
| **Audience Meter fills** | A Fan Box (see `achievements`). |
| **Something saucy on camera** | A Spicy Box, at the GM's discretion. |
| **Killing a non-combatant NPC or another crawler** | A Murder Box, every time, automatically. |
| **Floor 3 class selection** | A Bronze Class Box (see `class-selection`). |
| **Sponsors, quests and events** | Any box, as the GM likes. |

## Box Rules

- **Box inventory.** Boxes go to a separate box list on your Interface. They do not use inventory slots.
- **Bound.** A box belongs to the crawler who earned it. It cannot be traded, stolen or given away. What comes out of it can.
- **Opening.** You can only open boxes in a **safe room**. Opening a box takes an action, and the System plays a short fanfare. You can save boxes to open later.
- **Death.** Unopened boxes are lost when you die.

---

## Rarity

| Rarity | Rolls on its table | Gold | Item power | How often |
|--------|--------------------|------|------------|-----------|
| **Bronze** | 1 roll, Bronze column | 3d10 gp | Mundane and common items | Most achievements on Floors 1–4 |
| **Silver** | 1 roll Silver + 1 roll Bronze | 2d4 × 25 gp | Common and uncommon | Notable deeds; common from Floor 3 |
| **Gold** | 2 rolls, Gold column | 2d6 × 100 gp | Uncommon and rare | Major deeds and boss kills |
| **Legendary** | 2 rolls Legendary + 1 roll Gold | 2d10 × 500 gp | Rare, very rare, a few legendary | One or two per floor at most, from Floor 6 |
| **Celestial** | Signature relic + 2 rolls Legendary | 10,000 gp | Game-breaking relics | Once in a campaign, if ever |

### Rarity by Floor

Use this as a guide for normal achievements. Exceptional deeds can go one step higher.

| Floor | Usual box | Big deed | Exceptional deed |
|-------|-----------|----------|------------------|
| 1–2 | Bronze | Silver | Gold |
| 3–5 | Bronze or Silver | Gold | Legendary (very rare) |
| 6–9 | Silver | Gold | Legendary |
| 10–14 | Silver or Gold | Legendary | Legendary |
| 15–18 | Gold | Legendary | Legendary, or Celestial once |

### Celestial Boxes

A Celestial box is the rarest event in the World Dungeon. It contains the box type's **signature relic**, which is unique in the campaign (see `celestial-relics`). These items are meant to break the game.

- Award a Celestial box only for a deed the whole table will talk about for years.
- A good limit: **no more than one or two in a campaign**, and never before Floor 9.
- A Celestial-rarity **Divine Box** (gifts from the gods) holds the Spark of Divinity.

---

## Rolling Loot

1. Find the box type's table in `box-tables`.
2. Roll a d100 for each roll the rarity gives, and read the right column.
3. Add the gold.
4. **Duplicates.** If a result is a unique item the crawler already has (a relic, an attunement item they have), reroll.
5. **Your choice.** The crawler who opens the box chooses. "GM's choice" means the GM chooses.
6. **Bad fit.** If a result is useless to the crawler (a pet item with no pet, a weapon they cannot use), they can keep it to sell or trade. The GM can also swap it for another result on the same row.

---

## Box Types

| Box | Contents | Award it for |
|-----|----------|--------------|
| **Adventurer** | Potions, mana, survival gear, inventory space | Any achievement without a better fit |
| **Demolitionist** | Explosives and explosive gear | Big explosions, creative demolition |
| **Firearms** | Guns, special rounds, attachments | Gunplay, trick shots |
| **Swordsman** | Melee weapons and weapon upgrades | Melee kills, duels |
| **Archer** | Bows, crossbows, special arrows | Long shots, ranged kills |
| **Pugilist** | Unarmed gear, strength boosts | Unarmed kills, wrestling, punching things that should not be punched |
| **Armory** | Armor and shields | Taking big hits and surviving, protecting others |
| **Chatter** | Charisma items | Talking past danger, great lies, great speeches |
| **Shadow** | Stealth and thief gear | Sneaking, stealing, lock-picking |
| **Tome** | Spell tomes and mana items | Spellcasting feats, finding secret knowledge |
| **Skill** | Skill books and training | Mastering a Crawler Skill, training milestones |
| **Pet** | Pet food, armor, evolution | Pet heroics, taming creatures |
| **Divine** | Holy items, divine favor | Holy deeds, impressing a god, temples and shrines |
| **Fan** | Anything, including troll prizes | Filling the Audience Meter |
| **Spicy** | Charm and romance items, and jokes | Saucy, flirty or shameless behavior on camera |
| **Murder** | Poisons, assassin gear | Killing a non-combatant NPC or another crawler |
| **Boss** | Mixed high-value loot and a trophy | Killing a neighborhood or floor boss |
| **Class** | Class-themed gear | Floor 3 class selection, class-themed achievements |
| **Mystery** | A random box type | Anything. The System felt like it. |

---

## The Player Killer Mark

A crawler who earns a Murder Box gains the **Player Killer** mark.

- Inspect shows a red skull next to the crawler's name. Other crawlers see it.
- Some NPCs, shops and safe room staff refuse to deal with a Player Killer.
- The mark fades after the crawler completes **two floors** without earning another Murder Box. A Mask of Anonymity hides it.
- Some audiences love a villain. Player Killers often earn Fan Boxes faster, and lose sponsors faster.
