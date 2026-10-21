/* World Dungeon · Bestiary (GM area).
 *
 * Lists every stat block in window.BESTIARY (built by tools/bestiary.py):
 * search, filters, click-to-roll dice and attack bonuses, and printing
 * chosen blocks as cards. Also exposes window.WDB, the stat block renderer
 * and dice roller shared with the Mob Builder.
 */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TIERS = ['Trash', 'Standard', 'Elite', 'Boss', 'Floor Boss', 'Deity'];

  // ------------------------------------------------------------ markdown
  // Enough markdown for a stat block: the same shapes tools/build_pdf.py converts.
  function inline(t) {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, (m, x) => '<span class="xref">' + x + '</span>');
    t = t.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    return t;
  }
  function renderBlock(md) {
    const lines = String(md || '').split('\n');
    const out = [];
    let para = [];
    const flush = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
    let open = false;
    for (let i = 0; i < lines.length; i += 1) {
      const s = lines[i].trim();
      if (!s) { flush(); continue; }
      let h;
      if ((h = s.match(/^### (.+)$/))) {
        flush();
        if (open) out.push('</section>');
        out.push('<section class="entry statblock"><h3>' + inline(h[1].replace(/^Stat Block: /, '')) + '</h3>');
        open = true;
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j += 1;
        const meta = j < lines.length && lines[j].trim().match(/^\*\*([^*]+)\*\*$/);
        if (meta) { out.push('<div class="meta">' + meta[1].split('·').map((c) => '<span>' + inline(c.trim()) + '</span>').join('') + '</div>'); i = j; }
        continue;
      }
      if ((h = s.match(/^#### (.+)$/))) { flush(); out.push('<h4>' + inline(h[1]) + '</h4>'); continue; }
      if (s === '---') { flush(); continue; }
      if (s.startsWith('>')) {
        flush();
        const q = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) { q.push(lines[i].trim().slice(1).trim()); i += 1; }
        i -= 1;
        const text = q.join(' ');
        out.push('<blockquote class="' + (/^\*"|^\*\*Inspect/.test(text) ? 'system' : 'note') + '">' + inline(text) + '</blockquote>');
        continue;
      }
      if (s.startsWith('|')) {
        flush();
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())); i += 1; }
        i -= 1;
        const body = rows.filter((r) => !r.every((c) => /^:?-+:?$/.test(c) || c === ''));
        const head = rows[0] && rows[0].some((c) => c) && rows[1] && rows[1].every((c) => /^:?-+:?$/.test(c)) ? rows[0] : null;
        let t = '<div class="tablewrap"><table class="grid">';
        if (head) t += '<thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead>';
        t += '<tbody>' + (head ? body.slice(1) : body).map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
        out.push(t);
        continue;
      }
      if (/^- /.test(s)) {
        flush();
        const items = [];
        while (i < lines.length && /^- /.test(lines[i].trim())) { items.push(lines[i].trim().slice(2)); i += 1; }
        i -= 1;
        out.push('<ul>' + items.map((x) => '<li>' + inline(x) + '</li>').join('') + '</ul>');
        continue;
      }
      para.push(s);
    }
    flush();
    if (open) out.push('</section>');
    return out.join('');
  }

  // ------------------------------------------------------------ dice
  const d = (n) => 1 + Math.floor(Math.random() * n);
  function rollExpr(expr) {
    // "2d6 + 3", "1d10 − 1", "3d6": returns { total, detail }
    const e = expr.replace(/−/g, '-').replace(/\s+/g, '');
    let total = 0;
    const parts = [];
    e.replace(/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g, (m, s1, n, sides, s2, flat) => {
      if (sides) {
        const rolls = Array.from({ length: Number(n || 1) }, () => d(Number(sides)));
        const sum = rolls.reduce((a, b) => a + b, 0) * (s1 === '-' ? -1 : 1);
        total += sum; parts.push('[' + rolls.join(',') + ']');
      } else if (flat) {
        const v = Number(flat) * (s2 === '-' ? -1 : 1);
        total += v; parts.push((v < 0 ? '−' : '+') + Math.abs(v));
      }
      return m;
    });
    return { total, detail: parts.join(' ') };
  }
  let toastEl;
  function toast(html) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'wdb-toast'; document.body.appendChild(toastEl); }
    const row = document.createElement('div');
    row.innerHTML = html;
    toastEl.prepend(row);
    while (toastEl.children.length > 5) toastEl.lastChild.remove();
    setTimeout(() => row.classList.add('old'), 6000);
  }
  function d20(bonus, ev, label) {
    const mode = ev && ev.shiftKey ? 'adv' : ev && ev.altKey ? 'dis' : '';
    const a = d(20), b = d(20);
    const pick = mode === 'adv' ? Math.max(a, b) : mode === 'dis' ? Math.min(a, b) : a;
    const crit = pick === 20 ? ' <b class="crit">CRIT!</b>' : pick === 1 ? ' <b class="fumble">nat 1</b>' : '';
    toast(`<b>${esc(label || 'd20')}</b> ${mode ? `(${mode === 'adv' ? 'advantage' : 'disadvantage'}: ${a}, ${b}) ` : ''}${pick} ${bonus >= 0 ? '+' : '−'} ${Math.abs(bonus)} = <big>${pick + bonus}</big>${crit}`);
  }
  // Make dice and attack bonuses in a rendered block clickable.
  function enhanceRolls(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const re = /(\b\d*d\d+(?:\s*[+−-]\s*\d+)?\b)|(^\s*[+−-]\d+(?=[,\s]|$))/g;
    nodes.forEach((n) => {
      if (n.parentNode.closest('.roll, button, a, .wdb-noroll')) return;
      const prevEm = n.previousSibling && n.previousSibling.nodeName === 'EM' && /Attack Roll:?$/.test(n.previousSibling.textContent.trim());
      const text = n.nodeValue;
      if (!/\d*d\d+/.test(text) && !prevEm) return;
      const frag = document.createDocumentFragment();
      let last = 0;
      text.replace(re, (m, dice, bonus, off) => {
        if (bonus && !prevEm) return m;
        frag.appendChild(document.createTextNode(text.slice(last, off)));
        const b = document.createElement('span');
        b.className = 'roll';
        b.textContent = m;
        if (dice) b.dataset.dice = dice.trim(); else b.dataset.bonus = m.trim().replace('−', '-');
        frag.appendChild(b);
        last = off + m.length;
        return m;
      });
      frag.appendChild(document.createTextNode(text.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
    // Initiative, skill bonuses and saving throws in the tables roll a d20 too.
    root.querySelectorAll('tr').forEach((tr) => {
      const cells = tr.querySelectorAll('td');
      const key = cells[0] && cells[0].textContent.trim();
      if (!/^(Initiative|Skills|Mod \/ Save)$/i.test(key || '')) return;
      const heads = tr.closest('table') ? [...tr.closest('table').querySelectorAll('thead th')].map((th) => th.textContent.trim()) : [];
      [...cells].slice(1).forEach((td, ci) => {
        if (td.querySelector('.roll')) return;
        let html = td.innerHTML;
        if (/^Mod/i.test(key)) html = html.replace(/\/\s*([+−-]\d+)/, (mm, b) => `/ <span class="roll" data-bonus="${b.replace('−', '-')}" data-what="${esc((heads[ci + 1] || '') + ' save')}">${b}</span>`);
        else if (/^Initiative/i.test(key)) html = html.replace(/^([+−-]\d+)/, (mm, b) => `<span class="roll" data-bonus="${b.replace('−', '-')}" data-what="initiative">${b}</span>`);
        else html = html.replace(/([A-Z][A-Za-z ]+?) ([+−-]\d+)/g, (mm, nm, b) => `${nm} <span class="roll" data-bonus="${b.replace('−', '-')}" data-what="${esc(nm)}">${b}</span>`);
        td.innerHTML = html;
      });
    });
  }
  function labelFor(el) {
    const li = el.closest('li');
    const name = li && li.querySelector('strong');
    const block = el.closest('.statblock');
    const who = block && block.querySelector('h3');
    return [who && who.textContent, name && name.textContent.replace(/\.$/, '')].filter(Boolean).join(' · ');
  }
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('.roll');
    if (!el) return;
    ev.preventDefault();
    if (el.dataset.bonus) return d20(Number(el.dataset.bonus), ev, labelFor(el) + ' ' + (el.dataset.what || 'to hit'));
    const r = rollExpr(el.dataset.dice);
    toast(`<b>${esc(labelFor(el) || el.dataset.dice)}</b> ${esc(el.dataset.dice)}: ${r.detail} = <big>${r.total}</big>`);
  });

  // ------------------------------------------------------------ the server
  // Mobs saved from the Mob Builder live on the Tabletop Forge server (/api/world-dungeon/mobs),
  // like the Dungeon Builder's maps. A copy of the site without a server just shows the built-in ones.
  const API_BASE = (() => { try { return localStorage.getItem('wd_api') || ''; } catch (e) { return ''; } })();
  async function api(path, opts = {}) {
    const res = await fetch(`${API_BASE}/api/world-dungeon${path}`, {
      method: opts.method || 'GET',
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
    return res.json();
  }
  const XP = { Trash: 5, Standard: 10, Elite: 25, Boss: 100, 'Floor Boss': 200, Deity: 1000 };
  function fromServer(row) {
    const d = row.data || {}, st = d.state || {};
    const crN = String(st.cr || '0').includes('/') ? Number(String(st.cr).split('/')[0]) / Number(String(st.cr).split('/')[1]) : Number(st.cr || 0);
    const name = (st.name || row.name || 'Unnamed mob') + (st.variant ? ` (${st.variant})` : '');
    return {
      id: 'saved-' + row.id, serverId: row.id, saved: true, name, kind: st.mode === 'crawler' ? 'crawler' : 'mob',
      tier: st.tier || '', xp: XP[st.tier] || 0, level: String(st.level || ''), levelNum: /\d/.test(String(st.level || '')) ? Number(String(st.level).match(/\d+/)[0]) : null,
      cr: String(st.cr || '0'), crNum: crN, size: st.size || '', type: st.type || '', role: st.role || '', floor: Number(st.floor) || 0,
      area: '', found: st.found || '', md: d.md || '', html: renderBlock(d.md || ''), state: st, updated: row.updated_at,
      src: { title: 'Saved from the Mob Builder', url: '', file: d.file || '' },
    };
  }
  async function loadSaved() {
    try { return (await api('/mobs')).map(fromServer); } catch (e) { return null; }
  }

  window.WDB = { esc, inline, renderBlock, enhanceRolls, rollExpr, TIERS, api, loadSaved };

  // ------------------------------------------------------------ the Bestiary page
  const root = document.getElementById('wd-bestiary');
  if (!root) return;
  root.innerHTML = '<p class="hint">Loading…</p>';
  loadSaved().then((saved) => initBestiary(saved));
  function initBestiary(saved) {
  // A mob saved on the server replaces the same file pulled into the repo (tools/pull_saved_mobs.py), so it isn't listed twice.
  const savedFiles = new Set((saved || []).map((m) => m.src.file).filter(Boolean));
  const ALL = (window.BESTIARY || []).filter((m) => !savedFiles.has(m.src.file)).concat(saved || []);
  const offline = saved === null;
  const groupOf = (m) => (m.kind === 'deity' ? 'Gods and minor deities' : m.kind === 'crawler' ? 'NPC crawlers' : m.floor ? 'Floor ' + m.floor : 'Other mobs');
  const groups = [...new Set(ALL.map(groupOf))].sort((a, b) => (a.startsWith('Floor') && b.startsWith('Floor') ? a.localeCompare(b, undefined, { numeric: true }) : a.startsWith('Floor') ? -1 : b.startsWith('Floor') ? 1 : a.localeCompare(b)));
  const types = [...new Set(ALL.map((m) => m.type).filter(Boolean))].sort();
  const KEY = 'wd-bestiary-ui';
  let ui = { q: '', group: '', tier: '', type: '', role: '', crMin: '', crMax: '', sort: 'group', picked: [] };
  try { ui = Object.assign(ui, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage unavailable */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ui)); } catch (e) { /* storage unavailable */ } };
  const opened = new Set();
  let pendingDelete = null;
  const hashId = decodeURIComponent((location.hash || '').slice(1));
  if (hashId) opened.add(hashId);

  const opt = (v, label, cur) => `<option value="${esc(v)}"${String(cur) === String(v) ? ' selected' : ''}>${esc(label)}</option>`;
  root.innerHTML = `
    <div class="wdb-bar">
      <input type="search" class="wdb-q" placeholder="Search names, abilities, places…" value="${esc(ui.q)}">
      <select data-k="group">${opt('', 'All groups', ui.group)}${groups.map((g) => opt(g, g, ui.group)).join('')}</select>
      <select data-k="tier">${opt('', 'Any Mob Tier', ui.tier)}${TIERS.map((t) => opt(t, t, ui.tier)).join('')}</select>
      <select data-k="type">${opt('', 'Any type', ui.type)}${types.map((t) => opt(t, t, ui.type)).join('')}</select>
      <select data-k="role">${opt('', 'Any role', ui.role)}${opt('boss', 'Bosses', ui.role)}${opt('crawler', 'NPC crawlers', ui.role)}${opt('deity', 'Gods', ui.role)}${opt('mob', 'Not bosses', ui.role)}</select>
      <label class="wdb-cr">CR <input data-k="crMin" inputmode="decimal" placeholder="min" value="${esc(ui.crMin)}"> – <input data-k="crMax" inputmode="decimal" placeholder="max" value="${esc(ui.crMax)}"></label>
      <select data-k="sort">${opt('group', 'Sort: group', ui.sort)}${opt('name', 'Sort: name', ui.sort)}${opt('cr', 'Sort: CR', ui.sort)}${opt('tier', 'Sort: Mob Tier', ui.sort)}${opt('level', 'Sort: level', ui.sort)}</select>
    </div>
    <div class="wdb-actions"><span class="wdb-count"></span>
      <button type="button" class="wdb-btn" data-act="expand">Open all shown</button>
      <button type="button" class="wdb-btn" data-act="collapse">Close all</button>
      <button type="button" class="wdb-btn" data-act="pick">Tick all shown</button>
      <button type="button" class="wdb-btn" data-act="unpick">Untick all</button>
      <button type="button" class="wdb-btn primary" data-act="print">Print ticked</button></div>
    ${offline ? '<p class="wmb-hint">Mobs saved in the Mob Builder are kept on the Tabletop Forge server, which this copy of the site can\'t reach, so only the built-in stat blocks are shown.</p>' : ''}
    <div class="wdb-list"></div>`;
  const list = root.querySelector('.wdb-list');
  const crNum = (v) => { if (v === '' || v == null) return null; const s = String(v); if (s.includes('/')) { const [a, b] = s.split('/'); return Number(a) / Number(b); } return Number(s); };

  function shown() {
    const q = ui.q.trim().toLowerCase();
    const lo = crNum(ui.crMin), hi = crNum(ui.crMax);
    let r = ALL.filter((m) => {
      if (ui.group && groupOf(m) !== ui.group) return false;
      if (ui.tier && m.tier !== ui.tier) return false;
      if (ui.type && m.type !== ui.type) return false;
      if (ui.role === 'boss' && !/Boss/.test(m.tier)) return false;
      if (ui.role === 'crawler' && m.kind !== 'crawler') return false;
      if (ui.role === 'deity' && m.kind !== 'deity') return false;
      if (ui.role === 'mob' && (/Boss/.test(m.tier) || m.kind !== 'mob')) return false;
      if (lo != null && !isNaN(lo) && m.crNum < lo) return false;
      if (hi != null && !isNaN(hi) && m.crNum > hi) return false;
      if (q && !q.split(/\s+/).every((w) => (m.name + ' ' + m.area + ' ' + m.found + ' ' + m.md).toLowerCase().includes(w))) return false;
      return true;
    });
    const ti = (m) => (TIERS.indexOf(m.tier) + 10) % 10;
    const by = {
      name: (a, b) => a.name.localeCompare(b.name),
      cr: (a, b) => a.crNum - b.crNum || a.name.localeCompare(b.name),
      tier: (a, b) => ti(a) - ti(b) || a.name.localeCompare(b.name),
      level: (a, b) => (a.levelNum ?? 999) - (b.levelNum ?? 999) || a.name.localeCompare(b.name),
      group: (a, b) => groups.indexOf(groupOf(a)) - groups.indexOf(groupOf(b)) || ti(a) - ti(b) || a.name.localeCompare(b.name),
    };
    return r.sort(by[ui.sort] || by.group);
  }

  function row(m) {
    const on = opened.has(m.id), picked = ui.picked.includes(m.id);
    const lvl = m.levelNum != null ? 'Level ' + m.levelNum : '';
    return `<div class="wdb-row${on ? ' open' : ''}${picked ? ' picked' : ''}" data-id="${esc(m.id)}" id="${esc(m.id)}">
      <div class="wdb-head">
        <input type="checkbox" class="wdb-pick" aria-label="Tick for printing"${picked ? ' checked' : ''}>
        <button type="button" class="wdb-name">${esc(m.name)}</button>
        <span class="chip tier-${esc((m.tier || 'none').replace(/\s/g, '-').toLowerCase())}">${esc(m.tier || '—')}${m.xp ? ' · ' + m.xp.toLocaleString() + ' XP' : ''}</span>${m.saved ? '<span class="chip">saved</span>' : ''}
        <span class="wdb-sub">CR ${esc(m.cr)}${lvl ? ' · ' + lvl : ''} · ${esc(m.size)} ${esc(m.type)}${m.area ? ' · ' + esc(m.area) : ''}</span>
      </div>
      ${on ? `<div class="wdb-body">${m.html}<div class="wdb-links">${m.saved ? `<a href="mob-builder.html#edit=${m.serverId}">Edit in the Mob Builder</a><button type="button" class="wdb-btn" data-act="delete">${pendingDelete === m.id ? 'Click again to delete' : 'Delete'}</button>` : m.src.url ? `<a href="${esc(m.src.url)}">Open in ${esc(m.src.title)}</a>` : `<span>File: <code>${esc(m.src.file)}</code></span>`}<a href="mob-builder.html#clone=${encodeURIComponent(m.id)}">${m.saved ? 'Copy' : 'Clone'} in the Mob Builder</a><button type="button" class="wdb-btn" data-act="hp">Roll HP</button><button type="button" class="wdb-btn" data-act="copy">Copy markdown</button></div></div>` : ''}
    </div>`;
  }

  function draw() {
    const r = shown();
    root.querySelector('.wdb-count').textContent = `${r.length} of ${ALL.length} shown · ${ui.picked.length} ticked`;
    let html = '', g = null;
    r.forEach((m) => {
      if (ui.sort === 'group' && groupOf(m) !== g) { g = groupOf(m); html += `<h2 class="wdb-group">${esc(g)}</h2>`; }
      html += row(m);
    });
    list.innerHTML = html || '<p class="hint">Nothing matches.</p>';
    list.querySelectorAll('.wdb-body').forEach(enhanceRolls);
  }

  root.addEventListener('input', (ev) => {
    if (ev.target.classList.contains('wdb-q')) { ui.q = ev.target.value; save(); draw(); return; }
    const k = ev.target.dataset.k;
    if (k) { ui[k] = ev.target.value; save(); draw(); }
  });
  root.addEventListener('click', (ev) => {
    const r = ev.target.closest('.wdb-row');
    const id = r && r.dataset.id;
    const m = id && ALL.find((x) => x.id === id);
    if (ev.target.classList.contains('wdb-pick')) {
      ui.picked = ev.target.checked ? [...new Set([...ui.picked, id])] : ui.picked.filter((x) => x !== id);
      save(); r.classList.toggle('picked', ev.target.checked);
      root.querySelector('.wdb-count').textContent = `${shown().length} of ${ALL.length} shown · ${ui.picked.length} ticked`;
      return;
    }
    if (ev.target.classList.contains('wdb-name')) {
      if (opened.has(id)) opened.delete(id); else opened.add(id);
      draw();
      return;
    }
    const act = ev.target.dataset && ev.target.dataset.act;
    if (!act) return;
    if (act !== 'delete') pendingDelete = null;
    if (act === 'delete' && m) {
      if (pendingDelete !== m.id) { pendingDelete = m.id; draw(); return; }
      api(`/mobs/${m.serverId}`, { method: 'DELETE' }).then(() => {
        ALL.splice(ALL.indexOf(m), 1); ui.picked = ui.picked.filter((x) => x !== m.id); pendingDelete = null; save(); draw(); toast(`Deleted ${esc(m.name)}.`);
      }, (e) => toast('Not deleted: ' + esc(e.message)));
      return;
    }
    if (act === 'expand') shown().forEach((x) => opened.add(x.id));
    if (act === 'collapse') opened.clear();
    if (act === 'pick') ui.picked = [...new Set([...ui.picked, ...shown().map((x) => x.id)])];
    if (act === 'unpick') ui.picked = [];
    if (act === 'hp' && m) {
      const hp = ((m.fields ? m.fields.kv.HP : (m.md.match(/\*\*HP\*\* \| ([^|]+)/) || [])[1]) || '').match(/\(([^)]+)\)/);
      if (hp) { const x = rollExpr(hp[1]); toast(`<b>${esc(m.name)} HP</b> ${esc(hp[1])}: ${x.detail} = <big>${x.total}</big>`); }
      return;
    }
    if (act === 'copy' && m) {
      (navigator.clipboard ? navigator.clipboard.writeText(m.md) : Promise.reject()).then(() => toast('Markdown copied.'), () => toast('Copy failed: your browser blocked it.'));
      return;
    }
    if (act === 'print') return printPicked();
    save(); draw();
  });

  function printPicked() {
    const ids = ui.picked.length ? ui.picked : shown().map((x) => x.id);
    const sheet = document.createElement('div');
    sheet.className = 'wdb-print';
    sheet.innerHTML = ids.map((id) => ALL.find((x) => x.id === id)).filter(Boolean).map((m) => `<div class="wdb-card">${m.html}</div>`).join('');
    document.body.appendChild(sheet);
    document.body.classList.add('wdb-printing');
    const done = () => { document.body.classList.remove('wdb-printing'); sheet.remove(); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  }

  draw();
  if (hashId) { const el = document.getElementById(hashId); if (el) el.scrollIntoView({ block: 'start' }); }
  }
})();
