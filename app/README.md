# Crawler Sheet (mobile web app)

A phone-first character sheet for World Dungeon crawlers. It saves to a **Tabletop Forge** server, so a player reconnects from any device with the same server and player name, and the GM sees the crawler in Tabletop Forge.

## What it does

- **Build a crawler:** name, 2024 background (skills, tool, origin feat), the 10 + 6 point ability scores, saving throws, skills, first Skill Pick, Heal Self.
- **Play:** tap-to-roll checks, saves, skills, initiative, attacks and damage (advantage/disadvantage, crits double the dice, roll log), HP, temp HP, death saves, mixed Hit Dice, short and long rests, mana and Pact Mana.
- **Crawler Skills:** learn, train and GM-award Skill Levels, milestones at 1/5/10/15, and Level 20 with Limit Breaker. Training Montage and Drill.
- **Spells:** a spell library from the Tabletop Forge server. Tome spells (any list, level limit, Int requirement, ranks) and class spells (by class list), cast with mana, with up-casting costs and the one-per-long-rest 6th–9th rule.
- **Gear:** items and weapons from the Tabletop Forge item library or custom, equip, slots, gold (gp only), crafting materials.
- **Loot:** a box grid by type and rarity (earned, opened, waiting), achievements, box log, Audience Meter, Player Killer mark.
- **Features:** Crawler Core, survivor features, species traits, class and subclass features, prestige features, feats, proficiencies.
- **Levels:** level up (rolled or fixed HP), Floor 3 species, class and subclass selection, multiclassing, prestige levels.

## Data

Class, subclass, species, feat and background data is read from a **Tabletop Forge checkout at build time** (`TTF_SRC`). It is never copied into this repo. Spells and items come from the Tabletop Forge server while playing.

That data includes non-SRD book content, so host the built app only where that Tabletop Forge data is already served: on the Tabletop Forge server itself at `/crawler/` (see *Hosting with Tabletop Forge* in DEPLOY.md), or behind a password. Do not attach it to the public GitHub release.

## Build

```
cd app
npm install
echo "VITE_DEFAULT_SERVER=https://your-tabletop-forge.example" > .env.local   # optional default server
TTF_SRC=/path/to/dnd-vtt/frontend/src npm run build                            # TTF_SRC defaults to ../../dnd-vtt/frontend/src
```

Output: `sheet-dist/` (static files).

## Tabletop Forge requirement

The server needs the `crawler_state` column on creatures (added in Tabletop Forge's `backend/src/index.js` and `backend/src/routes/creatures.js`). Without it, the app still connects but crawler details are not kept between sessions.
