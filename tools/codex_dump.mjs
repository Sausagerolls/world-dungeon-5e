// Print the class data the Class Codex PDFs need, as JSON, from a Tabletop Forge checkout.
//
// Usage: node tools/codex_dump.mjs   (TTF_SRC defaults to ../dnd-vtt/frontend/src next to this repo)
//
// This is Player's Handbook class text. It is read at build time and never
// written into this repo: tools/build_codex.py turns it straight into PDFs that
// are only hosted on the Tabletop Forge server (see DEPLOY.md).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TTF = process.env.TTF_SRC || path.resolve(HERE, '../../dnd-vtt/frontend/src');
const load = (p) => import(pathToFileURL(path.join(TTF, p)).href);

const sub = await load('data/subclasses.js');
const cls = await load('data/classes.js');
const opt = await load('data/class_options.js');
const rules = await import(pathToFileURL(path.resolve(HERE, '../app/src/rules.js')).href);

const CLASSES = rules.CLASSES;
const out = {};
for (const c of CLASSES) {
  const base = sub.CLASS_FEATURES[c] || { features: [] };
  const subclasses = Object.entries(sub.SUBCLASS_FEATURES[c] || {}).map(([name, e]) => ({
    name, blurb: e.blurb || '', features: e.features || [], spells: e.spells || [], learnable: e.learnableSpells || [],
  }));
  const choices = (cls.getClassChoices(c) || []).map((ch) => ({
    id: ch.id, label: ch.label, kind: ch.kind, at_level: ch.at_level || 1, pick_count: ch.pick_count || 1,
    options: (ch.options || []).map((o) => (typeof o === 'string' ? o : o.label || o.name || o.id)),
    from: (ch.from || []).map((k) => String(k).replace(/^skill_/, '').replace(/_/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase())),
    desc: ch.desc || '',
  }));
  const options = opt.CLASS_OPTION_GROUPS.filter((g) => g.class === c && (g.editions.srd2024 || []).length)
    .map((g) => ({ label: g.label, items: g.editions.srd2024.map((x) => ({ name: x.name, desc: x.desc, prereq: x.prereq?.note || '' })) }));
  const levels = [];
  for (let l = 1; l <= 20; l += 1) {
    let cap = null;
    try { cap = cls.spellCapacityFor(c, l); } catch { cap = null; }
    const kind = rules.casterKind(c, '');
    const cl = kind === 'full' ? l : kind === 'half' ? Math.ceil(l / 2) : 0;
    levels.push({
      level: l, pb: rules.profBonus(l), cantrips: cap?.cantrips ?? null, prepared: cap?.prepared ?? null,
      mana: cl ? rules.classMana(cl) : null, maxSpell: cl ? rules.maxSpellLevel({ [c]: { level: l, subclass: '' } }) : null,
      pact: c === 'Warlock' ? rules.pactMana(l) : null,
    });
  }
  out[c] = {
    blurb: base.blurb || '', features: base.features, notes: base.notes || [], subclasses, choices, options, levels,
    hitDie: rules.HIT_DIE[c], saves: rules.CLASS_SAVES[c], armor: rules.CLASS_ARMOR[c], weapons: rules.CLASS_WEAPONS[c],
    spellAbility: rules.SPELL_ABILITY[c] || null, casterKind: rules.casterKind(c, ''),
  };
}
process.stdout.write(JSON.stringify(out));
