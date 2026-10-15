---
type: rule
id: gods
name: Gods and Worship
version: 0.2
status: draft
related: [pantheon, divine-gear, god-stat-blocks, class-selection, surviving-the-crawl]
---

# Gods and Worship

> *"The gods are watching. They have opinions. They have SPONSORSHIP DEALS. Please do not anger anyone with a domain."*

**Optional module.** The GM decides whether gods are in the game. Without this module, clerics and paladins work as normal and the gods stay in the background.

The gods of the World Dungeon are real, petty and very busy. They are bound by the System's **Divine Accord**: they can't walk into the dungeon and fight, but they can bless, curse and smite anyone who prays to them. Every prayer is a little bit of power, and a crawler who prays on camera is free advertising. The gods want you. They also want you to keep your promises.

## Meeting a God

You can only worship a god you have **met**. Gods don't take worshippers sight unseen: they want to look you over first, preferably on camera.

You meet a god when one of these happens:

| Meeting | How it happens |
|---------|----------------|
| **Avatar** | You see the god's avatar (see `god-stat-blocks`): at a smite, a floor event, a temple, or a boss fight the System approves. |
| **Herald** | You speak with one of the god's minor deities (Prince Fen for Moldra, Cinder for Embrix, and so on). |
| **Calling** | You do the thing the god loves, in front of an audience (each god's **Calling** in `pantheon`). The GM decides when it is enough: the world freezes, and the god appears to you in a vision for a few seconds. |
| **Answered prayer** | You pray at the god's shrine for 10 minutes. Make a Wisdom (Religion) or Charisma (Performance) check, DC 15. On a success, the god appears to you. You can try once per shrine per floor. |

Write every god you have met on your sheet (*Gods met*). Meeting a god doesn't oblige you to anything. It only opens the door.

### The Divine Offer

Whenever you meet a god, it makes you an offer. The System puts it on your Interface: *"[God] would like to add you to their followers. ACCEPT / DECLINE."*

- **Accept on the spot.** Say the god's vow (each god's entry in `pantheon` has one). You join at once, with no shrine needed, and you start with **2 Favor** instead of 0 (*"First impression"*). Accepting on camera in the middle of a fight is a Showmanship moment.
- **Decline**, or let it pass. Nothing happens, except that the god remembers. You can still join later at any of that god's shrines (see *Joining at a Shrine*), at 0 Favor.
- **Already worshipping someone?** Accepting means leaving your current god, and that god smites you (see *Leaving a Religion*). Accepting a rival god's offer while you worship its rival is a Taboo for every god: you leave with 2 extra Lapses first.
- **Apostates** never get an offer from a god they left.

### Joining at a Shrine

1. **Find a shrine** of a god you have met. Shrines appear on most floors (usually one or two per floor, sometimes inside a safe room).
2. **Take the vow.** Spend 10 minutes at the shrine and say the god's vow out loud.
3. **Get the Mark.** The god's Mark appears on your body, and Inspect shows *"Worshipper of [god]"* to anyone who looks. You start at **0 Favor** as an **Initiate**.

### Who Can Worship

- **One god at a time.** A crawler can worship only one major god. Minor deities (see `god-stat-blocks`) don't have religions to join, except Vorkath, who will take anyone.
- **Clerics and paladins.** If the table uses this module, a cleric or paladin must worship a god whose domains include their subclass's theme (the GM decides close calls). They meet that god when they take the class on Floor 3. A cleric or paladin who leaves their god loses Channel Divinity until they join another one.
- **Warlocks.** A Celestial or Fiend Patron can be one of these gods (you met it when you made the pact). A warlock can't worship a god who is the rival of their patron.

## Favor

Favor measures how much your god likes you right now. Track it on your sheet as a number.

| Favor | Rank | What it means |
|-------|------|---------------|
| 0–4 | **Initiate** | You took the vow. The god knows your name, barely. |
| 5–14 | **Devotee** | You show up. The god sends the odd blessing. |
| 15–29 | **Zealot** | You are a regular on the god's channel. |
| 30+ | **Chosen** | The god's favorite. Other worshippers bow. Rival gods take notice. |

Each god gives one **Boon** per rank (see `pantheon`). You keep every boon of your rank and the ranks below it. Favor never goes below 0.

### Gaining Favor

Each god has three kinds of **Devotion**:

| Devotion | How often | Favor |
|----------|-----------|-------|
| **Rite** | Each day (once between long rests) | +1 |
| **Offering** | Once per floor, before you take the stairs down | +3 |
| **Great Deed** | Once per floor, optional, hard and dangerous | +5 |

- **On camera.** A Great Deed done in front of a big audience (a boss fight, a crowded neighbourhood, a stream with many viewers) also counts as a Showmanship moment for Audience (see `surviving-the-crawl`).
- **The GM can award Favor** (+1 to +3) for anything the god would love that isn't on the list.

## Taboos and Lapses

Each god has **Rites** you must keep and **Taboos** you must never break. You gain a **Lapse** when:

- a day passes (you finish a long rest) without the god's Rite,
- you go down the stairs without making the floor's Offering, or
- you break one of the god's Taboos (each time).

Lapses add up, and every Lapse makes things worse. Each god's entry in `pantheon` says what its **Displeasure** and **Wrath** look like.

| Lapses | Stage | Effect |
|--------|-------|--------|
| 1 | **Warning** | A System notification: *"[God] has noticed."* Lose 1 Favor. |
| 2 | **Cold Shoulder** | Lose 3 Favor. Your highest-rank Boon stops working until you have 0 Lapses again. |
| 3 | **Displeasure** | Lose 5 Favor. The god's Displeasure effect starts. All your Boons stop working. |
| 4 | **Wrath** | The god's Wrath effect starts (on top of Displeasure). You can't gain Favor except by Atonement. |
| 5 | **Forsaken** | The god gives up on you: you are smitten as if you had left the religion (see *Leaving a Religion*), and you are no longer a worshipper. |

### Atonement

- **Clean floor.** Keep every Rite and make the Offering for a whole floor without breaking a Taboo: remove 1 Lapse when you take the stairs.
- **Atone.** Each god names an **Atonement**: a task that removes 1 Lapse when you finish it. It can be done once per floor.
- **Indulgence.** An *Indulgence Coupon* (see `divine-gear`) removes 1 Lapse at once. Every god accepts them. Nobody likes talking about it.
- At 0 Lapses, every Boon of your rank works again.

## Leaving a Religion

You can leave a religion at any time. Renounce the god out loud, or take the vow of another god. The god then **smites** you, once, at the worst possible moment the GM can find within the next 24 hours (often right away).

- **The Smite.** Each god has its own **Apostate's Smite** (see `pantheon`). It deals damage and leaves a lasting effect, and it gets worse the higher your rank was when you left:

| Rank when you left | Smite damage | Lasting effect lasts |
|--------------------|--------------|----------------------|
| Initiate | 4d10 | Until the end of the floor |
| Devotee | 8d10 | Until the end of the next floor |
| Zealot | 12d10 | For three floors |
| Chosen | 16d10 | Permanent, until removed by a god or a Celestial relic |

- **No saving throw** for the damage, which can't be reduced except by the god's own rules. The smite can't take you below 1 hit point unless you were Forsaken (5 Lapses): then it can kill you.
- **Apostate.** Afterwards, Inspect shows *"Apostate of [god]"*. That god's worshippers and minor deities are hostile to you, and you can never worship that god again (short of a Great Deed the GM invents just for you).
- **Your Boons, Favor and Lapses** for that god are gone. Divine gear tied to that god stops working for you (see `divine-gear`).

## Shrines and Temples

| Place | What you can do |
|-------|-----------------|
| **Shrine** (most floors) | Pray for an answered prayer (meet the god). Take a vow, if you have met the god. Make an Offering. Perform most Rites. Ask the god a yes-or-no question once per floor (the GM answers, cryptically). |
| **Temple** (rare: a safe room annex, or a neighbourhood landmark) | Everything a shrine does. Buy divine gear for gold or Favor (see `divine-gear`). Atone for 1 Lapse with a tithe of 100 gp × your level (once per floor). |
| **Rival shrine** | Desecrating a rival's shrine is a Great Deed for some gods, and a Taboo for others. Read the fine print. |

## Gods in Play (GM)

- **The Divine Accord.** Gods only act through worshippers, boons, smites, minor deities and avatars. An avatar (see `god-stat-blocks`) appears only for a smite, a floor event, a Great Deed gone wrong, or a boss fight the System approves.
- **Introductions.** Plan when the party meets each god: a Calling the first time someone does something on-theme, a herald in a neighbourhood, a shrine in a safe room, an avatar at the end of a floor. One or two gods per floor is plenty. The Divine Offer is a great cliffhanger: freeze the fight, show the god, ask the player.
- **Rivals.** Every god has a rival. Worshippers of rival gods start every meeting unfriendly. A crawler who works with a rival's worshipper for a whole floor counts as a Taboo for most gods (each god's list says).
- **Favor pacing.** A crawler who keeps every Rite and Offering gains about 7 Favor per floor (more with Great Deeds), so Devotee arrives around the end of a first floor of worship, Zealot about two floors later, and Chosen after five or six floors. That is on purpose: Chosen boons are strong.
- **Party religions.** Crawlers in one party can worship different gods. Rival gods in one party make great television.
- **Tracking.** Each worshipper tracks three things: god, Favor and Lapses. The GM can keep a worshipper list on the GM Floor Tracker.

## Designer Notes

- The Lapse ladder is the heart of the module: a missed Rite is a nudge, five are a disaster. Players should always know how many Lapses they have, and the System should remind them, rudely.
- Smites scale by rank so that leaving early is cheap and leaving late is a decision. A Chosen apostate should feel it for the rest of the crawl.
- Devotions are built to make players do interesting things on camera: light fires, tell jokes, keep grudges, share meals. If a Rite isn't fun, change it.
