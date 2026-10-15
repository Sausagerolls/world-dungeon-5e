// Quests (rules/quests.md): a simple list of quests. Stored as st.quests = [{ id, name, from, reward, notes, done }].
import React, { useState } from 'react';
import { RulesLink } from '../rulesLinks.jsx';

const listOf = (st) => (Array.isArray(st.quests) ? st.quests : []);

function Quest({ q, edit, remove }) {
  const [open, setOpen] = useState(!q.name);
  return (
    <div className="sk" style={{ opacity: q.done ? 0.6 : 1 }}>
      <div className="row between" style={{ gap: 8 }}>
        <label className="row" style={{ gap: 8, minWidth: 0, flex: 1 }}>
          <input type="checkbox" checked={!!q.done} onChange={(e) => edit({ done: e.target.checked })} />
          <b style={{ textDecoration: q.done ? 'line-through' : 'none' }}>{q.name || 'New quest'}</b>
        </label>
        <button className="btn sm" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Edit'}</button>
      </div>
      {!open && (q.from || q.reward || q.notes) && (
        <p className="small" style={{ margin: '4px 0 0' }}>
          {q.from && <><b>From:</b> {q.from}<br /></>}
          {q.reward && <><b>Reward:</b> {q.reward}<br /></>}
          {q.notes && <span style={{ whiteSpace: 'pre-wrap' }}>{q.notes}</span>}
        </p>)}
      {open && (
        <div style={{ marginTop: 6 }}>
          <div className="field"><span className="lab">Quest</span><input className="f" value={q.name} onChange={(e) => edit({ name: e.target.value })} placeholder="e.g. Find Pippa's cake" /></div>
          <div className="field"><span className="lab">From</span><input className="f" value={q.from} onChange={(e) => edit({ from: e.target.value })} placeholder="Who gave it, and where" /></div>
          <div className="field"><span className="lab">Reward promised</span><input className="f" value={q.reward} onChange={(e) => edit({ reward: e.target.value })} placeholder="e.g. 80 gp and a box" /></div>
          <div className="field"><span className="lab">Notes</span><textarea className="f" value={q.notes} onChange={(e) => edit({ notes: e.target.value })} /></div>
          <button className="btn sm" onClick={remove}>Delete</button>
        </div>)}
    </div>
  );
}

export default function QuestsTab({ st, update }) {
  const [showDone, setShowDone] = useState(false);
  const all = listOf(st);
  const open = all.filter((q) => !q.done);
  const done = all.filter((q) => q.done);
  const change = (id, fn) => update((s) => { s.quests = fn(listOf(s), id); return s; });
  const edit = (id) => (patch) => change(id, (l) => l.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const remove = (id) => () => change(id, (l) => l.filter((q) => q.id !== id));
  const add = () => update((s) => { s.quests = [{ id: `q${Date.now().toString(36)}`, name: '', from: '', reward: '', notes: '', done: false }, ...listOf(s)]; return s; });
  return (
    <div className="card">
      <div className="row between"><h2 className="sec" style={{ margin: 0 }}>Quests</h2>
        <button className="btn sm primary" onClick={add}>+ Add quest</button></div>
      <p className="small muted">Note down each quest, who it's from and what they promised. Tick it when it's done. <RulesLink page="quests" /></p>
      {open.length === 0 && <p className="small muted">No open quests.</p>}
      {open.map((q) => <Quest key={q.id} q={q} edit={edit(q.id)} remove={remove(q.id)} />)}
      {done.length > 0 && (
        <>
          <button className="btn sm" style={{ marginTop: 8 }} onClick={() => setShowDone(!showDone)}>{showDone ? 'Hide' : 'Show'} done ({done.length})</button>
          {showDone && done.map((q) => <Quest key={q.id} q={q} edit={edit(q.id)} remove={remove(q.id)} />)}
        </>)}
    </div>
  );
}
