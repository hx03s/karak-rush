// Karak Rush: levels, places, customers, kitchen stations, shop, endless mode, screens and the main loop.
const $ = (id) => document.getElementById(id);
const S = Store.data;
const app = $('app'), ov = $('ov'), panel = $('card');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const open = (k) => !!G && UNLOCK[k] <= G.menu;
const maxLevel = () => Math.min(S.unlocked, LEVELS);

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- tuning (upgrades, decorations and boosts change these) ----------
const U = () => S.upgrades;
const decorBonus = (key) => Object.keys(DECOR).filter((k) => S.decor[k]).reduce((s, k) => s + (DECOR[k][key] || 0), 0);
const boost = (k) => !!(G && G.boost && G.boost[k]);
const potCap = () => 4 + U().pot * 2;
const brewTime = () => (3.2 - U().stove * 0.6) * (boost('turbo') ? 0.5 : 1);
const cookTime = (type) => ({ paratha: 5, chicken: 6, samosa: 4.5 }[type] || 5) - U().griddle * 0.8;
const BURN_AFTER = 7;
const MAX_TIP = 60;

// ---------- customers & levels (same customers every time you replay a level) ----------
const localLevel = (l) => ((l - 1) % PER_PLACE) + 1;
function gapFor(l) {
  if (l <= PER_PLACE) return Math.max(2.6, 6.5 - l * 0.35);
  return Math.max(2.1, 3.3 - localLevel(l) * 0.07 - placeIndex(l) * 0.1);
}
function patienceFor(l) {
  if (l <= PER_PLACE) return Math.max(20, 38 - l * 1.5);
  return Math.max(17, 22 - placeIndex(l) - localLevel(l) * 0.15);
}
// o.menu: highest level whose menu is open; o.kinds: highest level whose customers show up; o.food: food chance.
function genCustomer(R, l, o = {}) {
  const pick = (a) => a[Math.floor(R() * a.length)];
  const ml = o.menu || l, kl = o.kinds || ml;
  const adds = ['hail', 'milk', 'zafran', 'ginger'].filter((k) => UNLOCK[k] <= ml);
  const foods = FOODS.filter((k) => UNLOCK[k] <= ml);
  const items = [];
  const foodOnly = l >= 7 && R() < 0.15;
  const drinks = foodOnly ? 0 : l >= 5 && R() < (l > 24 ? 0.38 : 0.3) ? 2 : 1;
  for (let d = 0; d < drinks; d++) {
    const spec = {};
    const sugar = Math.floor(R() * (l === 1 ? 2 : 3)); if (sugar) spec.sugar = sugar;
    if (adds.length && R() < 0.55) spec[pick(adds)] = 1;
    if (UNLOCK.ice <= ml && R() < 0.3) spec.ice = 1;
    items.push({ type: 'drink', spec, done: false });
  }
  if (foodOnly || R() < (o.food != null ? o.food : Math.min(0.6, 0.35 + l * 0.03))) items.push({ type: pick(foods), done: false });
  const kinds = Object.keys(KINDS).filter((k) => KINDS[k].from <= kl);
  const kind = pick(kinds), K = KINDS[kind];
  if (K.food && !items.some((it) => it.type !== 'drink') && R() < K.food) items.push({ type: pick(foods), done: false });
  const price = items.reduce((s, it) => s + (it.type === 'drink'
    ? PRICE.karak + Object.keys(it.spec).filter((k) => k !== 'sugar').length * PRICE.add : PRICE[it.type]), 0);
  return { kind, name: pick(PEOPLE[kind]), items, price, gap: (o.gap || gapFor(l)) * (0.8 + R() * 0.4), base: o.patience || patienceFor(l) };
}
function genLevel(l) {
  const R = rng(l * 7919 + 13);
  const count = l <= PER_PLACE ? Math.min(6 + l * 2, 26) : Math.min(30, 17 + localLevel(l) + placeIndex(l));
  const list = Array.from({ length: count }, () => genCustomer(R, l));
  return { list, stars: starLines(list, 1) };
}
function genEvent(id) {
  const ev = EVENTS[id], d = Math.max(10, Math.min(S.unlocked, 30)), menu = Math.max(8, maxLevel());
  const R = rng(id.length * 104729 + 7);
  const list = Array.from({ length: ev.count }, () => genCustomer(R, d, { menu, kinds: menu, food: ev.food, gap: gapFor(d) * 0.9 }));
  return { list, stars: starLines(list, ev.pay), d, menu };
}
function starLines(list, payMult) {
  const max = list.reduce((s, c) => s + c.price * payMult + MAX_TIP * KINDS[c.kind].tip, 0);
  const round = (x) => Math.round(x / 50) * 50;
  return [round(max * 0.45), round(max * 0.68), round(max * 0.88)];
}

// ---------- state ----------
let G = null, paused = false, pendingBoosts = {};

function blankState(l) {
  return {
    mode: 'level', level: l, menu: l, list: [], stars: [1, 2, 3], next: 0, spawnIn: 1, spots: [null, null, null], piles: [null, null, null],
    earned: 0, served: 0, lost: 0, ending: false, over: false, boost: {}, pay: 1,
    pot: { state: 'empty', t: 0, servings: 0 }, cups: [null, null, null], sel: -1,
    tawa: null, fryer: null, warmer: [null, null],
  };
}
function takeBoosts() {
  const got = {};
  for (const k of Object.keys(pendingBoosts)) {
    if (!pendingBoosts[k]) continue;
    if (S.wallet >= BOOSTS[k].cost) { S.wallet -= BOOSTS[k].cost; got[k] = true; }
  }
  pendingBoosts = {}; Store.save();
  return got;
}
function begin(state, bg, night, extraDecor) {
  G = state; G.boost = takeBoosts();
  paused = false; ov.hidden = true; ov.classList.remove('menu');
  document.querySelectorAll('.spot,.cash').forEach((s) => (s.innerHTML = ''));
  setScene(bg, night, extraDecor);
  renderAll();
  Sound.bell();
}
function startLevel(l) {
  const { list, stars } = genLevel(l);
  begin(Object.assign(blankState(l), { list, stars }), placeOf(l).bg, false, []);
  checkAch();
}
function startEvent(id) {
  const ev = EVENTS[id], { list, stars, d, menu } = genEvent(id);
  const live = ev.live(new Date());
  begin(Object.assign(blankState(d), { mode: 'event', ev: id, menu, list, stars: stars.map((s) => s * (live ? 2 : 1)), pay: ev.pay * (live ? 2 : 1), live }), ev.bg, ev.night, ev.decor);
}
function startEndless() {
  const menu = maxLevel();
  begin(Object.assign(blankState(1), { mode: 'endless', menu, lives: 3, R: rng((Date.now() & 0xffffff) + 1) }), placeOf(menu).bg, false, []);
  G.spawnIn = 0.6;
}
// Endless Rush gets harder as you serve: faster arrivals and less patience.
function endlessCustomer() {
  const d = Math.min(LEVELS, 3 + Math.floor((G.served + G.lost) / 4));
  return genCustomer(G.R, d, { menu: G.menu, kinds: G.menu, gap: Math.max(1.9, 5.2 - (G.served + G.lost) * 0.06), patience: Math.max(15, 30 - (G.served + G.lost) * 0.25) });
}

// ---------- scene: place background + decorations ----------
function setScene(bg, night, extraDecor) {
  app.style.setProperty('--bg', `url(../img/${bg}.webp)`);
  app.classList.toggle('night', !!night);
  const on = new Set([...Object.keys(DECOR).filter((k) => S.decor[k]), ...(extraDecor || [])]);
  $('decor').innerHTML = [...on].map((k) => `<img class="d-${k}" src="${IMG(`decor-${k}`)}" alt="">`).join('');
}

// ---------- drawing helpers ----------
function glassHTML(spec, empty) {
  if (empty) return `<div class="glass empty"><img class="g" src="${IMG('glass-empty')}" alt=""></div>`;
  let bits = '';
  for (let i = 0; i < Math.min(spec.sugar || 0, 3); i++) bits += `<img class="bit cube" src="${IMG('bit-cube')}" style="left:${4 + i * 13}%" alt="">`;
  if (spec.hail) bits += `<img class="bit pod" src="${IMG('bit-pod')}" alt="">`;
  if (spec.ginger) bits += `<img class="bit gin" src="${IMG('ing-ginger')}" alt="">`;
  if (spec.ice && glassKey(spec) !== 'ice') bits += `<img class="bit ice" src="${IMG('bit-ice')}" alt="">`;
  return `<div class="glass"><img class="g" src="${IMG(glassFile(spec))}" alt="">${bits}</div>`;
}
const personImg = (c, mood) => IMG(`${c.kind}-${mood === 0 ? 'happy' : 'wait'}`);

// ---------- customers ----------
function spawn() {
  const i = G.spots.findIndex((s) => !s);
  if (G.mode === 'endless' && G.next >= G.list.length) G.list.push(endlessCustomer());
  if (i < 0 || G.next >= G.list.length) return false;
  const base = G.list[G.next++], K = KINDS[base.kind];
  const max = (base.base + base.items.length * 4 + U().chairs * 5) * K.patience * (1 + decorBonus('patience')) * (boost('calm') ? 1.3 : 1);
  const c = { ...base, items: base.items.map((it) => ({ ...it, spec: it.spec ? { ...it.spec } : undefined })), patience: max, max, mood: 0, leaving: false, id: G.next };
  G.spots[i] = c;
  renderSpot(i); renderCard();
  return true;
}
function bubbleHTML(c) {
  return c.items.map((it, j) => {
    const cls = `oi${it.done ? ' done' : ''}`;
    if (it.type !== 'drink') return `<div class="${cls}" data-j="${j}"><img class="f" src="${IMG(FOOD[it.type])}" alt="${NAME[it.type]}"></div>`;
    const shown = glassKey(it.spec);
    const adds = ADDS.filter((k) => k !== shown && it.spec[k])
      .map((k) => `<span><img src="${IMG(ING[k])}" alt="">${it.spec[k] > 1 ? `×${it.spec[k]}` : ''}</span>`).join('');
    return `<div class="${cls}" data-j="${j}"><img class="g" src="${IMG(glassFile(it.spec))}" alt="Karak">${adds ? `<div class="adds">${adds}</div>` : ''}</div>`;
  }).join('');
}
function renderSpot(i) {
  const spot = document.querySelectorAll('.spot')[i], c = G.spots[i];
  if (!c) { spot.innerHTML = ''; return; }
  spot.innerHTML = `<div class="cust"><div class="bubble">${bubbleHTML(c)}<div class="pbar"><i></i></div></div>
    <div class="person${c.kind === 'vip' ? ' vip' : ''}"><img src="${personImg(c, c.mood)}" alt="${esc(c.name)}"></div></div>`;
  c.el = spot.firstElementChild;
}
function setMood(c, mood) {
  c.mood = mood;
  const pe = c.el && c.el.querySelector('.person'); if (!pe) return;
  pe.querySelector('img').src = personImg(c, mood);
  pe.classList.toggle('angry', mood === 2);
}
function leave(i, happy) {
  const c = G.spots[i]; if (!c || c.leaving) return;
  c.leaving = true;
  setMood(c, happy ? 0 : 2);
  setTimeout(() => {
    if (!c.el) return; c.el.classList.add('out');
    setTimeout(() => { if (G && G.spots[i] === c) { G.spots[i] = null; renderSpot(i); renderCard(); } }, 500);
  }, happy ? 350 : 0);
  renderCard();
}

// ---------- matching ----------
const sameSpec = (a, b) => ADDS.every((k) => (a[k] || 0) === (b[k] || 0));
const isOver = (cup, want) => ADDS.some((k) => (cup[k] || 0) > (want[k] || 0));
const progress = (cup, want) => ADDS.reduce((s, k) => s + Math.min(cup[k] || 0, want[k] || 0), 0);

// Who is this glass for? Exact match first, then the closest order, then whoever is most impatient.
function drinkTarget(cup) {
  let best = null, bestScore = -1e9;
  G.spots.forEach((c, i) => {
    if (!c || c.leaving) return;
    c.items.forEach((it, j) => {
      if (it.done || it.type !== 'drink') return;
      const urgency = 1 - c.patience / c.max;
      let score = urgency;
      if (cup) score += sameSpec(cup.spec, it.spec) ? 100 : isOver(cup.spec, it.spec) ? -10 + progress(cup.spec, it.spec) : progress(cup.spec, it.spec) * 5;
      if (score > bestScore) { bestScore = score; best = { c, i, j, it }; }
    });
  });
  return best;
}
function foodTarget(type) {
  let best = null;
  G.spots.forEach((c, i) => {
    if (!c || c.leaving) return;
    const j = c.items.findIndex((it) => !it.done && it.type === type);
    if (j >= 0 && (!best || c.patience / c.max < best.c.patience / best.c.max)) best = { c, i, j };
  });
  return best;
}

function deliver(t, fromEl, imgFile) {
  t.c.items[t.j].done = true;
  const o = t.c.el.querySelector(`.oi[data-j="${t.j}"]`);
  flyTo(fromEl, o, imgFile);
  setTimeout(() => { if (o) { o.classList.add('done'); sparks(o, '#ffffff', 6); } }, 420);
  Sound.clink();
  if (t.c.items.every((it) => it.done)) {
    const K = KINDS[t.c.kind];
    const tip = Math.round((MAX_TIP * (t.c.patience / t.c.max) * K.tip * (1 + decorBonus('tip')) * (boost('tips') ? 2 : 1)) / 5) * 5;
    const pay = Math.round((t.c.price * G.pay * (1 + decorBonus('pay'))) / 5) * 5;
    G.served++; S.served++;
    if (t.c.kind === 'vip') S.vipServed++;
    Store.save();
    leave(t.i, true);
    setTimeout(() => addPile(t.i, pay + tip), 450);
    checkAch();
  }
  renderHud(); renderCard();
}

// ---------- coins ----------
function addPile(i, amount) {
  if (!G) return;
  const p = G.piles[i];
  if (p) { p.amount += amount; p.t = 0; } else G.piles[i] = { amount, t: 0 };
  renderPile(i); Sound.cash();
}
function renderPile(i) {
  const slot = document.querySelectorAll('.cash')[i], p = G.piles[i];
  if (!p) { slot.innerHTML = ''; return; }
  slot.innerHTML = `<button class="pile" type="button" aria-label="Collect ${fils(p.amount)} BD"><img src="${IMG('eq-coins')}" alt=""><span>+${fils(p.amount)}</span></button>`;
  slot.firstElementChild.onclick = () => collect(i);
}
function collect(i) {
  const p = G.piles[i]; if (!p) return;
  const from = document.querySelectorAll('.cash')[i];
  G.earned += p.amount; S.wallet += p.amount; S.totalEarned += p.amount; Store.save();
  sparks(from, '#f7c823', 10); flyTo(from, $('money'), 'eq-coins');
  G.piles[i] = null; renderPile(i); Sound.coin();
  setTimeout(() => { renderHud(); const m = $('money'); m.classList.remove('bump'); void m.offsetWidth; m.classList.add('bump'); }, 420);
  checkAch();
}

// ---------- kitchen actions ----------
function tapPot() {
  const pot = G.pot;
  if (pot.state === 'empty') { pot.state = 'brewing'; pot.t = 0; Sound.pour(); renderPot(); renderCard(); return; }
  if (pot.state === 'brewing') { flash('Still brewing…'); return; }
  const i = G.cups.findIndex((c) => !c);
  if (i < 0) { flash('All 3 glasses are full'); return; }
  pourInto(i);
}
function pourInto(i) {
  G.cups[i] = { spec: {} }; G.sel = i;
  if (--G.pot.servings <= 0) G.pot.state = 'empty';
  Sound.pour(); renderPot(); renderCups(); renderTokens(); renderCard();
  const big = $('bigGlass'); big.classList.remove('sel'); void big.offsetWidth; big.classList.add('sel');
}
function tapAdd(k) {
  if (!open(k)) return;
  const cup = G.cups[G.sel];
  if (!cup) { flash(G.pot.state === 'ready' ? 'Tap the pot to pour a glass' : 'Brew karak first'); return; }
  const max = k === 'sugar' ? 3 : 1;
  if ((cup.spec[k] || 0) >= max) { flash(k === 'sugar' ? 'Max 3 sugar' : `${NAME[k]} is already in`); Sound.nope(); return; }
  cup.spec[k] = (cup.spec[k] || 0) + 1;
  k === 'sugar' ? Sound.plop() : Sound.tap();
  dropInto(k);
  const tok = document.querySelector(`.tok[data-k="${k}"]`); if (tok) { tok.classList.remove('hit'); void tok.offsetWidth; tok.classList.add('hit'); setTimeout(() => tok.classList.remove('hit'), 160); }
  setTimeout(() => { renderCups(); renderCard(); }, 260);
  renderTokens();
}
// The ingredient visibly falls into the glass, with a "+1 Sugar" pop.
function dropInto(k) {
  const a = app.getBoundingClientRect(), g = $('bigGlass').getBoundingClientRect();
  const x = g.left - a.left + g.width / 2, y = g.top - a.top + g.height * 0.28;
  const bit = document.createElement('img');
  bit.className = 'fallbit'; bit.src = IMG(k === 'sugar' ? 'bit-cube' : k === 'ice' ? 'bit-ice' : ING[k]); bit.alt = '';
  bit.style.left = `${x - 17}px`; bit.style.top = `${y}px`; app.appendChild(bit);
  setTimeout(() => bit.remove(), 520);
  const pop = document.createElement('div');
  pop.className = 'pop'; pop.textContent = `+1 ${NAME[k]}`;
  pop.style.left = `${x}px`; pop.style.top = `${g.top - a.top + g.height * 0.38}px`; app.appendChild(pop);
  setTimeout(() => pop.remove(), 1000);
}
function serveSelected() {
  const cup = G.cups[G.sel];
  if (!cup) { flash(G.pot.state === 'ready' ? 'Tap the pot to pour a glass' : 'Brew karak first'); return; }
  const t = drinkTarget(cup);
  if (!t || !sameSpec(t.it.spec, cup.spec)) { Sound.nope(); flash('Not ready yet – check the order card'); return; }
  deliver(t, $('bigGlass'), glassFile(cup.spec));
  G.cups[G.sel] = null; G.sel = G.cups.findIndex((c) => c);
  renderCups(); renderTokens(); renderCard();
}
function selectCup(i) {
  if (!G.cups[i]) { if (G.pot.state === 'ready') pourInto(i); else flash(G.pot.state === 'empty' ? 'Tap the pot to brew' : 'Still brewing…'); return; }
  G.sel = i; Sound.tap(); renderCups(); renderTokens(); renderCard();
}
function tapBin() {
  if (!G.cups[G.sel]) { flash('No glass to throw away'); return; }
  G.cups[G.sel] = null; G.sel = G.cups.findIndex((c) => c);
  Sound.bin(); flash('Glass binned'); renderCups(); renderTokens(); renderCard();
}
function placeRaw(slot, type) {
  if (!open(type)) return;
  if (G[slot]) {
    if (G[slot].type !== type && G[slot].stage === 'raw') { flash(`The ${slot === 'tawa' ? 'tawa' : 'fryer'} is busy`); return; }
    tapCooked(slot); return;
  }
  G[slot] = { type, t: 0, stage: 'raw' };
  Sound.sizzle(); renderStation(slot);
}
function tapCooked(slot) {
  const it = G[slot];
  if (!it) {
    if (slot === 'fryer') placeRaw('fryer', 'samosa');
    else if (open('paratha')) placeRaw('tawa', 'paratha');
    return;
  }
  const ct = cookTime(it.type);
  if (it.t >= ct + BURN_AFTER) { G[slot] = null; Sound.bin(); flash('Burnt! Thrown away'); renderStation(slot); return; }
  if (it.t < ct) { flash('Still cooking…'); return; }
  const el = $(slot), t = foodTarget(it.type);
  if (t) { deliver(t, el, FOOD[it.type]); G[slot] = null; renderStation(slot); return; }
  const w = G.warmer.findIndex((x) => !x);
  if (w < 0) { flash('Warmer is full'); return; }
  G.warmer[w] = { type: it.type }; G[slot] = null; Sound.tap(); flash('Kept warm');
  renderStation(slot); renderWarmer();
}
// Chips roll and balaleet are ready straight away.
function tapReady(type, btn) {
  if (!open(type)) return;
  const t = foodTarget(type);
  if (t) { deliver(t, $(btn), FOOD[type]); return; }
  const w = G.warmer.findIndex((x) => !x);
  if (w < 0) { flash(`Nobody ordered ${NAME[type].toLowerCase()}`); return; }
  G.warmer[w] = { type }; Sound.tap(); renderWarmer();
}
function tapWarmer(i) {
  const it = G.warmer[i]; if (!it) return;
  const t = foodTarget(it.type);
  if (!t) { flash('Nobody ordered that yet'); Sound.nope(); return; }
  deliver(t, document.querySelector(`.wm[data-i="${i}"]`), FOOD[it.type]);
  G.warmer[i] = null; renderWarmer();
}

// ---------- rendering ----------
function renderAll() { renderHud(); renderPot(); renderCups(); renderTokens(); renderStation('tawa'); renderStation('fryer'); renderSupplies(); renderWarmer(); renderCard(); }
function renderHud() {
  if (!G) return;
  const hud = document.querySelector('.hud');
  hud.classList.toggle('endless', G.mode === 'endless');
  $('lvl').textContent = G.mode === 'endless' ? '∞' : G.mode === 'event' ? '★' : G.level;
  $('lvlLabel').textContent = G.mode === 'endless' ? 'Rush' : G.mode === 'event' ? 'Special' : 'Level';
  $('earned').textContent = fils(G.earned);
  if (G.mode === 'endless') {
    $('served').innerHTML = `<span class="hearts">${[0, 1, 2].map((k) => `<i class="${k < G.lives ? 'on' : ''}"></i>`).join('')}</span> ${G.served} served`;
    const top = Math.max(S.endless.best, 1000);
    $('goalBar').style.width = `${Math.min(100, (G.earned / top) * 100)}%`;
    return;
  }
  $('served').textContent = G.list.length ? `${G.served + G.lost}/${G.list.length} served` : '';
  const top = G.stars[2];
  $('goalBar').style.width = `${Math.min(100, (G.earned / top) * 100)}%`;
  [0, 1, 2].forEach((k) => { const e = $(`star${k + 1}`); e.style.left = `${(G.stars[k] / top) * 100}%`; e.classList.toggle('on', G.earned >= G.stars[k]); });
}
function renderPot() {
  const p = G.pot, b = $('pot');
  b.className = `st stove ${p.state}`;
  b.innerHTML = `<img src="${IMG('stove')}" alt="">${p.state === 'ready' ? `<span class="badge">${p.servings}</span>` : ''}
    ${p.state === 'brewing' ? '<div class="prog"><i></i></div><span class="pill">Brewing…</span>'
      : `<span class="pill ${p.state === 'ready' ? 'go' : ''}">${p.state === 'empty' ? 'Tap to brew' : `Pour · ${p.servings} left`}</span>`}`;
}
function renderCups() {
  const cup = G.cups[G.sel], big = $('bigGlass');
  big.innerHTML = cup ? glassHTML(cup.spec) : `<div class="hint-empty">${G.pot.state === 'ready' ? 'Tap the pot to pour a glass' : G.pot.state === 'brewing' ? 'Karak is brewing…' : 'Tap the pot to brew karak'}</div>`;
  const others = [0, 1, 2].filter((i) => i !== (G.sel < 0 ? -9 : G.sel)).slice(0, 2);
  document.querySelectorAll('.spare').forEach((b, k) => {
    const i = others[k]; b.dataset.cup = i;
    b.innerHTML = i != null && G.cups[i] ? glassHTML(G.cups[i].spec) : '';
    b.setAttribute('aria-label', G.cups[i] ? 'Switch to this glass' : 'Empty spot');
  });
}
function renderTokens() {
  const cup = G.cups[G.sel], t = cup ? drinkTarget(cup) : null;
  $('tokens').innerHTML = ADDS.map((k) => {
    const n = cup ? cup.spec[k] || 0 : 0, want = t ? t.it.spec[k] || 0 : 0;
    const ring = cup && n < want ? ' ring' : '';
    return `<button class="tok${open(k) ? '' : ' locked'}${ring}" data-k="${k}" type="button" aria-label="Add ${NAME[k]}">
      <span class="disc"><img src="${IMG(ING[k])}" alt=""></span><b>${open(k) ? NAME[k] : `Lv ${UNLOCK[k]}`}</b>
      ${n ? `<span class="n ${n === want ? 'ok' : ''}">${n}</span>` : ''}</button>`;
  }).join('');
  $('tokens').querySelectorAll('.tok').forEach((b) => (b.onclick = live(() => tapAdd(b.dataset.k))));
}
function renderCard() {
  const card = $('orderCard'); if (!G) { card.innerHTML = ''; return; }
  renderTokens();
  const cup = G.cups[G.sel], t = drinkTarget(cup);
  card.classList.remove('ok');
  if (!t) { card.innerHTML = `<div class="none">No karak orders right now.<br>Serve the food!</div>`; highlight(null); return; }
  const want = t.it.spec, have = cup ? cup.spec : {};
  const rows = [{ k: 'karak', label: 'Karak', have: cup ? 1 : 0, need: 1, img: glassFile(want) }];
  for (const k of ADDS) if ((want[k] || 0) || (have[k] || 0)) rows.push({ k, label: NAME[k], have: have[k] || 0, need: want[k] || 0, img: ING[k] });
  let hint = '', bad = false, ready = false;
  const over = rows.find((r) => r.have > r.need), miss = rows.find((r) => r.have < r.need);
  if (!cup) hint = G.pot.state === 'ready' ? 'Tap the pot to pour' : G.pot.state === 'brewing' ? 'Karak is brewing…' : 'Tap the pot to brew';
  else if (over) { hint = over.need ? `Too much ${over.label.toLowerCase()} – bin it` : `${over.label} wasn't ordered – bin it`; bad = true; }
  else if (miss) { const d = miss.need - miss.have; hint = `Needs ${d} more ${miss.label.toLowerCase()}`; }
  else ready = true;
  const firstMiss = miss && !over && cup ? miss.k : null;
  card.innerHTML = `<div class="head"><img src="${personImg(t.c, 0)}" alt="">${esc(t.c.name)}'s karak</div>
    ${rows.map((r) => {
      const st = r.have > r.need ? 'over' : r.have === r.need && r.need ? 'done' : r.k === firstMiss ? 'active' : '';
      const dots = Array.from({ length: Math.max(r.need, r.have) }, (_, i) => `<i class="${i < r.have ? 'on' : ''}"></i>`).join('');
      return `<div class="crow ${st}"><img src="${IMG(r.img)}" alt=""><span class="lab">${r.label}</span><span class="dots">${dots}</span></div>`;
    }).join('')}
    ${ready ? `<button class="serve" id="serveBtn" type="button">Serve ${esc(t.c.name)} ➜</button>` : `<div class="chint ${bad ? 'bad' : ''}">${hint}</div>`}`;
  if (ready) { card.classList.add('ok'); $('serveBtn').onclick = live(serveSelected); }
  highlight(ready ? t : null);
}
function highlight(t) {
  G.spots.forEach((c) => {
    if (!c || !c.el) return; const b = c.el.querySelector('.bubble');
    const on = t && t.c === c; b.classList.toggle('match', !!on);
    const tag = b.querySelector('.tag'); if (on && !tag) b.insertAdjacentHTML('afterbegin', '<span class="tag">MATCH!</span>'); if (!on && tag) tag.remove();
  });
}
function renderStation(slot) {
  const it = G[slot], b = $(slot);
  const ct = it ? cookTime(it.type) : 1;
  const stage = !it ? 'empty' : it.t >= ct + BURN_AFTER ? 'burnt' : it.t >= ct ? 'ready' : 'raw';
  if (it) it.stage = stage;
  b.className = `st ${slot} ${stage}`;
  const emptyLabel = slot === 'tawa' ? 'Tawa' : 'Fryer';
  const label = { empty: emptyLabel, raw: 'Cooking…', ready: `${NAME[it ? it.type : 'paratha'].replace(' roll', '')} ready!`, burnt: 'Burnt! Tap to bin' }[stage];
  const pill = `<span class="pill ${stage === 'ready' ? 'go' : stage === 'burnt' ? 'warn' : ''}">${label}</span>`;
  const prog = stage === 'raw' || stage === 'ready' ? `<div class="prog ${stage === 'ready' ? 'burn' : ''}"><i></i></div>` : '';
  const smoke = stage === 'burnt' ? '<span class="smoke"></span>' : '';
  if (slot === 'tawa') {
    const pan = '<span class="iron"></span><span class="handle"></span>';
    let inner = pan;
    if (it && it.type === 'chicken') inner = `${pan}<img class="dough" src="${IMG(stage === 'raw' ? 'food-chicken-raw' : 'food-chicken-roll')}" alt="">`;
    else if (stage === 'raw') inner = `${pan}<img class="dough" src="${IMG('food-dough-flat')}" alt="">`;
    else if (stage !== 'empty') inner = `<img src="${IMG('food-paratha-pan')}" alt="">`;
    b.innerHTML = `<div class="pan">${inner}</div>${smoke}${prog}${pill}`;
  } else {
    b.innerHTML = `<div class="fr"><img class="base" src="${IMG('eq-fryer')}" alt="">${it ? `<img class="food ${stage === 'raw' ? 'raw' : ''}" src="${IMG('food-samosa')}" alt="">` : ''}</div>${smoke}${prog}${pill}`;
  }
  b.classList.toggle('locked', !open(slot === 'tawa' ? 'paratha' : 'samosa'));
}
function renderSupplies() {
  const sup = (id, k, img, raw) => {
    const b = $(id), on = open(k);
    b.classList.toggle('locked', !on);
    b.setAttribute('aria-label', NAME[k]);
    b.innerHTML = `<img class="${raw ? 'raw' : ''}" src="${IMG(img)}" alt=""><span class="pill">${on ? NAME[k].replace(' roll', '') : `Lv ${UNLOCK[k]}`}</span>`;
  };
  sup('doughBtn', 'paratha', 'food-dough-balls');
  sup('chickenBtn', 'chicken', 'food-chicken-raw');
  sup('samosaBtn', 'samosa', 'food-samosa', true);
  sup('chipsBtn', 'chips', 'food-chips');
  sup('balaleetBtn', 'balaleet', 'food-balaleet');
  $('binBtn').innerHTML = `<img src="${IMG('eq-bin')}" alt=""><span class="pill">Bin</span>`;
}
function renderWarmer() {
  document.querySelectorAll('.wm').forEach((b, i) => { const it = G.warmer[i]; b.innerHTML = it ? `<img src="${IMG(FOOD[it.type])}" alt="${NAME[it.type]}">` : ''; });
}

function flyTo(fromEl, toEl, file) {
  if (!fromEl || !toEl) return;
  const a = app.getBoundingClientRect(), f = fromEl.getBoundingClientRect(), t = toEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'fly'; el.innerHTML = `<img src="${IMG(file)}" alt="">`;
  el.style.left = `${f.left - a.left + f.width / 2 - 23}px`; el.style.top = `${f.top - a.top + f.height / 2 - 23}px`;
  app.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.transform = `translate(${t.left + t.width / 2 - (f.left + f.width / 2)}px, ${t.top + t.height / 2 - (f.top + f.height / 2)}px) scale(.6)`;
    el.style.opacity = '.5';
  }));
  setTimeout(() => el.remove(), 480);
}
function flash(text) {
  const el = document.createElement('div'); el.className = 'flash'; el.textContent = text;
  app.appendChild(el); setTimeout(() => el.remove(), 1100);
}
function sparks(el, color, n) {
  if (!el) return;
  const a = app.getBoundingClientRect(), r = el.getBoundingClientRect();
  for (let k = 0; k < n; k++) {
    const sp = document.createElement('div'), ang = (k / n) * Math.PI * 2, d = 26 + Math.random() * 18;
    sp.className = 'spark'; sp.style.background = k % 2 ? color : '#f7c823';
    sp.style.left = `${r.left - a.left + r.width / 2}px`; sp.style.top = `${r.top - a.top + r.height / 2}px`;
    sp.style.setProperty('--dx', `${Math.cos(ang) * d}px`); sp.style.setProperty('--dy', `${Math.sin(ang) * d}px`);
    app.appendChild(sp); setTimeout(() => sp.remove(), 650);
  }
}
function toast(html) {
  const el = document.createElement('div'); el.className = 'toast'; el.innerHTML = html;
  $('toasts').appendChild(el); setTimeout(() => el.remove(), 3200);
}

// ---------- achievements ----------
function award(id) {
  if (S.ach[id]) return;
  const a = ACHIEVEMENTS.find((x) => x.id === id); if (!a) return;
  S.ach[id] = Date.now(); S.wallet += a.reward; Store.save();
  Sound.fanfare();
  toast(`<i class="trophy"></i><div><b>${esc(a.name)}</b><span>${esc(a.desc)} · +${fils(a.reward)} BD</span></div>`);
}
function checkAch() {
  if (S.served >= 1) award('first');
  if (S.served >= 100) award('s100');
  if (S.served >= 500) award('s500');
  if (S.vipServed >= 1) award('vip');
  if (S.totalEarned >= 10000) award('rich');
  if (S.totalEarned >= 100000) award('rich2');
  if (S.unlocked >= 13) award('muharraq');
  if (S.unlocked >= 25) award('corniche');
  if (S.unlocked >= 37) award('sakhir');
  if (Object.values(S.stars).some((s) => s >= 3)) award('perfect');
  if (Array.from({ length: PER_PLACE }, (_, k) => S.stars[k + 1] || 0).every((s) => s >= 3)) award('souq3');
  if (S.stars[LEVELS] >= 1) award('champion');
  const owned = Object.keys(DECOR).filter((k) => S.decor[k]).length;
  if (owned >= 1) award('decor1');
  if (owned === Object.keys(DECOR).length) award('decorall');
  if (Object.entries(S.upgrades).some(([k, v]) => v >= UPGRADES[k].costs.length)) award('maxup');
  if (S.endless.bestServed >= 20) award('e20');
  if (S.endless.bestServed >= 50) award('e50');
  if (S.daily.streak >= 7) award('streak');
  if ((S.events.ramadan || 0) >= 3) award('ramadan');
  if ((S.events.national || 0) >= 3) award('national');
}

// ---------- screens ----------
function setScreen(html, menu) { panel.innerHTML = html; ov.hidden = false; ov.scrollTop = 0; ov.classList.toggle('menu', !!menu); }
function bind(id, fn) { const el = $(id); if (el) el.onclick = () => { Sound.click(); fn(); }; }
const totalStars = () => Object.values(S.stars).reduce((a, b) => a + b, 0);
const starRow = (n) => `<div class="stars">${[0, 1, 2].map((k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</div>`;
const today = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// A tidy kitchen to look at behind the menus.
function previewKitchen() {
  G = Object.assign(blankState(LEVELS), { pot: { state: 'ready', t: 0, servings: 4 }, cups: [{ spec: { sugar: 2, hail: 1 } }, { spec: { milk: 1 } }, null], sel: 0,
    tawa: { type: 'paratha', t: 5.5 }, fryer: { type: 'samosa', t: 1 }, warmer: [{ type: 'chips' }, null] });
  document.querySelectorAll('.spot,.cash').forEach((s) => (s.innerHTML = ''));
  setScene(placeOf(maxLevel()).bg, false, []);
  renderAll();
  document.querySelector('.hud').classList.remove('endless');
  $('lvl').textContent = '–'; $('lvlLabel').textContent = 'Level'; $('earned').textContent = fils(S.wallet); $('served').textContent = ''; $('goalBar').style.width = '0';
  G = null;
}

function showMenu() {
  previewKitchen(); paused = false;
  if (S.daily.last !== today()) { showDaily(); return; }
  const l = maxLevel(), pl = placeOf(l);
  const liveEv = Object.keys(EVENTS).find((k) => EVENTS[k].live(new Date()));
  setScreen(`
    <div class="logo">Karak<span>Rush!</span></div>
    <div class="artag">كرك رَش</div>
    <div class="hero"><img src="${IMG('man-wave')}" alt=""><img class="gl" src="${IMG('glass-karak')}" alt=""></div>
    <div class="stack">
      <button class="btn gold big" id="play">PLAY<small>Level ${l} · ${esc(pl.name)}</small></button>
      <div class="row2"><button class="btn teal" id="map">Level map</button><button class="btn coral" id="rush">Endless Rush<small>Best ${fils(S.endless.best)}</small></button></div>
      <div class="row2"><button class="btn plum" id="events">Special nights${liveEv ? '<em class="live">LIVE</em>' : ''}</button><button class="btn green" id="shop">Shop</button></div>
      <div class="row2"><button class="btn ghost-b" id="ach">🏆 ${Object.keys(S.ach).length}/${ACHIEVEMENTS.length}</button><button class="btn ghost-b" id="how">How to play</button></div>
    </div>
    <div class="stats">
      <div><b>${l}</b><span>Level</span></div>
      <div><b>${totalStars()} ★</b><span>Stars</span></div>
      <div><b>${fils(S.wallet)}</b><span>BD saved</span></div>
    </div>
    <div class="row2" style="margin-top:6px">
      <button class="btn ghost" id="snd">Sound: ${S.sound ? 'On' : 'Off'}</button>
      <button class="btn ghost" id="vib">Vibration: ${S.vibe ? 'On' : 'Off'}</button>
    </div>`, true);
  bind('play', () => (S.seenHow ? showIntro(l) : showHow(true)));
  bind('map', showMap);
  bind('rush', showRushIntro);
  bind('events', showEvents);
  bind('shop', () => showShop(showMenu));
  bind('ach', showAch);
  bind('how', () => showHow(false));
  $('snd').onclick = () => { S.sound = !S.sound; Store.save(); Sound.click(); showMenu(); };
  $('vib').onclick = () => { S.vibe = !S.vibe; Store.save(); Sound.buzz(40); showMenu(); };
}

// Daily gift: a little more each day for 7 days in a row.
function showDaily() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  const streak = S.daily.last === today(y) ? (S.daily.streak % 7) + 1 : 1;
  const amount = DAILY[streak - 1];
  setScreen(`<div class="ribbon">Daily gift</div>
    <h1 style="margin-top:6px">Day ${streak}</h1><p class="muted">Come back every day for a bigger gift</p>
    <div class="days">${DAILY.map((a, k) => `<div class="${k + 1 < streak ? 'got' : k + 1 === streak ? 'now' : ''}"><span>Day ${k + 1}</span><i class="coin"></i><b>${fils(a)}</b></div>`).join('')}</div>
    <div class="stack"><button class="btn gold big" id="claim">Collect ${fils(amount)} BD</button></div>`, true);
  bind('claim', () => {
    S.daily = { last: today(), streak: S.daily.last === today(y) ? S.daily.streak + 1 : 1 };
    S.wallet += amount; Store.save(); Sound.cash(); checkAch(); showMenu();
  });
}

function showHow(thenPlay) {
  setScreen(`<div class="ribbon">How to play</div>
    <ol class="rules">
      <li>Customers come to the window with an order bubble. Serve everything in it to get paid.</li>
      <li><b>Karak:</b> tap the pot to brew, then tap it again to pour a glass. It lands big on your brass tray.</li>
      <li>Tap sugar, spices and ice. You'll see each one drop in, and the <b>order card</b> tells you exactly what's still missing.</li>
      <li>When the card turns green, tap <b>Serve</b>. Made a mistake? Tap the <b>bin</b>.</li>
      <li><b>Paratha &amp; chicken roll</b> cook on the tawa, <b>samosa</b> in the fryer. Tap the pan when it glows. Don't let it burn! Chips roll and balaleet are ready straight away.</li>
      <li>Tap the coins on the counter. Earn enough for 1–3 stars to unlock the next level, and move from the souq to Muharraq, the Corniche and Sakhir.</li>
      <li>Spend your coins in the <b>Shop</b> on upgrades and decorations. In <b>Endless Rush</b>, 3 customers walking off ends the game.</li>
    </ol>
    <div class="stack"><button class="btn gold" id="go">${thenPlay ? "Let's go" : 'Got it'}</button></div>`);
  bind('go', () => { S.seenHow = true; Store.save(); thenPlay ? showIntro(maxLevel()) : showMenu(); });
}

function showMap(focus) {
  previewKitchen();
  const pi = placeIndex(focus || maxLevel());
  const sections = PLACES.map((p, idx) => {
    const from = idx * PER_PLACE + 1, unlocked = S.unlocked >= from;
    const stars = Array.from({ length: PER_PLACE }, (_, k) => S.stars[from + k] || 0).reduce((a, b) => a + b, 0);
    const btns = Array.from({ length: PER_PLACE }, (_, k) => {
      const l = from + k, ok = l <= S.unlocked, st = S.stars[l] || 0;
      return `<button class="lv${l === S.unlocked ? ' next' : ''}" data-l="${l}" ${ok ? '' : 'disabled'} type="button">
        <b>${l}</b><div class="s">${[0, 1, 2].map((s) => `<i class="${s < st ? 'on' : ''}"></i>`).join('')}</div></button>`;
    }).join('');
    return `<section class="place${unlocked ? '' : ' locked'}${idx === pi ? ' focus' : ''}" style="--pc:${p.color}">
      <div class="phead" style="background-image:url(${IMG(p.bg)})"><div><b>${esc(p.name)}</b><span>${p.ar}</span></div><em>${unlocked ? `${stars}/36 ★` : `🔒 Finish level ${from - 1}`}</em></div>
      ${unlocked ? `<div class="map">${btns}</div>` : ''}</section>`;
  }).join('');
  setScreen(`<div class="ribbon">Pick a level</div>
    <div class="wallet"><i class="coin"></i>${fils(S.wallet)} BD</div>
    ${sections}
    <div class="stack"><div class="row2"><button class="btn gold" id="shop">Shop</button><button class="btn ghost" id="back">Main menu</button></div></div>`, true);
  panel.querySelectorAll('.lv').forEach((b) => (b.onclick = () => { Sound.click(); showIntro(+b.dataset.l); }));
  const f = panel.querySelector('.place.focus'); if (f) setTimeout(() => f.scrollIntoView({ block: 'start' }), 30);
  bind('shop', () => showShop(showMap));
  bind('back', showMenu);
}

function boostPicker() {
  return `<div class="boosts"><p class="muted">Boosts for this round</p><div class="brow">${Object.entries(BOOSTS).map(([k, b]) =>
    `<button class="boost${pendingBoosts[k] ? ' on' : ''}" data-b="${k}" type="button" ${!pendingBoosts[k] && S.wallet < b.cost + spent() ? 'disabled' : ''}>
      <img src="${IMG(b.icon)}" alt=""><b>${esc(b.name)}</b><span>${esc(b.desc)}</span><em>${fils(b.cost)}</em></button>`).join('')}</div></div>`;
}
const spent = () => Object.keys(pendingBoosts).filter((k) => pendingBoosts[k]).reduce((s, k) => s + BOOSTS[k].cost, 0);
function wireBoosts(redraw) {
  panel.querySelectorAll('.boost').forEach((b) => (b.onclick = () => { Sound.click(); pendingBoosts[b.dataset.b] = !pendingBoosts[b.dataset.b]; redraw(); }));
}

function showIntro(l) {
  const fresh = Object.keys(UNLOCK).filter((k) => UNLOCK[k] === l);
  const newKinds = Object.keys(KINDS).filter((k) => KINDS[k].from === l);
  const icon = (k) => IMG(k === 'karak' ? 'glass-karak' : ING[k] || FOOD[k]);
  const { list, stars } = genLevel(l), pl = placeOf(l), firstOfPlace = localLevel(l) === 1;
  setScreen(`<div class="ribbon">Level ${l}</div>
    ${firstOfPlace ? `<div class="placecard" style="background-image:url(${IMG(pl.bg)})"><b>${l === 1 ? '' : 'New place! '}${esc(pl.name)}</b><span>${pl.ar} · ${esc(pl.tag)}</span></div>` : `<p class="muted">${esc(pl.name)}</p>`}
    <div class="big">${list.length} customers</div><p class="muted">tonight at the stall</p>
    ${fresh.length ? `<p class="muted">${l === 1 ? 'On the menu' : 'New on the menu'}:</p>
      <div class="newitems">${fresh.map((k) => `<div><img src="${icon(k)}" alt="">${NAME[k]}</div>`).join('')}</div>` : ''}
    ${newKinds.length ? `<p class="muted">New customers:</p><div class="newpeople">${newKinds.map((k) => `<div><img src="${IMG(`${k}-happy`)}" alt=""><span>${esc(KINDS[k].label || '')}</span></div>`).join('')}</div>` : ''}
    <ul class="lines">${stars.map((s, k) => `<li><span>${'★'.repeat(k + 1)}</span><b>BD ${fils(s)}</b></li>`).join('')}</ul>
    ${l > 2 ? boostPicker() : ''}
    <div class="stack"><button class="btn green" id="start">Open the stall</button><button class="btn ghost" id="back">Back</button></div>`, true);
  wireBoosts(() => showIntro(l));
  bind('start', () => startLevel(l));
  bind('back', () => { pendingBoosts = {}; showMap(l); });
}

function showRushIntro() {
  previewKitchen();
  setScreen(`<div class="ribbon">Endless Rush</div>
    <h1 style="margin-top:6px">How long can you last?</h1>
    <p>Customers keep coming, faster and faster. If <b>3 customers</b> walk off, it's over.</p>
    <p class="muted">Uses everything you've unlocked so far (up to level ${maxLevel()}).</p>
    <ul class="lines"><li><span>Best money</span><b>BD ${fils(S.endless.best)}</b></li><li><span>Most served</span><b>${S.endless.bestServed}</b></li></ul>
    ${boostPicker()}
    <div class="stack"><button class="btn coral" id="start">Start the rush</button><button class="btn ghost" id="back">Back</button></div>`, true);
  wireBoosts(showRushIntro);
  bind('start', startEndless);
  bind('back', () => { pendingBoosts = {}; showMenu(); });
}

function showEvents() {
  previewKitchen();
  const now = new Date();
  setScreen(`<div class="ribbon">Special nights</div>
    <div class="evs">${Object.entries(EVENTS).map(([id, ev]) => {
      const live = ev.live(now), st = S.events[id] || 0;
      return `<div class="ev ${id}" style="background-image:url(${IMG(ev.bg)})">
        ${live ? '<em class="live">LIVE NOW · coins ×2</em>' : ''}
        <b>${esc(ev.name)}</b><span class="ar">${ev.ar}</span><p>${esc(ev.desc)}</p>
        <div class="s">${[0, 1, 2].map((k) => `<i class="${k < st ? 'on' : ''}"></i>`).join('')}</div>
        <button class="btn gold" data-ev="${id}" type="button">Play</button></div>`;
    }).join('')}</div>
    <p class="muted">Play them any time. When the real date comes around they go live and pay double.</p>
    <div class="stack"><button class="btn ghost" id="back">Main menu</button></div>`, true);
  panel.querySelectorAll('[data-ev]').forEach((b) => (b.onclick = () => { Sound.click(); showEventIntro(b.dataset.ev); }));
  bind('back', showMenu);
}
function showEventIntro(id) {
  const ev = EVENTS[id], { list, stars } = genEvent(id), live = ev.live(new Date());
  setScreen(`<div class="ribbon">${esc(ev.name)}</div>
    <div class="placecard" style="background-image:url(${IMG(ev.bg)})"><b>${esc(ev.name)}</b><span>${ev.ar}${live ? ' · LIVE: coins ×2' : ''}</span></div>
    <div class="big">${list.length} customers</div><p class="muted">${esc(ev.desc)}</p>
    <ul class="lines">${stars.map((s, k) => `<li><span>${'★'.repeat(k + 1)}</span><b>BD ${fils(s * (live ? 2 : 1))}</b></li>`).join('')}</ul>
    ${boostPicker()}
    <div class="stack"><button class="btn green" id="start">Open the stall</button><button class="btn ghost" id="back">Back</button></div>`, true);
  wireBoosts(() => showEventIntro(id));
  bind('start', () => startEvent(id));
  bind('back', () => { pendingBoosts = {}; showEvents(); });
}

function showShop(back, tab = 'decor') {
  const ups = Object.entries(UPGRADES).map(([id, u]) => {
    const lvl = S.upgrades[id], cost = u.costs[lvl], maxed = cost == null;
    return `<div class="up"><div><b>${esc(u.name)}</b><span class="pips">${u.costs.map((_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</span><p>${esc(u.desc)}</p></div>
      <button class="btn ${maxed ? 'ghost' : 'gold'}" data-up="${id}" ${maxed || S.wallet < cost ? 'disabled' : ''} type="button">${maxed ? 'Maxed' : fils(cost)}</button></div>`;
  }).join('');
  const decs = Object.entries(DECOR).map(([id, d]) => {
    const own = !!S.decor[id];
    return `<div class="up deco"><img src="${IMG(`decor-${id}`)}" alt=""><div><b>${esc(d.name)}</b><p>${esc(d.desc)}</p></div>
      <button class="btn ${own ? 'ghost' : 'gold'}" data-de="${id}" ${own || S.wallet < d.cost ? 'disabled' : ''} type="button">${own ? 'Owned ✓' : fils(d.cost)}</button></div>`;
  }).join('');
  setScreen(`<div class="ribbon">Shop</div><div class="wallet"><i class="coin"></i>${fils(S.wallet)} BD</div>
    <div class="tabs"><button class="${tab === 'decor' ? 'on' : ''}" id="tDecor" type="button">Decorations</button><button class="${tab === 'up' ? 'on' : ''}" id="tUp" type="button">Upgrades</button></div>
    <div class="shop">${tab === 'decor' ? decs : ups}</div>
    ${tab === 'decor' ? '<p class="muted">Decorations show up on your stall in every place.</p>' : ''}
    <div class="stack"><button class="btn" id="back">Done</button></div>`, !G);
  panel.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => {
    const id = b.dataset.up, cost = UPGRADES[id].costs[S.upgrades[id]];
    if (cost == null || S.wallet < cost) return;
    S.wallet -= cost; S.upgrades[id]++; Store.save(); Sound.cash(); checkAch(); showShop(back, 'up');
  }));
  panel.querySelectorAll('[data-de]').forEach((b) => (b.onclick = () => {
    const id = b.dataset.de, d = DECOR[id];
    if (S.decor[id] || S.wallet < d.cost) return;
    S.wallet -= d.cost; S.decor[id] = true; Store.save(); Sound.cash(); checkAch();
    if (!G) previewKitchen();
    showShop(back, 'decor');
  }));
  bind('tDecor', () => showShop(back, 'decor'));
  bind('tUp', () => showShop(back, 'up'));
  bind('back', back);
}

function showAch() {
  setScreen(`<div class="ribbon">Achievements</div>
    <p class="muted">${Object.keys(S.ach).length} of ${ACHIEVEMENTS.length} unlocked · each one pays a reward</p>
    <div class="achs">${ACHIEVEMENTS.map((a) => `<div class="ach${S.ach[a.id] ? ' got' : ''}"><i class="trophy"></i><div><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></div><em>${S.ach[a.id] ? '✓' : `+${fils(a.reward)}`}</em></div>`).join('')}</div>
    <div class="stack"><button class="btn ghost" id="back">Main menu</button></div>`, true);
  bind('back', showMenu);
}

function finishLevel() {
  if (G.over) return; G.over = true;
  if (G.mode === 'endless') return finishEndless();
  const stars = G.stars.filter((s) => G.earned >= s).length;
  const clean = G.list.length >= 20 && G.lost === 0;
  if (G.mode === 'event') {
    if (stars > (S.events[G.ev] || 0)) S.events[G.ev] = stars;
  } else {
    const l = G.level;
    if (stars > (S.stars[l] || 0)) S.stars[l] = stars;
    if (stars >= 1 && S.unlocked === l && l < LEVELS) S.unlocked = l + 1;
    if (!S.best[l] || G.earned > S.best[l]) S.best[l] = G.earned;
  }
  Store.save();
  if (clean) award('clean');
  checkAch();
  stars ? Sound.bell() : Sound.leave();
  const l = G.level, isEv = G.mode === 'event', ev = isEv ? EVENTS[G.ev] : null;
  const nextOk = !isEv && stars >= 1 && l < LEVELS;
  const nextPlace = nextOk && localLevel(l + 1) === 1 ? placeOf(l + 1) : null;
  const title = isEv ? esc(ev.name) : `Level ${l} ${stars ? 'complete!' : ''}`;
  setScreen(`<div class="ribbon">${title}</div>
    <h1 style="margin-top:6px">${stars === 3 ? 'Perfect night!' : stars ? 'Well done!' : 'Not enough tonight'}</h1>
    ${starRow(stars)}
    <div class="big">BD ${fils(G.earned)}</div>
    ${stars < 3 ? `<p class="muted">${fils(G.stars[stars] - G.earned)} more for the ${['1st', '2nd', '3rd'][stars]} star</p>` : ''}
    ${nextPlace ? `<div class="placecard" style="background-image:url(${IMG(nextPlace.bg)})"><b>Unlocked: ${esc(nextPlace.name)}!</b><span>${nextPlace.ar} · ${esc(nextPlace.tag)}</span></div>` : ''}
    <ul class="lines">
      <li><span>Customers served</span><b>${G.served} / ${G.list.length}</b></li>
      <li><span>Customers who left</span><b>${G.lost}</b></li>
    </ul>
    <div class="faces"><img src="${IMG('woman-happy')}" alt=""><img src="${IMG('man-happy')}" alt=""><img src="${IMG('kid-happy')}" alt=""><img src="${IMG('grandpa-happy')}" alt=""></div>
    <div class="stack">
      ${nextOk ? `<button class="btn green" id="next">${nextPlace ? `On to ${esc(nextPlace.name)} ➜` : 'Next level ➜'}</button>` : ''}
      <div class="row2"><button class="btn gold" id="retry">Play again</button><button class="btn teal" id="shop">Shop</button></div>
      <button class="btn ghost" id="map">${isEv ? 'Special nights' : 'Level map'}</button>
    </div>`);
  bind('next', () => showIntro(l + 1));
  const evId = G.ev;
  bind('retry', () => (isEv ? showEventIntro(evId) : showIntro(l)));
  bind('shop', () => showShop(() => (isEv ? showEventIntro(evId) : showIntro(nextOk ? l + 1 : l))));
  bind('map', isEv ? showEvents : () => showMap(l));
}

function finishEndless() {
  const newBest = G.earned > S.endless.best;
  S.endless.best = Math.max(S.endless.best, G.earned);
  S.endless.bestServed = Math.max(S.endless.bestServed, G.served);
  Store.save(); checkAch();
  newBest ? Sound.fanfare() : Sound.leave();
  setScreen(`<div class="ribbon">Rush over!</div>
    <h1 style="margin-top:6px">${newBest ? 'New best!' : 'Good rush!'}</h1>
    <div class="big">BD ${fils(G.earned)}</div>
    <ul class="lines">
      <li><span>Customers served</span><b>${G.served}</b></li>
      <li><span>Best money</span><b>BD ${fils(S.endless.best)}</b></li>
      <li><span>Most served</span><b>${S.endless.bestServed}</b></li>
    </ul>
    <div class="stack"><button class="btn coral" id="again">Rush again</button>
      <div class="row2"><button class="btn green" id="shop">Shop</button><button class="btn ghost" id="menu">Main menu</button></div></div>`);
  bind('again', showRushIntro);
  bind('shop', () => showShop(showRushIntro));
  bind('menu', showMenu);
}

function pause() {
  if (!G || G.over || paused) return;
  paused = true;
  const mode = G.mode;
  setScreen(`<div class="ribbon">Paused</div><h1 style="margin-top:6px">Break time</h1><p>Everyone waits while you rest.</p>
    <div class="stack"><button class="btn gold" id="resume">Back to work</button>
    <div class="row2"><button class="btn" id="restart">Restart</button><button class="btn ghost" id="quit">${mode === 'level' ? 'Level map' : 'Main menu'}</button></div></div>`);
  bind('resume', () => { paused = false; ov.hidden = true; });
  bind('restart', () => (mode === 'endless' ? startEndless() : mode === 'event' ? startEvent(G.ev) : startLevel(G.level)));
  bind('quit', () => { const l = G.level; G = null; mode === 'level' ? showMap(l) : showMenu(); });
}

// ---------- input wiring ----------
function live(fn) { return () => { if (G && !paused && !G.over) fn(); }; }
$('pot').onclick = live(tapPot);
$('bigGlass').onclick = live(() => (G.cups[G.sel] ? serveSelected() : G.pot.state === 'ready' ? pourInto(G.cups.findIndex((c) => !c)) : tapPot()));
document.querySelectorAll('.spare').forEach((b) => (b.onclick = live(() => selectCup(+b.dataset.cup))));
$('binBtn').onclick = live(tapBin);
$('doughBtn').onclick = live(() => placeRaw('tawa', 'paratha'));
$('chickenBtn').onclick = live(() => placeRaw('tawa', 'chicken'));
$('samosaBtn').onclick = live(() => placeRaw('fryer', 'samosa'));
$('tawa').onclick = live(() => tapCooked('tawa'));
$('fryer').onclick = live(() => tapCooked('fryer'));
$('chipsBtn').onclick = live(() => tapReady('chips', 'chipsBtn'));
$('balaleetBtn').onclick = live(() => tapReady('balaleet', 'balaleetBtn'));
document.querySelectorAll('.wm').forEach((b) => (b.onclick = live(() => tapWarmer(+b.dataset.i))));
$('pauseBtn').onclick = pause; $('pauseBtn2').onclick = pause;
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
document.addEventListener('pointerdown', () => { Sound.unlock(); Voice.unlock(); }, { once: true });

// ---------- main loop ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (G && !paused && !G.over) tick(dt);
  requestAnimationFrame(loop);
}
function customerLeft(i, c) {
  G.lost++; Sound.leave(); Voice.cancel(c.kind); flash(`${c.name} left`); leave(i, false);
  if (G.mode === 'endless') {
    G.lives--; Sound.heart();
    if (G.lives <= 0 && !G.ending) {
      G.ending = true; const g = G;
      setTimeout(() => { if (G !== g) return; g.piles.forEach((p, k) => p && collect(k)); setTimeout(() => G === g && finishLevel(), 700); }, 900);
    }
  }
  renderHud();
}
function tick(dt) {
  G.spawnIn -= dt;
  const more = G.mode === 'endless' ? !G.ending : G.next < G.list.length;
  if (G.spawnIn <= 0 && more && spawn()) G.spawnIn = G.list[G.next - 1].gap;
  const pot = G.pot;
  if (pot.state === 'brewing') {
    pot.t += dt;
    const bar = $('pot').querySelector('.prog i'); if (bar) bar.style.width = `${Math.min(100, (pot.t / brewTime()) * 100)}%`;
    if (pot.t >= brewTime()) { pot.state = 'ready'; pot.servings = potCap(); Sound.ding(); renderPot(); renderCups(); renderCard(); }
  }
  for (const slot of ['tawa', 'fryer']) {
    const it = G[slot]; if (!it) continue;
    it.t += dt;
    const ct = cookTime(it.type), stage = it.t >= ct + BURN_AFTER ? 'burnt' : it.t >= ct ? 'ready' : 'raw';
    if (stage !== it.stage) { if (stage === 'ready') Sound.ding(); if (stage === 'burnt') Sound.burn(); renderStation(slot); }
    const bar = $(slot).querySelector('.prog i');
    if (bar) bar.style.width = stage === 'raw' ? `${(it.t / ct) * 100}%` : `${((it.t - ct) / BURN_AFTER) * 100}%`;
  }
  G.spots.forEach((c, i) => {
    if (!c || c.leaving) return;
    c.patience -= dt;
    const f = Math.max(0, c.patience / c.max);
    const bar = c.el.querySelector('.pbar i');
    bar.style.width = `${f * 100}%`;
    bar.style.background = f > 0.55 ? '#5bb04a' : f > 0.25 ? '#f5b301' : '#e8553e';
    const mood = f > 0.55 ? 0 : f > 0.25 ? 1 : 2;
    if (mood !== c.mood) { setMood(c, mood); if (mood === 2) Voice.angry(c.kind); }
    if (c.patience <= 0) customerLeft(i, c);
  });
  G.piles.forEach((p, i) => { if (p && (p.t += dt) > 7) collect(i); });
  if (G.mode !== 'endless' && !G.ending && G.next >= G.list.length && G.spots.every((s) => !s)) {
    G.ending = true;
    const g = G;
    setTimeout(() => { if (G !== g) return; g.piles.forEach((p, i) => p && collect(i)); setTimeout(() => G === g && finishLevel(), 600); }, 700);
  }
}

// ---------- boot ----------
// Players who finished the old last level (12) can carry on into Muharraq.
if (S.unlocked === PER_PLACE && (S.stars[PER_PLACE] || 0) >= 1) { S.unlocked = PER_PLACE + 1; Store.save(); }
showMenu();
requestAnimationFrame(loop);
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
}
