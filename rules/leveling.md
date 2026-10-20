---
type: rule
id: leveling
name: Leveling and Levels Beyond 20
version: 0.4
status: draft
related: [crawler, class-selection, crawler-skills, enemy-loot, safe-rooms-and-timer, quest-builder]
---

# Leveling and Levels Beyond 20

In the World Dungeon, crawlers gain **about 11 levels per floor**, and character level has **no cap**. A crawler who survives all 18 floors ends at about level 200. Every level is a full level: a class level, a Stat Point and a Hit Die.

## Experience Points

> *"Level up! You killed a lot of things. The System is proud of you. Please continue."*

Crawlers level up by killing things. Every mob you defeat is worth **experience points (XP)**, based on its **Mob Tier**. **Every 100 XP is one level.**

| Mob Tier | What it is | XP |
|----------|------------|----|
| **1. Trash** | Fodder that comes in packs: rats, crias, sweeper bots, minions, a boss's adds. Dies in a hit or two. | 5 |
| **2. Standard** | An ordinary monster in an ordinary fight. | 10 |
| **3. Elite** | Elite and named mobs, mini-bosses, a boss's lieutenant, hostile crawlers. | 25 |
| **4. Boss** | A neighbourhood boss, or any boss that drops a Boss Box. | 100 |
| **5. Floor Boss** | The boss guarding the floor's main stairwell. | 200 |
| **Deity** | A god, a god's avatar or a herald (see `god-stat-blocks`). Rare, and huge. | 1,000 |

- **Tier is the mob's role, not its CR.** A goblin is Trash in a horde of thirty and Standard in a fight with three. The GM decides, and the System shows it when you Inspect the mob. The values don't change with the floor, so 100 XP is always one level.
- **Everyone in the fight gets it.** Each crawler who took part in the fight gets the full XP for every mob defeated in it, whoever landed the blow. Crawlers who were down but alive still get it. Dead crawlers don't.
- **Defeated counts.** Killed, captured, or surrendered for good all count. A mob that runs away and comes back later is worth XP once, when it's finally beaten.
- **No XP** for creatures that were summoned, conjured or created by magic, for your own party's pets and allies, or for anything the GM says was never a threat (a caged rat, a sleeping kitten).
- **Swarms.** A swarm is one Standard mob, not a hundred Trash ones.
- **Level up when the fight ends.** When your XP reaches 100, you gain a level as soon as the fight is over. Take away 100 and keep the rest. Every boss is worth at least a level, and a big fight (a floor boss and its adds) can give three.
- **XP goes on your sheet.** Track it on the **Levels** page of your character sheet, or the Level tab of the Crawler Sheet app.

### Other Ways to Earn XP

- **Grinding.** A grinding block gives every crawler **150 XP** on Floors 1–6, and **125 XP** from Floor 7 (see *Grinding Blocks* in `safe-rooms-and-timer`).
- **Quests** don't give XP by themselves. The fights on the way do. The GM may give **100 XP** for a ★★★★ quest and **200 XP** for a ★★★★★ quest (see `quest-builder`).
- **Crawlers.** Killing another crawler is worth 25 XP (Elite), and a Murder Box. The audience will have opinions.

## Floor Pacing

A typical floor is about 15 ordinary fights (300–500 XP), a few elites (100–150 XP), three or four neighbourhood bosses (300–400 XP) and the floor boss (200 XP): about **1,100 XP, or 11 levels per floor**. Parties that clear every neighbourhood leave further ahead. Cautious parties fall behind, and the dungeon punishes that.

| Floor | Levels on that floor | | Floor | Levels on that floor |
|-------|----------------------|-|-------|----------------------|
| 1 | 1 → 12 | | 10 | 100 → 111 |
| 2 | 12 → 23 | | 11 | 111 → 122 |
| 3 | 23 → 34 (class selection on arrival) | | 12 | 122 → 133 |
| 4 | 34 → 45 | | 13 | 133 → 144 |
| 5 | 45 → 56 | | 14 | 144 → 155 |
| 6 | 56 → 67 | | 15 | 155 → 166 |
| 7 | 67 → 78 | | 16 | 166 → 177 |
| 8 | 78 → 89 | | 17 | 177 → 188 |
| 9 | 89 → 100 | | 18 | 188 → 199+ |

**Floor 1 is the exception.** Its neighbourhoods were built for levels 1–4, so it gets easier as the party levels up. That's on purpose: the tutorial floor is where crawlers learn they are getting strong. From Floor 2, floors are built for the table above.

**Farming.** There is no cap on XP from trash mobs. The floor timer is the cap: every fight costs a floor turn, and the stairs don't wait.

**Optional: milestone leveling.** If you'd rather not count XP, give levels at major beats on each floor instead: the first big fight, a neighbourhood boss, the floor boss, and finding the stairwell. Use the table above as the target.

## Proficiency Bonus

Proficiency bonus follows the normal 5e table to 20th level (+6 at 17–20). After that, it rises by **+1 every 10 levels**, to protect bounded accuracy:

| Character Level | Proficiency Bonus | | Character Level | Proficiency Bonus |
|-----------------|-------------------|-|-----------------|-------------------|
| 17–20 | +6 | | 111–120 | +16 |
| 21–30 | +7 | | 121–130 | +17 |
| 31–40 | +8 | | 131–140 | +18 |
| 41–50 | +9 | | 141–150 | +19 |
| 51–60 | +10 | | 151–160 | +20 |
| 61–70 | +11 | | 161–170 | +21 |
| 71–80 | +12 | | 171–180 | +22 |
| 81–90 | +13 | | 181–190 | +23 |
| 91–100 | +14 | | 191–200 | +24 |
| 101–110 | +15 | | 201+ | +1 per 10 levels |

## What Every Level Gives

Every character level, at any height, gives:

- **Crawler Core:** 1 Stat Point. A Skill Pick at 1st level and every 5th level (5, 10, 15 and so on).
- **One class level** (after Floor 3), in a class of your choice.
- **One Hit Die and hit points.** Before Floor 3 this is a d8. After that, it is the hit die of the class you took the level in (see *Hit Points and Hit Dice* in `crawler`).

## Leveling Your Classes

On Floor 3 you gain your first class at your current level, all at once (see `class-selection`). Crawlers arrive at about level 23, so the first 20 go into your class and the rest become prestige levels in it or levels in a second class. After that, **every new character level is one level in one class**:

- Level up a class you already have, or take 1st level in a new class (normal 5e multiclassing rules and prerequisites).
- You gain that class level's features, and its Ability Score Improvement or feat if it has one.
- **No class goes above 20th level.** Once a class is at 20th level, more levels in it are **prestige levels**, with big class-specific features (see `prestige-levels`). Or keep multiclassing. You choose at every level.
- **Mana.** Caster levels from all your classes add together for class mana. Each caster level above 20 adds 6 class mana (see `mana`).

## GM Notes

- **Monster scaling.** Standard 5e monsters run out at about CR 30, which suits crawlers around level 25–30. From Floor 3, the GM scales monsters up. The CR guide in `building-mobs` (and the Mob Builder) continues past CR 30.
- **Ability scores.** There is no cap. By level 200 a crawler has 200 or more Stat Points, so main scores of 60–100 are normal. This is intended: crawlers should feel like they are on a power trip. Answer it with bigger monsters.
- **Skill Picks.** By level 200, a crawler has about 41 Skill Picks, plus GM-awarded Skill Levels. Crawler Skills cap at Skill Level 15 (20 with Limit Breaker), and Training Montage absorbs extra picks. More Crawler Skills are planned for high-level play (see `crawler-skills`).
