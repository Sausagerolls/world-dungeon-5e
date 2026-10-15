---
type: rule
id: spells-replacements
name: Granted Spells and Replacements
version: 0.1
status: draft
related: [tome-magic, spell-lists, race-selection, class-selection]
---

# Granted Spells and Replacements

> *"We've replaced your old spells with new ones. They're better. They're funnier. They're non-refundable."*

The World Dungeon uses its own spells. Whenever a class, subclass, species, feat or other feature gives you a **named spell** from the Player's Handbook, you get its **World Dungeon replacement** instead. The *Replacement Index* in `spell-lists` lists every one.

## How a Granted Spell Works

- **Free.** It goes straight into your tome, ignoring the tome spell level limit and the Intelligence requirement. It doesn't count against the number of spells your class lets you learn.
- **Source and ability.** It keeps the source that granted it (your class, subclass, species or feat), and that source's spellcasting ability.
- **Starting rank.** Most replacements start at Rank I. Some higher-level spells are replaced by a lower-level World Dungeon spell at a higher rank, shown in brackets, such as *Arcane Eye → Security Cam (Rank II)*. You start it at that rank, even if your character level is below the rank's usual gate.
- **Already known.** If a feature grants a spell you already know, from any source, the spell rises to the listed rank, or gains one rank if it is already at or above it (up to Rank V).
- **Free casts.** If the feature lets you cast the spell once without a spell slot, you cast its replacement once per long rest without mana, as normal (see `tome-magic`).
- **Choose-a-spell features** (a High Elf's wizard cantrip, *Magic Initiate*, *Fey Touched*, *Ritual Caster*) choose from the World Dungeon lists in `spell-lists`, using the same class list, school or ritual tag the feature names.

## Species Spells

| Species | Original spell | World Dungeon spell |
|---------|----------------|---------------------|
| Aasimar | Light | Torch |
| Drow (Elf) | Dancing Lights · Faerie Fire (3rd) · Darkness (5th) | Torch · Glitter Bomb · Lights Out |
| High Elf | Prestidigitation · Detect Magic (3rd) · Misty Step (5th) | Party Trick · Deep Inspect · Puddle Jumper |
| Wood Elf | Druidcraft · Longstrider (3rd) · Pass without Trace (5th) | Party Trick · Zoomies · Ghost Mode |
| Forest Gnome | Minor Illusion · Speak with Animals | Cardboard Cutout · Pet Translator |
| Rock Gnome | Mending · Prestidigitation | Duct Tape · Party Trick |
| Tiefling (all) | Thaumaturgy | Party Trick |
| Abyssal Tiefling | Poison Spray · Ray of Sickness (3rd) · Hold Person (5th) | Stank Cloud · Food Poisoning · Hold It Right There |
| Chthonic Tiefling | Chill Touch · False Life (3rd) · Ray of Enfeeblement (5th) | Grave Chill · Wisp Armor · Noodle Arms |
| Infernal Tiefling | Fire Bolt · Hellish Rebuke (3rd) · Darkness (5th) | Fire Flick · Clapback · Lights Out |
| Hexblood | Disguise Self · Hex | Skin Suit · Jinx |
| Khoravar | Friends | Sponsor Smile |

The levels in brackets are the character levels at which the species grants the spell (see `race-selection`).

## Class Feature Spells

| Class feature | Original spell | World Dungeon spell |
|---------------|----------------|---------------------|
| Druid: Druidic (1st) | Speak with Animals | Pet Translator |
| Paladin: Paladin's Smite (2nd) | Divine Smite | Smackdown |
| Paladin: Faithful Steed (5th) | Find Steed | Mount Up |
| Ranger: Favored Enemy (1st) | Hunter's Mark | Quest Marker |
| Monk: Warrior of Shadow (3rd) | Darkness · Minor Illusion | Lights Out · Cardboard Cutout |
| Warlock: Eldritch Invocations | See *Eldritch Invocations* below | |

Subclass spell lists (Cleric domains, Druid circles, Paladin oaths, Ranger and Sorcerer subclasses, Warlock patrons and the rest) use the Replacement Index, spell by spell.

## Eldritch Invocations

Warlocks keep their Eldritch Invocations. The ones that name a spell use its World Dungeon replacement.

### Pact Beam and the Blast Invocations

*Pact Beam* replaces *eldritch blast*, and **counts as *eldritch blast*** for every invocation and feature that names it. Its beams work like eldritch blast's: each beam is a separate attack roll and a separate damage roll, so an invocation that triggers "on a hit" works once for each beam that hits.

| Invocation | With Pact Beam |
|------------|----------------|
| **Agonizing Blast** | Add your Charisma modifier to the damage of **each beam** that hits. |
| **Eldritch Spear** | Pact Beam's range increases by 30 feet × your warlock level. |
| **Repelling Blast** | Each beam that hits a Large or smaller creature can push it 10 feet straight away from you. |
| **Grasp of Hadar** | Once per turn, when a beam hits, you can pull the creature 10 feet straight toward you. |
| **Lance of Lethargy** | Once per turn, when a beam hits, the creature's speed drops by 10 feet until the end of your next turn. |

- **Beams and ranks.** Pact Beam's beams come from its rank, not your warlock level. The cantrip minimum ranks (Rank II at 5th level, III at 11th, IV at 17th) give the same number of beams at the same levels as *eldritch blast*. A warlock who spends Rank Ups or tomes on it gets extra beams sooner, within the rank gates (a second beam from 3rd level, a third from 5th).
- **Other cantrips.** The 2024 blast invocations work on any damaging warlock cantrip you know, so they also work with *Grave Chill*, *Stank Cloud*, *Fire Flick* or *Heckle* (only the ones that make an attack roll for Repelling Blast, Grasp of Hadar and Lance of Lethargy). Choose which cantrip each one applies to, as normal.
- **No Pact Mana boost.** Cantrips cost no mana, so Pact Mana never raises a cantrip's rank.

### Invocations That Cast Spells

An invocation that lets you cast a spell **without a spell slot** lets you cast its replacement **without mana**, as often as the invocation allows, at the spell's current rank. The spell goes into your tome as a granted warlock spell (it can take your warlock Rank Ups).

| Invocation | Original spell | World Dungeon spell |
|------------|----------------|---------------------|
| Armor of Shadows | Mage Armor | Wisp Armor, on yourself |
| Ascendant Step | Levitate | Soft Landing (starts at Rank V), on yourself |
| Fiendish Vigor | False Life | Wisp Armor (starts at Rank II), on yourself; you gain the maximum temporary hit points |
| Gift of the Depths | Water Breathing | Snorkel, once per long rest |
| Mask of Many Faces | Disguise Self | Skin Suit |
| Master of Myriad Forms | Alter Self | Glow Up, on yourself (the self-change option) |
| Misty Visions | Silent Image | Cardboard Cutout (starts at Rank III) |
| One with Shadows | Invisibility | Now You Don't, on yourself, while in dim light or darkness |
| Otherworldly Leap | Jump | Zoomies, on yourself |
| Visions of Distant Realms | Arcane Eye | Security Cam (starts at Rank II) |
| Whispers of the Grave | Speak with Dead | Exit Interview |
| Pact of the Chain | Find Familiar | Hench-Critter, cast as a Magic action without mana; it can also take the pact's special forms |
| Pact of the Tome | Three cantrips and two 1st-level rituals, any list | Choose from the World Dungeon lists |

Armor of Shadows and Fiendish Vigor both give Wisp Armor: a warlock with both learns it once, at Rank II. Eldritch Smite and other invocations that spend a pact slot spend Pact Mana instead (see `mana`).

## Feats

| Feat | What you get |
|------|--------------|
| Magic Initiate | Two cantrips and one 1st-level spell from the World Dungeon Cleric, Druid or Wizard list. |
| Fey Touched | Puddle Jumper, and one 1st-level Divination or Enchantment World Dungeon spell. |
| Shadow Touched | Now You Don't, and one 1st-level Illusion or Necromancy World Dungeon spell. |
| Telekinetic | Grabby Hand. |
| Ritual Caster | 1st-level World Dungeon spells with the ritual tag. |

## More Replacements

Spells from other books that a subclass or species in Tabletop Forge grants by name. The GM can add rows for other books the same way: pick the closest World Dungeon spell, and a starting rank that makes up the difference in level.

| Original spell | World Dungeon spell |
|----------------|---------------------|
| Dragon's Breath | Flamethrower (Rank II) |
| Fount of Moonlight | Abduction Beam (Rank III) |
| Enthrall | Laugh Track (Rank II) |
| Faithful Hound | Doorbell (Rank IV) |
| Coterie of Souls | Summon Critter |
| Demon's Feast | Bad Touch (Rank II) |
| Grim Hunter | Quest Marker (Rank II) |
| Guttertongue | Intrusive Thoughts (Rank II) |
| Swarm Breath | Smoke Machine (Rank II) |
| Plaguefeather | Food Poisoning (Rank III) |
| Ring of Pain | Tentacle Hug (Rank III) |
| Suffering Lash | Signature Move (Rank II) |
| Sickening Radiance | Gas Station Bathroom (Rank II) |
| Infernal Calling | Phone a Friend (Rank III) |
| Virtuous Guardians | Bouncer (Rank II) |
| Wall of Fire Destructive Wave | Body Slam |
| Speak with Plants | Pet Translator (Rank III) |
| Silent Image | Cardboard Cutout (Rank III) |
| Levitate | Soft Landing (Rank V) |
| Power Word Heal | Medic! (Rank V) |
| Animal Shapes | Creature Feature (Rank V) |

## GM Notes

- **Spells from other books.** A tome or feature that names a spell with no replacement can still be used as written. It follows the old rank rule for library spells (see *Spells from Other Books* in `tome-magic`). Or add a row to the table above.
- **Same spell twice.** A few subclasses grant two originals that share one replacement (Trickery's *Pass without Trace* and *Nondetection* both become Ghost Mode). The second grant raises the rank, so nothing is lost.
