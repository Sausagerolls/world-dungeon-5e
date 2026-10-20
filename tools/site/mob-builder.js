/* World Dungeon · Mob Builder (GM area).
 *
 * Builds a 5e (2024) stat block plus the World Dungeon Crawl fields (see
 * bestiary/building-mobs.md), for a mob or an NPC crawler. Does the ability
 * maths, checks the numbers against the CR guide (extended past CR 30),
 * builds attacks and saving-throw effects, and fills NPC crawlers from
 * fighting-style presets scaled by level and floor. Output is a markdown file
 * for the bestiary/ folder. The draft is kept in this browser.
 * Needs window.WDB (bestiary.js) and window.BESTIARY (bestiary-data.js).
 */
(function () {
  'use strict';
  const root = document.getElementById('wd-mob-builder');
  if (!root || !window.WDB) return;
  const { esc, renderBlock, enhanceRolls } = window.WDB;

  // ------------------------------------------------------------ rules data
  const AB = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  const AB_NAME = { STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution', INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma' };
  const SKILLS = { Acrobatics: 'DEX', 'Animal Handling': 'WIS', Arcana: 'INT', Athletics: 'STR', Deception: 'CHA', History: 'INT', Insight: 'WIS', Intimidation: 'CHA', Investigation: 'INT', Medicine: 'WIS', Nature: 'INT', Perception: 'WIS', Performance: 'CHA', Persuasion: 'CHA', Religion: 'INT', 'Sleight of Hand': 'DEX', Stealth: 'DEX', Survival: 'WIS' };
  const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
  const SIZE_DIE = { Tiny: 4, Small: 6, Medium: 8, Large: 10, Huge: 12, Gargantuan: 20 };
  const TYPES = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
  const ALIGN = ['Unaligned', 'Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
  const LOOT_TYPES = ['Beast', 'Humanoid', 'Undead', 'Construct', 'Fiend', 'Aberration', 'Monstrosity', 'Dragon', 'Giant', 'Elemental', 'Fey', 'Ooze and Plant'];
  const TIERS = ['Trash', 'Standard', 'Elite', 'Boss', 'Floor Boss', 'Deity'];
  const TIER_XP = { Trash: 5, Standard: 10, Elite: 25, Boss: 100, 'Floor Boss': 200, Deity: 1000 };
  const DMG_TYPES = ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
  const BOX_RARITY = ['Bronze', 'Silver', 'Gold', 'Legendary', 'Celestial'];
  const mod = (s) => Math.floor((Number(s) - 10) / 2);
  const sg = (n) => (n >= 0 ? '+' : '−') + Math.abs(n);
  const n0 = (v, d) => (v === '' || v == null || !Number.isFinite(Number(v)) ? d : Number(v));
  const slug = (s) => String(s || 'mob').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mob';
  const NUMWORD = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
  const WORDNUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  // CR guide (bestiary/building-mobs.md). Rows: [cr, ac, hpLo, hpHi, atk, dprLo, dprHi, dc, xp]
  const BASE = [
    ['0', 13, 1, 6, 3, 0, 1, 13, 10], ['1/8', 13, 7, 35, 3, 2, 3, 13, 25], ['1/4', 13, 36, 49, 3, 4, 5, 13, 50], ['1/2', 13, 50, 70, 3, 6, 8, 13, 100],
    ['1', 13, 71, 85, 3, 9, 14, 13, 200], ['2', 13, 86, 100, 3, 15, 20, 13, 450], ['3', 13, 101, 115, 4, 21, 26, 13, 700], ['4', 14, 116, 130, 5, 27, 32, 14, 1100],
    ['5', 15, 131, 145, 6, 33, 38, 15, 1800], ['6', 15, 146, 160, 6, 39, 44, 15, 2300], ['7', 15, 161, 175, 6, 45, 50, 15, 2900], ['8', 16, 176, 190, 7, 51, 56, 16, 3900],
    ['9', 16, 191, 205, 7, 57, 62, 16, 5000], ['10', 17, 206, 220, 7, 63, 68, 16, 5900], ['11', 17, 221, 235, 8, 69, 74, 17, 7200], ['12', 17, 236, 250, 8, 75, 80, 17, 8400],
    ['13', 18, 251, 265, 8, 81, 86, 18, 10000], ['14', 18, 266, 280, 8, 87, 92, 18, 11500], ['15', 18, 281, 295, 8, 93, 98, 18, 13000], ['16', 18, 296, 310, 9, 99, 104, 18, 15000],
    ['17', 19, 311, 325, 10, 105, 110, 19, 18000], ['18', 19, 326, 340, 10, 111, 116, 19, 20000], ['19', 19, 341, 355, 10, 117, 122, 19, 22000], ['20', 19, 356, 400, 10, 123, 140, 19, 25000],
    ['21', 19, 401, 445, 11, 141, 158, 20, 33000], ['22', 19, 446, 490, 11, 159, 176, 20, 41000], ['23', 19, 491, 535, 11, 177, 194, 20, 50000], ['24', 19, 536, 580, 12, 195, 212, 21, 62000],
    ['25', 19, 581, 625, 12, 213, 230, 21, 75000], ['26', 19, 626, 670, 12, 231, 248, 21, 90000], ['27', 19, 671, 715, 13, 249, 266, 22, 105000], ['28', 19, 716, 760, 13, 267, 284, 22, 120000],
    ['29', 19, 761, 805, 13, 285, 302, 22, 135000], ['30', 19, 806, 850, 14, 303, 320, 23, 155000],
  ];
  const GUIDE = BASE.map((r) => ({ cr: r[0], ac: r[1], hpLo: r[2], hpHi: r[3], atk: r[4], dprLo: r[5], dprHi: r[6], dc: r[7], xp: r[8] }));
  for (let k = 1; k <= 170; k += 1) {
    const b = Math.floor(k / 3);
    GUIDE.push({ cr: String(30 + k), ac: 19 + b, hpLo: 806 + 45 * k, hpHi: 850 + 45 * k, atk: 14 + b, dprLo: 303 + 15 * k, dprHi: 320 + 15 * k, dc: 23 + b, xp: 155000 + 20000 * k });
  }
  const CRS = GUIDE.map((g) => g.cr);
  const crNum = (c) => (String(c).includes('/') ? Number(c.split('/')[0]) / Number(c.split('/')[1]) : Number(c));
  const pbForCr = (c) => (crNum(c) < 1 ? 2 : 2 + Math.floor((crNum(c) - 1) / 4));
  const rowOf = (c) => GUIDE.find((g) => g.cr === String(c)) || GUIDE[0];
  const idxOf = (c) => Math.max(0, CRS.indexOf(String(c)));
  // Crawler proficiency bonus by character level (rules/leveling.md).
  const pbForLevel = (L) => (L <= 20 ? 2 + Math.floor((Math.max(1, L) - 1) / 4) : 6 + Math.ceil((L - 20) / 10));

  // ------------------------------------------------------------ state
  const blank = () => ({
    mode: 'mob', name: '', size: 'Medium', type: 'Monstrosity', tags: '', alignment: 'Unaligned', role: '', flavour: '',
    ac: 12, acNote: '', hpCount: 2, hpDie: '', hpOverride: '', speed: '30 ft.', initOverride: '',
    scores: [10, 10, 10, 10, 10, 10], saves: [], skills: [], vuln: '', resist: '', immune: '', condImmune: '', senses: '', languages: '',
    cr: '1/2', crAuto: true, crExtra: '', dprOverride: '',
    traits: [], actions: [], bonus: [], reactions: [], legendary: [], legendaryCount: 3, extra: [],
    tier: 'Standard', level: '1', lootType: 'Monstrosity', lootTier: '1', lootNote: '', found: '', inspect: '',
    drops: '', boxRarity: 'Gold', boxType: 'Boss', trophy: '', achievement: '', bossNotes: '', tactics: '', audience: '', voice: '',
    floor: 1, variant: '', futureFloor: '', futureLevels: '',
    crawler: { style: 'bruiser', level: 5, history: '', race: '', cls: '', party: '', god: '', titles: '', followers: '', standing: '', sponsor: '', pk: false, skillsText: '', gearText: '', boxes: '', weaponRanks: '', attitude: 'Hostile', personality: '', want: '', trades: '', pet: [] },
  });
  const KEY = 'wd-mob-builder-draft';
  let st = blank();
  try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d) st = Object.assign(blank(), d, { crawler: Object.assign(blank().crawler, d.crawler || {}) }); } catch (e) { /* storage unavailable */ }
  const saveDraft = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage unavailable */ } };

  // ------------------------------------------------------------ derived numbers
  function derived() {
    const pb = st.mode === 'crawler' ? pbForLevel(n0(st.crawler.level, 1)) : pbForCr(st.cr);
    const m = st.scores.map(mod);
    const M = Object.fromEntries(AB.map((a, i) => [a, m[i]]));
    const die = n0(st.hpDie, SIZE_DIE[st.size] || 8);
    const count = Math.max(1, n0(st.hpCount, 1));
    const hpAvg = Math.max(1, Math.floor(count * (die + 1) / 2) + count * M.CON);
    const hp = n0(st.hpOverride, hpAvg);
    const skillRows = st.skills.filter((s) => SKILLS[s.name]).map((s) => ({ name: s.name, bonus: M[SKILLS[s.name]] + pb * (s.exp ? 2 : 1) }));
    const perc = skillRows.find((s) => s.name === 'Perception');
    const passive = 10 + (perc ? perc.bonus : M.WIS);
    const init = n0(st.initOverride, M.DEX);
    return { pb, M, die, count, hpAvg, hp, skillRows, passive, init };
  }
  const hpText = (D) => {
    const bonus = D.count * D.M.CON;
    const formula = `${D.count}d${D.die}${bonus ? (bonus > 0 ? ' + ' : ' − ') + Math.abs(bonus) : ''}`;
    return st.hpOverride !== '' && Number(st.hpOverride) !== D.hpAvg ? `${D.hp}` : `${D.hp} (${formula})`;
  };

  // Generated entries (attack and save builders) keep their spec in e.gen and are rewritten from the current numbers.
  function avgDice(expr) {
    let total = 0;
    String(expr || '').replace(/−/g, '-').replace(/\s+/g, '').replace(/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g, (mm, s1, n, sides, s2, flat) => {
      if (sides) total += (s1 === '-' ? -1 : 1) * Number(n || 1) * (Number(sides) + 1) / 2;
      else if (flat) total += (s2 === '-' ? -1 : 1) * Number(flat);
      return mm;
    });
    return Math.max(0, Math.floor(total));
  }
  const dmgPart = (dice, bonus, type) => {
    const b = Number(bonus) || 0;
    const expr = `${dice}${b ? (b > 0 ? ' + ' : ' − ') + Math.abs(b) : ''}`;
    return `${avgDice(dice) + b} (${expr}) ${type} damage`;
  };
  function genText(g, D) {
    const abil = g.ability === 'best' ? (D.M.STR >= D.M.DEX ? 'STR' : 'DEX') : g.ability;
    const am = D.M[abil] || 0;
    if (g.kind === 'save') {
      const dc = 8 + D.pb + am;
      const r = (g.rider || '').trim();
      const fail = g.dice ? `${dmgPart(g.dice, 0, g.type)}${r ? (/^(and|plus|or)\b/.test(r) ? ' ' : '. ') + r : ''}` : (r || 'The effect.');
      const succ = g.dice ? (g.half ? 'Half damage.' : 'No damage.') : '';
      return `*${AB_NAME[g.save]} Saving Throw:* DC ${dc}, ${g.target || 'one creature within 30 feet'}. *Failure:* ${fail.replace(/\.?$/, '.')}${succ ? ' *Success:* ' + succ : ''}`;
    }
    const atk = am + D.pb + (Number(g.magic) || 0);
    const label = g.kind === 'melee' ? 'Melee Attack Roll' : g.kind === 'ranged' ? 'Ranged Attack Roll' : 'Melee or Ranged Attack Roll';
    const ft = (x) => String(x).replace(/\.$/, '');
    const where = g.kind === 'melee' ? `reach ${ft(g.reach || '5 ft')}` : g.kind === 'ranged' ? `range ${ft(g.range || '80/320 ft')}` : `reach ${ft(g.reach || '5 ft')} or range ${ft(g.range || '20/60 ft')}`;
    let hit = dmgPart(g.dice || '1d6', am + (Number(g.magic) || 0), g.type || 'Bludgeoning');
    if (g.extraDice) hit += ` plus ${dmgPart(g.extraDice, 0, g.extraType || 'Fire')}`;
    return `*${label}:* ${sg(atk)}, ${where}. *Hit:* ${hit}${g.rider ? ', ' + g.rider.replace(/^,\s*/, '') : ''}.`.replace(/\.\.$/, '.');
  }
  const entryText = (e, D) => (e.gen ? genText(e.gen, D) : e.text || '');

  // CR check: defensive CR from HP and AC, offensive CR from damage per round and attack bonus or DC.
  function allEntries() { return [...st.traits, ...st.actions, ...st.bonus, ...st.reactions]; }
  function offence(D) {
    const texts = st.actions.map((e) => ({ name: e.name, t: entryText(e, D) }));
    let atk = 0, dc = 0;
    allEntries().forEach((e) => {
      const t = entryText(e, D);
      (t.match(/Attack Roll:\*?\s*([+−-]\d+)/g) || []).forEach((x) => { atk = Math.max(atk, Number(x.replace(/.*?([+−-]\d+)$/, '$1').replace('−', '-'))); });
      (t.match(/DC (\d+)/g) || []).forEach((x) => { dc = Math.max(dc, Number(x.slice(3))); });
    });
    const dmgOf = (t) => (t.match(/(\d+) \(\d*d\d+[^)]*\)/g) || []).reduce((a, x) => a + Number(x.split(' ')[0]), 0);
    const per = texts.map((x) => ({ name: x.name, dmg: dmgOf(x.t) }));
    const multi = texts.find((x) => /^Multiattack/i.test(x.name));
    let dpr = Math.max(0, ...per.map((p) => p.dmg));
    if (multi) {
      dpr = 0;
      const t = multi.t;
      per.forEach((p) => {
        if (!p.dmg || /^Multiattack/i.test(p.name)) return;
        const re = new RegExp('(one|two|three|four|five|six|seven|eight|\\d+)\\s+' + p.name.replace(/\s*\(.*\)$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const mm = t.match(re);
        if (mm) dpr += p.dmg * (NUMWORD[mm[1].toLowerCase()] || Number(mm[1]) || 1);
        else if (new RegExp(p.name.replace(/\s*\(.*\)$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(t)) dpr += p.dmg;
      });
      if (!dpr) dpr = Math.max(0, ...per.map((p) => p.dmg));
    }
    if (st.legendary.length) dpr += Math.max(0, ...st.legendary.map((e) => dmgOf(entryText(e, D))));
    if (st.mode === 'crawler' && st.crawler.pet.length) dpr += Math.max(0, ...st.crawler.pet.map((e) => dmgOf(entryText(e, D))));
    return { atk, dc, dpr: n0(st.dprOverride, dpr) };
  }
  function crCheck(D) {
    const o = offence(D);
    const hpIdx = Math.max(0, GUIDE.findIndex((g) => D.hp <= g.hpHi));
    const hpRow = hpIdx === -1 ? GUIDE.length - 1 : hpIdx;
    let def = hpRow + Math.trunc((st.ac - GUIDE[hpRow].ac) / 2);
    const dprIdx = GUIDE.findIndex((g) => o.dpr <= g.dprHi);
    const dRow = dprIdx === -1 ? GUIDE.length - 1 : dprIdx;
    const useDc = o.dc && (!o.atk || o.dc - GUIDE[dRow].dc > o.atk - GUIDE[dRow].atk);
    let off = dRow + Math.trunc(((useDc ? o.dc - GUIDE[dRow].dc : o.atk ? o.atk - GUIDE[dRow].atk : 0)) / 2);
    def = Math.max(0, Math.min(GUIDE.length - 1, def));
    off = Math.max(0, Math.min(GUIDE.length - 1, off));
    const avg = Math.round((def + off) / 2);
    return { o, def: GUIDE[def].cr, off: GUIDE[off].cr, suggested: GUIDE[avg].cr, gap: Math.abs(avg - idxOf(st.cr)) };
  }

  // ------------------------------------------------------------ markdown
  function metaLine() {
    const type = st.type + (st.tags ? ` (${st.tags})` : '');
    const parts = [`${st.size} ${type}`, st.alignment, `CR ${st.cr}`];
    if (st.mode === 'crawler') parts.push('Crawler');
    else if (st.role) parts.push(st.role);
    return parts.join(' · ');
  }
  const list = (arr, D) => arr.filter((e) => e.name || e.text || e.gen).map((e) => `- **${(e.name || 'Unnamed').replace(/\.$/, '')}.** ${entryText(e, D)}`);
  function lootText() {
    const note = st.lootNote || '';
    if (!st.lootType) return note || '—';
    const joined = !note ? '' : /^[\s,;(]/.test(note) ? note : '; ' + note;
    return `${st.lootType}, Tier ${st.lootTier}${/Boss/.test(st.tier) ? ' (as a boss)' : ''}${joined}`;
  }
  function toMarkdown() {
    const D = derived();
    const name = (st.name || 'Unnamed Mob') + (st.variant ? ` (${st.variant})` : '');
    const out = [`### Stat Block: ${name}`, `**${metaLine()}**`, ''];
    if (st.flavour) out.push(st.flavour, '');
    out.push('| | |', '|---|---|', `| **AC** | ${st.ac}${st.acNote ? ` (${st.acNote})` : ''} |`, `| **HP** | ${hpText(D)} |`, `| **Speed** | ${st.speed || '30 ft.'} |`, `| **Initiative** | ${sg(D.init)} (${10 + D.init}) |`, '');
    out.push('| | STR | DEX | CON | INT | WIS | CHA |', '|---|---|---|---|---|---|---|', `| **Score** | ${st.scores.join(' | ')} |`,
      `| **Mod / Save** | ${AB.map((a) => `${sg(D.M[a])} / ${sg(D.M[a] + (st.saves.includes(a) ? D.pb : 0))}`).join(' | ')} |`, '');
    out.push('| | |', '|---|---|');
    if (D.skillRows.length) out.push(`| **Skills** | ${D.skillRows.map((s) => `${s.name} ${sg(s.bonus)}`).join(', ')} |`);
    if (st.vuln) out.push(`| **Vulnerabilities** | ${st.vuln} |`);
    if (st.resist) out.push(`| **Resistances** | ${st.resist} |`);
    if (st.immune || st.condImmune) out.push(`| **Immunities** | ${[st.immune, st.condImmune].filter(Boolean).join('; ')} |`);
    out.push(`| **Senses** | ${st.senses ? st.senses + '; ' : ''}Passive Perception ${D.passive} |`);
    out.push(`| **Languages** | ${st.languages || 'None'} |`);
    out.push(`| **CR** | ${st.cr} (encounter XP ${rowOf(st.cr).xp.toLocaleString('en')}${st.crExtra || ''}; PB ${sg(D.pb)}) |`, '');
    out.push('| | |', '|---|---|', `| **Mob Tier** | ${st.tier} (${TIER_XP[st.tier].toLocaleString('en')} XP) |`, `| **Level** | ${st.level || '—'} |`,
      `| **Loot** | ${lootText()} |`,
      `| **Found** | ${st.found || (st.floor ? 'Floor ' + st.floor : '—')} |`, '');
    if (st.inspect) out.push(`> **Inspect:** *"${st.inspect.replace(/^"|"$/g, '')}"*`, '');
    const sec = (title, lines) => { if (lines.length) out.push(`#### ${title}`, '', ...lines, ''); };
    const prose = (title, text) => { if (text && text.trim()) out.push(`#### ${title}`, '', text.trim(), ''); };
    sec('Traits', list(st.traits, D));
    sec('Actions', list(st.actions, D));
    sec('Bonus Actions', list(st.bonus, D));
    sec('Reactions', list(st.reactions, D));
    if (st.legendary.length) {
      const who = st.name ? st.name.split(',')[0] : 'It';
      out.push('#### Legendary Actions', '', `${who} can take ${st.legendaryCount} legendary actions, choosing from the options below. Only one can be used at a time, and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.`, '', ...list(st.legendary, D), '');
    }
    if (st.mode === 'crawler') sec('Pet', list(st.crawler.pet, D));
    st.extra.forEach((x) => { if (x.entries && x.entries.length) sec(x.title, list(x.entries, D)); else prose(x.title, x.text); });
    prose('Drops', st.drops);
    if (/Boss/.test(st.tier) && (st.mode !== 'crawler' || st.trophy || st.achievement || st.bossNotes)) {
      const b = [`Boss Box (${st.boxRarity}${st.boxType && st.boxType !== 'Boss' ? ', ' + st.boxType : ''})`];
      if (st.trophy) b.push(`Boss Trophy: **${st.trophy}**`);
      if (st.achievement) b.push(`Achievement: ${st.achievement}`);
      if (st.bossNotes) b.push(st.bossNotes);
      prose('Boss', b.join(' · '));
    }
    if (st.mode === 'crawler') {
      const c = st.crawler;
      const kv = (pairs) => pairs.filter(([, v]) => v !== '' && v != null && v !== false).map(([k, v]) => `- **${k}.** ${v}`);
      sec('Crawler', kv([['Race and class', [c.race, c.cls].filter(Boolean).join(' ')], ['Level', `${c.level} (floor ${st.floor})`], ['Party', c.party], ['God', c.god], ['Titles on Inspect', c.titles], ['Crawler Skills', c.skillsText]]));
      sec('Fame', kv([['Followers', c.followers], ['Audience', c.standing], ['Sponsor', c.sponsor], ['Player Killer', c.pk ? 'Yes: the Player Killer mark shows on Inspect (see `loot-boxes`)' : '']]));
      sec('Gear', kv([['Weapons and ranks', c.weaponRanks], ['Notable items', c.gearText], ['Unopened boxes', c.boxes], ['When killed', 'Their inventory spills out, and the killer gets a Murder Box (see `loot-boxes`).']]));
      sec('Roleplay', kv([['Attitude', c.attitude], ['Personality', c.personality], ['Wants', c.want], ['Will trade', c.trades], ['History', c.history]]));
    }
    prose('Tactics', st.tactics);
    prose('Audience', st.audience);
    prose('Voice', st.voice);
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  const fileSlug = () => slug(st.name) + (st.variant ? '-' + slug(st.variant) : '');
  function fileText() {
    const id = fileSlug();
    const title = (st.name || 'Unnamed Mob') + (st.variant ? ` (${st.variant})` : '');
    return ['---', `type: ${st.mode === 'crawler' ? 'npc-crawler' : 'mob'}`, `id: ${id}`, `name: ${title.replace(/"/g, "'")}`, `floor: ${st.floor || 0}`, 'version: 0.1', 'status: draft', '---', '', `# ${title}`, '', toMarkdown(), ''].join('\n');
  }
  const folder = () => (st.mode === 'crawler' ? 'bestiary/crawlers/' : `bestiary/floor-${st.floor || 1}/`);

  // ------------------------------------------------------------ templates
  const atk = (name, kind, ability, dice, type, extra) => ({ name, gen: Object.assign({ kind, ability, dice, type, reach: '5 ft.', range: kind === 'ranged' ? '80/320 ft.' : '20/60 ft.', magic: 0, extraDice: '', extraType: 'Fire', rider: '' }, extra || {}) });
  const save = (name, saveAb, ability, dice, type, target, extra) => ({ name, gen: Object.assign({ kind: 'save', save: saveAb, ability, dice, type, target, half: true, rider: '' }, extra || {}) });
  const TEMPLATES = {
    trash: { label: 'Trash: pack critter (CR 1/8)', s: { name: 'Gutter Rat', size: 'Small', type: 'Beast', ac: 12, hpCount: 2, scores: [6, 14, 10, 3, 12, 4], senses: 'Darkvision 60 ft.', cr: '1/8', tier: 'Trash', lootType: 'Beast', speed: '30 ft., climb 20 ft.',
      traits: [{ name: 'Pack Tactics', text: 'The rat has advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn\'t have the Incapacitated condition.' }],
      actions: [atk('Bite', 'melee', 'DEX', '1d4', 'Piercing')], inspect: 'Gutter Rat. Level 1. There are more of them. There are always more of them.', tactics: 'Swarms the weakest-looking crawler. Flees when half the pack is dead.' } },
    brute: { label: 'Standard: brute (CR 1)', s: { name: 'Bruiser Mook', size: 'Medium', type: 'Humanoid', alignment: 'Chaotic Neutral', ac: 13, acNote: 'scrap armor', hpCount: 5, scores: [16, 10, 14, 8, 10, 8], cr: '1', tier: 'Standard', lootType: 'Humanoid',
      actions: [{ name: 'Multiattack', text: 'The mook makes two Pipe Wrench attacks.' }, atk('Pipe Wrench', 'melee', 'STR', '1d8', 'Bludgeoning')],
      tactics: 'Walks straight at the nearest crawler and hits it until it stops moving.' } },
    skirm: { label: 'Standard: skirmisher (CR 1/2)', s: { name: 'Corridor Stalker', size: 'Medium', type: 'Monstrosity', ac: 13, hpCount: 4, scores: [10, 16, 12, 6, 12, 6], skills: [{ name: 'Stealth', exp: false }], senses: 'Darkvision 60 ft.', speed: '40 ft.', cr: '1/2', tier: 'Standard',
      actions: [atk('Claws', 'melee', 'DEX', '1d6', 'Slashing'), atk('Spit Barb', 'ranged', 'DEX', '1d6', 'Piercing', { range: '30/90 ft.' })], bonus: [{ name: 'Skitter', text: 'The stalker takes the Disengage or Hide action.' }], tactics: 'Hits and hides. Never fights in the open.' } },
    caster: { label: 'Elite: caster (CR 3)', s: { name: 'Hedge Witch', size: 'Medium', type: 'Humanoid', alignment: 'Neutral Evil', ac: 12, hpCount: 9, scores: [8, 14, 12, 16, 12, 10], saves: ['INT', 'WIS'], skills: [{ name: 'Arcana', exp: false }], cr: '3', tier: 'Elite', lootType: 'Humanoid', languages: 'Common',
      actions: [{ name: 'Multiattack', text: 'The witch casts Hex Bolt twice.' }, atk('Hex Bolt', 'ranged', 'INT', '2d8', 'Necrotic', { range: '120 ft.' }), save('Curse Cloud (Recharge 5–6)', 'CON', 'INT', '4d8', 'Poison', 'each creature in a 15-foot-radius Sphere within 60 feet')],
      reactions: [{ name: 'Blink', text: '*Trigger:* The witch is hit by an attack roll. *Response:* She teleports up to 20 feet to a space she can see, and the attack misses.' }], tactics: 'Stays at range behind her minions. Opens with Curse Cloud on the biggest group.' } },
    boss: { label: 'Boss: neighbourhood boss (CR 3)', s: { name: 'Neighbourhood Boss', size: 'Large', type: 'Monstrosity', ac: 14, acNote: 'natural armor', hpCount: 10, scores: [18, 12, 16, 6, 12, 10], cr: '3', role: 'Boss', tier: 'Boss', level: '3',
      traits: [{ name: 'Boss Mechanic', text: 'Describe the trick the room teaches (see *Bosses and Hints* in `floor-1-overview`).' }],
      actions: [{ name: 'Multiattack', text: 'The boss makes two Slam attacks.' }, atk('Slam', 'melee', 'STR', '1d10', 'Bludgeoning', { reach: '10 ft.' }), save('Signature Move (Recharge 5–6)', 'DEX', 'STR', '3d6', 'Bludgeoning', 'each creature in a 15-foot Cone')],
      trophy: 'Its Golden Something', achievement: '***Neighborhood Watch*** (Major)', tactics: 'Uses the room. Saves the Signature Move for groups.' } },
    floorboss: { label: 'Floor Boss (CR 5)', s: { name: 'Floor Boss', size: 'Huge', type: 'Giant', ac: 15, acNote: 'natural armor', hpCount: 12, scores: [20, 10, 18, 8, 12, 12], saves: ['STR', 'CON'], cr: '5', role: 'Floor Boss', tier: 'Floor Boss', level: '4', lootType: 'Giant',
      traits: [{ name: 'Legendary Resistance (1/Day)', text: 'If it fails a saving throw, it can choose to succeed instead.' }],
      actions: [{ name: 'Multiattack', text: 'It makes two Smash attacks.' }, atk('Smash', 'melee', 'STR', '2d8', 'Bludgeoning', { reach: '10 ft.' })],
      legendary: [{ name: 'Stomp', text: 'It moves up to half its speed, and each creature it moves next to makes a DC 15 Dexterity saving throw or has the Prone condition.' }], legendaryCount: 2,
      achievement: '***Floor Boss Down*** (Major)', bossNotes: 'Guards the main stairwell.' } },
  };

  // ------------------------------------------------------------ NPC crawler presets
  const BANDS = [[1, 2], [3, 5], [6, 9], [10, 14], [15, 18]];
  const bandOf = (f) => Math.max(0, BANDS.findIndex(([a, b]) => f >= a && f <= b)) || (f > 18 ? 4 : 0);
  const RANK = [{ to: 0, dice: 0, label: 'I' }, { to: 1, dice: 0, label: 'II' }, { to: 1, dice: 1, label: 'III' }, { to: 2, dice: 1, label: 'IV' }, { to: 3, dice: 2, label: 'V' }];
  const BOXES = ['1 Bronze Adventurer box', '1 Bronze and 1 Silver box', '2 Silver boxes', '1 Silver and 1 Gold box', '2 Gold boxes'];
  const addDice = (dice, extra) => (extra ? dice.replace(/^(\d+)d/, (mm, n) => `${Number(n) + extra}d`) : dice);
  const swings = (L) => 1 + (L >= 5) + (L >= 11) + (L >= 20) + Math.floor(Math.max(0, L - 20) / 40);
  const cantripDice = (L) => 1 + (L >= 5) + (L >= 11) + (L >= 17) + Math.floor(Math.max(0, L - 17) / 20);
  const bigDice = (L) => 3 + Math.floor(L / 2);
  const multi = (who, n, what) => ({ name: 'Multiattack', text: `${who} makes ${WORDNUM[n] || n} ${what} attacks.` });
  const STYLES = {
    bruiser: { label: 'Bruiser / Tank', order: ['STR', 'CON', 'WIS', 'DEX', 'CHA', 'INT'], die: 10, cls: 'Fighter (Champion)', skills: ['Bodyguard', 'Tough as Nails', 'Powerful Strike'],
      ac: (b, M) => [15, 17, 18, 19, 20][b] + 2, acNote: (b) => ['scrap plate and a riot shield', 'chain mail and a shield', 'splint armor and a shield', 'plate armor and a +1 shield', '+2 plate and a +2 shield'][b],
      weapon: (b) => [['Fire Axe', '1d8', 'Slashing'], ['Warhammer', '1d8', 'Bludgeoning'], ['Warhammer', '1d8', 'Bludgeoning'], ['named warhammer', '1d8', 'Bludgeoning'], ['named warhammer', '1d8', 'Bludgeoning']][b],
      gear: (b) => ['Riot Shield, Steel-Toe Boots, 2 healing potions', 'Riot Shield, Champion\'s Belt, Protein Shake ×2', 'Kevlar Vest under the plate, Pet Barding (for nobody), 3 healing potions', 'a Boss Trophy worn as a pauldron, Stat Potion', 'Manual of Limits, a Celestial relic shard'][b],
      traits: (c) => [{ name: 'Hard to Kill (1/Day)', text: `When ${c.he} drop to 0 hit points, ${c.he} drop to 1 instead.` }, { name: 'Bodyguard', text: `When an ally within 5 feet of ${c.him} is hit by an attack, ${c.he} can use a reaction to take the damage instead.` }],
      extra: (c) => [save('Shield Slam (Recharge 5–6)', 'STR', 'STR', `${2 + Math.floor(c.L / 4)}d6`, 'Bludgeoning', 'one creature within 5 feet', { rider: 'and the Prone condition' })],
      bonus: (c) => [{ name: 'Taunt', text: `One creature within 30 feet that can hear ${c.him} makes a DC ${c.dc('CHA') + 2} Wisdom saving throw. *Failure:* It has disadvantage on attack rolls against anyone but ${c.name} until the end of its next turn.` }],
      tactics: 'Plants themself in the doorway and dares anyone to get past. Taunts the crawler who hits hardest, and guards the party\'s caster.', voice: '"Go on. Hit me. I\'ll wait."' },
    brawler: { label: 'Brawler', order: ['STR', 'DEX', 'CON', 'WIS', 'CHA', 'INT'], die: 10, cls: 'Monk (Warrior of the Open Hand)', skills: ['Iron Fist', 'Wrestler', 'Dirty Fighting'],
      ac: (b, M) => 10 + M.DEX + M.CON, acNote: () => 'no armor, just attitude',
      weapon: (b) => [['Unarmed Strike (taped fists)', '1d6', 'Bludgeoning'], ['Unarmed Strike (Brass Knuckles)', '1d8', 'Bludgeoning'], ['Unarmed Strike (Iron Knuckles)', '1d10', 'Bludgeoning'], ['Unarmed Strike (Thunder Gloves)', '1d10', 'Bludgeoning'], ['Unarmed Strike (Thunder Gloves)', '1d12', 'Bludgeoning']][b],
      gear: (b) => ['Hand Wraps, a lucky bandana, Protein Shake', 'Brass Knuckles, Hand Wraps, Protein Shake ×2', 'Iron Knuckles, Champion\'s Belt', 'Thunder Gloves, Champion\'s Belt, Stat Potion', 'Thunder Gloves, Champion\'s Belt, Manual of Limits'][b],
      traits: (c) => [{ name: 'Iron Fist', text: `${c.His} unarmed strikes count as magical, and ${c.he} can make one extra Unarmed Strike as a bonus action.` }],
      extra: (c) => [save('Suplex', 'STR', 'STR', `${2 + Math.floor(c.L / 4)}d8`, 'Bludgeoning', 'one creature it is grappling', { rider: 'and the Prone condition. The grapple ends' })],
      bonus: (c) => [{ name: 'Grab', text: `${c.Name} grapples one creature within 5 feet (escape DC ${c.dc('STR')}).` }],
      tactics: 'Closes the gap fast, grabs the squishiest crawler and suplexes them. Loves an audience and always plays to the camera.', voice: '"Ding ding, round one!"' },
    sharp: { label: 'Sharpshooter / Gunslinger', order: ['DEX', 'WIS', 'CON', 'STR', 'INT', 'CHA'], die: 8, cls: 'Fighter (Battle Master)', skills: ['Dead Eye', 'Gunslinger', 'Night Eyes'], ranged: true,
      ac: (b, M) => [11, 12, 12, 13, 14][b] + Math.min(M.DEX, b >= 2 ? 99 : 5) + (b >= 2 ? 2 : 0), acNote: (b) => ['leather jacket', 'studded leather', 'Kevlar Vest', 'Kevlar Vest +1', 'Kevlar Vest +2'][b],
      weapon: (b) => [['Junk Pistol', '1d8', 'Piercing', '30/90 ft.'], ['Revolver', '2d8', 'Piercing', '40/120 ft.'], ['Sniper Rifle', '2d12', 'Piercing', '300/1,200 ft.'], ['Assault Rifle', '2d8', 'Piercing', '120/480 ft.'], ['Six-Shooter of the Last Stand', '2d8', 'Piercing', '40/120 ft.']][b],
      gear: (b) => ['Junk Pistol, Nail Gun, Box of Rounds', 'Revolver, Hunting Rifle, Speed Loader, Holster', 'Sniper Rifle with Scope and Suppressor, Revolver', 'Assault Rifle with Laser Sight and Extended Magazine, Hand Cannon', 'Six-Shooter of the Last Stand, Railgun'][b],
      traits: (c) => [{ name: 'Dead Eye', text: `${c.Name}'s ranged attacks ignore half cover and three-quarters cover, and don't have disadvantage at long range.` }],
      extra: (c) => [{ name: 'Called Shot (Recharge 5–6)', text: `${c.Name} makes one ranged attack with advantage. On a hit, it deals an extra ${avgDice(`${2 + Math.floor(c.L / 3)}d6`)} (${2 + Math.floor(c.L / 3)}d6) damage, and the target has the Prone condition or drops what it is holding (${c.name}'s choice).` }],
      bonus: (c) => [{ name: 'Quick Draw', text: `${c.Name} reloads, or swaps weapons, and moves up to 10 feet without provoking opportunity attacks.` }],
      tactics: 'Finds high ground and a long corridor before the fight starts. Shoots casters first, then whoever runs at them.', voice: '"Nothing personal. You were just standing in my sightline."' },
    demo: { label: 'Demolitionist', order: ['DEX', 'INT', 'CON', 'WIS', 'STR', 'CHA'], die: 8, cls: 'Rogue (Thief)', skills: ['Demolitionist', 'Bomb Surgeon', 'Pitcher\'s Arm'], ranged: true,
      ac: (b, M) => [11, 12, 12, 13, 14][b] + Math.min(M.DEX, 5), acNote: (b) => ['hi-vis vest', 'studded leather and Blast Goggles', 'Blast Shield and studded leather', 'Blast Shield and +1 studded leather', '+2 studded leather'][b],
      weapon: (b) => [['Crowbar', '1d6', 'Bludgeoning'], ['Shortsword', '1d6', 'Piercing'], ['Shortsword', '1d6', 'Piercing'], ['Shortsword', '1d6', 'Piercing'], ['Shortsword', '1d6', 'Piercing']][b], melee: true, finesse: true,
      bomb: (b) => [['Molotov', '2d6', 'Fire', '5-foot-radius Sphere'], ['Frag Grenade', '5d6', 'Piercing', '20-foot-radius Sphere'], ['Cluster Bomb', '3d6', 'Fire', 'four 10-foot-radius Spheres'], ['Bunker Buster', '8d6', 'Fire', '30-foot-radius Sphere'], ['Hellfire Barrel', '10d6', 'Fire', '40-foot-radius Sphere']][b],
      gear: (b) => ['Pipe Bomb ×6, Molotov ×4, Firecracker Bundle ×3, Fuse Kit', 'Frag Grenade ×4, Sticky Bomb ×2, Smoke Bomb ×2, Detonator, Bomb Bandolier', 'Cluster Bomb ×2, Remote Charge ×4, Land Mine ×3, Demolition Gloves', 'Bunker Buster, Thermite Charge ×2, Gravity Grenade ×2, Blast Shield', 'Hellfire Barrel, Mini Sun (one, for emergencies), Satchel of Endless Pipe Bombs'][b],
      traits: (c) => [{ name: 'Bomb Surgeon', text: `${c.Name} has advantage on saving throws against explosives, and takes no damage from them on a successful save.` }],
      extraFn: (c) => { const [nm, dice, type, area] = STYLES.demo.bomb(c.b); return [save(`${nm} (3/Day)`, 'DEX', 'DEX', addDice(dice, Math.floor(c.L / 10)), type, `each creature in a ${area} within 90 feet`), save('Pipe Bomb', 'DEX', 'DEX', addDice('3d6', Math.floor(c.L / 10)), 'Piercing', 'each creature in a 10-foot-radius Sphere within 60 feet')]; },
      bonus: (c) => [{ name: 'Cook the Fuse', text: `${c.Name} plants a Proximity or Remote charge in an empty space within 5 feet. It uses the Pipe Bomb above when it goes off.` }],
      tactics: 'Mines the corridor before the fight, then throws from behind cover. Happy to blow up their own party if it gets a crawler too.', voice: '"Everybody back! No, further! FURTHER!"' },
    tome: { label: 'Tome Caster', order: ['INT', 'CON', 'DEX', 'WIS', 'CHA', 'STR'], die: 6, cls: 'Wizard (Evoker)', skills: ['Tome Scholar', 'Mana Well', 'Signature Spell'], caster: 'INT',
      ac: (b, M) => 10 + M.DEX + [0, 1, 2, 3, 4][b], acNote: (b) => ['cardigan', 'robe of the Tome Scholar', 'mage armor', '+1 mage armor and a ring', '+2 mage armor and a ring'][b],
      gear: (b) => ['a battered tome, Mana Potion ×2', 'tome with 12 spells, Mana Potion ×3, Ink of Copying', 'tome with 20 spells, Greater Mana Potion ×2, Mana Crystal', 'tome with 30 spells, Superior Mana Potion ×2, Manual of Limits', 'tome with every spell they could find, Supreme Mana Potion ×2'][b],
      spells: (c) => [atk('Fire Bolt', 'ranged', 'INT', `${cantripDice(c.L)}d10`, 'Fire', { range: '120 ft.' }), save('Signature Spell (Recharge 5–6)', 'DEX', 'INT', `${bigDice(c.L)}d6`, 'Fire', 'each creature in a 20-foot-radius Sphere within 150 feet')],
      traits: (c) => [{ name: 'Mana Shield', text: `When ${c.name} takes damage, ${c.he} can spend mana instead of hit points: ${c.pb * 5} damage per long rest.` }],
      reactions: (c) => [{ name: 'Counter-Read', text: `*Trigger:* A creature within 60 feet casts a spell. *Response:* The caster makes a DC ${c.dc('INT')} Intelligence saving throw. *Failure:* The spell fails, and its mana is spent.` }],
      tactics: 'Stays at the back, fireballs the biggest cluster, and counters the other side\'s caster. Runs when a melee crawler gets close.', voice: '"Page forty-two. Oh, you\'ll like page forty-two."' },
    healer: { label: 'Healer / Support', order: ['WIS', 'CON', 'STR', 'DEX', 'CHA', 'INT'], die: 8, cls: 'Cleric (Life Domain)', skills: ['First Aid', 'Hype Man', 'Tough as Nails'], caster: 'WIS',
      ac: (b, M) => [14, 16, 17, 18, 19][b] + Math.min(M.DEX, 2) + 2, acNote: (b) => ['scrap armor and a trash-can lid', 'scale mail and a shield', 'half plate and a shield', 'half plate +1 and a shield', 'half plate +2 and a shield'][b],
      weapon: (b) => [['Mace (a frying pan)', '1d6', 'Bludgeoning'], ['Mace', '1d6', 'Bludgeoning'], ['Mace', '1d6', 'Bludgeoning'], ['Mace', '1d6', 'Bludgeoning'], ['Mace', '1d6', 'Bludgeoning']][b], melee: true,
      gear: (b) => ['Survival Kit, Blessed Bandage ×3', 'Blessed Bandage ×4, Shrine Candle, healing potions ×3', 'Blessed Bandage ×5, Prayer Card, Halo of Light', 'Angel Feather, Divine Favor Token ×2', 'Angel Feather, Pet Revival Stone, Relic Shard'][b],
      spells: (c) => [{ name: 'Patch Up', text: `One creature ${c.name} can see within 60 feet regains ${avgDice(`${2 + Math.floor(c.L / 3)}d8`) + c.M.WIS} (${2 + Math.floor(c.L / 3)}d8 + ${c.M.WIS}) hit points.` }, save('Searing Word', 'CON', 'WIS', `${cantripDice(c.L) + 1}d8`, 'Radiant', 'one creature within 60 feet')],
      bonus: (c) => [{ name: 'Rally', text: `Each ally within 30 feet that can hear ${c.him} gains ${c.L + c.M.WIS} temporary hit points.` }],
      tactics: 'Keeps the party alive from second rank: heals whoever is lowest, rallies before the big hit. Kill the healer first, or kill everyone twice.', voice: '"Walk it off. No, really, I\'ve fixed your legs. Walk."' },
    skirm: { label: 'Skirmisher / Assassin', order: ['DEX', 'CHA', 'CON', 'WIS', 'INT', 'STR'], die: 8, cls: 'Rogue (Assassin)', skills: ['Backstab', 'Sneak', 'Escape Artist'],
      ac: (b, M) => [11, 12, 12, 13, 14][b] + Math.min(M.DEX, 99), acNote: (b) => ['dark hoodie', 'studded leather', 'studded leather and Shadow Goggles', '+1 studded leather', '+2 studded leather and a Hitman\'s Suit'][b],
      weapon: (b) => [['Kitchen Knife', '1d4', 'Piercing'], ['Rapier', '1d8', 'Piercing'], ['Rapier', '1d8', 'Piercing'], ['named rapier', '1d8', 'Piercing'], ['named rapier', '1d8', 'Piercing']][b], melee: true, finesse: true,
      gear: (b) => ['Kitchen Knife ×3, Smoke Bomb, Masterwork Lockpicks', 'Rapier, Weapon Oil (poison), Smoke Bomb ×2', 'Bloodstained Knife, Mask of Anonymity, Weapon Oil ×3', 'Hitman\'s Suit, Bounty Contract, Reaper\'s Ledger Page', 'Shovel of Quick Burial, Guilty Conscience (not theirs)'][b],
      traits: (c) => [{ name: 'Backstab', text: `Once per turn, ${c.name} deals an extra ${avgDice(`${Math.ceil(c.L / 2)}d6`)} (${Math.ceil(c.L / 2)}d6) damage to a creature ${c.he} hit with advantage, or that has one of ${c.his} allies within 5 feet of it.` }],
      extra: (c) => [save('Poisoned Blade (3/Day)', 'CON', 'DEX', `${1 + Math.floor(c.L / 3)}d10`, 'Poison', 'one creature hit by the blade this turn', { rider: 'and the Poisoned condition for 1 minute' })],
      bonus: (c) => [{ name: 'Vanish', text: `${c.Name} takes the Disengage, Dash or Hide action. ${c.He} can hide while only lightly obscured.` }],
      tactics: 'Never starts the fight: waits for one, then stabs whoever is busy. Disappears when spotted and comes back in two rounds.', voice: '"Don\'t turn around."' },
    pet: { label: 'Pet Master', order: ['WIS', 'CHA', 'DEX', 'CON', 'STR', 'INT'], die: 8, cls: 'Ranger (Beast Master)', skills: ['Pet Trainer', 'Forager', 'Hype Man'], ranged: true,
      ac: (b, M) => [11, 12, 13, 14, 15][b] + Math.min(M.DEX, 2) + 1, acNote: (b) => ['cargo shorts and confidence', 'hide armor', 'scale mail', 'scale mail +1', 'scale mail +2'][b],
      weapon: (b) => [['Sling', '1d4', 'Bludgeoning', '30/120 ft.'], ['Shortbow', '1d6', 'Piercing', '80/320 ft.'], ['Longbow', '1d8', 'Piercing', '150/600 ft.'], ['Stormstring Bow', '1d8', 'Piercing', '150/600 ft.'], ['Stormstring Bow', '1d8', 'Piercing', '150/600 ft.']][b],
      gear: (b) => ['Pet Treats, Squeaky Toy, Leash of Command', 'Premium Pet Food, Pet Barding, Pet Collar of Returning', 'Pet Carrier, Pet Evolution Crystal, Premium Pet Food ×3', 'Pet Revival Stone, a second Pet Egg', 'Pet Evolution Crystal ×2, Pet Revival Stone'][b],
      petFn: (c) => { const ph = Math.max(10, Math.round(c.hp * 0.6)); const pa = c.M.WIS + c.pb; const pd = `${1 + Math.floor(c.L / 6)}d10`; return [
        { name: `${c.petName} (pet)`, text: `${c.petKind}. AC ${12 + Math.min(6, c.b * 2)}, HP ${ph}, speed 40 ft. Acts on ${c.name}'s turn. ${c.Name} can command it as a bonus action; otherwise it Dodges.` },
        { name: `${c.petName}'s Bite`, text: `*Melee Attack Roll:* ${sg(pa)}, reach 5 ft. *Hit:* ${avgDice(pd) + c.M.WIS} (${pd} + ${c.M.WIS}) Piercing damage, and the target has the Prone condition if it is Large or smaller.` }]; },
      bonus: (c) => [{ name: 'Sic \'Em', text: `${c.petName} makes one Bite attack, and moves up to its speed first.` }],
      reactions: (c) => [{ name: 'Protect the Pet', text: `*Trigger:* ${c.petName} is hit by an attack. *Response:* ${c.petName} takes half the damage, and ${c.name} takes the rest.` }],
      tactics: 'Sends the pet at whoever is closest and shoots from behind it. Goes berserk if the pet is hurt: the audience loves it.', voice: '"Who\'s a good boy? You are! Now eat him."' },
    blaster: { label: 'Elemental Blaster', order: ['INT', 'DEX', 'CON', 'WIS', 'CHA', 'STR'], die: 6, cls: 'Sorcerer (Draconic)', skills: ['Quick Cast', 'Mana Well', 'Signature Spell'], caster: 'INT',
      ac: (b, M) => 10 + M.DEX + [1, 2, 3, 3, 4][b], acNote: (b) => ['flame-scorched apron', 'mage armor', 'mage armor and a ring', '+1 mage armor', '+2 mage armor'][b],
      gear: (b) => ['Flare Gun, Mana Potion ×2', 'Mana Potion ×3, Mana Crystal', 'Greater Mana Potion ×2, Plasma Caster', 'Superior Mana Potion ×2, Mana Crystal ×2', 'Supreme Mana Potion ×2, Mini Sun (as a spell focus)'][b],
      spells: (c) => [atk('Elemental Bolt', 'ranged', 'INT', `${cantripDice(c.L)}d10`, c.el, { range: '120 ft.' }), save(`${c.el} Burst (Recharge 5–6)`, c.el === 'Lightning' ? 'DEX' : c.el === 'Cold' ? 'CON' : 'DEX', 'INT', `${bigDice(c.L)}d6`, c.el, 'each creature in a 20-foot-radius Sphere within 150 feet'), save(`${c.el} Wall (1/Day)`, 'DEX', 'INT', `${2 + Math.floor(c.L / 4)}d8`, c.el, 'each creature in a 60-foot-long, 10-foot-high wall, and each creature that ends its turn next to it')],
      traits: (c) => [{ name: 'Overcharge', text: `When ${c.name} rolls ${c.el} damage, ${c.he} can reroll any 1s once.` }],
      bonus: (c) => [{ name: 'Quick Cast', text: `${c.Name} casts Elemental Bolt.` }],
      tactics: `Blasts the biggest group of crawlers from as far away as possible, and sets the room on fire (or ice, or lightning). Glass cannon: one good hit sends ${'them'} running.`, voice: '"Stand closer together. It\'s more efficient."' },
    control: { label: 'Controller / Illusionist', order: ['CHA', 'INT', 'DEX', 'CON', 'WIS', 'STR'], die: 8, cls: 'Bard (College of Glamour)', skills: ['Smooth Talker', 'Trash Talk', 'Crowd Pleaser'], caster: 'CHA',
      ac: (b, M) => 11 + M.DEX + [0, 1, 1, 2, 3][b], acNote: (b) => ['sequined jacket', 'leather armor', 'Silk Robe of Distraction', '+1 leather and a Silk Robe of Distraction', '+2 leather'][b],
      gear: (b) => ['Megaphone, Breath Mints, Perfume of First Impressions', 'Liar\'s Tie, Silver Lozenge, Talk Show Mic', 'Silk Robe of Distraction, Smoldering Gaze Potion', 'Crown of the Talk Show Host, Celebrity Status', 'Crown of the Talk Show Host, Signed Photo of the System'][b],
      spells: (c) => [save('Mind Spike', 'WIS', 'CHA', `${2 + Math.floor(c.L / 3)}d8`, 'Psychic', 'one creature within 120 feet', { rider: `and ${c.name} knows where it is for 1 hour` }),
        save('Vicious Mockery', 'WIS', 'CHA', `${cantripDice(c.L)}d6`, 'Psychic', 'one creature within 60 feet that can hear', { rider: 'and disadvantage on its next attack roll' }),
        save('Hypnotic Pattern (Recharge 5–6)', 'WIS', 'CHA', '', '', 'each creature in a 30-foot Cube within 120 feet', { rider: 'The Charmed and Incapacitated conditions for 1 minute, or until it takes damage or someone uses an action to shake it awake', half: false }),
        save('Wall of Faces (1/Day)', 'CHA', 'CHA', '', '', 'each creature that tries to pass through an illusory wall up to 60 feet long', { rider: 'It can\'t pass, and has the Frightened condition until the end of its next turn', half: false })],
      reactions: (c) => [{ name: 'Mirror Image', text: `*Trigger:* ${c.Name} is targeted by an attack. *Response:* Roll a d6. On a 4 or higher, the attack hits an illusory duplicate instead, and the duplicate vanishes. ${c.He} have ${Math.min(5, 3 + c.b)} duplicates per long rest.` }],
      tactics: 'Splits the party: charms the heavy hitters, walls off the healer, and talks the rest into fighting each other. Never fights fair, never fights alone.', voice: '"You don\'t want to hit me. You want to hit him."' },
    necro: { label: 'Necromancer / Summoner', order: ['INT', 'WIS', 'CON', 'DEX', 'CHA', 'STR'], die: 6, cls: 'Wizard (Necromancer)', skills: ['Tome Scholar', 'Mana Shield', 'Iron Stomach'], caster: 'INT',
      ac: (b, M) => 10 + M.DEX + [1, 2, 3, 3, 4][b], acNote: (b) => ['bone necklace and a bathrobe', 'mage armor', 'Bone Shield', '+1 Bone Shield', '+2 Bone Shield'][b],
      gear: (b) => ['a box of mystery bones, Mana Potion', 'Shovel of Quick Burial, Mana Potion ×2', 'Reaper\'s Ledger Page, Greater Mana Potion ×2', 'Boss Core Fragment, Superior Mana Potion ×2', 'a Relic Shard that whispers, Supreme Mana Potion ×2'][b],
      spells: (c) => [atk('Chill Touch', 'ranged', 'INT', `${cantripDice(c.L)}d10`, 'Necrotic', { range: '120 ft.', rider: 'and the target can\'t regain hit points until the start of ' + c.name + '\'s next turn' }),
        { name: 'Raise Minions (Recharge 5–6)', text: `${c.Name} raises ${2 + c.b} minions (use a Trash stat block of about CR ${['1/4', '1', '3', '6', '10'][c.b]}) in empty spaces within 30 feet. They act right after ${c.him} and obey ${c.his} commands. Minions are summoned: they give no XP and drop no loot.` }],
      traits: (c) => [{ name: 'Bone Shield', text: `While ${c.name} has at least one minion within 30 feet, ${c.he} have resistance to all damage.` }],
      bonus: (c) => [{ name: 'Command', text: `Each of ${c.his} minions moves up to its speed and makes one attack.` }],
      reactions: (c) => [{ name: 'Body Double', text: `*Trigger:* ${c.Name} is hit by an attack while a minion is within 5 feet. *Response:* The minion takes the hit instead.` }],
      tactics: 'Hides behind a wall of minions and raises the dead crawlers too. Kill the necromancer and the minions drop.', voice: '"Don\'t worry. You\'ll work for me after this."' },
    battle: { label: 'Battle Mage / Divine Champion', order: ['STR', 'CHA', 'CON', 'WIS', 'DEX', 'INT'], die: 10, cls: 'Paladin (Oath of Glory)', skills: ['Spellblade', 'Powerful Strike', 'Dramatic Entrance'], caster: 'CHA',
      ac: (b, M) => [15, 17, 18, 19, 20][b] + 2, acNote: (b) => ['hockey pads and a stop sign', 'chain mail and a shield', 'splint and a shield', 'plate and a +1 shield', '+2 plate and a shield'][b],
      weapon: (b) => [['Longsword (a machete)', '1d8', 'Slashing'], ['Longsword', '1d8', 'Slashing'], ['Longsword', '1d8', 'Slashing'], ['named longsword', '1d8', 'Slashing'], ['named longsword', '1d8', 'Slashing']][b],
      gear: (b) => ['Shrine Candle, Prayer Card, 2 healing potions', 'Prayer Card, Halo of Light, Mana Potion', 'Divine Favor Token, Angel Feather', 'divine gear of their god, Divine Favor Token ×2', 'divine gear of their god, a Relic Shard'][b],
      traits: (c) => [{ name: 'Divine Smite', text: `Once per turn, when ${c.name} hits with a melee attack, ${c.he} can deal an extra ${avgDice(`${2 + Math.floor(c.L / 4)}d8`)} (${2 + Math.floor(c.L / 4)}d8) Radiant damage. ${c.He} can do this ${c.pb} times per long rest.` },
        { name: 'Divine Shield', text: `${c.Name} and allies within 10 feet add ${Math.max(1, c.M.CHA)} to their saving throws.` }],
      extra: (c) => [save('Spellblade Burst (Recharge 5–6)', 'DEX', 'CHA', `${bigDice(c.L) - 1}d6`, 'Radiant', 'each creature in a 15-foot Emanation')],
      bonus: (c) => [{ name: 'Dramatic Entrance', text: `${c.Name} moves up to ${c.his} speed toward an enemy and has advantage on the next attack this turn. Once per fight.` }],
      tactics: 'Kicks the door in, smites the biggest threat, and shields their friends. Fights for their god as loudly as possible.', voice: '"In the name of my god, and my sponsor: CHARGE!"' },
  };
  const FIRST = ['Brenda', 'Marcus', 'Priya', 'Dave', 'Tilly', 'Ozzie', 'Femi', 'Jun', 'Rosa', 'Gary', 'Imani', 'Lars', 'Nadia', 'Theo', 'Bea', 'Sven', 'Keisha', 'Mo', 'Ines', 'Wendell'];
  const HANDLE = ['Big Shovel', 'the Wall', 'Two-Shot', 'Boom', 'Grandma', 'No Refunds', 'the Intern', 'Sparkles', 'Knuckles', 'Doc', 'the Vibe', 'Lucky', 'Crypto', 'Sudden', 'Mild', 'Ten-Toes', 'Ma\'am', 'Wet Floor', 'Encore', 'Spreadsheet'];
  const LAST = ['Okafor', 'Lindqvist', 'Patel', 'Brannigan', 'Moreau', 'Kowalski', 'Nakamura', 'Ferreira', 'Doyle', 'Haddad', 'Mbeki', 'Novak', 'Quinn', 'Reyes', 'Szabo'];
  const RACES = ['Human', 'Elf', 'Dwarf', 'Orc', 'Halfling', 'Gnome', 'Dragonborn', 'Tiefling', 'Goliath', 'Aasimar'];
  const PETS = ['Bruno, a dire badger', 'Princess, a hellhound puppy', 'Mr. Biscuits, a war pig', 'Kevin, a giant crab', 'Duchess, an owlbear cub', 'Spike, a velociraptor'];
  const ELEMENTS = ['Fire', 'Cold', 'Lightning'];
  const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
  const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

  // Every entry a preset writes is marked, so a levelled-up version can tell the GM's own additions apart.
  function generateCrawler(styleId, L, floor, keep) {
    const out = buildCrawler(styleId, L, floor, keep);
    ['traits', 'actions', 'bonus', 'reactions'].forEach((k) => { out[k] = out[k].map((e) => Object.assign(e, { preset: true })); });
    out.crawler.pet = out.crawler.pet.map((e) => Object.assign(e, { preset: true }));
    return out;
  }
  function buildCrawler(styleId, L, floor, keep) {
    const S = STYLES[styleId];
    const b = bandOf(floor);
    // Seeded by name and style only, so a levelled-up version keeps its race, element and pet.
    const seed = hashStr((keep.name || '') + styleId);
    const race = floor < 3 ? 'Human' : (keep.raceChosen && keep.race ? keep.race : pick(RACES, seed >> 4));
    const name = keep.name || `${pick(FIRST, seed)} "${pick(HANDLE, seed >> 3)}" ${pick(LAST, seed >> 6)}`;
    const short = /"/.test(name) ? name.split(' ')[0] : /^The /.test(name) ? name : name.split(/[ ,]/)[0];
    // Ability scores: 15, 14, 13, 12, 10, 8 by the style's order, then L Stat Points, weighted to the main abilities.
    const base = [15, 14, 13, 12, 10, 8];
    const w = [0.45, 0.25, 0.15, 0.05, 0.05, 0.05];
    const sc = {};
    let spent = 0;
    S.order.forEach((a, i) => { const add = Math.floor(L * w[i]); sc[a] = base[i] + add; spent += add; });
    sc[S.order[0]] += L - spent;
    const scores = AB.map((a) => sc[a]);
    const M = Object.fromEntries(AB.map((a) => [a, mod(sc[a])]));
    const pb = pbForLevel(L);
    const hp = Math.max(1, Math.floor(L * (S.die + 1) / 2) + L * M.CON);
    const c = { L, b, pb, M, hp, name: short, Name: short, he: 'they', He: 'They', him: 'them', his: 'their', His: 'Their',
      dc: (a) => 8 + pb + M[a], petName: (keep.petName || pick(PETS, seed).split(',')[0]), petKind: (pick(PETS, seed).split(', ')[1] || 'a beast').replace(/^a /, 'A '), el: pick(ELEMENTS, seed >> 2) };
    const rank = RANK[b];
    const actions = [];
    const n = swings(L);
    if (S.weapon) {
      const [wn, dice, type, range] = S.weapon(b);
      const kind = S.ranged && range ? 'ranged' : 'melee';
      const ability = S.finesse || styleId === 'brawler' ? 'DEX' : kind === 'ranged' ? 'DEX' : 'STR';
      const wname = wn.replace(/^named /, `${short}'s `);
      const e = atk(wname.charAt(0).toUpperCase() + wname.slice(1), kind, styleId === 'brawler' ? (M.STR >= M.DEX ? 'STR' : 'DEX') : ability, addDice(dice, rank.dice), type, { range: range || '20/60 ft.', magic: rank.to });
      if ((!S.caster || styleId === 'battle') && n > 1) actions.push(multi(short, n, e.name));
      actions.push(e);
    }
    if (S.spells) actions.push(...S.spells(c));
    if (S.extra) actions.push(...S.extra(c));
    if (S.extraFn) actions.push(...S.extraFn(c));
    const casts = 1 + (L >= 11) + (L >= 20) + Math.floor(Math.max(0, L - 20) / 40);
    if (S.caster && !S.weapon && casts > 1) actions.unshift({ name: 'Multiattack', text: `${short} casts ${actions[0].name} ${casts === 2 ? 'twice' : (WORDNUM[casts] || casts) + ' times'}.` });
    const skillLvl = Math.min(15, 1 + Math.floor(L / 8));
    const skillsText = S.skills.map((s, i) => `${s} ${Math.max(1, skillLvl - i * 2)}`).join(', ');
    const cls = floor < 3 ? 'Crawler (no class yet)' : S.cls.replace(/^(\w+)/, `$1 ${Math.min(20, L)}`) + (L > 20 ? ` + ${L - 20} prestige` : '');
    const followers = Math.round(Math.pow(L, 1.7) * 120 * (1 + (seed % 5) / 4));
    const skillList = { bruiser: ['Athletics', 'Intimidation'], brawler: ['Athletics', 'Acrobatics'], sharp: ['Perception', 'Stealth'], demo: ['Sleight of Hand', 'Investigation'], tome: ['Arcana', 'History'], healer: ['Medicine', 'Insight'], skirm: ['Stealth', 'Deception'], pet: ['Animal Handling', 'Survival'], blaster: ['Arcana', 'Intimidation'], control: ['Persuasion', 'Deception'], necro: ['Arcana', 'Religion'], battle: ['Athletics', 'Persuasion'] }[styleId];
    const saves = [S.order[0], S.order[1]].filter((a, i, arr) => arr.indexOf(a) === i);
    const tierDefault = keep.tier || 'Elite';
    return {
      mode: 'crawler', name, size: 'Medium', type: 'Humanoid', tags: race, alignment: keep.alignment && keep.alignment !== 'Unaligned' ? keep.alignment : 'Chaotic Neutral', role: '',
      flavour: `A level ${L} crawler and ${S.label.toLowerCase()}${floor < 3 ? ', still in whatever they were wearing when the world ended' : ''}.`,
      ac: S.ac(b, M), acNote: S.acNote(b), hpCount: L, hpDie: String(S.die), hpOverride: '', speed: styleId === 'brawler' ? `${30 + 5 * Math.min(6, Math.floor(L / 4))} ft.` : '30 ft.', initOverride: '',
      scores, saves, skills: skillList.map((s) => ({ name: s, exp: L >= 9 })), vuln: '', resist: '', immune: '', condImmune: '', senses: '', languages: 'Common',
      crAuto: true, cr: '1', dprOverride: '',
      traits: S.traits ? S.traits(c) : [], actions, bonus: S.bonus ? S.bonus(c) : [], reactions: S.reactions ? S.reactions(c) : [], legendary: [], legendaryCount: 3, extra: [],
      tier: tierDefault, level: String(L), lootType: 'Humanoid', lootTier: String(Math.min(4, 1 + Math.floor(L / 25))), lootNote: 'and their whole inventory (see Gear)', found: keep.found || `Floor ${floor}`,
      inspect: `${name}. Level ${L} ${race} ${floor < 3 ? 'Crawler' : S.cls.split(' ')[0]}. ${followers.toLocaleString('en')} followers. ${pick(['Currently trending.', 'Sponsored.', 'The System has flagged them as "entertaining".', 'Has killed other crawlers. Probably.', 'Fan favourite.'], seed >> 5)}`,
      drops: keep.drops || '', boxRarity: 'Gold', boxType: 'Boss', trophy: '', achievement: '', bossNotes: '', tactics: keep.tactics || S.tactics, audience: keep.audience || 'Beating them in front of their own fans: +1 Audience. Sparing them on camera can be worth more.', voice: keep.voice || S.voice,
      floor, variant: keep.variant || '', futureFloor: '', futureLevels: '',
      crawler: { style: styleId, level: L, race, history: keep.history || '', cls, party: keep.party || '', god: floor < 3 ? '' : (keep.god || ''), titles: keep.titles || '', followers: followers.toLocaleString('en'), standing: ['Unknown', 'Rising', 'Popular', 'Famous', 'A household name'][b], sponsor: floor < 3 ? '' : (keep.sponsor || 'None yet'), pk: !!keep.pk,
        skillsText, gearText: S.gear(b), boxes: BOXES[b], weaponRanks: S.weapon ? `${S.weapon(b)[0].replace(/^named /, short + "'s ")} (rank ${rank.label})` : 'Spells (rank ' + rank.label + ')', attitude: keep.attitude || 'Hostile', personality: keep.personality || '', want: keep.want || '', trades: keep.trades || '',
        pet: S.petFn ? S.petFn(c) : [] },
    };
  }

  // ------------------------------------------------------------ clone from the Bestiary
  function fromBestiary(m) {
    const f = m.fields, s = blank();
    const vm = f.name.match(/^(.*) \((Floor \d+)\)$/);
    s.name = vm ? vm[1] : f.name;
    s.variant = vm ? vm[2] : '';
    const meta = f.meta.split('·').map((x) => x.trim());
    const st0 = (meta[0] || '').match(/^(\w+)\s+([^(]+?)(?:\s*\((.+)\))?$/);
    if (st0) { s.size = st0[1]; s.type = st0[2].trim(); s.tags = st0[3] || ''; }
    s.alignment = meta[1] || s.alignment;
    s.cr = (meta.find((x) => x.startsWith('CR ')) || 'CR 1').slice(3);
    s.role = meta.find((x) => x === 'Boss' || x === 'Floor Boss') || '';
    s.mode = meta.includes('Crawler') ? 'crawler' : 'mob';
    s.crAuto = false;
    s.flavour = f.flavour;
    const kv = f.kv;
    const ac = (kv.AC || '').match(/^(\d+)(?:\s*\((.+)\))?/);
    if (ac) { s.ac = Number(ac[1]); s.acNote = ac[2] || ''; }
    const hp = (kv.HP || '').match(/^(\d+)(?:\s*\((\d+)d(\d+)[^)]*\))?/);
    if (hp) { s.hpCount = Number(hp[2] || 1); s.hpDie = hp[3] || ''; s.hpOverride = hp[1]; }
    s.speed = kv.Speed || s.speed;
    s.scores = f.scores.slice();
    s.saves = f.saves.slice();
    const D0 = { M: Object.fromEntries(AB.map((a, i) => [a, mod(s.scores[i])])), pb: pbForCr(s.cr) };
    const ini = (kv.Initiative || '').match(/^([+−-]\d+)/);
    if (ini) { const v = Number(ini[1].replace('−', '-')); if (v !== D0.M.DEX) s.initOverride = String(v); }
    s.skills = (kv.Skills || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => {
      const mm = x.match(/^(.+?)\s+([+−-]\d+)$/);
      if (!mm || !SKILLS[mm[1]]) return null;
      const v = Number(mm[2].replace('−', '-'));
      return { name: mm[1], exp: v - D0.M[SKILLS[mm[1]]] >= 2 * D0.pb };
    }).filter(Boolean);
    s.vuln = kv.Vulnerabilities || '';
    s.resist = kv.Resistances || '';
    const imm = (kv.Immunities || '').split(';');
    s.immune = (imm[0] || '').trim(); s.condImmune = (imm[1] || '').trim();
    s.senses = (kv.Senses || '').replace(/;?\s*Passive Perception \d+/, '').trim();
    s.languages = kv.Languages || '';
    const tier = (f.crawl['Mob Tier'] || '').match(/^(Floor Boss|Trash|Standard|Elite|Boss|Deity)/);
    s.tier = tier ? tier[1] : (s.role || 'Standard');
    s.level = f.crawl.Level || '';
    const loot = (f.crawl.Loot || '').match(/^([^,]+), Tier (\d)(.*)$/);
    if (loot) { s.lootType = loot[1]; s.lootTier = loot[2]; s.lootNote = loot[3].replace(/^\s*\(as a boss\)/, '').replace(/^;\s*/, ''); } else { s.lootType = ''; s.lootNote = f.crawl.Loot || ''; }
    const crx = (kv.CR || '').match(/encounter XP [\d,]+(, or [^;]+)?;/);
    s.crExtra = crx && crx[1] ? crx[1] : '';
    s.found = f.crawl.Found || '';
    s.inspect = f.inspect || '';
    s.floor = m.floor || 0;
    const keys = { Traits: 'traits', Actions: 'actions', 'Bonus Actions': 'bonus', Reactions: 'reactions', 'Legendary Actions': 'legendary' };
    const prose = { Drops: 'drops', Tactics: 'tactics', Audience: 'audience', Voice: 'voice' };
    f.sections.forEach((sec) => {
      const entries = sec.entries.map((e) => ({ name: e.name, text: e.text }));
      if (keys[sec.title]) s[keys[sec.title]] = entries;
      else if (prose[sec.title]) s[prose[sec.title]] = [sec.text, ...sec.entries.map((e) => `- **${e.name}.** ${e.text}`)].filter(Boolean).join('\n');
      else if (sec.title === 'Boss') s.bossNotes = sec.text;
      else if (sec.title === 'Pet') s.crawler.pet = entries;
      else if (['Crawler', 'Fame', 'Gear', 'Roleplay'].includes(sec.title) && s.mode === 'crawler') {
        const g = Object.fromEntries(sec.entries.map((e) => [e.name, e.text]));
        const c = s.crawler;
        if (sec.title === 'Crawler') { const rc = (g['Race and class'] || '').split(' '); c.race = rc[0] || ''; c.cls = rc.slice(1).join(' '); c.level = num(g.Level) || c.level; c.party = g.Party || ''; c.god = g.God || ''; c.titles = g['Titles on Inspect'] || ''; c.skillsText = g['Crawler Skills'] || ''; }
        if (sec.title === 'Fame') { c.followers = g.Followers || ''; c.standing = g.Audience || ''; c.sponsor = g.Sponsor || ''; c.pk = !!g['Player Killer']; }
        if (sec.title === 'Gear') { c.weaponRanks = g['Weapons and ranks'] || ''; c.gearText = g['Notable items'] || ''; c.boxes = g['Unopened boxes'] || ''; }
        if (sec.title === 'Roleplay') { c.attitude = g.Attitude || ''; c.personality = g.Personality || ''; c.want = g.Wants || ''; c.trades = g['Will trade'] || ''; c.history = g.History || ''; }
      } else s.extra.push({ title: sec.title, entries, text: sec.text });
    });
    if (s.legendary.length) {
      const sec = f.sections.find((x) => x.title === 'Legendary Actions');
      const mm = sec && sec.text.match(/take (\d+) legendary/);
      if (mm) s.legendaryCount = Number(mm[1]);
    }
    if (s.mode === 'crawler') {
      // Builder-made crawlers say their style in the description ("A level 9 crawler and demolitionist").
      const fl = (f.flavour || '').toLowerCase();
      const hit = Object.entries(STYLES).find(([, v]) => fl.includes('crawler and ' + v.label.toLowerCase()));
      if (hit) s.crawler.style = hit[0];
      s.crawler.level = num(s.level) || s.crawler.level;
      // Assume the clone's entries came from its preset, so a level-up replaces rather than duplicates them.
      ['traits', 'actions', 'bonus', 'reactions'].forEach((k) => { s[k].forEach((e) => { e.preset = true; }); });
      s.crawler.pet.forEach((e) => { e.preset = true; });
    }
    if (s.bossNotes) { s.boxRarity = (s.bossNotes.match(/Boss Box \((\w+)/) || [])[1] || 'Gold'; s.boxType = 'Boss'; }
    return s;
  }
  const num = (t) => { const mm = String(t || '').match(/\d+/); return mm ? Number(mm[0]) : 0; };

  // ------------------------------------------------------------ form
  const F = (label, path, opts) => {
    opts = opts || {};
    const v = get(path);
    const cls = 'wmb-f' + (opts.full ? ' full' : '');
    if (opts.options) return `<label class="${cls}">${label}<select data-p="${path}">${opts.options.map((o) => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}"${String(v) === String(val) ? ' selected' : ''}>${esc(lab)}</option>`; }).join('')}</select></label>`;
    if (opts.area) return `<label class="${cls}">${label}<textarea data-p="${path}" rows="${opts.rows || 2}" placeholder="${esc(opts.ph || '')}">${esc(v)}</textarea></label>`;
    if (opts.check) return `<label class="${cls}" style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" data-p="${path}"${v ? ' checked' : ''}>${label}</label>`;
    return `<label class="${cls}">${label}<input data-p="${path}" value="${esc(v)}" ${opts.num ? 'inputmode="numeric"' : ''} placeholder="${esc(opts.ph || '')}"></label>`;
  };
  function get(path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), st); }
  function set(path, val) {
    const ks = path.split('.');
    let o = st;
    ks.slice(0, -1).forEach((k) => { o = o[k]; });
    o[ks[ks.length - 1]] = val;
  }
  const SECTION_LABELS = { traits: 'Traits', actions: 'Actions', bonus: 'Bonus Actions', reactions: 'Reactions', legendary: 'Legendary Actions', 'crawler.pet': 'Pet (mini stat block)' };
  function entriesHtml(key) {
    const arr = get(key);
    const D = derived();
    return `<fieldset><legend>${SECTION_LABELS[key]}</legend>
      ${key === 'legendary' ? `<div class="wmb-grid">${F('Legendary actions per round', 'legendaryCount', { num: true })}</div>` : ''}
      ${arr.map((e, i) => `<div class="wmb-entry">
        <div class="row"><input data-p="${key}.${i}.name" value="${esc(e.name)}" placeholder="Name (e.g. Bite, or Pack Tactics)"><button type="button" class="x" data-act="up" data-key="${key}" data-i="${i}" title="Move up">↑</button><button type="button" class="x" data-act="del" data-key="${key}" data-i="${i}" title="Remove">×</button></div>
        ${e.gen ? genForm(key, i, e.gen) + `<p class="wmb-hint" data-gen="${key}.${i}">${esc(entryText(e, D))}</p><button type="button" class="wdb-btn" data-act="unlock" data-key="${key}" data-i="${i}">Edit as text</button>`
        : `<textarea data-p="${key}.${i}.text" rows="3" placeholder="Rules text. Use *Melee Attack Roll:* +5 ... *Hit:* 7 (1d8 + 3) Piercing damage, or the attack builder.">${esc(e.text)}</textarea>`}
      </div>`).join('')}
      <div class="wmb-top"><button type="button" class="wdb-btn" data-act="add" data-key="${key}">+ Text entry</button>
      ${key !== 'traits' ? `<button type="button" class="wdb-btn" data-act="addatk" data-key="${key}">+ Attack</button><button type="button" class="wdb-btn" data-act="addsave" data-key="${key}">+ Saving throw effect</button>` : ''}</div>
    </fieldset>`;
  }
  function genForm(key, i, g) {
    const p = `${key}.${i}.gen`;
    const abil = [['best', 'Best of STR/DEX'], ...AB.map((a) => [a, a])];
    if (g.kind === 'save') {
      return `<div class="wmb-atk"><div class="wmb-grid">
        ${F('Save', p + '.save', { options: AB.map((a) => [a, AB_NAME[a]]) })}${F('DC from', p + '.ability', { options: AB })}
        ${F('Damage dice', p + '.dice', { ph: '3d6 (blank for none)' })}${F('Damage type', p + '.type', { options: DMG_TYPES })}
        ${F('Half on success', p + '.half', { check: true })}</div><div class="wmb-grid wide">
        ${F('Target / area', p + '.target', { ph: 'each creature in a 15-foot Cone' })}${F('Extra on failure', p + '.rider', { ph: 'and the Prone condition' })}</div></div>`;
    }
    return `<div class="wmb-atk"><div class="wmb-grid">
      ${F('Kind', p + '.kind', { options: [['melee', 'Melee'], ['ranged', 'Ranged'], ['both', 'Melee or ranged']] })}${F('Ability', p + '.ability', { options: abil })}
      ${F('Damage dice', p + '.dice', { ph: '1d8' })}${F('Damage type', p + '.type', { options: DMG_TYPES })}
      ${F('Reach', p + '.reach', { ph: '5 ft.' })}${F('Range', p + '.range', { ph: '80/320 ft.' })}
      ${F('Magic / rank bonus', p + '.magic', { num: true })}${F('Extra dice', p + '.extraDice', { ph: '1d6' })}${F('Extra type', p + '.extraType', { options: DMG_TYPES })}</div>
      <div class="wmb-grid wide">${F('Extra on hit', p + '.rider', { ph: 'and the target has the Grappled condition (escape DC 13)' })}</div></div>`;
  }

  function formHtml() {
    const D = derived();
    const crawler = st.mode === 'crawler';
    const clones = (window.BESTIARY || []).slice().sort((a, b) => a.name.localeCompare(b.name));
    return `
    <div class="wmb-mode"><button type="button" data-mode="mob" class="${crawler ? '' : 'on'}">Mob</button><button type="button" data-mode="crawler" class="${crawler ? 'on' : ''}">NPC Crawler</button></div>
    ${crawler ? '' : '<p class="wmb-hint">Building another crawler, or levelling one up for a later floor? Switch to <b>NPC Crawler</b>.</p>'}
    <div class="wmb-top">
      ${crawler ? '' : `<select data-act="template"><option value="">Start from a template…</option>${Object.entries(TEMPLATES).map(([k, t]) => `<option value="${k}">${esc(t.label)}</option>`).join('')}</select>`}
      <select data-act="clone"><option value="">Clone from the Bestiary…</option>${clones.map((m) => `<option value="${esc(m.id)}">${esc(m.name)} (${esc(m.tier || '?')}, CR ${esc(m.cr)})</option>`).join('')}</select>
      <button type="button" class="wdb-btn" data-act="new">${pendingNew ? 'Click again to clear everything' : 'New (clear)'}</button>
    </div>
    ${crawler ? `<fieldset><legend>Fighting style preset</legend>
      <div class="wmb-grid">${F('Style', 'crawler.style', { options: Object.entries(STYLES).map(([k, s]) => [k, s.label]) })}${F('Crawler level', 'crawler.level', { num: true })}${F('Floor', 'floor', { num: true })}${F('Mob Tier', 'tier', { options: TIERS })}</div>
      <p class="wmb-hint">Fills the whole stat block, gear and tactics for this style, level and floor. Name, race, party and the Roleplay fields are kept. Everything stays editable afterwards.</p>
      <div class="wmb-top"><button type="button" class="wdb-btn primary" data-act="generate">Generate from preset</button><button type="button" class="wdb-btn" data-act="rename">Random name</button></div>
      <div class="wmb-grid" style="margin-top:8px">${F('Future floor', 'futureFloor', { num: true, ph: String(n0(st.floor, 1) + 1) })}${F('Levels gained (blank = 11 per floor)', 'futureLevels', { num: true })}</div>
      <p class="wmb-hint">Meeting them again later? <b>Level up for a future floor</b> makes their next version: same name, race, pet, element, party, roleplay and tactics, plus anything you added by hand, with stats, gear, fame and boxes for the new floor. Download it as its own file (it gets <i>(Floor N)</i> in its name), so the original stays in the Bestiary too.</p>
      <div class="wmb-top"><button type="button" class="wdb-btn primary" data-act="levelup">Level up for a future floor</button>${st.variant ? `<span class="wmb-hint">This is the ${esc(st.variant)} version. ${esc(st.crawler.history || '')}</span>` : ''}</div></fieldset>` : ''}
    <form class="wmb-form" onsubmit="return false">
    <fieldset><legend>Identity</legend><div class="wmb-grid">
      ${F('Name', 'name', { ph: crawler ? 'Brenda "Big Shovel" Okafor' : 'Bad Llama' })}${F('Size', 'size', { options: SIZES })}${F('Creature type', 'type', { options: TYPES })}${F('Tags', 'tags', { ph: crawler ? 'Human' : 'Goblinoid' })}
      ${F('Alignment', 'alignment', { options: ALIGN })}${crawler ? '' : F('Role', 'role', { options: [['', 'Normal'], ['Boss', 'Boss'], ['Floor Boss', 'Floor Boss']] })}</div>
      <div class="wmb-grid wide">${F('Description', 'flavour', { area: true, full: true, ph: 'A llama, but bad.' })}</div></fieldset>
    <fieldset><legend>Defence</legend><div class="wmb-grid">
      ${F('AC', 'ac', { num: true })}${F('AC note', 'acNote', { ph: 'natural armor' })}${F('Hit Dice (count)', 'hpCount', { num: true })}${F(`Hit die (d${SIZE_DIE[st.size] || 8} for ${st.size})`, 'hpDie', { options: [['', 'By size'], ...[4, 6, 8, 10, 12, 20].map((x) => [String(x), 'd' + x])] })}
      ${F(`HP (blank = ${D.hpAvg})`, 'hpOverride', { num: true })}${F('Speed', 'speed', { ph: '30 ft., fly 60 ft.' })}${F(`Initiative (blank = ${sg(D.M.DEX)})`, 'initOverride', { num: true })}</div></fieldset>
    <fieldset><legend>Abilities</legend><div class="wmb-abil">${AB.map((a, i) => `<div><b>${a}</b><input type="number" data-p="scores.${i}" value="${st.scores[i]}"><small data-d="mod.${a}">${sg(D.M[a])}</small><label class="sv"><input type="checkbox" data-save="${a}"${st.saves.includes(a) ? ' checked' : ''}>save</label></div>`).join('')}</div>
      <p class="wmb-hint">Proficiency bonus <b data-d="pb">${sg(D.pb)}</b> (${crawler ? 'from crawler level' : 'from CR'}). Saves add it when ticked.</p>
      <div class="wmb-grid">${Object.keys(SKILLS).map((k) => { const s = st.skills.find((x) => x.name === k); return `<label class="wmb-f" style="flex-direction:row;gap:5px;align-items:center;text-transform:none"><select data-skill="${esc(k)}" style="width:auto;padding:2px"><option value="">–</option><option value="p"${s && !s.exp ? ' selected' : ''}>Prof</option><option value="e"${s && s.exp ? ' selected' : ''}>Exp</option></select>${esc(k)}</label>`; }).join('')}</div></fieldset>
    <fieldset><legend>Senses and resistances</legend><div class="wmb-grid wide">
      ${F('Vulnerabilities', 'vuln', { ph: 'Fire' })}${F('Resistances', 'resist', { ph: 'Bludgeoning, Piercing' })}${F('Damage immunities', 'immune', { ph: 'Poison' })}${F('Condition immunities', 'condImmune', { ph: 'Charmed, Poisoned' })}
      ${F('Senses (Passive Perception is added)', 'senses', { ph: 'Darkvision 60 ft.' })}${F('Languages', 'languages', { ph: 'Common, Goblin' })}</div></fieldset>
    <fieldset><legend>Challenge</legend><div class="wmb-grid">
      ${F('CR', 'cr', { options: CRS })}${F('Set CR from the guide', 'crAuto', { check: true })}${F('Damage per round (blank = estimate)', 'dprOverride', { num: true })}</div>
      <p class="wmb-hint">The CR check (right) estimates damage per round from your actions and Multiattack. Override it if the estimate is off (save effects on several targets, auras).</p></fieldset>
    ${entriesHtml('traits')}${entriesHtml('actions')}${entriesHtml('bonus')}${entriesHtml('reactions')}${entriesHtml('legendary')}${crawler ? entriesHtml('crawler.pet') : ''}
    ${st.extra.map((x, i) => `<fieldset><legend>${esc(x.title)} (from the clone)</legend>${x.entries.length ? x.entries.map((e, j) => `<div class="wmb-entry"><div class="row"><input data-p="extra.${i}.entries.${j}.name" value="${esc(e.name)}"></div><textarea data-p="extra.${i}.entries.${j}.text" rows="3">${esc(e.text)}</textarea></div>`).join('') : `<textarea data-p="extra.${i}.text" rows="4" style="width:100%">${esc(x.text)}</textarea>`}<button type="button" class="wdb-btn" data-act="delextra" data-i="${i}">Remove section</button></fieldset>`).join('')}
    <fieldset><legend>Crawl fields</legend><div class="wmb-grid">
      ${F('Mob Tier', 'tier', { options: TIERS.map((t) => [t, `${t} (${TIER_XP[t].toLocaleString('en')} XP)`]) })}${F('Level (on Inspect)', 'level', { ph: '3' })}${F('Floor', 'floor', { num: true })}
      ${F('Loot table', 'lootType', { options: [['', 'No loot table (note only)'], ...LOOT_TYPES] })}${F('Loot tier', 'lootTier', { options: ['1', '2', '3', '4'] })}</div>
      <div class="wmb-grid wide">${F('Loot note', 'lootNote', { ph: 'plus every piece of junk armor it drops' })}${F('Found', 'found', { ph: 'Floor 2 · The Food Court (packs of 3–6)' })}
      ${F('Inspect text', 'inspect', { area: true, full: true, ph: 'Name. Level 3. One joke. One true hint.' })}
      ${F('Drops', 'drops', { area: true, full: true, ph: 'Monster Parts, keys, a recipe…' })}</div></fieldset>
    ${/Boss/.test(st.tier) ? `<fieldset><legend>Boss extras</legend><div class="wmb-grid">${F('Boss Box rarity', 'boxRarity', { options: BOX_RARITY })}${F('Box type', 'boxType', { ph: 'Boss' })}${F('Boss Trophy', 'trophy', { ph: 'Golden Fleece' })}</div>
      <div class="wmb-grid wide">${F('Achievements', 'achievement', { ph: '***Neighborhood Watch*** (Major), plus ***Name*** (Notable): how' })}${F('Boss room, mechanics and hints', 'bossNotes', { area: true, full: true, ph: 'Mechanics and hints: see Boss Room: …' })}</div></fieldset>` : ''}
    ${crawler ? `<fieldset><legend>Crawler identity</legend><div class="wmb-grid">${F('Race', 'crawler.race')}${F('Class', 'crawler.cls')}${F('Party', 'crawler.party', { ph: 'The Wet Floor Boys' })}${F('God', 'crawler.god', { ph: 'none' })}</div>
      <div class="wmb-grid wide">${F('Titles on Inspect', 'crawler.titles', { ph: 'Clown Hunter, Mop Boy' })}${F('Crawler Skills', 'crawler.skillsText')}</div></fieldset>
      <fieldset><legend>Fame</legend><div class="wmb-grid">${F('Followers', 'crawler.followers')}${F('Audience standing', 'crawler.standing')}${F('Sponsor', 'crawler.sponsor')}${F('Player Killer mark', 'crawler.pk', { check: true })}</div></fieldset>
      <fieldset><legend>Gear and loot</legend><div class="wmb-grid wide">${F('Weapons and ranks', 'crawler.weaponRanks')}${F('Unopened boxes', 'crawler.boxes')}${F('Notable items', 'crawler.gearText', { area: true, full: true })}</div></fieldset>
      <fieldset><legend>Roleplay</legend><div class="wmb-grid">${F('Attitude', 'crawler.attitude', { options: ['Hostile', 'Wary', 'Neutral', 'Friendly', 'Desperate'] })}</div><div class="wmb-grid wide">${F('Personality', 'crawler.personality', { area: true })}${F('Wants', 'crawler.want', { area: true })}${F('Will trade', 'crawler.trades', { area: true })}</div></fieldset>` : ''}
    <fieldset><legend>Tactics and the show</legend><div class="wmb-grid wide">${F('Tactics', 'tactics', { area: true, full: true, ph: 'How it fights, who it targets, when it runs.' })}${F('Audience', 'audience', { area: true, full: true, ph: 'Ways of beating it the audience loves.' })}${F('Voice', 'voice', { area: true, full: true, ph: '"A line it says."' })}</div></fieldset>
    </form>`;
  }

  // ------------------------------------------------------------ layout
  let pendingNew = false;
  root.innerHTML = `<div class="wmb"><div class="wmb-left"></div><div class="wmb-side">
    <div class="wmb-check"></div>
    <div class="wmb-top"><button type="button" class="wdb-btn primary" data-act="download">Download .md</button><button type="button" class="wdb-btn" data-act="copy">Copy markdown</button><span class="wmb-hint wmb-where"></span></div>
    <div class="wdb-preview"></div>
    <details><summary class="wmb-hint">Markdown</summary><textarea class="wmb-md" readonly></textarea></details></div></div>`;
  const left = root.querySelector('.wmb-left');
  const drawForm = () => { left.innerHTML = formHtml(); };

  function refresh() {
    const D = derived();
    if (st.crAuto) {
      const c = crCheck(D);
      if (c.suggested !== st.cr) { st.cr = c.suggested; const sel = left.querySelector('[data-p="cr"]'); if (sel) sel.value = st.cr; }
    }
    const D2 = derived();
    const c = crCheck(D2);
    const row = rowOf(st.cr);
    const mark = (ok) => (ok ? '<span class="ok">✓</span>' : '<span class="warn">!</span>');
    root.querySelector('.wmb-check').innerHTML = `<b>CR check</b> · chosen CR ${esc(st.cr)} · suggested <b>${esc(c.suggested)}</b> (defence ${esc(c.def)}, offence ${esc(c.off)})
      ${c.gap >= 2 ? ' <span class="warn">— more than one step off</span>' : ''}
      <table><tr><th></th><th>This mob</th><th>CR ${esc(st.cr)} guide</th><th></th></tr>
      <tr><td>AC</td><td>${st.ac}</td><td>${row.ac}</td><td>${mark(Math.abs(st.ac - row.ac) <= 2)}</td></tr>
      <tr><td>HP</td><td>${D2.hp}</td><td>${row.hpLo}–${row.hpHi}</td><td>${mark(D2.hp >= row.hpLo * 0.7 && D2.hp <= row.hpHi * 1.3)}</td></tr>
      <tr><td>Attack</td><td>${c.o.atk ? sg(c.o.atk) : '—'}</td><td>${sg(row.atk)}</td><td>${c.o.atk ? mark(Math.abs(c.o.atk - row.atk) <= 2) : ''}</td></tr>
      <tr><td>Save DC</td><td>${c.o.dc || '—'}</td><td>${row.dc}</td><td>${c.o.dc ? mark(Math.abs(c.o.dc - row.dc) <= 2) : ''}</td></tr>
      <tr><td>Damage / round</td><td>${c.o.dpr}</td><td>${row.dprLo}–${row.dprHi}</td><td>${mark(c.o.dpr >= row.dprLo * 0.7 && c.o.dpr <= row.dprHi * 1.3)}</td></tr></table>
      <div class="wmb-hint">Mob Tier ${esc(st.tier)}: ${TIER_XP[st.tier].toLocaleString('en')} XP per crawler · encounter XP ${row.xp.toLocaleString('en')} · PB ${sg(D2.pb)}${st.crAuto ? ' · CR follows the guide (untick to set it yourself)' : ''}</div>`;
    left.querySelectorAll('[data-d]').forEach((el) => {
      const k = el.dataset.d;
      if (k === 'pb') el.textContent = sg(D2.pb);
      else if (k.startsWith('mod.')) el.textContent = sg(D2.M[k.slice(4)]);
    });
    left.querySelectorAll('[data-gen]').forEach((el) => { const e = get(el.dataset.gen); if (e) el.textContent = entryText(e, D2); });
    const md = toMarkdown();
    root.querySelector('.wmb-md').value = fileText();
    const pv = root.querySelector('.wdb-preview');
    pv.innerHTML = renderBlock(md);
    enhanceRolls(pv);
    root.querySelector('.wmb-where').textContent = `Save as ${folder()}${fileSlug()}.md`;
    saveDraft();
  }

  // ------------------------------------------------------------ events
  left.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.dataset.p) {
      let v = t.type === 'checkbox' ? t.checked : t.value;
      if (/^scores\.\d$/.test(t.dataset.p) || ['ac', 'hpCount', 'legendaryCount', 'floor', 'crawler.level'].includes(t.dataset.p)) v = v === '' ? '' : Number(v);
      if (/\.gen\.magic$/.test(t.dataset.p)) v = Number(v) || 0;
      set(t.dataset.p, v);
      if (t.dataset.p === 'cr') { st.crExtra = ''; st.crAuto = false; const cb = left.querySelector('[data-p="crAuto"]'); if (cb) cb.checked = false; }
      if (['tier', 'size', 'mode'].includes(t.dataset.p)) { drawForm(); }
    } else if (t.dataset.save) {
      st.saves = t.checked ? [...new Set([...st.saves, t.dataset.save])] : st.saves.filter((a) => a !== t.dataset.save);
    } else if (t.dataset.skill) {
      st.skills = st.skills.filter((s) => s.name !== t.dataset.skill);
      if (t.value) st.skills.push({ name: t.dataset.skill, exp: t.value === 'e' });
    }
    refresh();
  });
  left.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.dataset.act === 'template' && t.value) {
      const tp = TEMPLATES[t.value];
      st = Object.assign(blank(), JSON.parse(JSON.stringify(tp.s)));
      st.crAuto = true;
      drawForm(); refresh();
    }
    if (t.dataset.act === 'clone' && t.value) {
      const m = (window.BESTIARY || []).find((x) => x.id === t.value);
      if (m) { st = fromBestiary(m); drawForm(); refresh(); }
    }
    if (t.dataset.p === 'hpDie' || t.dataset.p === 'crAuto') refresh();
  });
  root.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-act],[data-mode]');
    if (!t) return;
    if (t.dataset.mode) {
      if (st.mode !== t.dataset.mode) { st.mode = t.dataset.mode; if (st.mode === 'crawler' && st.tier === 'Standard') st.tier = 'Elite'; drawForm(); refresh(); }
      return;
    }
    const a = t.dataset.act, key = t.dataset.key, i = Number(t.dataset.i);
    if (a !== 'new') pendingNew = false;
    if (a === 'add') { get(key).push({ name: '', text: '' }); drawForm(); refresh(); }
    if (a === 'addatk') { get(key).push(atk('Slam', 'melee', 'best', '1d8', 'Bludgeoning')); drawForm(); refresh(); }
    if (a === 'addsave') { get(key).push(save('Breath', 'DEX', 'CON', '3d6', 'Fire', 'each creature in a 15-foot Cone')); drawForm(); refresh(); }
    if (a === 'del') { get(key).splice(i, 1); drawForm(); refresh(); }
    if (a === 'up' && i > 0) { const arr = get(key); [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; drawForm(); refresh(); }
    if (a === 'unlock') { const e = get(key)[i]; e.text = entryText(e, derived()); delete e.gen; drawForm(); refresh(); }
    if (a === 'delextra') { st.extra.splice(i, 1); drawForm(); refresh(); }
    if (a === 'new') {
      if (!pendingNew) { pendingNew = true; drawForm(); return; }
      pendingNew = false; const mode = st.mode; st = blank(); st.mode = mode; if (mode === 'crawler') st.tier = 'Elite'; drawForm(); refresh();
    }
    if (a === 'levelup') {
      const c = st.crawler;
      const from = Math.max(1, n0(st.floor, 1));
      const to = Math.max(from + 1, n0(st.futureFloor, from + 1));
      const L0 = Math.max(1, n0(c.level, 1));
      const L = L0 + Math.max(1, n0(st.futureLevels, 11 * (to - from)));
      const keep = { name: st.name, race: c.race, raceChosen: from >= 3, party: c.party, god: c.god, titles: c.titles, sponsor: c.sponsor, pk: c.pk,
        attitude: c.attitude, personality: c.personality, want: c.want, trades: c.trades, tier: st.tier, alignment: st.alignment,
        tactics: st.tactics, voice: st.voice, audience: st.audience, drops: st.drops, variant: `Floor ${to}`,
        history: [c.history, `Floor ${from}: level ${L0}`].filter(Boolean).join('; ') };
      const old = st;
      st = generateCrawler(c.style, L, to, keep);
      // Carry over anything the GM added by hand (entries the preset didn't write).
      ['traits', 'actions', 'bonus', 'reactions', 'legendary'].forEach((k) => {
        const names = new Set(st[k].map((e) => e.name));
        st[k].push(...(old[k] || []).filter((e) => !e.preset && !names.has(e.name)));
      });
      st.extra = old.extra || [];
      drawForm(); refresh();
      return;
    }
    if (a === 'generate' || a === 'rename') {
      const c = st.crawler;
      // Keep the identity and roleplay fields; tier and alignment only if this was already a crawler.
      const was = st.mode === 'crawler' && st.crawler.cls;
      const keep = { name: st.name, race: c.race, raceChosen: st.floor >= 3, history: c.history, party: c.party, god: c.god, titles: c.titles, sponsor: c.sponsor, pk: c.pk, attitude: c.attitude, personality: c.personality, want: c.want, trades: c.trades, tier: was ? st.tier : '', alignment: was ? st.alignment : '', found: st.found && !/^Floor \d+$/.test(st.found) ? st.found : '' };
      if (a === 'rename') {
        const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const old = st.name, nu = `${r(FIRST)} "${r(HANDLE)}" ${r(LAST)}`;
        st.name = nu;
        if (old && st.inspect) st.inspect = st.inspect.split(old).join(nu);
        drawForm(); refresh(); return;
      }
      st = generateCrawler(c.style, Math.max(1, n0(c.level, 1)), Math.max(1, n0(st.floor, 1)), keep);
      drawForm(); refresh();
    }
    if (a === 'download') {
      const blob = new Blob([fileText()], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = fileSlug() + '.md';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    if (a === 'copy') {
      const ta = root.querySelector('.wmb-md');
      (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).catch(() => { ta.closest('details').open = true; ta.select(); document.execCommand('copy'); });
    }
  });

  // Open with #clone=<id> (from the Bestiary's "Clone in the Mob Builder").
  const hm = (location.hash || '').match(/clone=([^&]+)/);
  if (hm) {
    const m = (window.BESTIARY || []).find((x) => x.id === decodeURIComponent(hm[1]));
    if (m) st = fromBestiary(m);
    history.replaceState(null, '', location.pathname);
  }
  drawForm();
  refresh();
  window.WDMB = { generateCrawler, toMarkdown: () => toMarkdown(), state: () => st, STYLES, fromBestiary, crCheck: () => crCheck(derived()) };
})();
