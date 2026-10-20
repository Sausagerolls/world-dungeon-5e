import React, { useState } from 'react';
import { CLASSES, HIT_DIE, DIE_FIXED } from '../rules.js';
import { faithStairs } from '../faith.js';
import { SPECIES, findSpecies, subclassGroups, findFeat } from '../ttf.js';
import { classChoicesFor, choiceDone, speciesChoices, speciesChoiceDone } from '../choices.js';
import { ClassChoiceFields, SpeciesChoiceFields } from '../ChoiceFields.jsx';
import { newFeat } from '../featRules.js';
import { RulesLink } from '../rulesLinks.jsx';
import { derive } from '../character.js';
import { rollDamage } from '../dice.js';
import { Modal, Pick, Stepper } from '../bits.jsx';

export default function LevelTab({ st, d, update }) {
  const [levelUp, setLevelUp] = useState(false);
  const [select, setSelect] = useState(false);
  const canSelect = st.floor >= 3 && !st.classChosen;

  return (
    <>
      <div className="card">
        <div className="row between"><h2 className="sec" style={{ margin: 0 }}>Floor</h2>
          <Stepper value={st.floor} min={1} max={18} onChange={(v) => update((s) => { if (v > s.floor) faithStairs(s); s.floor = v; return s; })} /></div>
        <p className="small muted">Set this when you take the stairs. Class and species selection opens on Floor 3. <RulesLink page="class-selection">Class selection</RulesLink> · <RulesLink page="race-selection">Race selection</RulesLink> · <RulesLink page="leveling">Leveling</RulesLink></p>
      </div>

      {canSelect && (
        <div className="card dark">
          <h2 className="sec">Floor 3: choose your species and class</h2>
          <p className="small" style={{ color: '#bdb8cc' }}>Your crawler levels become levels in your new class (keeping their d8 Hit Dice). You keep every Crawler feature.</p>
          <button className="btn primary block" onClick={() => setSelect(true)}>Open the selection menu</button>
        </div>)}

      <XpCard st={st} update={update} onLevel={() => setLevelUp(true)} />

      <div className="card">
        <div className="row between"><h2 className="sec" style={{ margin: 0 }}>Level {d.level}</h2>
          <button className="btn primary" onClick={() => setLevelUp(true)}>Level up</button></div>
        <div className="row wrap" style={{ marginTop: 8 }}>
          <span className="chip">Stat Points {st.statPointsUnspent}</span><span className="chip">Skill Picks {st.skillPicksUnspent}</span>
          {Object.entries(d.hitDice).map(([die, n]) => <span className="chip" key={die}>{n}{die}</span>)}
        </div>
        <table className="boxgrid" style={{ marginTop: 10 }}>
          <thead><tr><th>Lvl</th><th style={{ textAlign: 'left' }}>Class</th><th>HD</th><th>HP</th></tr></thead>
          <tbody>{st.levels.map((e) => (
            <tr key={e.n}><td>{e.n}</td><td className="n">{e.cls}{e.asClass ? <span className="small muted"> · counts as {e.asClass}</span> : ''}{e.prestige ? ` P${e.prestige}` : ''}</td><td>{e.hd}</td><td>{e.hp}</td></tr>))}</tbody>
        </table>
        {d.level > 1 && <button className="btn sm" style={{ marginTop: 8 }} onClick={() => { if (confirm('Remove your last level?')) update((s) => { s.levels.pop(); return s; }); }}>Undo last level</button>}
      </div>

      {levelUp && <LevelUp st={st} d={d} update={update} onClose={() => setLevelUp(false)} />}
      {select && <ClassSelect st={st} d={d} update={update} onClose={() => setSelect(false)} />}
    </>
  );
}

// XP (rules/leveling.md): every defeated mob is worth XP by its Mob Tier; every 100 XP is a level. Stored as st.xp.
const XP_PER_LEVEL = 100;
const MOB_TIERS = [['Trash', 5], ['Standard', 10], ['Elite', 25], ['Boss', 100], ['Floor Boss', 200]];

function XpCard({ st, update, onLevel }) {
  const [custom, setCustom] = useState('');
  const xp = st.xp || 0;
  const add = (n) => update((s) => { s.xp = Math.max(0, (s.xp || 0) + n); return s; });
  const ready = Math.floor(xp / XP_PER_LEVEL);
  return (
    <div className="card">
      <div className="row between"><h2 className="sec" style={{ margin: 0 }}>XP {xp} / {XP_PER_LEVEL}</h2>
        {ready > 0 && <button className="btn primary" onClick={onLevel}>Level up{ready > 1 ? ` (${ready})` : ''}</button>}</div>
      <div style={{ height: 8, background: '#e6e1d6', borderRadius: 4, margin: '8px 0', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, (xp % XP_PER_LEVEL || (ready ? XP_PER_LEVEL : 0)))}%`, height: '100%', background: '#c2185b' }} /></div>
      <div className="chips">{MOB_TIERS.map(([name, n]) => <button key={name} className="btn sm" onClick={() => add(n)}>{name} +{n}</button>)}</div>
      <div className="row" style={{ gap: 6, marginTop: 6 }}>
        <input className="f" type="number" inputMode="numeric" placeholder="Other XP (e.g. 150 for grinding)" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button className="btn sm" disabled={!Number(custom)} onClick={() => { add(Math.trunc(Number(custom))); setCustom(''); }}>Add</button>
      </div>
      <p className="small muted">Tap a mob's tier for each one your fight defeats. Everyone in the fight gets the full XP. At 100, level up and keep the rest. Use a minus number to fix a mistake. <RulesLink page="leveling">XP rules</RulesLink></p>
    </div>
  );
}

function LevelUp({ st, d, update, onClose }) {
  const n = d.level + 1;
  const classed = st.classChosen;
  const [cls, setCls] = useState(classed ? d.primary : 'Crawler');
  const [hpMode, setHpMode] = useState('fixed');
  const [rolled, setRolled] = useState(null);
  const [sub, setSub] = useState('');
  const die = classed ? HIT_DIE[cls] : 'd8';
  const next = classed ? (d.classes[cls]?.level || 0) + 1 : 0;
  const needsSub = classed && next >= 3 && !st.subclasses[cls];
  const hp = hpMode === 'fixed' ? DIE_FIXED[die] : rolled;
  const prestige = next > 20 ? next - 20 : 0;
  const [picks, setPicks] = useState({});
  // Choices reached at this class level. Multiclassing into a class skips its starting skill list.
  const fromLv = d.classes[cls] ? next : 1;
  const newChoices = classed ? classChoicesFor(cls, next).filter((c) => c.kind !== 'auto' && (c.at_level || 1) >= fromLv && !(fromLv === 1 && c.id === 'class-skills')) : [];
  const choicesOk = newChoices.every((c) => choiceDone(c, picks[c.id]));
  const have = d.skillRows.filter((r) => r.prof).map((r) => r.name);

  const confirmLevel = () => {
    update((s) => {
      s.levels.push({ n, cls: classed ? cls : 'Crawler', hd: die, hp, ...(prestige ? { prestige } : {}) });
      if ((s.xp || 0) >= XP_PER_LEVEL) s.xp -= XP_PER_LEVEL;
      s.statPointsUnspent += 1;
      if (n % 5 === 0) s.skillPicksUnspent += 1;
      if (needsSub && sub) s.subclasses = { ...s.subclasses, [cls]: sub };
      if (newChoices.length) s.classChoices = { ...(s.classChoices || {}), [cls]: { ...((s.classChoices || {})[cls] || {}), ...picks } };
      return topUp(d, s);
    });
    onClose();
  };

  return (
    <Modal title={`Level ${n}`} onClose={onClose}>
      <ul className="small">
        <li>+1 Stat Point{n % 5 === 0 ? ', +1 Skill Pick' : ''}.</li>
        {!classed && n === 3 && <li>Survivor feature: Inclination (choose it in Features).</li>}
        {!classed && n === 5 && <li>Survivor feature: Hardened (choose it in Features).</li>}
        {[2, 4, 7, 8].includes(n) && !classed && <li>New survivor feature (see Features).</li>}
        {prestige > 0 && <li>Prestige level {prestige} in {cls}{prestige % 2 === 1 ? ': a new prestige feature' : ': an Epic Boon (add in Features) or 2 Stat Points'}.</li>}
      </ul>
      {classed && <>
        <span className="lab">Take this level in</span>
        <div className="chips">{CLASSES.map((c) => <Pick key={c} on={cls === c} onClick={() => { setCls(c); setRolled(null); setSub(''); setPicks({}); }}>{c}{d.classes[c] ? ` ${d.classes[c].level}` : ''}</Pick>)}</div>
        {!d.classes[cls] && <p className="small muted">New class: normal multiclassing rules apply (check the ability prerequisites).</p>}
        {needsSub && <>
          <span className="lab">{cls} subclass</span>
          <select className="f" value={sub} onChange={(e) => setSub(e.target.value)} style={{ marginBottom: 10 }}>
            <option value="">Choose a subclass…</option><SubOptions cls={cls} /></select>
        </>}
        <ClassChoiceFields cls={cls} level={next} fromLevel={fromLv} skip={fromLv === 1 ? ['class-skills'] : []} value={picks} onChange={setPicks} have={have} />
      </>}
      <span className="lab">Hit points: {die} + Con ({d.m.CON >= 0 ? '+' : ''}{d.m.CON})</span>
      <div className="chips">
        <Pick on={hpMode === 'fixed'} onClick={() => setHpMode('fixed')}>Fixed {DIE_FIXED[die]}</Pick>
        <Pick on={hpMode === 'roll'} onClick={() => { setHpMode('roll'); setRolled(rollDamage(`1${die}`).total); }}>Roll {rolled ? `(${rolled})` : die}</Pick>
      </div>
      <button className="btn primary block" disabled={hp == null || (needsSub && !sub) || !choicesOk} onClick={confirmLevel}>Gain level {n}</button>
    </Modal>
  );
}

function ClassSelect({ st, d, update, onClose }) {
  const [speciesId, setSpecies] = useState('');
  const [subraceId, setSubrace] = useState('');
  const [spPicks, setSpPicks] = useState({});
  const [cls, setCls] = useState('');
  const [sub, setSub] = useState('');
  const [picks, setPicks] = useState({});
  const sp = findSpecies(speciesId);
  const N = d.level;
  const have = [...new Set([...st.skills, ...(st.bgSkills || []), ...(st.extraSkill ? [st.extraSkill] : [])])];
  const spChoices = speciesChoices(speciesId, subraceId);
  const spSkills = Object.entries(spPicks).filter(([k]) => k.startsWith('skills:')).flatMap(([, v]) => v || []);
  const CL = Math.min(N, 20); // no class goes above 20th level; the rest are prestige levels
  const clsChoices = cls ? classChoicesFor(cls, CL).filter((c) => c.kind !== 'auto') : [];
  const ok = speciesId && (!sp?.subraces?.length || subraceId) && spChoices.every((c) => speciesChoiceDone(c, spPicks[c.id]))
    && cls && (N < 3 || sub) && clsChoices.every((c) => choiceDone(c, picks[c.id]));

  const confirm = () => {
    update((s) => {
      s.levels = s.levels.map((e, i) => (e.cls === 'Crawler' ? { ...e, asClass: cls, ...(i >= 20 ? { prestige: i - 19 } : {}) } : e));
      s.classChosen = true;
      s.subclasses = { ...s.subclasses, ...(sub ? { [cls]: sub } : {}) };
      s.speciesId = speciesId; s.subraceId = subraceId; s.speciesName = sp?.name + (subraceId ? ` (${(sp.subraces || []).find((x) => x.id === subraceId)?.name || ''})` : '');
      s.speciesChoices = spPicks;
      const feat = spPicks.feat && findFeat(spPicks.feat);
      if (feat) s.feats = [...(s.feats || []), newFeat(feat, `${sp.name} species`)];
      s.classChoices = { ...(s.classChoices || {}), [cls]: picks };
      s.boxes = { ...(s.boxes || {}), [`Class|Bronze`]: { ...(s.boxes?.['Class|Bronze'] || { earned: 0, opened: 0 }), earned: (s.boxes?.['Class|Bronze']?.earned || 0) + 1 } };
      s.boxLog = [{ text: `Class selection: became a ${cls}. Earned a Bronze Class Box.`, floor: s.floor, at: Date.now() }, ...(s.boxLog || [])];
      return topUp(d, s);
    });
    onClose();
  };

  return (
    <Modal title="Race and Class selection" onClose={onClose}>
      <div className="sys">"Congratulations on surviving two whole floors! Please select a class from the menu. All sales are final."</div>
      <span className="lab">Species (2024)</span>
      <select className="f" value={speciesId} onChange={(e) => { setSpecies(e.target.value); setSubrace(''); setSpPicks({}); }} style={{ marginBottom: 8 }}>
        <option value="">Choose a species…</option>{SPECIES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
      <p className="small muted" style={{ marginTop: 0 }}>Until now you were an ordinary person. Species traits only apply from this choice on, Human included. <RulesLink page="race-selection">Race rules</RulesLink></p>
      {sp?.subraces?.length > 0 && (
        <select className="f" value={subraceId} onChange={(e) => { setSubrace(e.target.value); setSpPicks({}); }} style={{ marginBottom: 8 }}>
          <option value="">Choose {sp.subraceLabel ? `a ${sp.subraceLabel.toLowerCase()}` : 'a lineage'}…</option>{sp.subraces.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>)}
      {sp && <div className="small muted" style={{ marginBottom: 6 }}>{(sp.traits || []).map((t) => t.name).join(' · ')}</div>}
      <SpeciesChoiceFields id={speciesId} subId={subraceId} value={spPicks} onChange={setSpPicks} have={have} />
      <span className="lab">Class (any Player's Handbook class)</span>
      <div className="chips">{CLASSES.map((c) => <Pick key={c} on={cls === c} onClick={() => { setCls(c); setSub(''); setPicks({}); }}>{c}</Pick>)}</div>
      {cls && <>
        <p className="small">You become a level {CL} {cls}, with every {cls} feature up to level {CL}{N > 20 ? `, plus ${N - 20} prestige level${N > 21 ? 's' : ''} (add the prestige features in Features)` : ''}. Your {N} crawler levels keep their d8 Hit Dice; from now on you gain {HIT_DIE[cls]}s.</p>
        {N >= 3 && <><span className="lab">Subclass</span>
          <select className="f" value={sub} onChange={(e) => setSub(e.target.value)} style={{ marginBottom: 10 }}>
            <option value="">Choose a subclass…</option><SubOptions cls={cls} /></select></>}
        <ClassChoiceFields cls={cls} level={CL} value={picks} onChange={setPicks} have={[...have, ...spSkills]} />
        <p className="small muted">Saving throws switch to the {cls}'s.</p>
      </>}
      <button className="btn primary block" disabled={!ok} onClick={confirm}>Confirm selection</button>
    </Modal>
  );
}

function SubOptions({ cls }) {
  const { phb, other } = subclassGroups(cls);
  return <>
    <optgroup label="Player's Handbook (2024)">{phb.map((x) => <option key={x}>{x}</option>)}</optgroup>
    {other.length > 0 && <optgroup label="Other books">{other.map((x) => <option key={x}>{x}</option>)}</optgroup>}
  </>;
}

// After gaining levels or class mana, add the new maximum's increase to the current pools.
export function topUp(before, s) {
  const after = derive(s);
  s.mana.current = Math.min(after.manaMax, (s.mana.current ?? before.manaMax) + Math.max(0, after.manaMax - before.manaMax));
  s.mana.pact = Math.min(after.pact.mana, (s.mana.pact ?? before.pact.mana) + Math.max(0, after.pact.mana - before.pact.mana));
  s.hp.current = Math.min(after.hpMax, (s.hp.current ?? before.hpMax) + Math.max(0, after.hpMax - before.hpMax));
  return s;
}
