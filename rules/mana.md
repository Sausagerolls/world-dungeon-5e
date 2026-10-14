---
type: rule
id: mana
name: Mana
version: 0.1
status: draft
related: [tome-magic, crawler, leveling, crawler-skills]
---

# Mana

> *"The System has standardized all magic into a single, convenient resource. Please spend it responsibly. Or don't. We're not your mother."*

In the World Dungeon there are **no spell slots**. Every spell, whether it comes from a tome or from your class, is cast with **mana**. Your class still decides which spells you know or prepare, and how strong your magic gets. Mana just replaces the slots. This system is based on the *spell points* variant in the 5e Dungeon Master's Guide.

---

## Your Mana Pool

Every crawler has **one mana pool**. Its maximum is the total of these parts:

| Part | Amount | Who has it |
|------|--------|------------|
| **Tome mana** | Character level + Intelligence modifier (minimum 1) | Every crawler |
| **Class mana** | From your **caster level** (see *Class Mana*) | Classes with the Spellcasting feature |
| **Bonus mana** | Dabbler Inclination, Mana Well, items | As the feature says |

Warlocks also have a separate, smaller **Pact Mana** pool (see *Pact Mana*).

### Recovering Mana

- **Long rest:** regain all your mana.
- **Short rest:** regain mana equal to **half your tome mana** (rounded down), up to your maximum. Class mana only comes back on a long rest, unless a class feature says otherwise.
- **Potions and features:** Mana Potions, the Mana Well Crawler Skill, Mana Crystals and similar effects work for every spell you cast, not only tome spells.

---

## Casting a Spell

To cast a spell of 1st level or higher, spend the mana for the level you cast it at.

| Spell level | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|-------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| **Mana cost** | 2 | 3 | 5 | 6 | 7 | 9 | 10 | 11 | 13 |

- **Cantrips** cost nothing. **Rituals** cast as rituals cost nothing.
- **Casting at a higher level** works as normal. Pay the cost of the level you cast it at, up to your **maximum spell level**.
- **Big spells.** You can cast **one spell of each level from 6th to 9th** per long rest with mana. Tick them off on your sheet.
- **Which spells.** Mana does not care where a spell comes from. Class spells use your class spellcasting ability; tome spells use Intelligence (see `tome-magic`).
- Everything else (casting time, components, concentration) works as normal.

---

## Class Mana

### Step 1: Find your caster level

| Class or subclass | Caster level |
|-------------------|--------------|
| **Full casters:** Bard, Cleric, Druid, Sorcerer, Wizard | Your level in the class |
| **Half casters:** Paladin, Ranger (and Artificer, if your table uses it) | Half your level in the class, rounded up |
| **Third casters:** Eldritch Knight, Arcane Trickster | A third of your level in the class, rounded up |
| **Warlock** | None. Warlocks use Pact Mana instead. |

**Multiclassing:** add your caster levels from every class together.

### Step 2: Read your class mana

| Caster level | Class mana | Max spell level | Caster level | Class mana | Max spell level |
|--------------|------------|-----------------|--------------|------------|-----------------|
| 1 | 4 | 1st | 11 | 73 | 6th |
| 2 | 6 | 1st | 12 | 73 | 6th |
| 3 | 14 | 2nd | 13 | 83 | 7th |
| 4 | 17 | 2nd | 14 | 83 | 7th |
| 5 | 27 | 3rd | 15 | 94 | 8th |
| 6 | 32 | 3rd | 16 | 94 | 8th |
| 7 | 38 | 4th | 17 | 107 | 9th |
| 8 | 44 | 4th | 18 | 114 | 9th |
| 9 | 57 | 5th | 19 | 123 | 9th |
| 10 | 64 | 5th | 20 | 133 | 9th |

Class mana is the total mana cost of the spell slots your caster level would give you, so it matches normal 5e exactly.

**Maximum spell level.** You can cast class spells up to the level in the table, and no higher than your class would let you learn or prepare. Half casters stop at 5th level, and third casters at 4th.

**Beyond caster level 20.** Each caster level above 20 adds **+6 class mana**. Your maximum spell level stays at 9th.

---

## Pact Mana (Warlocks)

Warlocks keep the feel of Pact Magic: a small pool that refills fast and always casts at full power.

| Warlock level | Pact mana | Pact level | Warlock level | Pact mana | Pact level |
|---------------|-----------|------------|---------------|-----------|------------|
| 1 | 2 | 1st | 9–10 | 14 | 5th |
| 2 | 4 | 1st | 11–16 | 21 | 5th |
| 3–4 | 6 | 2nd | 17–20 | 28 | 5th |
| 5–6 | 10 | 3rd | 21+ | 28 + 7 per level above 20 | 5th |
| 7–8 | 12 | 4th | | | |

- **Recovery.** Pact mana comes back in full on a **short or long rest**.
- **Always at pact level.** When you spend pact mana on a spell, you pay the cost of your **pact level**, and the spell is cast at that level. You cannot pay a smaller amount for a lower level.
- **Any spell.** Pact mana can pay for any spell you know of your pact level or lower, warlock or otherwise.
- **Your main pool too.** A warlock can also cast warlock spells from their main mana pool (tome mana and any class mana from other classes), at any level up to their pact level, paying the normal cost.
- **Mystic Arcanum** does not change: each arcanum spell is cast once per long rest for free.

---

## Converting Class Features

Many class features talk about spell slots. Use these rules to convert them.

| The feature says… | Instead… |
|-------------------|----------|
| "Expend a spell slot" of a level (Divine Smite, Eldritch Smite, Wild Shape options, and so on) | Spend the mana cost of that level. The level you pay for counts as the slot's level. |
| "Expend a pact slot" (Warlock features) | Spend pact mana equal to your pact level's cost. |
| "Regain expended spell slots" with a total level (Arcane Recovery, Natural Recovery) | Regain **2 mana per slot level** it would restore. A 6th-level wizard's Arcane Recovery (3 levels) restores 6 mana. |
| "Regain a spell slot" of a set level (Harness Divine Power, some items) | Regain the mana cost of that level. |
| Font of Magic: **create a spell slot** with sorcery points | Spend the same sorcery points to gain the mana cost of that level. Mana gained this way vanishes when you finish a long rest. |
| Font of Magic: **turn a spell slot into sorcery points** | Spend the mana cost of a level to gain sorcery points equal to that level. |
| "When you cast a spell using a spell slot" (triggers for features) | Triggers when you cast a spell by spending mana (or pact mana). |
| Item or effect that "uses a spell slot" | Spend mana of that level. |

If a feature does not fit any of these, the GM converts it using the mana cost table: a slot of level X is worth its mana cost.

---

## Example

**Vix** is a 9th-level crawler: Wizard 9, Intelligence 18 (+4).

- Tome mana: 9 + 4 = **13**
- Class mana: caster level 9 = **57**
- **Mana pool: 70.** Maximum spell level 5th.

Vix casts *fireball* at 3rd level (5 mana), then at 5th level (7 mana). After a short rest, Vix regains 6 mana (half of 13, rounded down). Arcane Recovery restores another 10 mana (5 slot levels × 2).

---

## Designer Notes

- **Flexibility is the point.** A caster with mana can cast their best spells more often than with slots. The once-per-long-rest limit on 6th–9th level spells keeps the very biggest spells rare.
- **Power trip.** Mana Potions and Mana Well now help every caster, and class mana keeps growing after caster level 20. This is deliberate. Scale encounters to match.
- **Tracking.** Each crawler tracks one number (current mana), plus pact mana for warlocks. The character sheet has boxes for both.
