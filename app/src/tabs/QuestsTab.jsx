// Quests (rules/quests.md): the quest log, questlines and divine quests.
import React, { useState } from 'react';
import { Modal, Pick } from '../bits.jsx';
import { RulesLink } from '../rulesLinks.jsx';
import { BOX_TYPES, RARITIES } from '../character.js';
import { faithOf, findGod, isSlain, shortName } from '../faith.js';
import {
  LENGTHS, STAR_NAMES, starText, suggestReward, DIVINE, questsOf, activeQuests, openDivine, linksOf,
  saveQuest, completeQuest, failQuest, declineDivine, setLine,
} from '../quests.js';

const blank = (divine, god) => ({
  name: '', giver: divine ? shortName(god) : '', stars: 2, length: 'Short', deadline: '', floorBound: true, objective: '',
  stepsText: '', gold: '', boxType: divine ? 'Divine' : '', boxRarity: '', reward: '', penalty: '', line: '', link: '', divine: !!divine, god: divine ? god : '',
});

function QuestForm({ st, init, onClose, update }) {
  const [q, setQ] = useState(() => ({ ...init, stepsText: (init.steps || []).map((x) => x.text).join('\n') || init.stepsText || '' }));
  const set = (patch) => setQ((x) => ({ ...x, ...patch }));
  const sug = suggestReward(st.floor, q.stars, q.length);
  const lines = questsOf(st).lines.map((l) => l.name);
  const save = () => {
    if (!q.name.trim()) return;
    const old = init.steps || [];
    const steps = q.stepsText.split('\n').map((t) => t.trim()).filter(Boolean).map((text) => ({ text, done: !!old.find((o) => o.text === text)?.done }));
    const { stepsText, ...rest } = q;
    update((s) => saveQuest(s, { ...rest, name: q.name.trim(), steps, gold: Number(q.gold) || 0, link: Number(q.link) || '' }));
    onClose();
  };
  const D = q.divine ? DIVINE[q.stars] : null;
  return (
    <Modal title={init.id ? 'Edit quest' : q.divine ? `Divine quest from ${shortName(q.god)}` : 'New quest'} onClose={onClose}>
      <div className="field"><span className="lab">Quest name</span><input className="f" value={q.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Party Pooper" /></div>
      {!q.divine && <div className="field"><span className="lab">Giver and where</span><input className="f" value={q.giver} onChange={(e) => set({ giver: e.target.value })} placeholder="e.g. Pippa, Birthday Party Wing safe room" /></div>}
      <div className="lab" style={{ marginTop: 8 }}>Difficulty</div>
      <div className="chips">{[1, 2, 3, 4, 5].map((n) => <Pick key={n} on={q.stars === n} onClick={() => set({ stars: n })}>{'★'.repeat(n)} {STAR_NAMES[n]}</Pick>)}</div>
      <div className="lab">Length</div>
      <div className="chips">{LENGTHS.map(([l, t]) => <Pick key={l} on={q.length === l} onClick={() => set({ length: l, floorBound: l !== 'Long' })}>{l}</Pick>)}</div>
      <p className="small muted" style={{ marginTop: -4 }}>{LENGTHS.find(([l]) => l === q.length)?.[1]}</p>
      <div className="field"><span className="lab">Deadline</span><input className="f" value={q.deadline} onChange={(e) => set({ deadline: e.target.value })} placeholder="e.g. 8 floor turns, before the stairs, end of Floor 4" /></div>
      <label className="small" style={{ display: 'block', margin: '6px 0' }}><input type="checkbox" checked={q.floorBound} onChange={(e) => set({ floorBound: e.target.checked })} /> Floor-bound: fails when you take the stairs</label>
      <div className="field"><span className="lab">Objective</span><textarea className="f" value={q.objective} onChange={(e) => set({ objective: e.target.value })} /></div>
      <div className="field"><span className="lab">Steps (one per line, optional)</span><textarea className="f" style={{ minHeight: 60 }} value={q.stepsText} onChange={(e) => set({ stepsText: e.target.value })} /></div>

      <div className="lab" style={{ marginTop: 8 }}>Reward</div>
      {q.divine
        ? <div className="sys small">+{D.favor} Favor{D.clear ? (D.clear >= 5 ? ', all Lapses removed' : ', −1 Lapse') : ''}{q.stars >= 2 ? `, usually a ${q.stars === 5 ? 'Legendary' : sug.boxRarity} Divine box` : ''}.</div>
        : <p className="small muted">Suggested for Floor {st.floor}: {sug.gold} gp{sug.boxRarity ? ` and a ${sug.boxRarity} box` : ''}. The giver decides. <button className="btn sm" onClick={() => set({ gold: sug.gold, boxRarity: sug.boxRarity })}>Use it</button></p>}
      <div className="grid2">
        <div className="field"><span className="lab">Gold</span><input className="f" inputMode="numeric" value={q.gold} onChange={(e) => set({ gold: e.target.value.replace(/[^0-9]/g, '') })} /></div>
        <div className="field"><span className="lab">Box rarity</span>
          <select className="f" value={q.boxRarity} onChange={(e) => set({ boxRarity: e.target.value })}><option value="">No box</option>{RARITIES.map((r) => <option key={r}>{r}</option>)}</select></div>
      </div>
      {q.boxRarity && <div className="field"><span className="lab">Box type</span>
        <select className="f" value={q.boxType} onChange={(e) => set({ boxType: e.target.value })}><option value="">Box type…</option>{BOX_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>}
      <div className="field"><span className="lab">Other reward</span><input className="f" value={q.reward} onChange={(e) => set({ reward: e.target.value })} placeholder="An item, a favor, a discount…" /></div>
      {q.divine
        ? <div className="warn small"><b>If you fail:</b> {shortName(q.god)} smites you ({findGod(q.god)?.smite?.name}, {D.dice}d10, no save; lasting effect {D.lasts}). −{D.lose} Favor{D.lapses ? `, +${D.lapses} Lapse${D.lapses > 1 ? 's' : ''}` : ''}.</div>
        : <div className="field"><span className="lab">Penalty (only if the quest showed one)</span><input className="f" value={q.penalty} onChange={(e) => set({ penalty: e.target.value })} placeholder="Most quests have none" /></div>}
      <div className="grid2" style={{ gridTemplateColumns: '3fr 1fr' }}>
        <div className="field"><span className="lab">Questline (optional)</span><input className="f" list="qlines" value={q.line} onChange={(e) => set({ line: e.target.value })} />
          <datalist id="qlines">{lines.map((l) => <option key={l} value={l} />)}</datalist></div>
        <div className="field"><span className="lab">Link #</span><input className="f" inputMode="numeric" value={q.link} onChange={(e) => set({ link: e.target.value.replace(/[^0-9]/g, '') })} /></div>
      </div>
      <button className="btn primary block" style={{ marginTop: 10 }} onClick={save} disabled={!q.name.trim()}>{init.id ? 'Save' : 'Accept quest'}</button>
    </Modal>
  );
}

function QuestCard({ q, update, onEdit }) {
  const [confirm, setConfirm] = useState('');
  const D = q.divine ? DIVINE[q.stars] : null;
  const toggleStep = (i) => update((s) => { const x = questsOf(s).list.find((y) => y.id === q.id); x.steps[i].done = !x.steps[i].done; return s; });
  return (
    <div className="sk" style={q.divine ? { borderColor: '#f5c542' } : undefined}>
      <div className="row between">
        <div style={{ minWidth: 0 }}>
          <h3 className="it">{q.name}</h3>
          <span className="chip gold" title={STAR_NAMES[q.stars]}>{'★'.repeat(q.stars)}</span>{' '}
          <span className="chip">{q.length}</span>{q.divine && <> <span className="chip pink">Divine</span></>}{q.line && <> <span className="chip teal">{q.line}{q.link ? ` · ${q.link}` : ''}</span></>}
        </div>
        <button className="btn sm" onClick={onEdit}>Edit</button>
      </div>
      <p className="small" style={{ margin: '6px 0 2px' }}>
        {q.giver && <><b>Giver:</b> {q.giver}<br /></>}
        {(q.deadline || q.floorBound) && <><b>Deadline:</b> {q.deadline || 'before the stairs'}{q.floorBound && q.deadline ? ' (fails at the stairs)' : ''}<br /></>}
        {q.objective && <><b>Objective:</b> {q.objective}</>}
      </p>
      {(q.steps || []).map((x, i) => (
        <label key={x.text} className="small" style={{ display: 'block', padding: '2px 0', textDecoration: x.done ? 'line-through' : 'none' }}>
          <input type="checkbox" checked={x.done} onChange={() => toggleStep(i)} /> {x.text}</label>))}
      <p className="small" style={{ margin: '4px 0' }}>
        <b>Reward:</b> {[q.divine && `+${D.favor} Favor${D.clear ? (D.clear >= 5 ? ', all Lapses gone' : ', −1 Lapse') : ''}`, q.gold && `${q.gold} gp`, q.boxRarity && `${q.boxRarity} ${q.boxType || ''} Box`, q.reward].filter(Boolean).join(' · ') || 'none named'}
      </p>
      {q.divine && <div className="warn small"><b>If you fail:</b> {findGod(q.god)?.smite?.name || 'smite'}, {D.dice}d10, no save; lasting effect {D.lasts}. −{D.lose} Favor{D.lapses ? `, +${D.lapses} Lapse${D.lapses > 1 ? 's' : ''}` : ''}.</div>}
      {!q.divine && q.penalty && <div className="warn small"><b>Penalty:</b> {q.penalty}</div>}
      {!confirm
        ? <div className="row wrap" style={{ marginTop: 6 }}>
          <button className="btn sm primary" onClick={() => update((s) => completeQuest(s, q.id))}>Done{q.gold ? ` (+${q.gold} gp)` : ''}</button>
          <button className="btn sm" onClick={() => setConfirm('failed')}>Failed</button>
          <button className="btn sm" onClick={() => setConfirm('abandoned')}>Abandon</button></div>
        : <div className="row wrap" style={{ marginTop: 6 }}>
          <span className="small">{q.divine ? `${confirm === 'abandoned' ? 'Abandoning is failing.' : ''} Take the smite?` : `Mark it ${confirm}?`}</span>
          <button className="btn sm primary" onClick={() => { setConfirm(''); update((s) => failQuest(s, q.id, confirm)); }}>Yes</button>
          <button className="btn sm" onClick={() => setConfirm('')}>No</button></div>}
    </div>
  );
}

export default function QuestsTab({ st, update }) {
  const [form, setForm] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const Q = questsOf(st);
  const f = faithOf(st);
  const worships = f.god && !isSlain(f, f.god);
  const divine = openDivine(st);
  const active = activeQuests(st).filter((q) => !q.divine);
  const ended = Q.list.filter((q) => q.status !== 'active');
  const linkMark = (q) => ({ done: '✓', failed: '✗', abandoned: '✗', ended: '–' }[q.status] || '•');
  const editOf = (q) => setForm({ ...q });

  return (
    <>
      {worships && (
        <div className="card" style={{ borderColor: '#f5c542' }}>
          <div className="row between"><h2 className="sec" style={{ margin: 0 }}>Divine quest</h2><span className="chip gold">{shortName(f.god)}</span></div>
          {divine
            ? <div style={{ marginTop: 8 }}><QuestCard q={divine} update={update} onEdit={() => editOf(divine)} /></div>
            : <>
              <p className="small muted">When {shortName(f.god)} gives you a quest, add it here. One at a time. Turning one down is a Lapse; failing one is a smite. <RulesLink page="quests" anchor="Divine Quests" /></p>
              <div className="row wrap">
                <button className="btn sm primary" onClick={() => setForm(blank(true, f.god))}>Accept a divine quest</button>
                <button className="btn sm" onClick={() => update((s) => declineDivine(s, ''))}>Turned one down (+1 Lapse)</button>
              </div>
            </>}
        </div>)}

      <div className="card">
        <div className="row between"><h2 className="sec" style={{ margin: 0 }}>Quests ({active.length})</h2>
          <button className="btn sm primary" onClick={() => setForm(blank(false))}>+ New quest</button></div>
        <p className="small muted">Failing an ordinary quest costs you nothing but the reward. The world remembers, though. A penalty is always shown before you accept. Taking the stairs fails every floor-bound quest still open. <RulesLink page="quests" /></p>
        {active.length === 0 && <p className="small muted">No open quests. Ask around, or read the Quest Board in a safe room.</p>}
        {active.map((q) => <QuestCard key={q.id} q={q} update={update} onEdit={() => editOf(q)} />)}
      </div>

      {Q.lines.length > 0 && (
        <div className="card">
          <h2 className="sec">Questlines</h2>
          {Q.lines.map((l) => {
            const links = linksOf(st, l.name);
            return (
              <div key={l.name} style={{ borderBottom: '1px solid var(--rule)', padding: '8px 0' }}>
                <div className="row between"><b>{l.name}</b><span className={`chip ${l.status === 'done' ? 'teal' : l.status === 'broken' ? 'pink' : ''}`}>{l.status === 'done' ? 'Complete' : l.status === 'broken' ? 'Broken' : 'Ongoing'}</span></div>
                <div className="chips">{links.map((q) => <span key={q.id} className="chip">{q.link ? `${q.link}. ` : ''}{q.name} {linkMark(q)}</span>)}</div>
                <div className="row wrap">
                  <input className="f" style={{ flex: 1, minWidth: 140 }} value={l.reward || ''} placeholder="Chain reward" onChange={(e) => update((s) => setLine(s, l.name, { reward: e.target.value }))} />
                  {l.status === 'active' && <>
                    <button className="btn sm primary" onClick={() => update((s) => setLine(s, l.name, { status: 'done' }))}>Chain done</button>
                    <button className="btn sm" onClick={() => update((s) => setLine(s, l.name, { status: 'broken' }))}>Broken</button></>}
                </div>
              </div>);
          })}
          <p className="small muted">Add a quest with the questline's name to add a link. Each link pays its own reward; the chain pays its reward on top.</p>
        </div>)}

      {ended.length > 0 && (
        <div className="card">
          <h2 className="sec">Finished and failed</h2>
          {(showAll ? ended : ended.slice(0, 8)).map((q) => (
            <div key={q.id} style={{ borderBottom: '1px solid var(--rule)', padding: '6px 0' }}>
              <div className="row between"><span><b>{q.name}</b> <span className="small muted">{starText(q.stars)} · Floor {q.endedOn || q.floor}</span></span>
                <span className={`chip ${q.status === 'done' ? 'teal' : 'pink'}`}>{{ done: 'Done', failed: 'Failed', abandoned: 'Abandoned', ended: 'Ended' }[q.status]}</span></div>
              {q.status !== 'done' && !q.divine && <input className="f" style={{ marginTop: 4 }} value={q.fallout || ''} placeholder="What happened because of it?"
                onChange={(e) => update((s) => { questsOf(s).list.find((x) => x.id === q.id).fallout = e.target.value; return s; })} />}
            </div>))}
          {ended.length > 8 && <button className="btn sm" style={{ marginTop: 6 }} onClick={() => setShowAll(!showAll)}>{showAll ? 'Show fewer' : `Show all ${ended.length}`}</button>}
        </div>)}

      {Q.log.length > 0 && (
        <details className="feat card"><summary><span>Quest log</span></summary>
          {Q.log.slice(0, 30).map((l) => <div key={l.at + l.text} className="small muted">Floor {l.floor}: {l.text}</div>)}</details>)}

      {form && <QuestForm st={st} init={form} update={update} onClose={() => setForm(null)} />}
    </>
  );
}
