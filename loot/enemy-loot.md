---
type: loot-table-list
id: enemy-loot
name: Enemy Loot
version: 0.1
status: draft
related: [box-tables, loot-boxes, dungeon-items, explosives, firearms]
---

# Enemy Loot

> *"Looting the dead is not only allowed, it is encouraged. The dead have no further use for pocket change."*

Loot boxes reward achievements. **Enemy loot** is what crawlers find on the bodies: coins, gear, monster parts and the odd surprise. Each creature type has its own table, so a goblin drops different things from a fire elemental.

---

## Rules

### Looting a Body

- Searching one body takes an **action**. Searching every body after a fight takes **1 minute**.
- For each creature, roll its **Coin** and **one d100** on its type's table. Use the column for the creature's **tier**.
- Creatures that were summoned, conjured or created by magic drop nothing.

### Tier

Tier depends on the creature's CR, not the floor.

| Tier | CR |
|------|----|
| **Tier 1** | 0–4 |
| **Tier 2** | 5–10 |
| **Tier 3** | 11–16 |
| **Tier 4** | 17 or higher |

### Special Cases

- **Mob packs.** For a large group of weak creatures (CR 1/2 or lower), roll once for every four bodies, not for each one.
- **Elite and named mobs.** Roll twice on the table and double the coin.
- **Bosses.** A boss gives a Boss Box (see `loot-boxes`). Its body also gets two rolls on its type's table, one tier higher (Tier 4 stays Tier 4), and five times the coin.
- **Crawlers.** A dead crawler's inventory spills out where they fell. There is no table: the loot is whatever they carried. Killing one also gives a Murder Box.
- **Story items.** If the creature was carrying something for a reason (a key, a map, a stolen item), it drops that as well.
- **Forager.** A crawler with the Harvester feature of the Forager Crawler Skill gets one extra Monster Part from each beast, monstrosity, dragon, ooze or plant they harvest.

### Drop Glossary

| Drop | What it is | Sells for (Tier 1 / 2 / 3 / 4) |
|------|------------|--------------------------------|
| **Junk** | Broken trinkets, bottle caps, half a sandwich. Shops take it. | 1 gp / 1d6 gp / 2d6 gp / 2d6 × 5 gp |
| **Monster Part** | Hide, teeth, venom sacs, eyes. Crafting material for Tinkerer, Alchemy and Cooking. | 5 / 25 / 100 / 500 gp |
| **Scrap** | Gears, wire, plating, power cores. Crafting material for Tinkerer and Bomb Maker. | 5 / 25 / 100 / 500 gp |
| **Essence** | Magic residue: brimstone, fey dust, ectoplasm, elemental sparks. Crafting material for Alchemy and Tome Scholar. | 10 / 50 / 200 / 1,000 gp |
| **Trophy Part** | A fine pelt, a perfect horn, an intact skull. | Three times a Monster Part |
| **Gems** and **art objects** | As the 5e treasure tables (gemstones worth 10–500 gp, art objects worth 25–2,500 gp). | As listed |
| **Their gear** | The weapons and armor the creature was using. | Normal price |

*Italic names* are setting items, from the Explosives, Firearms and Dungeon Items handbooks.

---

## Creature Types

| Table | Use it for |
|-------|-----------|
| **Beast** | Animals, vermin, dungeon wildlife |
| **Humanoid** | Goblins, bandits, cultists, guards, orcs, kobolds, NPCs |
| **Undead** | Skeletons, zombies, ghouls, wraiths, vampires |
| **Construct** | Golems, robots, animated objects, turrets |
| **Fiend** | Demons, devils, imps |
| **Aberration** | Tentacled things, mind eaters, things from beyond |
| **Monstrosity** | Owlbears, basilisks, mimics, chimeras |
| **Dragon** | Dragons, wyverns, drakes |
| **Giant** | Ogres, trolls, giants |
| **Elemental** | Elementals, mephits, salamanders |
| **Fey** | Pixies, hags, satyrs, dryads |
| **Ooze and Plant** | Slimes, jellies, shambling plants, fungus |

---

## Beast

Beasts carry no money. Sometimes they have eaten someone who did.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | None | None | None | None |
| 01–35 | Nothing | Nothing | Monster Part | Monster Part |
| 36–60 | Monster Part | Monster Part | Monster Part ×2 | Monster Part ×2 |
| 61–78 | Trophy Part | Trophy Part | Trophy Part | Trophy Part ×2 |
| 79–90 | Stomach contents: roll on the Humanoid table, Tier 1 | Stomach contents: roll on the Humanoid table, Tier 2 | Stomach contents: roll on the Humanoid table, Tier 3 | Stomach contents: roll on the Humanoid table, Tier 4 |
| 91–97 | Potion of healing (it ate an adventurer) | Potion of greater healing | Potion of superior healing | Potion of supreme healing |
| 98–100 | *Pet Egg* | *Pet Egg* (uncommon) | *Pet Egg* (rare) | *Pet Egg* (very rare) |

---

## Humanoid

The most common loot in the dungeon. Humanoids carry money, gear and whatever they stole.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 2d6 gp | 4d10 gp | 2d6 × 25 gp | 4d6 × 100 gp |
| 01–35 | Junk | Junk | Junk ×2 | Junk ×3 |
| 36–60 | Their weapon | Their gear | Their gear; one piece is +1 | Their gear; one piece is +2 |
| 61–78 | Potion of healing | Potion of greater healing | Potion of superior healing | Potion of supreme healing |
| 79–90 | *Pipe Bomb* ×2 or *Box of Rounds* | *Frag Grenade* or *Service Pistol* | *Sticky Bomb* ×2 or *Assault Rifle* | *Gravity Grenade* or +1 *Sniper Rifle* |
| 91–97 | *Mana Potion* | 2nd-level tome | 4th-level tome | 6th-level tome |
| 98–100 | *Skill Book*: random | *Stat Potion* | Rare magic item (GM's choice) | Very rare magic item (GM's choice) |

---

## Undead

Grave goods, old coins and the leftovers of necromancy.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 1d6 gp (old coins) | 2d10 gp | 2d6 × 10 gp | 2d6 × 50 gp |
| 01–35 | Nothing | Junk | Junk | Junk ×2 |
| 36–60 | Essence (ectoplasm) | Essence | Essence ×2 | Essence ×3 |
| 61–78 | Art object (25 gp) | Art object (250 gp) | Art object (750 gp) | Art object (2,500 gp) |
| 79–90 | Ancient weapon (silvered) | +1 weapon | +2 weapon | +3 weapon |
| 91–97 | *Prayer Card* | *Relic Shard* | *Relic Shard* ×2 | *Divine Favor Token* |
| 98–100 | 1st-level tome | 3rd-level tome | 5th-level tome | 7th-level tome |

---

## Construct

Constructs carry no coins, but they are full of useful parts.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | None | None | None | None |
| 01–35 | Scrap | Scrap | Scrap ×2 | Scrap ×3 |
| 36–60 | *Fuse Kit* | *Detonator* and *Remote Charge* | *Thermite Charge* | *Thermite Charge* ×2 |
| 61–78 | Essence (power cell) | Essence | Essence ×2 | Essence ×3 |
| 79–90 | *Box of Rounds* ×2 | *Laser Sight* or *Scope* | *Extended Magazine* and *Suppressor* | *Minigun* (salvaged from a turret) |
| 91–97 | Tinker's tools | *Mana Crystal* | Pearl of power | Animated shield |
| 98–100 | *Skill Book*: Tinkerer | *Skill Book*: Tinkerer or Bomb Surgeon | *Training Manual* | *Railgun* |

---

## Fiend

Brimstone, dark bargains and fire.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 1d10 gp | 3d10 gp | 2d6 × 25 gp | 2d10 × 100 gp |
| 01–35 | Essence (brimstone) | Essence | Essence ×2 | Essence ×3 |
| 36–60 | Junk | Art object (250 gp) | Art object (750 gp) | Art object (2,500 gp) |
| 61–78 | *Molotov* ×2 | Potion of resistance (fire) | *Cluster Bomb* | *Hellfire Barrel* |
| 79–90 | *Bounty Contract* | *Bounty Contract* and malice | Midnight tears | *Reaper's Ledger Page* |
| 91–97 | *Mana Potion* | *Greater Mana Potion* | *Superior Mana Potion* | *Supreme Mana Potion* |
| 98–100 | *Stat Potion* | *Stat Potion* ×2 | Rare magic item (GM's choice, fiendish) | Very rare magic item (GM's choice, fiendish) |

---

## Aberration

Strange organs, psychic residue, and whatever its last victims carried.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 1d4 gp | 2d6 gp | 2d6 × 10 gp | 4d6 × 25 gp |
| 01–35 | Monster Part | Monster Part | Monster Part ×2 | Monster Part ×3 |
| 36–60 | Essence (psychic) | Essence | Essence ×2 | Essence ×3 |
| 61–78 | Victim's gear: roll on the Humanoid table, Tier 1 | Victim's gear: roll on the Humanoid table, Tier 2 | Victim's gear: roll on the Humanoid table, Tier 3 | Victim's gear: roll on the Humanoid table, Tier 4 |
| 79–90 | *Mana Potion* ×2 | *Mana Crystal* | *Ink of Copying* | *Ink of Copying* ×2 |
| 91–97 | 1st-level tome | 3rd-level tome | 5th-level tome | 7th-level tome |
| 98–100 | *Stat Potion* (Intelligence) | *Stat Potion* ×2 (Intelligence or Wisdom) | Ring of mind shielding and *Stat Potion* | Manual or tome (+2 Intelligence) |

---

## Monstrosity

Big, strange and full of valuable bits.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 1d6 gp (swallowed) | 2d10 gp | 4d10 × 5 gp | 2d6 × 100 gp |
| 01–35 | Monster Part | Monster Part | Monster Part ×2 | Monster Part ×3 |
| 36–60 | Trophy Part | Trophy Part | Trophy Part | Trophy Part ×2 |
| 61–78 | Stomach contents: roll on the Humanoid table, Tier 1 | Stomach contents: roll on the Humanoid table, Tier 2 | Stomach contents: roll on the Humanoid table, Tier 3 | Stomach contents: roll on the Humanoid table, Tier 4 |
| 79–90 | Venom gland: basic poison ×2 | Venom gland: serpent venom | Venom gland: wyvern poison | Venom gland: purple worm poison |
| 91–97 | *Protein Shake* ×2 | Potion of giant strength (hill) | Potion of giant strength (frost) | Potion of giant strength (storm) |
| 98–100 | *Pet Egg* | *Pet Egg* (uncommon) | *Pet Egg* (rare) | *Pet Egg* (very rare) |

---

## Dragon

Dragons carry a little of their hoard with them, even far from home.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 4d10 gp | 2d6 × 50 gp | 2d6 × 250 gp | 2d10 × 500 gp |
| 01–35 | Dragon scales (Trophy Part) | Dragon scales (Trophy Part) | Dragon scales (Trophy Part ×2) | Dragon scales (Trophy Part ×3) |
| 36–60 | Gems: 1d6 × 10 gp | Gems: 1d6 × 50 gp | Gems: 2d6 × 100 gp | Gems: 2d6 × 500 gp |
| 61–78 | Potion of resistance (its damage type) | Potion of resistance (its type) and potion of greater healing | Potion of resistance ×2 and potion of superior healing | Dragon scale mail |
| 79–90 | Art object (25 gp) | Art object (250 gp) | Art object (750 gp) | Art object (2,500 gp) |
| 91–97 | +1 weapon | +2 weapon | Dragon slayer | +3 weapon |
| 98–100 | *Stat Potion* ×2 | *Stat Potion* ×3 | Rare magic item (GM's choice) | Legendary magic item (GM's choice) |

---

## Giant

Big pockets, big sacks, and stolen goods.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 2d10 gp | 2d6 × 10 gp | 2d6 × 50 gp | 4d6 × 100 gp |
| 01–35 | Junk ×2 | Junk ×2 | Junk ×3 | Junk ×4 |
| 36–60 | *Protein Shake* ×2 | Potion of giant strength (hill) | Potion of giant strength (frost or fire) | Potion of giant strength (cloud or storm) |
| 61–78 | Art object (25 gp) | Art object (250 gp) | Art object (750 gp) | Art object (2,500 gp) |
| 79–90 | Gems: 2d4 × 10 gp | Gauntlets of ogre power | Belt of giant strength (hill) | Belt of giant strength (frost or fire) |
| 91–97 | Captured crawler's gear: roll on the Humanoid table, Tier 1 | Captured crawler's gear: roll on the Humanoid table, Tier 2 | Captured crawler's gear: roll on the Humanoid table, Tier 3 | Captured crawler's gear: roll on the Humanoid table, Tier 4 |
| 98–100 | *Stat Potion* (Strength) | *Stat Potion* ×2 (Strength) | *Stat Potion* ×3 (Strength) | Belt of giant strength (storm) |

---

## Elemental

Elementals carry no coins. What they leave behind is raw element.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | None | None | None | None |
| 01–35 | Essence (its element) | Essence | Essence ×2 | Essence ×3 |
| 36–60 | Gems: 1d6 × 10 gp | Gems: 1d6 × 50 gp | Gems: 2d6 × 100 gp | Gems: 1d6 × 500 gp |
| 61–78 | *Weapon Oil* (its element) | Potion of resistance (its element) | *Thunderclap Charge* ×2 | Ring of resistance (its element) and Essence ×3 |
| 79–90 | *Mana Potion* | *Greater Mana Potion* | *Superior Mana Potion* | *Supreme Mana Potion* |
| 91–97 | Elemental gem | Elemental gem | Elemental gem ×2 | Elemental gem ×3 |
| 98–100 | *Mana Crystal* | Wand of magic missiles | Flame tongue or frost brand (by element) | Staff of fire or staff of frost (by element) |

---

## Fey

Pretty, tricky and charming loot. Fey coin is **fairy gold**: at the next dawn, roll a d6 for each pile. On a 1–3, it turns into leaves.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 2d6 gp (fairy gold) | 4d10 gp (fairy gold) | 2d6 × 25 gp (fairy gold) | 2d6 × 100 gp (fairy gold) |
| 01–35 | Essence (fey dust) | Essence | Essence ×2 | Essence ×3 |
| 36–60 | *Chocolate Box* | *Perfume of First Impressions* | Philter of love | Eyes of charming |
| 61–78 | Potion of healing | Dust of disappearance | Cloak of elvenkind | Cloak of displacement |
| 79–90 | *Breath Mints* ×3 | *Silver Lozenge* | *Liar's Tie* | *Talk Show Mic* |
| 91–97 | *Stat Potion* (Charisma) | *Stat Potion* ×2 (Charisma or Dexterity) | *Stat Potion* ×3 (Charisma or Dexterity) | *Stat Potion* ×4 (Charisma or Dexterity) |
| 98–100 | *Smoldering Gaze Potion* | *Smoldering Gaze Potion* ×2 | *Heartbreaker* | *Heartbreaker* and *Silk Robe of Distraction* |

---

## Ooze and Plant

Acid, spores, and everything they failed to digest.

| d100 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| **Coin** | 1d6 gp (undigested) | 2d6 gp | 2d6 × 10 gp | 4d6 × 25 gp |
| 01–35 | Nothing | Monster Part | Monster Part | Monster Part ×2 |
| 36–60 | Monster Part | *Acid Bomb* | *Acid Bomb* ×3 | *Acid Bomb* ×5 |
| 61–78 | Undigested gear: roll on the Humanoid table, Tier 1 | Undigested gear: roll on the Humanoid table, Tier 2 | Undigested gear: roll on the Humanoid table, Tier 3 | Undigested gear: roll on the Humanoid table, Tier 4 |
| 79–90 | Antitoxin ×2 | Potion of healing ×2 | Potion of greater healing ×2 | Potion of superior healing ×2 |
| 91–97 | **Troll prize:** *Mystery Meat* | Potion of resistance (acid or poison) | Periapt of proof against poison | Potion of longevity |
| 98–100 | *Stat Potion* (Constitution) | *Stat Potion* ×2 (Constitution) | *Stat Potion* ×3 (Constitution) | *Stat Potion* ×4 (Constitution) |
