/* World Dungeon · Dungeon Builder (GM area).
 *
 * The GM enters the physical tiles and props they own, then generates floor
 * maps from them: named neighbourhoods with boss rooms, safe rooms and
 * stairwells. Each neighbourhood is built only from what the GM owns, because
 * it is laid out on the table on its own and the pieces are reused for the
 * next one. Maps print on one A4 page, or at scale across several sheets.
 *
 * Everything is saved on the Tabletop Forge server (/api/world-dungeon).
 */
(function () {
  'use strict';
  const root = document.getElementById('wd-builder');
  if (!root) return;

  // ---------------------------------------------------------------- helpers
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const num = (v, d) => (Number.isFinite(Number(v)) && v !== '' ? Number(v) : d);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const code = (i) => { let s = ''; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const FEATURES = ['Chasm', 'Pit', 'Water', 'Lava', 'Rubble', 'Trap', 'Darkness', 'Difficult terrain', 'Webs', 'Altar', 'Pillars'];
  const HAZARDS = new Set(['Chasm', 'Pit', 'Lava', 'Trap']);
  const PAPERS = { A5: [148, 210], A4: [210, 297], A3: [297, 420], A2: [420, 594], Letter: [215.9, 279.4], Legal: [215.9, 355.6], Tabloid: [279.4, 431.8] };
  const NB_COLORS = ['#f6e7c8', '#dcebf7', '#e6f2d9', '#f3dcea', '#e9e2f6', '#fbe3d3', '#d9f0ee', '#f1f0cf', '#e4e4e4', '#f7d9d9'];
  const TYPE_FILL = { boss: '#f2b8b5', safe: '#b9e4c4', stairs: '#b9d3f2' };

  const DEFAULT_KIT = () => ({
    squareSize: 1, squareUnit: 'in',
    tiles: [
      { id: uid('t'), name: 'Room 4×4', use: 'room', w: 4, h: 4, count: 4, cells: null, features: [] },
      { id: uid('t'), name: 'Room 6×6', use: 'room', w: 6, h: 6, count: 2, cells: null, features: [] },
      { id: uid('t'), name: 'Room 4×6', use: 'room', w: 4, h: 6, count: 2, cells: null, features: [] },
      { id: uid('t'), name: 'Room 2×4', use: 'either', w: 2, h: 4, count: 4, cells: null, features: [] },
      { id: uid('t'), name: 'Corridor 1×4', use: 'corridor', w: 1, h: 4, count: 6, cells: null, features: [] },
      { id: uid('t'), name: 'Corridor 2×2', use: 'corridor', w: 2, h: 2, count: 4, cells: null, features: [] },
      { id: uid('t'), name: 'Corner corridor', use: 'corridor', w: 3, h: 3, count: 2, cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], features: [] },
    ],
    props: [
      { id: uid('p'), name: 'Door', role: 'door', symbol: 'D', count: 8 },
      { id: uid('p'), name: 'Stairs', role: 'stairs', symbol: '≡', count: 2 },
      { id: uid('p'), name: 'Chest', role: 'decor', symbol: 'C', count: 3 },
      { id: uid('p'), name: 'Pillar', role: 'decor', symbol: 'O', count: 4 },
      { id: uid('p'), name: 'Barrel', role: 'decor', symbol: 'B', count: 4 },
      { id: uid('p'), name: 'Statue', role: 'decor', symbol: 'S', count: 2 },
    ],
  });

  // ---------------------------------------------------------------- server
  const API = { base: localStorage.getItem('wd_api') || '' };
  async function api(path, opts = {}) {
    const res = await fetch(`${API.base}/api/world-dungeon${path}`, {
      method: opts.method || 'GET',
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
    return res.json();
  }

  // ---------------------------------------------------------------- state
  const S = { kit: null, maps: [], map: null, mapId: null, view: 'kit', selected: null, status: '', paint: null, showCodes: true, showGrid: true };
  const setStatus = (t) => { S.status = t; const el = root.querySelector('.wd-status'); if (el) el.textContent = t; };
  const saveKit = debounce(async () => {
    try { await api('/kit', { method: 'PUT', body: { data: S.kit } }); setStatus('Kit saved'); } catch (e) { setStatus(`Kit not saved: ${e.message}`); }
  }, 700);
  const saveMap = debounce(async () => {
    if (!S.mapId) return;
    try { await api(`/maps/${S.mapId}`, { method: 'PUT', body: { name: S.map.name, data: S.map } }); setStatus('Map saved'); refreshList(); } catch (e) { setStatus(`Map not saved: ${e.message}`); }
  }, 700);
  async function refreshList() { try { S.maps = await api('/maps'); if (S.view === 'maps') render(); } catch { /* shown elsewhere */ } }

  // ---------------------------------------------------------------- shapes
  const tileCells = (t) => (t.cells && t.cells.length ? t.cells.map((c) => [c[0], c[1]]) : (() => { const out = []; for (let y = 0; y < t.h; y++) for (let x = 0; x < t.w; x++) out.push([x, y]); return out; })());
  const norm = (cells) => { const mx = Math.min(...cells.map((c) => c[0])); const my = Math.min(...cells.map((c) => c[1])); return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
  function rotations(t) {
    const out = []; const seen = new Set();
    let cells = tileCells(t);
    for (let r = 0; r < 4; r++) {
      const n = norm(cells); const k = n.map((c) => c.join(',')).join(';');
      if (!seen.has(k)) { seen.add(k); out.push({ r, cells: n }); }
      cells = cells.map(([x, y]) => [-y, x]);
    }
    return out;
  }
  // One square on the GM's tiles, in mm. Entered in inches (default 1) or mm.
  const sqMm = (kit) => (kit.squareSize != null ? num(kit.squareSize, 1) * (kit.squareUnit === 'mm' ? 1 : 25.4) : num(kit.squareMm, 25.4));
  const sqLabel = (mm) => (Math.abs(mm / 25.4 - Math.round(mm / 25.4 * 100) / 100) < 0.001 ? `${+(mm / 25.4).toFixed(2)} inch` : `${+mm.toFixed(1)} mm`);
  const kitCode = (kit, tileId) => code(Math.max(0, kit.tiles.findIndex((t) => t.id === tileId)));
  const canRoom = (t) => t.use === 'room' || t.use === 'either';
  const canCorr = (t) => t.use === 'corridor' || t.use === 'either';
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // ---------------------------------------------------------------- generator
  // Builds the floor neighbourhood by neighbourhood. Each one grows from a seed
  // point spread across an A4-shaped canvas, attached to what is already built
  // so the floor is one connected dungeon, and uses at most the tiles and props
  // the GM owns (counted afresh for every neighbourhood).
  function generate(kit, settings) {
    const rnd = mulberry32(settings.seed >>> 0);
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const nbs = settings.neighbourhoods.length ? settings.neighbourhoods : [{ name: 'Neighbourhood 1' }];
    const N = nbs.length;
    const tiles = kit.tiles.filter((t) => num(t.count, 0) > 0 && tileCells(t).length > 0);
    const shapes = new Map(tiles.map((t) => [t.id, rotations(t)]));
    const area = (t) => tileCells(t).length;
    const roomTiles = tiles.filter(canRoom); const corrTiles = tiles.filter(canCorr);
    const avg = (list) => (list.length ? list.reduce((s, t) => s + area(t) * num(t.count, 1), 0) / list.reduce((s, t) => s + num(t.count, 1), 0) : 0);
    const rmin = clamp(num(settings.roomsMin, 4), 1, 60); const rmax = Math.max(rmin, num(settings.roomsMax, 7));

    // Safe rooms from the first neighbourhood on (the first is the start hub),
    // stairwells from the last back (deeper is later).
    const safeOf = new Array(N).fill(0); const stairOf = new Array(N).fill(0);
    for (let i = 0; i < num(settings.safeRooms, 0); i++) safeOf[i % N] += 1;
    for (let i = 0; i < num(settings.stairwells, 0); i++) stairOf[N - 1 - (i % N)] += 1;
    const targets = nbs.map((_, k) => ri(rmin, rmax) + 1 + safeOf[k] + stairOf[k]);

    const landscape = settings.orientation !== 'portrait';
    const ratio = landscape ? Math.SQRT2 : 1 / Math.SQRT2;
    const estimate = targets.reduce((s, n) => s + n * (avg(roomTiles) + 0.8 * avg(corrTiles)), 0) || 100;

    let best = null;
    for (let attempt = 0; attempt < 6; attempt++) {
      const canvasArea = (estimate / 0.32) * Math.pow(1.3, attempt);
      const W = Math.max(12, Math.round(Math.sqrt(canvasArea * ratio)));
      const H = Math.max(12, Math.round(W / ratio));
      const result = build(W, H);
      const short = result.nb.reduce((s, nb, k) => s + Math.max(0, Math.min(rmin + 1, targets[k]) - nb.rooms), 0);
      if (!best || short < best.short) best = { ...result, short };
      if (short === 0) break;
    }
    return best;

    function build(W, H) {
      const occ = new Map(); // "x,y" -> piece index
      const pieces = []; const links = []; const props = [];
      // Seeds on a grid of cells that matches the page shape, visited in a snake.
      // A short last row is spread across the full width, so no corner is left empty.
      const cols = Math.max(1, Math.round(Math.sqrt(N * ratio))); const rows = Math.ceil(N / cols);
      const seeds = [];
      for (let r = 0; r < rows; r++) {
        const inRow = r < rows - 1 ? cols : N - cols * (rows - 1);
        for (let c = 0; c < inRow; c++) {
          const cc = r % 2 ? inRow - 1 - c : c;
          seeds.push([((cc + 0.5) / inRow) * W + (rnd() - 0.5) * (W / inRow) * 0.3, ((r + 0.5) / rows) * H + (rnd() - 0.5) * (H / rows) * 0.3]);
        }
      }
      const nb = nbs.map((n, k) => ({ name: n.name || `Neighbourhood ${k + 1}`, seed: seeds[k], rooms: 0, tilesUsed: {}, propsUsed: {} }));

      const free = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !occ.has(`${x},${y}`);
      const centre = (cells) => [cells.reduce((s, c) => s + c[0], 0) / cells.length + 0.5, cells.reduce((s, c) => s + c[1], 0) / cells.length + 0.5];
      const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

      // Every valid way to attach a tile to a parent piece, sampled.
      function candidates(parentIdx, tile, k, tries) {
        const parent = pieces[parentIdx]; const pset = new Set(parent.cells.map((c) => c.join(',')));
        const contacts = [];
        for (const [x, y] of parent.cells) for (const [dx, dy] of DIRS) if (!pset.has(`${x + dx},${y + dy}`) && free(x + dx, y + dy)) contacts.push([x + dx, y + dy, dx, dy]);
        const out = [];
        if (!contacts.length) return out;
        for (let i = 0; i < tries; i++) {
          const [nx, ny, dx, dy] = pick(contacts);
          const rot = pick(shapes.get(tile.id));
          const tset = new Set(rot.cells.map((c) => c.join(',')));
          const facing = rot.cells.filter(([tx, ty]) => !tset.has(`${tx - dx},${ty - dy}`));
          if (!facing.length) continue;
          const [tx, ty] = pick(facing);
          const ox = nx - tx; const oy = ny - ty;
          const cells = rot.cells.map(([cx, cy]) => [cx + ox, cy + oy]);
          if (!cells.every(([cx, cy]) => free(cx, cy))) continue;
          // Touching another neighbourhood (other than through this door) is
          // not allowed, and touching more of this one is discouraged.
          let extra = 0; let foreign = false;
          for (const [cx, cy] of cells) for (const [ex, ey] of DIRS) {
            const o = occ.get(`${cx + ex},${cy + ey}`);
            if (o === undefined || o === parentIdx) continue;
            if (pieces[o].nb !== k) foreign = true; else extra += 1;
          }
          if (foreign) continue;
          const c = centre(cells);
          let score = dist(c, nb[k].seed) + rnd() * 4 + extra * 0.6;
          for (let j = 0; j < N; j++) if (j !== k && dist(c, nb[j].seed) < dist(c, nb[k].seed)) score += 8;
          out.push({ cells, rot: rot.r, door: [[nx - dx, ny - dy], [nx, ny]], score });
        }
        return out.sort((a, b) => a.score - b.score);
      }

      function place(cand, tile, k, role, parentIdx, left) {
        const idx = pieces.length;
        pieces.push({ id: uid('r'), tileId: tile.id, cells: cand.cells, rot: cand.rot, nb: k, role, type: role === 'room' ? 'room' : 'corridor', features: [...(tile.features || [])], notes: '' });
        cand.cells.forEach(([x, y]) => occ.set(`${x},${y}`, idx));
        left.tiles[tile.id] -= 1;
        nb[k].tilesUsed[tile.id] = (nb[k].tilesUsed[tile.id] || 0) + 1;
        if (role === 'room') nb[k].rooms += 1;
        if (parentIdx != null) {
          const bothCorr = role === 'corridor' && pieces[parentIdx].role === 'corridor';
          const door = !bothCorr && takeProp(left, k, 'door');
          links.push({ a: cand.door[0], b: cand.door[1], door: door ? door.id : null, pa: parentIdx, pb: idx });
        }
        return idx;
      }
      function takeProp(left, k, role) {
        const options = kit.props.filter((x) => x.role === role && (left.props[x.id] || 0) > 0);
        if (!options.length) return null;
        const p = role === 'decor' ? pick(options) : options[0];
        left.props[p.id] -= 1; nb[k].propsUsed[p.id] = (nb[k].propsUsed[p.id] || 0) + 1;
        return p;
      }
      const tilePool = (left, f) => tiles.filter((t) => f(t) && left.tiles[t.id] > 0);

      for (let k = 0; k < N; k++) {
        const left = { tiles: Object.fromEntries(tiles.map((t) => [t.id, num(t.count, 0)])), props: Object.fromEntries(kit.props.map((p) => [p.id, num(p.count, 0)])) };
        const mine = [];
        // First room: in the middle of the canvas for the first neighbourhood,
        // otherwise attached to the nearest built piece of an earlier one.
        const firstTiles = tilePool(left, canRoom).length ? tilePool(left, canRoom) : tilePool(left, canCorr);
        if (!firstTiles.length) continue;
        if (k === 0) {
          const t = firstTiles.slice().sort((a, b) => area(b) - area(a))[0];
          const rot = shapes.get(t.id)[0];
          const tw = Math.max(...rot.cells.map((c) => c[0])) + 1; const th = Math.max(...rot.cells.map((c) => c[1])) + 1;
          const ox = clamp(Math.round(nb[0].seed[0] - tw / 2), 0, Math.max(0, W - tw)); const oy = clamp(Math.round(nb[0].seed[1] - th / 2), 0, Math.max(0, H - th));
          const cells = rot.cells.map(([x, y]) => [x + ox, y + oy]);
          mine.push(place({ cells, rot: rot.r }, t, 0, canRoom(t) ? 'room' : 'corridor', null, left));
        } else {
          const near = pieces.map((p, i) => ({ i, d: dist(centre(p.cells), nb[k].seed) })).sort((a, b) => a.d - b.d).slice(0, 8);
          let got = null;
          for (const { i } of near) {
            const useCorr = tilePool(left, canCorr).length && rnd() < 0.7;
            const pool = useCorr ? tilePool(left, canCorr) : firstTiles;
            for (const t of pool.slice().sort(() => rnd() - 0.5).slice(0, 4)) {
              const c = candidates(i, t, k, 80)[0];
              if (c && (!got || c.score < got.c.score)) got = { c, t, i, useCorr };
            }
            if (got) break;
          }
          if (!got) continue;
          mine.push(place(got.c, got.t, k, got.useCorr && canCorr(got.t) ? 'corridor' : (canRoom(got.t) ? 'room' : 'corridor'), got.i, left));
        }
        // Grow until the neighbourhood has its rooms or runs out of tiles or room.
        let fails = 0;
        while (nb[k].rooms < targets[k] && fails < 60) {
          const parentIdx = pick(mine);
          const parent = pieces[parentIdx];
          const rooms = tilePool(left, canRoom); const corrs = tilePool(left, canCorr);
          if (!rooms.length && !corrs.length) break;
          let wantCorr = parent.role === 'room' ? rnd() < 0.6 : rnd() < 0.3;
          if (!corrs.length) wantCorr = false; if (!rooms.length) wantCorr = true;
          const pool = wantCorr ? corrs : rooms;
          let best = null; let bestT = null;
          for (const t of pool.slice().sort(() => rnd() - 0.5).slice(0, 4)) {
            const c = candidates(parentIdx, t, k, 40)[0];
            if (c && (!best || c.score < best.score)) { best = c; bestT = t; }
          }
          if (!best) { fails += 1; continue; }
          const role = wantCorr && canCorr(bestT) ? 'corridor' : 'room';
          mine.push(place(best, bestT, k, role, parentIdx, left));
          fails = 0;
        }
        // Dead-end corridors go back in the box.
        let trimmed = true;
        while (trimmed) {
          trimmed = false;
          for (const idx of mine.slice()) {
            const p = pieces[idx];
            if (!p || p.role !== 'corridor' || p.dead) continue;
            const deg = links.filter((l) => !l.dead && (l.pa === idx || l.pb === idx)).length;
            if (deg <= 1 && idx !== mine[0]) {
              p.dead = true; p.cells.forEach(([x, y]) => occ.delete(`${x},${y}`));
              left.tiles[p.tileId] += 1; nb[k].tilesUsed[p.tileId] -= 1;
              links.filter((l) => l.pa === idx || l.pb === idx).forEach((l) => {
                l.dead = true;
                if (l.door) { left.props[l.door] += 1; nb[k].propsUsed[l.door] -= 1; }
              });
              trimmed = true;
            }
          }
        }
        assignTypes(k, mine.filter((i) => !pieces[i].dead), left);
      }

      function assignTypes(k, mine, left) {
        const rooms = mine.filter((i) => pieces[i].role === 'room');
        if (!rooms.length) return;
        // Graph distance from the neighbourhood's entrance.
        const d = new Map([[mine[0], 0]]); const q = [mine[0]];
        while (q.length) {
          const a = q.shift();
          for (const l of links) {
            if (l.dead) continue;
            const b = l.pa === a ? l.pb : l.pb === a ? l.pa : null;
            if (b == null || d.has(b) || pieces[b].nb !== k) continue;
            d.set(b, d.get(a) + 1); q.push(b);
          }
        }
        const hazard = (i) => pieces[i].features.some((f) => HAZARDS.has(f));
        const size = (i) => pieces[i].cells.length;
        const bossIdx = rooms.slice().sort((a, b) => ((d.get(b) || 0) * 2 + size(b) / 4) - ((d.get(a) || 0) * 2 + size(a) / 4))[0];
        pieces[bossIdx].type = 'boss';
        const rest = rooms.filter((i) => i !== bossIdx && !hazard(i));
        const nextToBoss = (i) => links.some((l) => !l.dead && ((l.pa === i && l.pb === bossIdx) || (l.pb === i && l.pa === bossIdx)));
        const safeList = rest.filter((i) => !nextToBoss(i)).sort((a, b) => Math.abs((d.get(a) || 0) - 2) - Math.abs((d.get(b) || 0) - 2));
        for (let n = 0; n < safeOf[k] && safeList.length; n++) pieces[safeList.shift()].type = 'safe';
        const stairList = rest.filter((i) => pieces[i].type === 'room').sort((a, b) => size(a) - size(b) || (d.get(b) || 0) - (d.get(a) || 0));
        for (let n = 0; n < stairOf[k] && stairList.length; n++) {
          const i = stairList.shift(); pieces[i].type = 'stairs';
          const p = takeProp(left, k, 'stairs');
          if (p) props.push({ prop: p.id, cell: interior(i)[0] || pieces[i].cells[0], piece: i });
        }
        // Extra doors where two rooms of the neighbourhood already touch.
        for (const a of rooms) for (const b of rooms) {
          if (a >= b || rnd() > 0.35) continue;
          if (links.some((l) => !l.dead && ((l.pa === a && l.pb === b) || (l.pa === b && l.pb === a)))) continue;
          const bset = new Set(pieces[b].cells.map((c) => c.join(',')));
          const edges = [];
          for (const [x, y] of pieces[a].cells) for (const [dx, dy] of DIRS) if (bset.has(`${x + dx},${y + dy}`)) edges.push([[x, y], [x + dx, y + dy]]);
          if (!edges.length) continue;
          const door = takeProp(left, k, 'door');
          const e = edges[Math.floor(edges.length / 2)];
          links.push({ a: e[0], b: e[1], door: door ? door.id : null, pa: a, pb: b });
        }
        // Decor props, never on a doorway cell, limited by what the GM owns.
        const density = { none: 0, light: 1, heavy: 3 }[settings.decor || 'light'] || 0;
        for (const i of rooms) {
          if (pieces[i].type === 'stairs') continue;
          const spots = interior(i).filter((c) => !props.some((p) => p.cell[0] === c[0] && p.cell[1] === c[1]));
          for (let n = 0; n < ri(0, density) && spots.length; n++) {
            const p = takeProp(left, k, 'decor');
            if (!p) break;
            props.push({ prop: p.id, cell: spots.splice(Math.floor(rnd() * spots.length), 1)[0], piece: i });
          }
        }
      }
      function interior(i) {
        const doorCells = new Set(links.filter((l) => !l.dead).flatMap((l) => [l.a.join(','), l.b.join(',')]));
        const own = new Set(pieces[i].cells.map((c) => c.join(',')));
        const inner = pieces[i].cells.filter(([x, y]) => DIRS.every(([dx, dy]) => own.has(`${x + dx},${y + dy}`)));
        const pool = (inner.length ? inner : pieces[i].cells).filter((c) => !doorCells.has(c.join(',')));
        return pool.sort(() => rnd() - 0.5);
      }

      // Drop removed pieces and renumber.
      const keep = pieces.map((p, i) => (p.dead ? -1 : i)).filter((i) => i >= 0);
      const remap = new Map(keep.map((old, n) => [old, n]));
      const outPieces = keep.map((i) => { const p = { ...pieces[i] }; delete p.dead; return p; });
      const outLinks = links.filter((l) => !l.dead && remap.has(l.pa) && remap.has(l.pb)).map((l) => ({ ...l, pa: remap.get(l.pa), pb: remap.get(l.pb) }));
      const outProps = props.filter((p) => remap.has(p.piece)).map((p) => ({ ...p, piece: remap.get(p.piece) }));
      // Room numbers: neighbourhood.room
      const countBy = {};
      outPieces.forEach((p) => { if (p.role === 'room') { countBy[p.nb] = (countBy[p.nb] || 0) + 1; p.label = `${p.nb + 1}.${countBy[p.nb]}`; } });
      return { W, H, pieces: outPieces, links: outLinks, props: outProps, nb: nb.map((x) => ({ name: x.name, rooms: x.rooms, tilesUsed: x.tilesUsed, propsUsed: x.propsUsed })) };
    }
  }

  // ---------------------------------------------------------------- drawing
  function bounds(map, nbOnly) {
    const cells = map.pieces.filter((p) => nbOnly == null || p.nb === nbOnly).flatMap((p) => p.cells);
    if (!cells.length) return { x: 0, y: 0, w: 10, h: 10 };
    const xs = cells.map((c) => c[0]); const ys = cells.map((c) => c[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs) + 1, h: Math.max(...ys) - Math.min(...ys) + 1 };
  }
  // The map's frame: its bounds with a margin, widened to the A4 shape.
  function frame(map, nbOnly, tight) {
    // Just enough room for the neighbourhood names above the rooms.
    const b = bounds(map, nbOnly); const m = tight ? 0.2 : 0.4; const top = 1.4;
    let x = b.x - m; let y = b.y - top; let w = b.w + 2 * m; let h = b.h + m + top;
    if (nbOnly == null && !tight) {
      const r = map.settings?.orientation === 'portrait' ? 1 / Math.SQRT2 : Math.SQRT2;
      if (w / h < r) { const nw = h * r; x -= (nw - w) / 2; w = nw; } else { const nh = w / r; y -= (nh - h) / 2; h = nh; }
    }
    return { x, y, w, h };
  }
  const centroid = (cells) => [cells.reduce((s, c) => s + c[0], 0) / cells.length + 0.5, cells.reduce((s, c) => s + c[1], 0) / cells.length + 0.5];
  function labelCell(cells) {
    const [cx, cy] = centroid(cells);
    return cells.slice().sort((a, b) => Math.hypot(a[0] + 0.5 - cx, a[1] + 0.5 - cy) - Math.hypot(b[0] + 0.5 - cx, b[1] + 0.5 - cy))[0];
  }

  // SVG of the map. `u` is the size of one square in SVG units (px on screen,
  // mm when printing), `view` the visible region in squares.
  function mapSVG(map, kit, opts) {
    const u = opts.u; const view = opts.view || frame(map);
    const sel = opts.selected; const grid = opts.grid !== false; const codes = opts.codes !== false;
    const out = [];
    const propOf = new Map(kit.props.map((p) => [p.id, p]));
    const nbFill = (k) => NB_COLORS[k % NB_COLORS.length];
    out.push(`<defs><pattern id="hatch${opts.idp || ''}" width="${u * 0.5}" height="${u * 0.5}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="${u * 0.5}" stroke="#7a4b2a" stroke-width="${u * 0.06}" opacity="0.55"/></pattern></defs>`);
    out.push(`<rect x="${view.x * u}" y="${view.y * u}" width="${view.w * u}" height="${view.h * u}" fill="#fff"/>`);
    map.pieces.forEach((p, i) => {
      const fill = p.role === 'corridor' ? '#e7e2d6' : (TYPE_FILL[p.type] || nbFill(p.nb));
      const d = p.cells.map(([x, y]) => `M${x * u} ${y * u}h${u}v${u}h${-u}z`).join('');
      out.push(`<path d="${d}" fill="${fill}" ${grid ? `stroke="#b9b2a2" stroke-width="${u * 0.02}"` : ''} data-piece="${i}" class="wd-piece${sel === i ? ' sel' : ''}"/>`);
      if (p.features.length) out.push(`<path d="${d}" fill="url(#hatch${opts.idp || ''})" pointer-events="none"/>`);
    });
    // Walls: every piece edge with no neighbour from the same piece.
    const walls = [];
    map.pieces.forEach((p) => {
      const own = new Set(p.cells.map((c) => c.join(',')));
      for (const [x, y] of p.cells) {
        if (!own.has(`${x},${y - 1}`)) walls.push(`M${x * u} ${y * u}h${u}`);
        if (!own.has(`${x},${y + 1}`)) walls.push(`M${x * u} ${(y + 1) * u}h${u}`);
        if (!own.has(`${x - 1},${y}`)) walls.push(`M${x * u} ${y * u}v${u}`);
        if (!own.has(`${x + 1},${y}`)) walls.push(`M${(x + 1) * u} ${y * u}v${u}`);
      }
    });
    out.push(`<path d="${walls.join('')}" stroke="#2b2a33" stroke-width="${u * 0.12}" stroke-linecap="square" fill="none" pointer-events="none"/>`);
    // Doorways: open the wall, then draw the door if a door prop is there.
    for (const l of map.links) {
      const [[ax, ay], [bx, by]] = [l.a, l.b];
      const vertical = ax !== bx; // wall between them is vertical
      const ex = Math.max(ax, bx); const ey = Math.max(ay, by);
      const [x1, y1, x2, y2] = vertical ? [ex * u, (ay + 0.15) * u, ex * u, (ay + 0.85) * u] : [(ax + 0.15) * u, ey * u, (ax + 0.85) * u, ey * u];
      out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="${u * 0.16}" pointer-events="none"/>`);
      if (l.door) {
        const w = u * 0.7; const t = u * 0.22;
        const rx = vertical ? ex * u - t / 2 : (ax + 0.15) * u; const ry = vertical ? (ay + 0.15) * u : ey * u - t / 2;
        out.push(`<rect x="${rx}" y="${ry}" width="${vertical ? t : w}" height="${vertical ? w : t}" fill="#8b5a2b" stroke="#3b2414" stroke-width="${u * 0.03}" pointer-events="none"/>`);
      }
    }
    // Props.
    for (const pr of map.props) {
      const p = propOf.get(pr.prop); if (!p) continue;
      const [x, y] = pr.cell;
      if (p.role === 'stairs') {
        for (let s = 0; s < 4; s++) out.push(`<rect x="${(x + 0.15) * u}" y="${(y + 0.15 + s * 0.18) * u}" width="${u * 0.7}" height="${u * 0.12}" fill="#3a4f74" pointer-events="none"/>`);
      } else {
        out.push(`<circle cx="${(x + 0.5) * u}" cy="${(y + 0.5) * u}" r="${u * 0.34}" fill="#fff" stroke="#2b2a33" stroke-width="${u * 0.05}" pointer-events="none"/>`);
        out.push(`<text x="${(x + 0.5) * u}" y="${(y + 0.5) * u}" font-size="${u * 0.38}" text-anchor="middle" dominant-baseline="central" font-family="Menlo,monospace" font-weight="700" pointer-events="none">${esc(p.symbol || p.name[0])}</text>`);
      }
    }
    // Room labels and tile codes.
    map.pieces.forEach((p) => {
      if (codes) {
        const [cx, cy] = p.cells.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0])[0];
        out.push(`<text x="${(cx + 0.08) * u}" y="${(cy + 0.08) * u}" font-size="${u * 0.24}" font-family="Menlo,monospace" fill="#6d6878" dominant-baseline="hanging" pointer-events="none">${esc(kitCode(kit, p.tileId))}</text>`);
      }
      if (p.role !== 'room') return;
      const [lx, ly] = labelCell(p.cells);
      const title = { boss: 'BOSS', safe: 'SAFE ROOM', stairs: 'STAIRWELL' }[p.type];
      const fs = u * 0.36;
      const lines = [p.label, title, p.name, ...p.features.map((f) => f.toUpperCase())].filter(Boolean);
      lines.forEach((t, n) => out.push(`<text x="${(lx + 0.5) * u}" y="${(ly + 0.5) * u + (n - (lines.length - 1) / 2) * fs * 1.1}" font-size="${n === 0 ? fs * 1.05 : fs * 0.8}" text-anchor="middle" dominant-baseline="central" font-family="Avenir Next Condensed,Arial Narrow,sans-serif" font-weight="${n < 2 ? 800 : 600}" fill="#1c1b24" stroke="#fff" stroke-width="${u * 0.06}" paint-order="stroke" pointer-events="none">${esc(t)}</text>`));
    });
    // Neighbourhood names.
    (map.nb || []).forEach((n, k) => {
      const cells = map.pieces.filter((p) => p.nb === k).flatMap((p) => p.cells);
      if (!cells.length || !n.name) return;
      const [cx, cy] = centroid(cells); const b = bounds(map, k);
      out.push(`<text x="${cx * u}" y="${(b.y - 0.6) * u}" font-size="${u * 0.95}" text-anchor="middle" font-family="Avenir Next Condensed,Arial Narrow,sans-serif" font-weight="800" letter-spacing="${u * 0.02}" fill="#d81b60" stroke="#fff" stroke-width="${u * 0.18}" paint-order="stroke" pointer-events="none">${esc(String(n.name).toUpperCase())}</text>`);
    });
    if (opts.overlay) out.push(opts.overlay(u));
    if (opts.caption) out.push(`<text x="${(view.x + 0.3) * u}" y="${(view.y + view.h - 0.3) * u}" font-size="${u * 0.45}" font-family="Avenir Next Condensed,Arial Narrow,sans-serif" font-weight="800" fill="#1c1b24" stroke="#fff" stroke-width="${u * 0.1}" paint-order="stroke">${esc(opts.caption)}</text>`);
    const size = opts.size ? `width="${opts.size[0]}" height="${opts.size[1]}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" ${size} viewBox="${view.x * u} ${view.y * u} ${view.w * u} ${view.h * u}" preserveAspectRatio="xMidYMid meet">${out.join('')}</svg>`;
  }

  function tileSVG(t, px) {
    const cells = tileCells(t); const w = Math.max(...cells.map((c) => c[0])) + 1; const h = Math.max(...cells.map((c) => c[1])) + 1;
    const d = cells.map(([x, y]) => `M${x * px} ${y * px}h${px}v${px}h${-px}z`).join('');
    return `<svg width="${w * px}" height="${h * px}" viewBox="0 0 ${w * px} ${h * px}"><path d="${d}" fill="${t.use === 'corridor' ? '#e7e2d6' : '#f6e7c8'}" stroke="#2b2a33" stroke-width="1"/></svg>`;
  }

  // ---------------------------------------------------------------- printing
  // ---- PDF output. Browsers lay out printed pages differently (Safari
  // ignores the page size and margins a web page asks for), so the builder
  // draws every sheet itself and writes a real PDF at the exact paper size.
  const mmPt = (mm) => (mm * 72) / 25.4;
  const dpiFor = (wMm, hMm) => clamp(Math.sqrt(14e6 / ((wMm / 25.4) * (hMm / 25.4))), 100, 200);
  async function sheetCanvas(wMm, hMm, draw) {
    const px = dpiFor(wMm, hMm) / 25.4; // pixels per mm
    const c = document.createElement('canvas');
    c.width = Math.round(wMm * px); c.height = Math.round(hMm * px);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await draw(ctx, px);
    return c;
  }
  function drawSVG(ctx, svg, x, y, w, h) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, x, y, w, h); res(); };
      img.onerror = () => rej(new Error('Could not draw the map'));
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
  }
  // A small white label box with text, at (x, y) in mm.
  function label(ctx, px, text, xMm, yMm, sizeMm) {
    ctx.font = `${sizeMm * px}px Menlo, monospace`;
    const w = ctx.measureText(text).width; const pad = 1.2 * px;
    ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fillRect(xMm * px - pad, yMm * px - sizeMm * px - pad, w + 2 * pad, sizeMm * px * 1.35 + 2 * pad);
    ctx.fillStyle = '#222'; ctx.fillText(text, xMm * px, yMm * px);
  }
  async function jpegOf(c) {
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
    return new Uint8Array(await blob.arrayBuffer());
  }
  // Minimal PDF: one full-page JPEG per page, at the page's exact size.
  function makePDF(pages) {
    const enc = new TextEncoder(); const chunks = []; let len = 0; const offs = [];
    const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; chunks.push(b); len += b.length; };
    const obj = (n, body) => { offs[n] = len; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };
    push('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n');
    const n = pages.length; const total = 3 + 3 * n;
    obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
    obj(2, () => push(`<< /Type /Pages /Count ${n} /Kids [${pages.map((_, i) => `${3 + 3 * i} 0 R`).join(' ')}] >>`));
    pages.forEach((p, i) => {
      const W = mmPt(p.wMm).toFixed(2); const H = mmPt(p.hMm).toFixed(2); const id = 3 + 3 * i;
      obj(id, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>`));
      const cs = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
      obj(id + 1, () => push(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
      obj(id + 2, () => { push(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpg.length} >>\nstream\n`); push(p.jpg); push('\nendstream'); });
    });
    const xref = len;
    push(`xref\n0 ${total}\n0000000000 65535 f \n`);
    for (let i = 1; i < total; i++) push(`${String(offs[i]).padStart(10, '0')} 00000 n \n`);
    push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(chunks, { type: 'application/pdf' });
  }
  async function pageOf(wMm, hMm, draw) {
    const c = await sheetCanvas(wMm, hMm, draw);
    return { wMm, hMm, w: c.width, h: c.height, jpg: await jpegOf(c) };
  }
  // The key: build lists and rooms, as text pages.
  async function keyPages(map, kit, paper) {
    const tName = (id) => { const t = kit.tiles.find((x) => x.id === id); return t ? `${kitCode(kit, id)} · ${t.name}` : id; };
    const pName = (id) => (kit.props.find((x) => x.id === id) || {}).name || id;
    const lines = [{ t: `${map.name} · key and build lists`, s: 6, b: true }];
    (map.nb || []).forEach((n, k) => {
      lines.push({ t: '', s: 2 }, { t: `${k + 1}. ${n.name}`, s: 5, b: true });
      lines.push({ t: `Tiles: ${Object.entries(n.tilesUsed || {}).filter(([, c]) => c > 0).map(([id, c]) => `${c}× ${tName(id)}`).join(', ') || '—'}`, s: 3.4 });
      lines.push({ t: `Props: ${Object.entries(n.propsUsed || {}).filter(([, c]) => c > 0).map(([id, c]) => `${c}× ${pName(id)}`).join(', ') || '—'}`, s: 3.4 });
      map.pieces.filter((p) => p.nb === k && p.role === 'room').forEach((p) => {
        const type = { boss: 'Boss room', safe: 'Safe room', stairs: 'Stairwell', room: 'Room' }[p.type];
        lines.push({ t: `${p.label}  ${type}${p.name ? ` · ${p.name}` : ''} — tile ${tName(p.tileId)}${p.features.length ? ` — ${p.features.join(', ')}` : ''}${p.notes ? ` — ${p.notes}` : ''}`, s: 3.2 });
      });
    });
    const m = 12; const out = []; let i = 0;
    while (i < lines.length) {
      const start = i;
      out.push(await pageOf(paper[0], paper[1], (ctx, px) => {
        let y = m;
        const maxW = (paper[0] - 2 * m) * px;
        while (i < lines.length) {
          const l = lines[i];
          ctx.font = `${l.b ? '700 ' : ''}${l.s * px}px "Avenir Next Condensed", "Arial Narrow", sans-serif`;
          // Wrap long lines.
          const words = l.t.split(' '); const rows = []; let cur = '';
          for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > maxW && cur) { rows.push(cur); cur = w; } else cur = t; }
          rows.push(cur);
          const need = rows.length * l.s * 1.35;
          if (y + need > paper[1] - m && i > start) break;
          ctx.fillStyle = l.b ? '#d81b60' : '#1c1b24';
          rows.forEach((r) => { y += l.s * 1.35; ctx.fillText(r, m * px, y * px); });
          i += 1;
        }
      }));
    }
    return out;
  }
  // Opens the finished PDF in the tab opened on the click (so it isn't blocked
  // as a pop-up), and keeps a download link in the page.
  // Prints the finished sheets straight from this page: one full-page image
  // per sheet, with the paper size and zero margin set for the print.
  let printURLs = [];
  function printSheets(pages) {
    printURLs.forEach((u) => URL.revokeObjectURL(u));
    printURLs = pages.map((p) => URL.createObjectURL(new Blob([p.jpg], { type: 'image/jpeg' })));
    const paper = [pages[0].wMm, pages[0].hMm];
    let box = document.getElementById('wd-print');
    if (!box) { box = document.createElement('div'); box.id = 'wd-print'; document.body.appendChild(box); }
    box.innerHTML = printURLs.map((u) => `<img src="${u}" alt="">`).join('');
    let st = document.getElementById('wd-print-page');
    if (!st) { st = document.createElement('style'); st.id = 'wd-print-page'; document.head.appendChild(st); }
    st.textContent = `@page { size: ${paper[0]}mm ${paper[1]}mm; margin: 0; }
      @media print { #wd-print img { width: ${paper[0]}mm; height: ${paper[1]}mm; } }`;
    document.body.classList.add('wd-printing');
    const done = () => { document.body.classList.remove('wd-printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    const imgs = [...box.querySelectorAll('img')];
    Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = r; i.onerror = r; })))).then(() => {
      setStatus('Ready to print');
      const again = root.querySelector('.wd-printnow');
      if (again) { again.hidden = false; again.onclick = () => { document.body.classList.add('wd-printing'); window.print(); }; }
      window.print();
    });
  }
  async function output(target, tab, build, fileName) {
    if (target === 'print') {
      try { setStatus('Drawing the sheets…'); printSheets(await build()); } catch (e) { setStatus(`Print failed: ${e.message}`); }
      return;
    }
    return showPDF(tab, build, fileName);
  }
  async function showPDF(tab, build, fileName) {
    try {
      setStatus('Making the PDF…');
      const blob = makePDF(await build());
      const url = URL.createObjectURL(blob);
      if (tab && !tab.closed) tab.location.href = url;
      const a = root.querySelector('.wd-pdflink');
      if (a) { a.href = url; a.download = fileName; a.textContent = `Download ${fileName} (${(blob.size / 1048576).toFixed(1)} MB)`; a.hidden = false; }
      setStatus('PDF ready');
    } catch (e) { if (tab && !tab.closed) tab.close(); setStatus(`PDF failed: ${e.message}`); }
  }
  const safeName = (s) => (String(s || 'map').replace(/[^\w\- ]+/g, '').trim() || 'map');

  function keyPageHTML(map, kit) {
    const tName = (id) => { const t = kit.tiles.find((x) => x.id === id); return t ? `${kitCode(kit, id)} · ${t.name}` : id; };
    const pName = (id) => (kit.props.find((x) => x.id === id) || {}).name || id;
    return (map.nb || []).map((n, k) => {
      const rooms = map.pieces.filter((p) => p.nb === k && p.role === 'room');
      const tiles = Object.entries(n.tilesUsed || {}).filter(([, c]) => c > 0).map(([id, c]) => `${c}× ${esc(tName(id))}`).join(', ');
      const props = Object.entries(n.propsUsed || {}).filter(([, c]) => c > 0).map(([id, c]) => `${c}× ${esc(pName(id))}`).join(', ');
      return `<div class="wd-key"><h3>${k + 1}. ${esc(n.name)}</h3><p><b>Tiles:</b> ${tiles || '—'}<br><b>Props:</b> ${props || '—'}</p>
        <table><tbody>${rooms.map((p) => `<tr><td>${esc(p.label)}</td><td>${esc({ boss: 'Boss room', safe: 'Safe room', stairs: 'Stairwell', room: 'Room' }[p.type])}${p.name ? ` · ${esc(p.name)}` : ''}</td><td>${esc(tName(p.tileId))}</td><td>${esc(p.features.join(', '))}${p.notes ? ` — ${esc(p.notes)}` : ''}</td></tr>`).join('')}</tbody></table></div>`;
    }).join('');
  }

  // One A4 sheet, the map filling it edge to edge, then the key.
  function printOverview(map, kit, target, tab) {
    const portrait = map.settings?.orientation === 'portrait';
    const paper = portrait ? PAPERS.A4 : [PAPERS.A4[1], PAPERS.A4[0]];
    const mapPage = () => pageOf(paper[0], paper[1], (ctx, px) => drawSVG(ctx, mapSVG(map, kit, { u: 10, size: [paper[0] * px, paper[1] * px], codes: S.showCodes, grid: S.showGrid, idp: 'o', caption: map.name }), 0, 0, paper[0] * px, paper[1] * px));
    // Printing gives the map sheet; the PDF adds the key pages after it.
    return output(target, tab, async () => (target === 'print' ? [await mapPage()] : [await mapPage(), ...(await keyPages(map, kit, PAPERS.A4))]), `${safeName(map.name)} A4.pdf`);
  }

  // At scale: sheets laid edge to edge with no margin or overlap, the dungeon
  // centred in the grid so spare paper is shared out evenly on every side.
  function scaleLayout(map, opt) {
    const paperBase = PAPERS[opt.paper] || PAPERS.A4;
    const paper = opt.landscape ? [paperBase[1], paperBase[0]] : paperBase;
    const sq = opt.squareMm;
    const view = opt.nb === 'all' ? frame(map, null, true) : frame(map, Number(opt.nb), true);
    const mapW = view.w * sq; const mapH = view.h * sq;
    const pw = paper[0]; const ph = paper[1];
    const cols = Math.max(1, Math.ceil(mapW / pw - 1e-6)); const rows = Math.max(1, Math.ceil(mapH / ph - 1e-6));
    const x0 = view.x - (cols * pw - mapW) / 2 / sq; const y0 = view.y - (rows * ph - mapH) / 2 / sq;
    // Sheets with nothing on them are not printed.
    const cells = map.pieces.filter((p) => opt.nb === 'all' || p.nb === Number(opt.nb)).flatMap((p) => p.cells);
    const sheets = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const v = { x: x0 + (c * pw) / sq, y: y0 + (r * ph) / sq, w: pw / sq, h: ph / sq };
      const used = cells.some(([x, y]) => x + 1 > v.x && x < v.x + v.w && y + 1 > v.y && y < v.y + v.h);
      sheets.push({ r, c, v, used });
    }
    const printed = sheets.filter((x) => x.used).length;
    const grid = { x: x0, y: y0, w: (cols * pw) / sq, h: (rows * ph) / sq };
    return { paper, sq, view, grid, mapW, mapH, pw, ph, cols, rows, sheets, printed };
  }
  // Just one neighbourhood's pieces, for printing it on its own.
  function onlyNb(map, k) {
    const keep = map.pieces.map((p, i) => (p.nb === k ? i : -1)).filter((i) => i >= 0);
    const re = new Map(keep.map((old, n) => [old, n]));
    return { ...map, pieces: keep.map((i) => map.pieces[i]),
      links: map.links.filter((l) => re.has(l.pa) && re.has(l.pb)).map((l) => ({ ...l, pa: re.get(l.pa), pb: re.get(l.pb) })),
      props: map.props.filter((p) => re.has(p.piece)).map((p) => ({ ...p, piece: re.get(p.piece) })),
      nb: map.nb.map((n, j) => (j === k ? n : { ...n, name: '' })) };
  }
  function printScaled(full, kit, opt, target, tab) {
    const map = opt.nb === 'all' ? full : onlyNb(full, Number(opt.nb));
    const L = scaleLayout(map, opt);
    return output(target, tab, async () => {
      const pages = [];
      // Assembly guide on one sheet of the same paper.
      const guideOverlay = (u) => {
        let s = ''; let n = 0;
        for (const sh of L.sheets) {
          if (!sh.used) continue;
          n += 1;
          const x = sh.v.x * u; const y = sh.v.y * u;
          s += `<rect x="${x}" y="${y}" width="${sh.v.w * u}" height="${sh.v.h * u}" fill="none" stroke="#00808a" stroke-width="${u * 0.08}" stroke-dasharray="${u * 0.3} ${u * 0.2}"/>`;
          s += `<text x="${x + u * 0.4}" y="${y + u * 1.2}" font-size="${u * 1.1}" font-weight="800" fill="#00808a" font-family="Menlo,monospace">${n}</text>`;
        }
        return s;
      };
      const gview = L.grid;
      pages.push(await pageOf(L.paper[0], L.paper[1], async (ctx, px) => {
        const g = 10; const head = 10;
        await drawSVG(ctx, mapSVG(map, kit, { u: 10, view: gview, size: [(L.paper[0] - 2 * g) * px, (L.paper[1] - 2 * g - head) * px], overlay: guideOverlay, codes: S.showCodes, grid: S.showGrid, idp: 'g' }), g * px, (g + head) * px, (L.paper[0] - 2 * g) * px, (L.paper[1] - 2 * g - head) * px);
        label(ctx, px, `${map.name} · assembly guide · ${L.printed} sheets on a ${L.cols} × ${L.rows} grid · 1 square = ${sqLabel(L.sq)}`, g, g + 5, 3.5);
      }));
      let n = 0;
      for (const sh of L.sheets) {
        if (!sh.used) continue;
        n += 1; setStatus(`Drawing sheet ${n} of ${L.printed}…`);
        const { r, c } = sh; const view = sh.v;
        pages.push(await pageOf(L.paper[0], L.paper[1], async (ctx, px) => {
          await drawSVG(ctx, mapSVG(map, kit, { u: L.sq, view, size: [L.pw * px, L.ph * px], codes: S.showCodes, grid: S.showGrid, idp: `s${n}` }), 0, 0, L.pw * px, L.ph * px);
          label(ctx, px, `${map.name} · sheet ${n} of ${L.printed} (row ${r + 1}, column ${c + 1}) · 1 square = ${sqLabel(L.sq)}`, 5, 6, 2.6);
          // The check bar, exactly 50 mm, on the first sheet only.
          if (n === 1) {
            const bx = 5; const by = L.paper[1] - 8;
            ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fillRect((bx - 1.2) * px, (by - 4) * px, 112 * px, 7 * px);
            ctx.fillStyle = '#000'; ctx.fillRect(bx * px, (by - 1) * px, 50 * px, 2 * px);
            ctx.font = `${2.6 * px}px Menlo, monospace`; ctx.fillStyle = '#222'; ctx.fillText('50 mm: measure to check the print is at 100%', (bx + 52) * px, (by + 0.8) * px);
          }
        }));
      }
      return pages;
    }, `${safeName(map.name)} at scale ${opt.paper}.pdf`);
  }

  function downloadSVG(map, kit) {
    const svg = mapSVG(map, kit, { u: 20, codes: S.showCodes, grid: S.showGrid, idp: 'd' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    a.download = `${(map.name || 'map').replace(/[^\w\- ]+/g, '').trim() || 'map'}.svg`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------------------------------------------------------------- views
  function render() {
    root.innerHTML = `
      <div class="wd-tabs no-print">
        ${[['kit', 'Your tiles and props'], ['new', 'New map'], ['maps', `Saved maps (${S.maps.length})`]].map(([k, l]) => `<button class="chip${S.view === k ? ' on' : ''}" data-view="${k}">${l}</button>`).join('')}
        ${S.map ? `<button class="chip${S.view === 'map' ? ' on' : ''}" data-view="map">Open: ${esc(S.map.name)}</button>` : ''}
        <span class="wd-status">${esc(S.status)}</span>
      </div>
      <div class="wd-body">${S.view === 'kit' ? kitView() : S.view === 'new' ? newView() : S.view === 'maps' ? mapsView() : mapView()}</div>`;
    root.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { S.view = b.dataset.view; if (S.view === 'maps') refreshList(); render(); }));
    if (S.view === 'kit') bindKit(); else if (S.view === 'new') bindNew(); else if (S.view === 'maps') bindMaps(); else bindMap();
  }

  // ----- kit
  function kitView() {
    const k = S.kit;
    return `
      <p class="hint">Enter the tiles and props you own. Sizes are in grid squares. A neighbourhood is built only from what you have, and pieces are reused for the next neighbourhood. Everything saves to your Tabletop Forge server as you type.</p>
      <div class="wd-row" style="max-width:420px"><div class="field"><label>One square on your tiles</label><input type="number" step="0.05" min="0.1" data-k="squareSize" value="${esc(k.squareSize)}"></div>
        <div class="field"><label>Unit</label><select data-k="squareUnit"><option value="in"${k.squareUnit !== 'mm' ? ' selected' : ''}>inches</option><option value="mm"${k.squareUnit === 'mm' ? ' selected' : ''}>mm</option></select></div></div>
      <h3>Tiles</h3>
      <div class="tablewrap"><table class="wd-table"><thead><tr><th>Code</th><th>Shape</th><th>Name</th><th>Use as</th><th>Width</th><th>Height</th><th>How many</th><th>Printed features</th><th></th></tr></thead><tbody>
      ${k.tiles.map((t, i) => `<tr data-t="${i}">
        <td><b>${code(i)}</b></td>
        <td>${tileSVG(t, 9)}<br><button class="wd-mini" data-act="shape">${t.cells && t.cells.length ? 'Edit shape' : 'Irregular…'}</button></td>
        <td><input type="text" data-f="name" value="${esc(t.name)}"></td>
        <td><select data-f="use">${['room', 'corridor', 'either'].map((u) => `<option${t.use === u ? ' selected' : ''}>${u}</option>`).join('')}</select></td>
        <td><input type="number" min="1" max="40" data-f="w" value="${esc(t.w)}"></td>
        <td><input type="number" min="1" max="40" data-f="h" value="${esc(t.h)}"></td>
        <td><input type="number" min="0" max="999" data-f="count" value="${esc(t.count)}"></td>
        <td>${FEATURES.map((f) => `<label class="wd-feat"><input type="checkbox" data-feat="${esc(f)}"${t.features.includes(f) ? ' checked' : ''}>${esc(f)}</label>`).join('')}</td>
        <td><button class="wd-mini" data-act="del">Remove</button></td></tr>
        ${S.paint === i ? `<tr><td colspan="9">${painterHTML(t)}</td></tr>` : ''}`).join('')}
      </tbody></table></div>
      <button class="btn light" data-act="add-tile">+ Add a tile</button>
      <h3>Props</h3>
      <p class="hint">Doors go in doorways (a doorway without a door left over stays open). Stairs mark stairwells. Decor is scattered in rooms. Each neighbourhood uses at most the number you own.</p>
      <div class="tablewrap"><table class="wd-table"><thead><tr><th>Name</th><th>Kind</th><th>Map symbol</th><th>How many</th><th></th></tr></thead><tbody>
      ${k.props.map((p, i) => `<tr data-p="${i}">
        <td><input type="text" data-f="name" value="${esc(p.name)}"></td>
        <td><select data-f="role">${[['door', 'Door'], ['stairs', 'Stairs'], ['decor', 'Decor']].map(([v, l]) => `<option value="${v}"${p.role === v ? ' selected' : ''}>${l}</option>`).join('')}</select></td>
        <td><input type="text" maxlength="2" data-f="symbol" value="${esc(p.symbol)}" style="width:60px"></td>
        <td><input type="number" min="0" max="999" data-f="count" value="${esc(p.count)}"></td>
        <td><button class="wd-mini" data-act="del">Remove</button></td></tr>`).join('')}
      </tbody></table></div>
      <button class="btn light" data-act="add-prop">+ Add a prop</button>`;
  }
  function painterHTML(t) {
    const own = new Set(tileCells(t).map((c) => c.join(',')));
    let cells = '';
    for (let y = 0; y < t.h; y++) for (let x = 0; x < t.w; x++) cells += `<button class="wd-cell${own.has(`${x},${y}`) ? ' on' : ''}" data-x="${x}" data-y="${y}"></button>`;
    return `<div class="wd-painter"><p class="hint">Click squares to draw the tile's shape inside its ${t.w}×${t.h} box. Change Width and Height above to resize the box.</p>
      <div class="wd-grid" style="grid-template-columns:repeat(${t.w}, 26px)">${cells}</div>
      <button class="wd-mini" data-act="rect">Make it a full rectangle</button> <button class="wd-mini" data-act="close-shape">Done</button></div>`;
  }
  function bindKit() {
    const k = S.kit;
    const changed = () => { saveKit(); setStatus('Saving…'); };
    root.querySelector('[data-k="squareSize"]').addEventListener('input', (e) => { k.squareSize = Math.max(0.1, num(e.target.value, 1)); changed(); });
    root.querySelector('[data-k="squareUnit"]').addEventListener('change', (e) => { k.squareUnit = e.target.value; changed(); });
    root.querySelectorAll('tr[data-t]').forEach((tr) => {
      const t = k.tiles[Number(tr.dataset.t)];
      tr.querySelectorAll('[data-f]').forEach((el) => el.addEventListener('change', () => {
        const f = el.dataset.f;
        t[f] = ['w', 'h', 'count'].includes(f) ? clamp(Math.round(num(el.value, 1)), f === 'count' ? 0 : 1, f === 'count' ? 999 : 40) : el.value;
        if ((f === 'w' || f === 'h') && t.cells) t.cells = t.cells.filter(([x, y]) => x < t.w && y < t.h);
        changed(); if (f !== 'name') render();
      }));
      tr.querySelectorAll('[data-feat]').forEach((el) => el.addEventListener('change', () => {
        const f = el.dataset.feat; t.features = el.checked ? [...new Set([...t.features, f])] : t.features.filter((x) => x !== f); changed();
      }));
      tr.querySelector('[data-act="del"]').addEventListener('click', () => { k.tiles.splice(Number(tr.dataset.t), 1); S.paint = null; changed(); render(); });
      tr.querySelector('[data-act="shape"]').addEventListener('click', () => { S.paint = S.paint === Number(tr.dataset.t) ? null : Number(tr.dataset.t); render(); });
    });
    const painter = root.querySelector('.wd-painter');
    if (painter) {
      const t = k.tiles[S.paint];
      painter.querySelectorAll('.wd-cell').forEach((b) => b.addEventListener('click', () => {
        const x = Number(b.dataset.x); const y = Number(b.dataset.y);
        const cells = tileCells(t); const at = cells.findIndex((c) => c[0] === x && c[1] === y);
        if (at >= 0) { if (cells.length > 1) cells.splice(at, 1); } else cells.push([x, y]);
        t.cells = cells.length === t.w * t.h ? null : cells; changed(); render();
      }));
      painter.querySelector('[data-act="rect"]').addEventListener('click', () => { t.cells = null; changed(); render(); });
      painter.querySelector('[data-act="close-shape"]').addEventListener('click', () => { S.paint = null; render(); });
    }
    root.querySelectorAll('tr[data-p]').forEach((tr) => {
      const p = k.props[Number(tr.dataset.p)];
      tr.querySelectorAll('[data-f]').forEach((el) => el.addEventListener('change', () => {
        p[el.dataset.f] = el.dataset.f === 'count' ? clamp(Math.round(num(el.value, 0)), 0, 999) : el.value; changed();
      }));
      tr.querySelector('[data-act="del"]').addEventListener('click', () => { k.props.splice(Number(tr.dataset.p), 1); changed(); render(); });
    });
    root.querySelector('[data-act="add-tile"]').addEventListener('click', () => { k.tiles.push({ id: uid('t'), name: 'New tile', use: 'room', w: 4, h: 4, count: 1, cells: null, features: [] }); changed(); render(); });
    root.querySelector('[data-act="add-prop"]').addEventListener('click', () => { k.props.push({ id: uid('p'), name: 'New prop', role: 'decor', symbol: '?', count: 1 }); changed(); render(); });
  }

  // ----- new map
  const draft = { name: '', nbs: ['The Llama Pens', 'The Birthday Party Wing', 'The Mushroom Rave'], safeRooms: 3, stairwells: 1, roomsMin: 4, roomsMax: 7, decor: 'light', orientation: 'landscape' };
  function newView() {
    const owned = S.kit.tiles.reduce((s, t) => s + num(t.count, 0), 0);
    return `
      ${!owned ? '<div class="gm-banner">Add your tiles first (Your tiles and props).</div>' : ''}
      <div class="wd-form">
        <div class="field"><label>Map name</label><input type="text" data-d="name" value="${esc(draft.name)}" placeholder="Floor 1"></div>
        <div class="field"><label>Neighbourhoods (${draft.nbs.length}) — one name per line</label><textarea data-d="nbs" rows="${Math.max(4, draft.nbs.length + 1)}">${esc(draft.nbs.join('\n'))}</textarea></div>
        <div class="wd-row">
          <div class="field"><label>Safe rooms</label><input type="number" min="0" max="60" data-d="safeRooms" value="${draft.safeRooms}"></div>
          <div class="field"><label>Stairwells</label><input type="number" min="0" max="60" data-d="stairwells" value="${draft.stairwells}"></div>
          <div class="field"><label>Rooms per neighbourhood (fewest)</label><input type="number" min="1" max="60" data-d="roomsMin" value="${draft.roomsMin}"></div>
          <div class="field"><label>(most)</label><input type="number" min="1" max="60" data-d="roomsMax" value="${draft.roomsMax}"></div>
        </div>
        <div class="wd-row">
          <div class="field"><label>Page</label><select data-d="orientation"><option value="landscape"${draft.orientation === 'landscape' ? ' selected' : ''}>A4 landscape</option><option value="portrait"${draft.orientation === 'portrait' ? ' selected' : ''}>A4 portrait</option></select></div>
          <div class="field"><label>Decor props</label><select data-d="decor">${[['none', 'None'], ['light', 'A few'], ['heavy', 'Lots']].map(([v, l]) => `<option value="${v}"${draft.decor === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
        </div>
        <p class="hint">Every neighbourhood gets a boss room. Safe rooms are shared out from the first neighbourhood (the start hub), stairwells from the last. Rooms on a tile with a hazard (chasm, pit, lava, trap) are never safe rooms or stairwells.</p>
        <button class="btn primary" data-act="gen"${owned ? '' : ' disabled'}>Generate map</button>
      </div>`;
  }
  function bindNew() {
    root.querySelectorAll('[data-d]').forEach((el) => el.addEventListener('input', () => {
      const f = el.dataset.d;
      if (f === 'nbs') draft.nbs = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
      else draft[f] = ['safeRooms', 'stairwells', 'roomsMin', 'roomsMax'].includes(f) ? num(el.value, 0) : el.value;
      const lab = root.querySelector('[data-d="nbs"]').previousElementSibling; lab.textContent = `Neighbourhoods (${draft.nbs.length}) — one name per line`;
    }));
    root.querySelector('[data-act="gen"]').addEventListener('click', async () => {
      const settings = { neighbourhoods: draft.nbs.map((name) => ({ name })), safeRooms: draft.safeRooms, stairwells: draft.stairwells, roomsMin: draft.roomsMin, roomsMax: Math.max(draft.roomsMin, draft.roomsMax), decor: draft.decor, orientation: draft.orientation, seed: Math.floor(Math.random() * 2 ** 31) };
      const map = { name: draft.name.trim() || `Map ${S.maps.length + 1}`, settings, kitSnapshot: JSON.parse(JSON.stringify(S.kit)), ...generate(S.kit, settings) };
      setStatus('Saving map…');
      try {
        const row = await api('/maps', { method: 'POST', body: { name: map.name, data: map } });
        S.map = map; S.mapId = row.id; S.view = 'map'; S.selected = null; setStatus('Map saved'); refreshList(); render();
      } catch (e) { setStatus(`Map not saved: ${e.message}`); S.map = map; S.mapId = null; S.view = 'map'; render(); }
    });
  }

  // ----- saved maps
  function mapsView() {
    if (!S.maps.length) return '<p class="hint">No maps yet. Make one under New map.</p>';
    return `<div class="tablewrap"><table class="wd-table"><thead><tr><th>Name</th><th>Last changed</th><th></th></tr></thead><tbody>
      ${S.maps.map((m) => `<tr data-id="${m.id}"><td><input type="text" data-f="rename" value="${esc(m.name)}"></td><td>${esc(new Date(m.updated_at).toLocaleString())}</td>
      <td><button class="wd-mini" data-act="open">Open</button> <button class="wd-mini" data-act="del">Delete</button></td></tr>`).join('')}</tbody></table></div>
      <p class="hint">Maps stay saved until you delete them. Type in a name to rename a map.</p>`;
  }
  function bindMaps() {
    root.querySelectorAll('tr[data-id]').forEach((tr) => {
      const id = Number(tr.dataset.id);
      tr.querySelector('[data-f="rename"]').addEventListener('change', async (e) => {
        try { await api(`/maps/${id}`, { method: 'PUT', body: { name: e.target.value } }); if (S.mapId === id) S.map.name = e.target.value; setStatus('Renamed'); refreshList(); } catch (err) { setStatus(err.message); }
      });
      tr.querySelector('[data-act="open"]').addEventListener('click', async () => {
        try { const row = await api(`/maps/${id}`); S.map = { ...row.data, name: row.name }; S.mapId = id; S.view = 'map'; S.selected = null; render(); } catch (err) { setStatus(err.message); }
      });
      const del = tr.querySelector('[data-act="del"]');
      del.addEventListener('click', async () => {
        if (del.dataset.sure !== '1') { del.dataset.sure = '1'; del.textContent = 'Delete for good?'; return; }
        try { await api(`/maps/${id}`, { method: 'DELETE' }); if (S.mapId === id) { S.map = null; S.mapId = null; } setStatus('Deleted'); await refreshList(); render(); } catch (err) { setStatus(err.message); }
      });
    });
  }

  // ----- one map
  const scaleOpt = { paper: 'A4', landscape: false, nb: 'all', squareMm: null, open: false };
  function mapView() {
    const m = S.map; const kit = m.kitSnapshot || S.kit;
    const p = S.selected != null ? m.pieces[S.selected] : null;
    const sq = scaleOpt.squareMm || sqMm(S.kit);
    const L = scaleLayout(m, { ...scaleOpt, squareMm: sq });
    return `
      <div class="wd-toolbar no-print">
        <input type="text" class="wd-name" value="${esc(m.name)}" title="Map name">
        <button class="btn dark" data-act="regen">New layout</button>
        <button class="btn light" data-act="print">Print on A4</button>
        <button class="btn light" data-act="a4pdf">A4 PDF</button>
        <button class="btn${scaleOpt.open ? ' primary' : ' light'}" data-act="scale-open">Print at scale…</button>
        <button class="btn light" data-act="svg">Download SVG</button>
        <label class="wd-feat"><input type="checkbox" data-opt="codes"${S.showCodes ? ' checked' : ''}> Tile codes</label>
        <label class="wd-feat"><input type="checkbox" data-opt="grid"${S.showGrid ? ' checked' : ''}> Grid</label>
      </div>
      ${scaleOpt.open ? `<div class="wd-scale no-print">
        <h4 style="margin-top:0">Print at scale</h4>
        <div class="wd-row">
          <div class="field"><label>What to print</label><select data-s="nb"><option value="all">Whole map</option>${(m.nb || []).map((n, k) => `<option value="${k}"${String(scaleOpt.nb) === String(k) ? ' selected' : ''}>${esc(n.name)} only</option>`).join('')}</select></div>
          <div class="field"><label>Paper</label><select data-s="paper">${Object.keys(PAPERS).map((x) => `<option${scaleOpt.paper === x ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Turn</label><select data-s="landscape"><option value="0"${!scaleOpt.landscape ? ' selected' : ''}>Portrait</option><option value="1"${scaleOpt.landscape ? ' selected' : ''}>Landscape</option></select></div>
          <div class="field"><label>One square (inches)</label><input type="number" step="0.05" min="0.1" data-s="squareIn" value="${+(sq / 25.4).toFixed(3)}"></div>
        </div>
        <p class="hint">At ${sqLabel(sq)} a square the map is ${(L.mapW / 10).toFixed(1)} × ${(L.mapH / 10).toFixed(1)} cm: <b>${L.printed} sheet${L.printed > 1 ? 's' : ''}</b> of ${esc(scaleOpt.paper)} (blank ones skipped), plus an assembly guide. Print at 100%, then check the 50 mm bar on sheet 1.</p>
        <button class="btn primary" data-act="scale">Print ${L.printed} sheet${L.printed > 1 ? 's' : ''} + guide</button>
        <button class="btn light" data-act="scalepdf">Download as PDF</button>
      </div>` : ''}
      <p class="no-print" style="margin:0 0 10px"><button class="btn dark wd-printnow" hidden>Print now</button> <a class="wd-pdflink" hidden></a></p>
      <div class="wd-split">
        <div class="wd-canvas">${mapSVG(m, kit, { u: 12, selected: S.selected, codes: S.showCodes, grid: S.showGrid })}</div>
        <aside class="wd-side">
          ${p ? roomPanel(p, kit) : '<p class="hint">Click a room or corridor to edit it: its type, name, notes and features such as a chasm or pit.</p>'}
          <h4>Neighbourhoods</h4>
          ${(m.nb || []).map((n, k) => `<div class="field"><label>${k + 1}. ${n.rooms} rooms</label><input type="text" data-nb="${k}" value="${esc(n.name)}"></div>`).join('')}
          <h4>Build lists</h4>
          ${keyPageHTML(m, kit)}
        </aside>
      </div>`;
  }
  function roomPanel(p, kit) {
    const t = kit.tiles.find((x) => x.id === p.tileId);
    const isRoom = p.role === 'room';
    return `<div class="wd-room">
      <h4>${isRoom ? `Room ${esc(p.label)}` : 'Corridor'} · ${esc(S.map.nb[p.nb]?.name || '')}</h4>
      <p class="hint">Tile ${esc(kitCode(kit, p.tileId))}${t ? ` · ${esc(t.name)}` : ''}${p.rot ? ` · turned ${p.rot * 90}°` : ''}</p>
      ${isRoom ? `<div class="field"><label>Type</label><select data-r="type">${[['room', 'Room'], ['boss', 'Boss room'], ['safe', 'Safe room'], ['stairs', 'Stairwell']].map(([v, l]) => `<option value="${v}"${p.type === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label>Name on the map</label><input type="text" data-r="name" value="${esc(p.name || '')}" placeholder="Mama Drama's pen"></div>` : ''}
      <div class="field"><label>Features</label>${FEATURES.map((f) => `<label class="wd-feat"><input type="checkbox" data-rf="${esc(f)}"${p.features.includes(f) ? ' checked' : ''}>${esc(f)}</label>`).join('')}</div>
      <div class="field"><label>Notes</label><textarea data-r="notes">${esc(p.notes || '')}</textarea></div>
    </div>`;
  }
  function bindMap() {
    const m = S.map; const kit = m.kitSnapshot || S.kit;
    const changed = () => { setStatus('Saving…'); saveMap(); };
    root.querySelector('.wd-name').addEventListener('change', (e) => { m.name = e.target.value.trim() || m.name; changed(); render(); });
    root.querySelectorAll('.wd-piece').forEach((el) => el.addEventListener('click', () => { S.selected = Number(el.dataset.piece); render(); }));
    root.querySelectorAll('[data-opt]').forEach((el) => el.addEventListener('change', () => { if (el.dataset.opt === 'codes') S.showCodes = el.checked; else S.showGrid = el.checked; render(); }));
    root.querySelectorAll('[data-nb]').forEach((el) => el.addEventListener('change', () => { m.nb[Number(el.dataset.nb)].name = el.value; m.settings.neighbourhoods[Number(el.dataset.nb)] = { name: el.value }; changed(); render(); }));
    const p = S.selected != null ? m.pieces[S.selected] : null;
    if (p) {
      root.querySelectorAll('[data-r]').forEach((el) => el.addEventListener('change', () => { p[el.dataset.r] = el.value; changed(); render(); }));
      root.querySelectorAll('[data-rf]').forEach((el) => el.addEventListener('change', () => { const f = el.dataset.rf; p.features = el.checked ? [...new Set([...p.features, f])] : p.features.filter((x) => x !== f); changed(); render(); }));
    }
    root.querySelectorAll('[data-s]').forEach((el) => el.addEventListener('change', () => {
      const f = el.dataset.s;
      if (f === 'squareIn') scaleOpt.squareMm = Math.max(0.1, num(el.value, 1)) * 25.4;
      else scaleOpt[f] = f === 'landscape' ? el.value === '1' : f === 'paper' || f === 'nb' ? el.value : Math.max(0, num(el.value, scaleOpt[f] || 0));
      render();
    }));
    root.querySelector('[data-act="regen"]').addEventListener('click', () => {
      m.settings.seed = Math.floor(Math.random() * 2 ** 31);
      Object.assign(m, generate(kit, m.settings));
      m.nb.forEach((n, k) => { n.name = m.settings.neighbourhoods[k]?.name || n.name; });
      S.selected = null; changed(); render();
    });
    root.querySelector('[data-act="print"]').addEventListener('click', () => printOverview(m, kit, 'print'));
    root.querySelector('[data-act="a4pdf"]').addEventListener('click', () => printOverview(m, kit, 'pdf', window.open('', '_blank')));
    root.querySelector('[data-act="svg"]').addEventListener('click', () => downloadSVG(m, kit));
    root.querySelector('[data-act="scale-open"]').addEventListener('click', () => { scaleOpt.open = !scaleOpt.open; render(); });
    const sb = root.querySelector('[data-act="scale"]');
    const scaleArgs = () => ({ ...scaleOpt, squareMm: scaleOpt.squareMm || sqMm(S.kit) });
    if (sb) sb.addEventListener('click', () => printScaled(m, kit, scaleArgs(), 'print'));
    const sp = root.querySelector('[data-act="scalepdf"]');
    if (sp) sp.addEventListener('click', () => printScaled(m, kit, scaleArgs(), 'pdf', window.open('', '_blank')));
  }

  // ---------------------------------------------------------------- start
  function connectView(err) {
    root.innerHTML = `<div class="gm-banner">Could not reach the Tabletop Forge server${err ? `: ${esc(err)}` : ''}.</div>
      <p class="hint">The Dungeon Builder saves to Tabletop Forge. On your Tabletop Forge server it connects by itself. Opened from somewhere else, enter the server address.</p>
      <div class="field" style="max-width:420px"><label>Tabletop Forge server</label><input type="text" class="wd-api" value="${esc(API.base)}" placeholder="https://forge.example.com"></div>
      <button class="btn primary" data-act="connect">Connect</button>`;
    root.querySelector('[data-act="connect"]').addEventListener('click', () => {
      API.base = root.querySelector('.wd-api').value.trim().replace(/\/+$/, '');
      localStorage.setItem('wd_api', API.base); start();
    });
  }
  async function start() {
    root.innerHTML = '<p class="hint">Loading your tiles from Tabletop Forge…</p>';
    try {
      const kit = await api('/kit');
      S.kit = kit.data && kit.data.tiles ? kit.data : DEFAULT_KIT();
      if (S.kit.squareSize == null) { const mm = num(S.kit.squareMm, 25.4); S.kit.squareSize = +(mm / 25.4).toFixed(3); S.kit.squareUnit = 'in'; delete S.kit.squareMm; }
      S.maps = await api('/maps');
      if (!(kit.data && kit.data.tiles)) { S.status = 'Starter kit: change it to match your own tiles'; saveKit(); }
      render();
    } catch (e) { connectView(e.message); }
  }
  start();
})();
