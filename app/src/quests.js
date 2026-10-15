// Quests (rules/quests.md): the quest log, questlines and divine quests.
// Stored on the crawler as st.quests = { list: [quest], lines: [{ name, giver, reward, status }], log: [] }.
// A quest: { id, name, giver, stars 1-5, length, deadline, floorBound, objective, steps: [{ text, done }],
//   gold, boxType, boxRarity, reward, penalty, line, link, divine, god, status, floor, fallout, at }.
import { faithOf, addLapse, isSlain, shortName, findGod } from './faith.js';

export const LENGTHS = [
  ['Quick', 'One scene: a few floor turns'],
  ['Short', 'A session, or about 6–12 floor turns'],
  ['Floor', 'Most of a floor, before the stairs'],
  ['Long', 'Two floors or more'],
];
export const STAR_NAMES = ['', 'Errand', 'Job', 'Venture', 'Ordeal', 'Legend'];
export const starText = (n) => '★'.repeat(n || 0) + '☆'.repeat(5 - (n || 0));

// Rewards guide (quests/quest-builder.md): gold per star by floor, times length; box rarity by floor and stars.
const GOLD_PER_STAR = [[2, 20], [5, 60], [9, 200], [14, 600], [99, 2000]];
const LEN_MULT = { Quick: 1, Short: 2, Floor: 3, Long: 5 };
const RARITY_BY_FLOOR = [ // usual, big deed, exceptional deed (loot-boxes, Rarity by Floor)
  [2, ['Bronze', 'Silver', 'Gold']], [5, ['Bronze', 'Gold', 'Legendary']], [9, ['Silver', 'Gold', 'Legendary']],
  [14, ['Silver', 'Legendary', 'Legendary']], [99, ['Gold', 'Legendary', 'Legendary']],
];
export function suggestReward(floor, stars, length) {
  const per = GOLD_PER_STAR.find(([f]) => floor <= f)[1];
  const r = RARITY_BY_FLOOR.find(([f]) => floor <= f)[1];
  const box = { 1: '', 2: r[0], 3: r[1], 4: r[2], 5: 'Legendary' }[stars] || '';
  return { gold: per * stars * (LEN_MULT[length] || 1), boxRarity: box };
}

// Divine quests: Favor and Lapses removed on success; smite dice, how long it lasts, Favor and Lapses on failure.
export const DIVINE = {
  1: { favor: 2, clear: 0, dice: 2, lasts: '1 hour', lose: 2, lapses: 0 },
  2: { favor: 3, clear: 0, dice: 4, lasts: 'until your next long rest', lose: 3, lapses: 1 },
  3: { favor: 5, clear: 1, dice: 8, lasts: 'until the end of the floor', lose: 5, lapses: 1 },
  4: { favor: 8, clear: 1, dice: 12, lasts: 'until the end of the floor', lose: 8, lapses: 1 },
  5: { favor: 12, clear: 5, dice: 16, lasts: 'until the end of the next floor', lose: 12, lapses: 2 },
};

export const questsOf = (st) => ({ list: [], lines: [], log: [], ...(st.quests || {}) });
export const activeQuests = (st) => questsOf(st).list.filter((q) => q.status === 'active');
export const openDivine = (st) => activeQuests(st).find((q) => q.divine) || null;
export const linksOf = (st, line) => questsOf(st).list.filter((q) => q.line === line).sort((a, b) => (a.link || 0) - (b.link || 0));

const logIt = (s, text) => { const Q = questsOf(s); Q.log = [{ text, floor: s.floor, at: Date.now() }, ...Q.log].slice(0, 80); s.quests = Q; };
const faithLog = (s, text) => { const f = faithOf(s); f.log = [{ text, at: Date.now() }, ...(f.log || [])].slice(0, 30); s.faith = f; };
const find = (s, id) => questsOf(s).list.find((q) => q.id === id);

export function saveQuest(s, q) {
  const Q = questsOf(s);
  const i = Q.list.findIndex((x) => x.id === q.id);
  if (i >= 0) Q.list[i] = q;
  else {
    Q.list = [{ status: 'active', floor: s.floor, at: Date.now(), ...q, id: q.id || `q${Date.now().toString(36)}` }, ...Q.list];
  }
  if (q.line && !Q.lines.some((l) => l.name === q.line)) Q.lines = [...Q.lines, { name: q.line, giver: q.giver, reward: '', status: 'active' }];
  s.quests = Q;
  if (i < 0) logIt(s, `Accepted ${q.divine ? 'divine quest' : 'quest'} ${q.name} (${starText(q.stars)}).`);
  return s;
}

// Hand it in: gold to the purse, the box to the box list, Favor for a divine quest.
export function completeQuest(s, id) {
  const q = find(s, id);
  if (!q || q.status !== 'active') return s;
  q.status = 'done'; q.endedOn = s.floor;
  if (q.gold) s.gold = (s.gold || 0) + Number(q.gold);
  if (q.boxType && q.boxRarity) {
    const k = `${q.boxType}|${q.boxRarity}`;
    const b = { ...(s.boxes?.[k] || { earned: 0, opened: 0 }) }; b.earned += 1;
    s.boxes = { ...(s.boxes || {}), [k]: b };
    s.boxLog = [{ text: `Earned a ${q.boxRarity} ${q.boxType} Box (quest: ${q.name})`, floor: s.floor, at: Date.now() }, ...(s.boxLog || [])];
  }
  let extra = '';
  if (q.divine) {
    const D = DIVINE[q.stars];
    const f = faithOf(s);
    if (f.god === q.god && !isSlain(f, q.god)) {
      if (f.lapses < 4) f.favor += D.favor; // at Wrath only Atonement gains Favor
      if (D.clear) f.lapses = Math.max(0, f.lapses - D.clear);
      s.faith = f;
      extra = ` +${D.favor} Favor${D.clear ? (D.clear >= 5 ? ', all Lapses gone' : ', −1 Lapse') : ''}`;
      faithLog(s, `Divine quest done: ${q.name}.${extra}.`);
    }
  }
  logIt(s, `Finished ${q.name}.${q.gold ? ` +${q.gold} gp.` : ''}${q.boxRarity && q.boxType ? ` ${q.boxRarity} ${q.boxType} Box.` : ''}${extra}`);
  return s;
}

// Fail (or abandon) it. Ordinary quests cost nothing; a divine quest is a smite.
export function failQuest(s, id, why = 'failed') {
  const q = find(s, id);
  if (!q || q.status !== 'active') return s;
  q.status = why === 'abandoned' ? 'abandoned' : 'failed'; q.endedOn = s.floor;
  if (q.divine) smite(s, q, why);
  else logIt(s, `${why === 'abandoned' ? 'Abandoned' : 'Failed'} ${q.name}.${q.penalty ? ` Penalty: ${q.penalty}` : ''}`);
  return s;
}

function smite(s, q, why) {
  const D = DIVINE[q.stars];
  const god = findGod(q.god);
  const f = faithOf(s);
  const text = `Divine quest ${q.name} ${why}: smitten by ${shortName(q.god)} (${god?.smite?.name || 'smite'}, ${D.dice}d10, no save; lasting effect ${D.lasts})`;
  if (f.god === q.god && !isSlain(f, q.god)) {
    f.favor = Math.max(0, f.favor - D.lose);
    s.faith = f;
    faithLog(s, `${text}. −${D.lose} Favor.`);
    for (let i = 0; i < D.lapses; i++) addLapse(s, `failed the divine quest ${q.name}`);
  } else faithLog(s, `${text}.`);
  logIt(s, `${text}.`);
}

// Turning down a divine quest is a Lapse.
export function declineDivine(s, name) {
  addLapse(s, `turned down a divine quest${name ? ` (${name})` : ''}`);
  logIt(s, `Turned down a divine quest${name ? `: ${name}` : ''}. +1 Lapse.`);
  return s;
}

// After any change: a divine quest from a god you no longer worship fails (both smites),
// unless the god was slain (the quest just ends).
export function syncDivine(s) {
  if (!s.quests) return s;
  const f = faithOf(s);
  for (const q of questsOf(s).list) {
    if (!q.divine || q.status !== 'active' || q.god === f.god && !isSlain(f, q.god)) continue;
    if (isSlain(f, q.god)) { q.status = 'ended'; logIt(s, `${shortName(q.god)} was slain: the divine quest ${q.name} just ends.`); }
    else { q.status = 'failed'; q.endedOn = s.floor; smite(s, q, 'failed (you left your god)'); }
  }
  return s;
}

// Taking the stairs: floor-bound quests still open fail.
export function questsStairs(s) {
  for (const q of activeQuests(s)) if (q.floorBound) failQuest(s, q.id, 'failed (took the stairs)');
  return s;
}

export function setLine(s, name, patch) {
  const Q = questsOf(s);
  Q.lines = Q.lines.map((l) => (l.name === name ? { ...l, ...patch } : l));
  s.quests = Q;
  if (patch.status === 'done') logIt(s, `Questline complete: ${name}.${Q.lines.find((l) => l.name === name)?.reward ? ` Chain reward: ${Q.lines.find((l) => l.name === name).reward}` : ''}`);
  if (patch.status === 'broken') logIt(s, `Questline broken: ${name}.`);
  return s;
}
