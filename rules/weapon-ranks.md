---
type: rule
id: weapon-ranks
name: Weapon Ranks
version: 0.1
status: draft
related: [crafting, safe-room-shops, crawler-skills, tome-magic, firearms]
---

# Weapon Ranks

> *"Your sword is level one. You are level twelve. The System has noticed this mismatch, and would like to sell you a solution."*

Spells get stronger through ranks. Weapons do too. Every weapon a crawler uses, including firearms, bows, thrown weapons and hand wraps for unarmed strikes, has a **rank from I to V**. Higher ranks hit harder, roll more dice and gain **traits**. Ranks are earned at the workbench, bought from the Armory, found in loot, and moved from weapon to weapon, so a crawler's favorite weapon keeps up with them all the way down.

On top of that, **Heavy Hands** turns very high ability scores into extra damage dice, so Stat Points spent on Strength or Dexterity keep paying off.

## Ranks

Each rank includes everything from the ranks below it.

| Rank | Attack and damage | Extra damage dice | Traits | Character level |
|------|-------------------|-------------------|--------|-----------------|
| **I** | — | — | — | Any |
| **II** | +1 | — | Choose 1 trait. The weapon counts as magical. | 3rd |
| **III** | +1 | +1 die | — | 5th |
| **IV** | +2 | +1 die | Choose a 2nd trait | 9th |
| **V** | +3 | +2 dice | **Named:** choose a 3rd trait, and give it a name | 13th |

- **Extra damage dice** are more of the weapon's own damage die: a Rank III longsword deals 2d8, a Rank V greataxe 3d12. A versatile weapon adds the die of the grip you use. A firearm adds dice of its own damage die.
- **Rank gates.** A weapon above your rank gate works at your gate until you level up. You can still upgrade it early.
- **Magic weapons.** A +1, +2 or +3 weapon can be ranked too. Its own bonus and the rank's attack and damage bonus don't add together: use the higher. Extra dice and traits always add.
- **Unarmed strikes.** Hand wraps, knuckles or gauntlets can be ranked like a weapon. While you wear them, your unarmed strikes use their rank (add extra dice of your unarmed die: Martial Arts, Iron Fist or Scrappy).
- **Ammunition and explosives** don't have ranks. Explosives scale with *Demolitionist* (see `explosives`).

## Traits

Choose a trait when the weapon reaches Rank II, Rank IV and Rank V. A trait can't be taken twice on one weapon unless it says so.

| Trait | Effect |
|-------|--------|
| **Keen** | The weapon scores a critical hit on a 19 or 20. With *Weapon Specialist*, each lowers your critical range by 1 (to a minimum of 17). |
| **Elemental** | Choose acid, cold, fire, lightning, thunder, radiant or necrotic. A hit deals an extra 1d6 damage of that type. Can be taken twice (a different type each time). |
| **Brutal** | When you roll a 1 or 2 on a damage die for the weapon, you can reroll it. You must use the new roll. |
| **Heavy Hitter** | Once per turn, when you hit a Large or smaller creature, you can push it 10 feet or knock it Prone (Strength save, DC 8 + your proficiency bonus + the attack's ability modifier). |
| **Vampiric** | Once per turn, when you hit a creature that isn't a construct or undead, you regain hit points equal to your proficiency bonus. |
| **Bane** | Choose a creature type. Hits against that type deal an extra 2d6 damage. |
| **Long Arm** | Melee: reach +5 feet. Ranged or thrown: normal and long range doubled. |
| **Quickdraw** | Drawing and stowing it is free, and you add your proficiency bonus to Initiative while you carry it. |
| **Returning** | Thrown: it flies back to your hand after the attack. Firearm or bow: double its magazine (Reload) and it never misfires. |
| **Sundering** | *Rank IV or higher.* The weapon's damage ignores resistance (not immunity) to its damage type. |
| **Highlight Reel** | Once per long rest, after you hit with it, you can turn the hit into a critical hit. The audience notices: the GM can count it as a Showmanship moment. |

## Raising a Rank

### At the Workbench

Upgrading is **Workbench crafting** (see `crafting`). Use the tool that fits the weapon: smith's tools for metal, woodcarver's tools for bows and clubs, leatherworker's tools for wraps and whips, tinker's tools for firearms.

| To rank | Gold | Materials | Floor turns |
|---------|------|-----------|-------------|
| **II** | 100 gp | Scrap or Monster Part (T1) ×2 | 4 |
| **III** | 500 gp | Scrap or Monster Part (T2) ×2, Essence (T1) ×1 | 8 |
| **IV** | 2,500 gp | Scrap or Monster Part (T3) ×2, Essence (T2) ×2 | 16 |
| **V** | 12,000 gp | Scrap or Monster Part (T4) ×2, Essence (T3) ×2, Trophy Part (T3) ×1 | 32 |

- *Weapon Specialist* for that weapon type halves the floor turns. *Tinkerer* does the same for firearms.
- An Essence or Trophy Part with a **flavor** can set an Elemental or Bane trait for free (Essence (fire) for fire, Trophy Part (dragon) for Bane: dragons).

### At the Armory

An **Armory** (or **Gun Shop** for firearms) does the upgrade for you: the gold cost +50%, the same materials, and the same floor turns while you wait in the safe room (see `safe-room-shops`).

### Weapon Upgrade Kits and System Awards

- A **Weapon Upgrade Kit** from a loot box raises one weapon by one rank at once, up to your rank gate (see `dungeon-items`).
- **System award.** Like Crawler Skills, the GM can award a free rank to a weapon that just did something spectacular on camera: killed a boss, saved the party, ended a fight in one swing.

### Reforging

Found a better weapon? Move the ranks across. At a workbench, spend **8 floor turns** and **10% of the gold** the old weapon's upgrades cost, and move all its ranks and traits to another weapon of the same kind (melee to melee, ranged to ranged, wraps to wraps). The old weapon drops to Rank I.

## Heavy Hands

There is no cap on ability scores in the World Dungeon, so very strong (or very quick) crawlers get more out of a weapon than a normal person could.

When you hit with a weapon attack or an unarmed strike, and the ability modifier you use for the attack is **+8 or higher**, the attack deals **one extra damage die** of the weapon's own die, plus one more for every 3 points above that:

| Ability modifier | +8 to +10 | +11 to +13 | +14 to +16 | +17 or higher |
|------------------|-----------|------------|------------|---------------|
| **Extra dice** | 1 | 2 | 3 | 4 (and +1 more per 3) |

Heavy Hands adds to rank dice. A Rank V greataxe swung with Strength 26 (+8) deals 4d12 + 11.

## Designer Notes

- **Why ranks.** A 5e weapon stays the same weapon unless you find a better one. In the World Dungeon, spell ranks, Crawler Skills and uncapped ability scores keep pushing crawlers up, and a plain longsword fell behind fast. Weapon ranks keep a favorite weapon in step with the rest of the crawler, and Reforging makes a lucky loot drop an upgrade, not a reset.
- **Pacing.** The rank gates match spell ranks (3rd, 5th, 9th, 13th), and the gold and material costs follow magic item crafting (see `crafting`), so a crawler can afford Rank III around Floor 2 or 3, Rank IV around Floor 5 and Rank V on the deep floors.
- **Power.** A Rank V weapon is about as strong as a +3 weapon with two extra dice: very strong, on purpose. Scale monsters to match, as with everything else in the World Dungeon.
