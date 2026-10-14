// Karak Rush: levels, customers, the kitchen stations, screens and the main loop.
const $ = (id) => document.getElementById(id);
const S = Store.data;
const app = $('app'), ov = $('ov'), card = $('card');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const open = (k) => G && UNLOCK[k] <= G.level;

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- tuning (upgrades change these) ----------
const U = () => S.upgrades;
const potCap = () => 4 + U().pot * 2;
const brewTime = () => 3.2 - U().stove * 0.6;
const cookTime = (type) => (type === 'paratha' ? 5 : 4.5) - U().griddle * 0.8;
const BURN_AFTER = 7;
const MAX_TIP = 60;

// ---------- level generation (same customers every time you play a level) ----------
function genLevel(l) {
  const R = rng(l * 7919 + 13), pick = (a) => a[Math.floor(R() * a.length)];
  const count = Math.min(6 + l * 2, 26);
  const adds = ['hail', 'milk', 'zafran', 'ginger'].filter((k) => UNLOCK[k] <= l);
  const foods = ['chips', 'paratha', 'samosa'].filter((k) => UNLOCK[k] <= l);
  const list = [];
  for (let n = 0; n < count; n++) {
    const items = [];
    const foodOnly = l >= 7 && R() < 0.15;
    const drinks = foodOnly ? 0 : l >= 5 && R() < 0.3 ? 2 : 1;
    for (let d = 0; d < drinks; d++) {
      const spec = {};
      const sugar = Math.floor(R() * (l === 1 ? 2 : 3)); if (sugar) spec.sugar = sugar;
      if (adds.length && R() < 0.55) spec[pick(adds)] = 1;
      items.push({ type: 'drink', spec, done: false });
    }
    if (foodOnly || R() < Math.min(0.6, 0.35 + l * 0.03)) items.push({ type: pick(foods), done: false });
    const kind = R() < 0.45 ? 'man' : R() < 0.8 ? 'woman' : 'kid';
    const price = items.reduce((s, it) => s + (it.type === 'drink'
      ? PRICE.karak + Object.keys(it.spec).filter((k) => k !== 'sugar').length * PRICE.add : PRICE[it.type]), 0);
    list.push({
      kind, name: pick(PEOPLE[kind]), skin: pick(SKIN), cloth: kind === 'woman' ? pick(HIJAB) : pick(SHIRT), beard: R() < 0.5,
      items, price, gap: Math.max(2.4, 6.5 - l * 0.35) * (0.8 + R() * 0.4),
    });
  }
  const max = list.reduce((s, c) => s + c.price + MAX_TIP, 0);
  const round = (x) => Math.round(x / 50) * 50;
  return { list, stars: [round(max * 0.45), round(max * 0.68), round(max * 0.88)] };
}

// ---------- level state ----------
let G = null, paused = false;

function startLevel(l) {
  const { list, stars } = genLevel(l);
  G = {
    level: l, list, stars, next: 0, spawnIn: 1, spots: [null, null, null], piles: [null, null, null],
    earned: 0, served: 0, lost: 0, ending: false, over: false,
    pot: { state: 'empty', t: 0, servings: 0 }, cups: [null, null, null], sel: -1,
    griddle: [null, null], fryer: [null, null], warmer: [null, null],
  };
  paused = false; ov.hidden = true;
  document.querySelectorAll('.spot').forEach((s) => (s.innerHTML = ''));
  document.querySelectorAll('.cash').forEach((s) => (s.innerHTML = ''));
  renderAll();
  Sound.bell();
}

// ---------- customers ----------
function spawn() {
  const i = G.spots.findIndex((s) => !s);
  if (i < 0 || G.next >= G.list.length) return false;
  const base = G.list[G.next++];
  const max = Math.max(20, 38 - G.level * 1.5) + base.items.length * 4 + U().chairs * 5;
  const c = { ...base, items: base.items.map((it) => ({ ...it })), patience: max, max, mood: 0, leaving: false, id: G.next };
  G.spots[i] = c;
  renderSpot(i);
  return true;
}

function bubbleHTML(c) {
  return c.items.map((it, j) => {
    if (it.type !== 'drink') return `<div class="oi${it.done ? ' done' : ''}" data-j="${j}">${ICON[it.type]}</div>`;
    const mini = ADDS.filter((k) => it.spec[k]).map((k) => `${ICON[k]}${it.spec[k] > 1 ? `<b>×${it.spec[k]}</b>` : ''}`).join('');
    return `<div class="oi${it.done ? ' done' : ''}" data-j="${j}">${ICON.karak}${mini ? `<div class="mini">${mini}</div>` : ''}</div>`;
  }).join('');
}

function renderSpot(i) {
  const spot = document.querySelectorAll('.spot')[i], c = G.spots[i];
  if (!c) { spot.innerHTML = ''; return; }
  spot.innerHTML = `<div class="cust"><div class="bubble">${bubbleHTML(c)}<div class="pbar"><i></i></div></div>
    <div class="person${c.mood === 2 ? ' angry' : ''}">${personSVG(c, c.mood)}</div></div>`;
  c.el = spot.firstElementChild;
}

function leave(i, happy) {
  const c = G.spots[i]; if (!c || c.leaving) return;
  c.leaving = true;
  if (!happy) { c.mood = 2; const pe = c.el.querySelector('.person'); pe.innerHTML = personSVG(c, 2); pe.classList.remove('angry'); }
  c.el.classList.add('out');
  setTimeout(() => { if (G && G.spots[i] === c) { G.spots[i] = null; renderSpot(i); } }, 500);
}

// Most impatient customer first.
function findTarget(match) {
  let best = null;
  G.spots.forEach((c, i) => {
    if (!c || c.leaving) return;
    const j = c.items.findIndex((it) => !it.done && match(it));
    if (j >= 0 && (!best || c.patience / c.max < best.c.patience / best.c.max)) best = { c, i, j };
  });
  return best;
}
const sameSpec = (a, b) => ADDS.every((k) => (a[k] || 0) === (b[k] || 0));

function deliver(t, fromEl, icon) {
  t.c.items[t.j].done = true;
  flyTo(fromEl, t.c.el.querySelector(`.oi[data-j="${t.j}"]`), icon);
  setTimeout(() => { const o = t.c.el && t.c.el.querySelector(`.oi[data-j="${t.j}"]`); if (o) { o.classList.add('done'); sparks(o, '#ffffff', 6); } }, 400);
  Sound.clink();
  if (t.c.items.every((it) => it.done)) {
    const tip = Math.round((MAX_TIP * (t.c.patience / t.c.max)) / 5) * 5;
    const amount = t.c.price + tip;
    G.served++; S.served++; Store.save();
    t.c.mood = 0; t.c.leaving = true;
    setTimeout(() => { if (t.c.el) { const pe = t.c.el.querySelector('.person'); pe.innerHTML = personSVG(t.c, 0); pe.classList.remove('angry'); } }, 200);
    setTimeout(() => {
      t.c.el.classList.add('out');
      setTimeout(() => { if (G && G.spots[t.i] === t.c) { G.spots[t.i] = null; renderSpot(t.i); } }, 500);
      addPile(t.i, amount);
    }, 450);
  }
  renderHud();
}

// ---------- coins ----------
function addPile(i, amount) {
  const p = G.piles[i];
  if (p) { p.amount += amount; p.t = 0; } else G.piles[i] = { amount, t: 0 };
  renderPile(i);
  Sound.cash();
}
function renderPile(i) {
  const slot = document.querySelectorAll('.cash')[i], p = G.piles[i];
  if (!p) { slot.innerHTML = ''; return; }
  slot.innerHTML = `<button class="pile" type="button" aria-label="Collect ${fils(p.amount)} BD">${COIN_PILE}<span>${fils(p.amount)}</span></button>`;
  slot.firstElementChild.onclick = () => collect(i);
}
function collect(i) {
  const p = G.piles[i]; if (!p) return;
  const from = document.querySelectorAll('.cash')[i];
  G.earned += p.amount; S.wallet += p.amount; Store.save();
  sparks(from, '#f7c823', 10);
  flyTo(from, $('money'), COIN);
  setTimeout(() => flyTo(from, $('money'), COIN), 90);
  G.piles[i] = null; renderPile(i);
  Sound.coin();
  setTimeout(() => { renderHud(); const m = $('money'); m.classList.remove('bump'); void m.offsetWidth; m.classList.add('bump'); }, 420);
}

// ---------- kitchen actions ----------
function tapPot() {
  const pot = G.pot;
  if (pot.state === 'empty') { pot.state = 'brewing'; pot.t = 0; Sound.pour(); renderPot(); return; }
  if (pot.state === 'brewing') { flash('Still brewing…', '#fff', true); return; }
  const i = G.cups.findIndex((c) => !c);
  if (i < 0) { flash('No free cup', '#fff', true); return; }
  pourInto(i);
}
function pourInto(i) {
  G.cups[i] = { spec: {} }; G.sel = i;
  if (--G.pot.servings <= 0) G.pot.state = 'empty';
  Sound.pour(); renderPot(); renderCups();
}
function tapAdd(k) {
  if (!open(k)) return;
  const cup = G.cups[G.sel];
  if (!cup) { flash('Pour a karak first', '#fff', true); return; }
  const max = k === 'sugar' ? 3 : 1;
  if ((cup.spec[k] || 0) >= max) { flash(k === 'sugar' ? 'Max 3 sugar' : 'Already in', '#fff', true); return; }
  cup.spec[k] = (cup.spec[k] || 0) + 1;
  k === 'sugar' ? Sound.plop() : Sound.tap();
  renderCups();
}
function tapCup(i) {
  const cup = G.cups[i];
  if (!cup) { if (G.pot.state === 'ready') pourInto(i); else flash(G.pot.state === 'empty' ? 'Tap the pot to brew' : 'Still brewing…', '#fff', true); return; }
  const t = findTarget((it) => it.type === 'drink' && sameSpec(it.spec, cup.spec));
  const el = document.querySelector(`.cupslot[data-i="${i}"]`);
  if (t) {
    deliver(t, el, cupSVG(cup.spec));
    G.cups[i] = null;
    if (G.sel === i) G.sel = G.cups.findIndex((c) => c);
    renderCups(); return;
  }
  if (G.sel === i) { flash('Nobody ordered this cup', '#ffb3b3', true); Sound.nope(); }
  else { G.sel = i; Sound.tap(); renderCups(); }
}
function tapBin() {
  const cup = G.cups[G.sel];
  if (!cup) { flash('Select a cup to bin', '#fff', true); return; }
  G.cups[G.sel] = null; G.sel = G.cups.findIndex((c) => c);
  Sound.bin(); renderCups();
}
function placeRaw(pan, type) {
  if (!open(type)) return;
  const arr = G[pan], i = arr.findIndex((x) => !x);
  if (i < 0) { flash(pan === 'griddle' ? 'Griddle is full' : 'Fryer is full', '#fff', true); return; }
  arr[i] = { type, t: 0 };
  Sound.sizzle(); renderPan(pan);
}
function tapCooked(pan, i) {
  const it = G[pan][i];
  const type = pan === 'griddle' ? 'paratha' : 'samosa';
  if (!it) { placeRaw(pan, type); return; }
  const ct = cookTime(it.type);
  if (it.t >= ct + BURN_AFTER) { G[pan][i] = null; Sound.bin(); flash('Burnt! Thrown away', '#ffb3b3', true); renderPan(pan); return; }
  if (it.t < ct) { flash('Still cooking…', '#fff', true); return; }
  const el = document.querySelector(`#${pan} .ck[data-i="${i}"]`);
  const t = findTarget((o) => o.type === it.type);
  if (t) { deliver(t, el, ICON[it.type]); G[pan][i] = null; renderPan(pan); return; }
  const w = G.warmer.findIndex((x) => !x);
  if (w < 0) { flash('Warmer is full', '#fff', true); return; }
  G.warmer[w] = { type: it.type }; G[pan][i] = null; Sound.tap();
  renderPan(pan); renderWarmer();
}
function tapChips() {
  if (!open('chips')) return;
  const t = findTarget((o) => o.type === 'chips');
  if (t) { deliver(t, $('chipsBtn'), ICON.chips); return; }
  const w = G.warmer.findIndex((x) => !x);
  if (w < 0) { flash('Nobody ordered a chips roll', '#fff', true); return; }
  G.warmer[w] = { type: 'chips' }; Sound.tap(); renderWarmer();
}
function tapWarmer(i) {
  const it = G.warmer[i]; if (!it) return;
  const t = findTarget((o) => o.type === it.type);
  if (!t) { flash('Nobody ordered that yet', '#fff', true); Sound.nope(); return; }
  deliver(t, document.querySelector(`.wm[data-i="${i}"]`), ICON[it.type]);
  G.warmer[i] = null; renderWarmer();
}

// ---------- rendering ----------
function renderAll() {
  renderHud(); renderPot(); renderCups(); renderAdds(); renderSupplies(); renderPan('griddle'); renderPan('fryer'); renderWarmer();
}
function renderHud() {
  if (!G) return;
  $('lvl').textContent = G.level;
  $('earned').textContent = fils(G.earned);
  $('custLeft').textContent = `${G.served + G.lost}/${G.list.length} served`;
  const top = G.stars[2];
  $('goalBar').style.width = `${Math.min(100, (G.earned / top) * 100)}%`;
  [0, 1, 2].forEach((k) => { const e = $(`star${k + 1}`); e.style.left = `${(G.stars[k] / top) * 100}%`; e.classList.toggle('on', G.earned >= G.stars[k]); });
}
function renderPot() {
  const p = G.pot;
  $('pot').innerHTML = `${potSVG(p.state, p.servings, potCap())}
    ${p.state === 'ready' ? `<span class="badge">${p.servings}</span>` : ''}
    ${p.state === 'brewing' ? '<div class="prog"><i></i></div><span class="lbl">Brewing…</span>' : `<span class="lbl">${p.state === 'empty' ? 'Tap to brew' : 'Tap to pour'}</span>`}`;
}
function renderCups() {
  document.querySelectorAll('.cupslot').forEach((b, i) => {
    const c = G.cups[i];
    b.classList.toggle('full', !!c); b.classList.toggle('sel', !!c && G.sel === i);
    b.innerHTML = c ? cupSVG(c.spec) : '';
    b.setAttribute('aria-label', c ? 'Cup of karak' : 'Empty cup spot');
  });
}
function renderAdds() {
  $('adds').innerHTML = ADDS.map((k) => `<button class="add${open(k) ? '' : ' locked'}" data-k="${k}" type="button" aria-label="${NAME[k]}">
    ${jarSVG(k)}<span class="lbl">${open(k) ? NAME[k] : `Lvl ${UNLOCK[k]}`}</span></button>`).join('');
  $('adds').querySelectorAll('.add').forEach((b) => (b.onclick = () => G && !paused && tapAdd(b.dataset.k)));
}
function renderSupplies() {
  const sup = (id, k, crate) => {
    const b = $(id), on = open(k);
    b.classList.toggle('locked', !on);
    b.setAttribute('aria-label', NAME[k]);
    b.innerHTML = `${crateSVG(crate)}<span class="lbl">${on ? `${NAME[k]}<small>${AR[k]}</small>` : `Level ${UNLOCK[k]}`}</span>`;
  };
  sup('doughBtn', 'paratha', 'dough');
  sup('samosaBtn', 'samosa', 'samosa');
  sup('chipsBtn', 'chips', 'chips');
  $('griddleBox').classList.toggle('locked', !open('paratha'));
  $('fryerBox').classList.toggle('locked', !open('samosa'));
}
function renderPan(pan) {
  document.querySelectorAll(`#${pan} .ck`).forEach((b, i) => {
    const it = G[pan][i];
    b.className = 'ck';
    if (!it) { b.innerHTML = ''; return; }
    const ct = cookTime(it.type), stage = it.t >= ct + BURN_AFTER ? 'burnt' : it.t >= ct ? 'ready' : 'raw';
    it.stage = stage;
    if (stage !== 'raw') b.classList.add(stage);
    const art = it.type === 'paratha' ? parathaSVG(stage) : samosaSVG(stage);
    b.innerHTML = `${art}${stage === 'burnt' ? '' : `<div class="prog${stage === 'ready' ? ' burn' : ''}"><i></i></div>`}`;
  });
}
function renderWarmer() {
  const art = { paratha: () => parathaSVG('ready'), samosa: () => samosaSVG('ready'), chips: () => ICON.chips };
  document.querySelectorAll('.wm').forEach((b, i) => { const it = G.warmer[i]; b.innerHTML = it ? art[it.type]() : ''; });
}

function flyTo(fromEl, toEl, icon) {
  if (!fromEl || !toEl) return;
  const a = app.getBoundingClientRect(), f = fromEl.getBoundingClientRect(), t = toEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'fly'; el.innerHTML = icon;
  el.style.left = `${f.left - a.left + f.width / 2 - 20}px`; el.style.top = `${f.top - a.top + f.height / 2 - 20}px`;
  app.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.transform = `translate(${t.left + t.width / 2 - (f.left + f.width / 2)}px, ${t.top + t.height / 2 - (f.top + f.height / 2)}px) scale(.6)`;
    el.style.opacity = '.4';
  }));
  setTimeout(() => el.remove(), 480);
}
function flash(text, color, small) {
  const el = document.createElement('div');
  el.className = 'flash'; el.textContent = text; el.style.color = color;
  if (small) el.style.fontSize = '18px';
  app.appendChild(el); setTimeout(() => el.remove(), 1000);
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

// ---------- screens ----------
function setScreen(html) { card.innerHTML = html; ov.hidden = false; }
function bind(id, fn) { const el = $(id); if (el) el.onclick = () => { Sound.click(); fn(); }; }
const totalStars = () => Object.values(S.stars).reduce((a, b) => a + b, 0);
const starRow = (n) => `<div class="stars">${[0, 1, 2].map((k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</div>`;

// A tidy kitchen to look at behind the menus.
function previewKitchen() {
  G = { level: LEVELS, list: [], stars: [1, 2, 3], earned: 0, served: 0, lost: 0, spots: [null, null, null], piles: [null, null, null],
    pot: { state: 'ready', t: 0, servings: 4 }, cups: [{ spec: { sugar: 1, hail: 1 } }, { spec: { milk: 1 } }, null], sel: 0,
    griddle: [{ type: 'paratha', t: 5.5 }, null], fryer: [{ type: 'samosa', t: 1 }, null], warmer: [{ type: 'chips' }, null] };
  renderAll();
  document.querySelectorAll('.spot').forEach((s) => (s.innerHTML = ''));
  document.querySelectorAll('.cash').forEach((s) => (s.innerHTML = ''));
  $('lvl').textContent = '–'; $('earned').textContent = fils(S.wallet); $('custLeft').textContent = '';
  $('goalBar').style.width = '0';
  G = null;
}

function showMenu() {
  previewKitchen(); paused = false;
  setScreen(`
    <div class="hero">${heroSVG()}</div>
    <div class="logo">Karak<span>Rush</span></div>
    <div class="logo-ar">كرك رَش</div>
    <p>Brew karak, cook paratha, keep the customers smiling.</p>
    <div class="stack">
      <button class="btn" id="play">Play</button>
      <div class="row2"><button class="btn gold" id="shop">Upgrades</button><button class="btn gold" id="how">How to play</button></div>
      <div class="row2">
        <button class="btn ghost" id="snd">Sound: ${S.sound ? 'On' : 'Off'}</button>
        <button class="btn ghost" id="vib">Vibration: ${S.vibe ? 'On' : 'Off'}</button>
      </div>
    </div>
    <div class="stats">
      <div><b>${Math.min(S.unlocked, LEVELS)}</b><span>Level</span></div>
      <div><b>${totalStars()}</b><span>Stars</span></div>
      <div><b>${fils(S.wallet)}</b><span>BD saved</span></div>
    </div>`);
  bind('play', () => (S.seenHow ? showMap() : showHow(true)));
  bind('shop', () => showShop(showMenu));
  bind('how', () => showHow(false));
  $('snd').onclick = () => { S.sound = !S.sound; Store.save(); Sound.click(); showMenu(); };
  $('vib').onclick = () => { S.vibe = !S.vibe; Store.save(); Sound.buzz(40); showMenu(); };
}

function showHow(thenPlay) {
  setScreen(`
    <div class="ribbon">How to play</div>
    <ol class="rules">
      <li>Customers come to the window with an order bubble. Serve everything in the bubble to get paid.</li>
      <li><b>Karak:</b> tap the pot to brew, then tap it again to pour a cup. The highlighted cup gets the sugar and spices you tap. Tap a finished cup to hand it over.</li>
      <li><b>Paratha &amp; samosa:</b> tap the supply to start cooking. Tap it when it glows to serve it. Leave it too long and it burns.</li>
      <li><b>Chips roll</b> is ready straight away. Extra food waits in the <b>warmer</b>.</li>
      <li>Tap the coins on the counter to collect them. Earn enough for 1–3 stars. Slow service means smaller tips, and customers who wait too long walk away.</li>
    </ol>
    <div class="stack"><button class="btn" id="go">${thenPlay ? "Let's go" : 'Got it'}</button></div>`);
  bind('go', () => { S.seenHow = true; Store.save(); thenPlay ? showMap() : showMenu(); });
}

function showMap() {
  previewKitchen();
  const btns = Array.from({ length: LEVELS }, (_, k) => {
    const l = k + 1, ok = l <= S.unlocked, st = S.stars[l] || 0;
    return `<button class="lv${l === S.unlocked ? ' next' : ''}" data-l="${l}" ${ok ? '' : 'disabled'} type="button">
      <b>${l}</b><div class="s">${[0, 1, 2].map((s) => `<i class="${s < st ? 'on' : ''}"></i>`).join('')}</div></button>`;
  }).join('');
  setScreen(`<div class="ribbon">Pick a level</div>
    <div class="wallet"><span class="coinIcon"></span>${fils(S.wallet)} BD</div>
    <div class="map">${btns}</div>
    <div class="stack"><div class="row2"><button class="btn gold" id="shop">Upgrades</button><button class="btn ghost" id="back">Main menu</button></div></div>`);
  card.querySelectorAll('.lv').forEach((b) => (b.onclick = () => { Sound.click(); showIntro(+b.dataset.l); }));
  bind('shop', () => showShop(showMap));
  bind('back', showMenu);
}

function showIntro(l) {
  const fresh = Object.keys(UNLOCK).filter((k) => UNLOCK[k] === l);
  const { list, stars } = genLevel(l);
  setScreen(`<div class="ribbon">Level ${l}</div>
    <div class="big">${list.length} customers</div>
    <p class="muted">tonight at the stall</p>
    ${fresh.length ? `<p class="muted">${l === 1 ? 'On the menu' : 'New on the menu'}:</p>
      <div class="newitems">${fresh.map((k) => `<div>${ICON[k]}${NAME[k]}</div>`).join('')}</div>` : ''}
    <ul class="lines">${stars.map((s, k) => `<li><span>${'★'.repeat(k + 1)}</span><b>BD ${fils(s)}</b></li>`).join('')}</ul>
    <div class="stack"><button class="btn green" id="start">Open the stall</button><button class="btn ghost" id="back">Back</button></div>`);
  bind('start', () => startLevel(l));
  bind('back', showMap);
}

function showShop(back) {
  const ups = Object.entries(UPGRADES).map(([id, u]) => {
    const lvl = S.upgrades[id], cost = u.costs[lvl], maxed = cost == null;
    return `<div class="up"><div><b>${esc(u.name)}</b><span class="pips">${u.costs.map((_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</span><p>${esc(u.desc)}</p></div>
      <button class="btn ${maxed ? 'ghost' : 'gold'}" data-up="${id}" ${maxed || S.wallet < cost ? 'disabled' : ''} type="button">${maxed ? 'Maxed' : `<span class="coinIcon"></span>${fils(cost)}`}</button></div>`;
  }).join('');
  setScreen(`<div class="ribbon">Upgrades</div><div class="wallet"><span class="coinIcon"></span>${fils(S.wallet)} BD</div>
    <div class="shop">${ups}</div><div class="stack"><button class="btn" id="back">Done</button></div>`);
  card.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => {
    const id = b.dataset.up, cost = UPGRADES[id].costs[S.upgrades[id]];
    if (cost == null || S.wallet < cost) return;
    S.wallet -= cost; S.upgrades[id]++; Store.save(); Sound.cash(); showShop(back);
  }));
  bind('back', back);
}

function finishLevel() {
  if (G.over) return; G.over = true;
  const l = G.level, stars = G.stars.filter((s) => G.earned >= s).length;
  if (stars > (S.stars[l] || 0)) S.stars[l] = stars;
  if (stars >= 1 && S.unlocked === l && l < LEVELS) S.unlocked = l + 1;
  if (!S.best[l] || G.earned > S.best[l]) S.best[l] = G.earned;
  Store.save();
  stars ? Sound.bell() : Sound.leave();
  const nextOk = stars >= 1 && l < LEVELS;
  setScreen(`<div class="ribbon">Level ${l}</div><h1 style="margin-top:6px">${stars === 3 ? 'Perfect night!' : stars ? 'Well done!' : 'Not enough tonight'}</h1>
    ${starRow(stars)}
    <div class="big">BD ${fils(G.earned)}</div>
    <ul class="lines">
      <li><span>Customers served</span><b>${G.served}</b></li>
      <li><span>Customers who left</span><b>${G.lost}</b></li>
      <li><span>Next star at</span><b>${stars < 3 ? `BD ${fils(G.stars[stars])}` : '–'}</b></li>
    </ul>
    ${stars ? '' : '<p class="muted">You need at least one star to unlock the next level. Upgrades can help.</p>'}
    <div class="stack">
      ${nextOk ? '<button class="btn green" id="next">Next level</button>' : ''}
      <div class="row2"><button class="btn" id="retry">Play again</button><button class="btn gold" id="shop">Upgrades</button></div>
      <button class="btn ghost" id="map">Level map</button>
    </div>`);
  bind('next', () => showIntro(l + 1));
  bind('retry', () => showIntro(l));
  bind('shop', () => showShop(() => afterShop(l, stars)));
  bind('map', showMap);
}
function afterShop(l, stars) {
  setScreen(`<h1>Level ${l}</h1>${starRow(stars)}<div class="stack">
    ${stars && l < LEVELS ? '<button class="btn green" id="next">Next level</button>' : ''}
    <button class="btn" id="retry">Play again</button><button class="btn ghost" id="map">Level map</button></div>`);
  bind('next', () => showIntro(l + 1)); bind('retry', () => showIntro(l)); bind('map', showMap);
}

function pause() {
  if (!G || G.over || paused) return;
  paused = true;
  setScreen(`<div class="ribbon">Paused</div><h1 style="margin-top:6px">Break time</h1><p>Everyone waits while you rest.</p>
    <div class="stack"><button class="btn" id="resume">Back to work</button>
    <div class="row2"><button class="btn gold" id="restart">Restart</button><button class="btn ghost" id="quit">Level map</button></div></div>`);
  bind('resume', () => { paused = false; ov.hidden = true; });
  bind('restart', () => startLevel(G.level));
  bind('quit', showMap);
}

// ---------- input wiring ----------
const live = (fn) => () => { if (G && !paused && !G.over) fn(); };
$('pot').onclick = live(tapPot);
document.querySelectorAll('.cupslot').forEach((b) => (b.onclick = live(() => tapCup(+b.dataset.i))));
$('binBtn').onclick = live(tapBin);
$('doughBtn').onclick = live(() => placeRaw('griddle', 'paratha'));
$('samosaBtn').onclick = live(() => placeRaw('fryer', 'samosa'));
document.querySelectorAll('#griddle .ck').forEach((b) => (b.onclick = live(() => tapCooked('griddle', +b.dataset.i))));
document.querySelectorAll('#fryer .ck').forEach((b) => (b.onclick = live(() => tapCooked('fryer', +b.dataset.i))));
$('chipsBtn').onclick = live(tapChips);
document.querySelectorAll('.wm').forEach((b) => (b.onclick = live(() => tapWarmer(+b.dataset.i))));
$('pauseBtn').onclick = pause;
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });

// ---------- main loop ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (G && !paused && !G.over) tick(dt);
  requestAnimationFrame(loop);
}
function tick(dt) {
  // arrivals
  G.spawnIn -= dt;
  if (G.spawnIn <= 0 && G.next < G.list.length && spawn()) G.spawnIn = G.list[G.next - 1].gap;
  // pot
  const pot = G.pot;
  if (pot.state === 'brewing') {
    pot.t += dt;
    const bar = $('pot').querySelector('.prog i'); if (bar) bar.style.width = `${Math.min(100, (pot.t / brewTime()) * 100)}%`;
    if (pot.t >= brewTime()) { pot.state = 'ready'; pot.servings = potCap(); Sound.ding(); renderPot(); }
  }
  // griddle & fryer
  ['griddle', 'fryer'].forEach((pan) => {
    G[pan].forEach((it, i) => {
      if (!it) return;
      it.t += dt;
      const ct = cookTime(it.type), stage = it.t >= ct + BURN_AFTER ? 'burnt' : it.t >= ct ? 'ready' : 'raw';
      if (stage !== it.stage) { if (stage === 'ready') Sound.ding(); if (stage === 'burnt') Sound.burn(); renderPan(pan); }
      const bar = document.querySelector(`#${pan} .ck[data-i="${i}"] .prog i`);
      if (bar) bar.style.width = stage === 'raw' ? `${(it.t / ct) * 100}%` : stage === 'ready' ? `${((it.t - ct) / BURN_AFTER) * 100}%` : '100%';
    });
  });
  // customers
  G.spots.forEach((c, i) => {
    if (!c || c.leaving) return;
    c.patience -= dt;
    const f = Math.max(0, c.patience / c.max);
    const bar = c.el.querySelector('.pbar i');
    bar.style.width = `${f * 100}%`;
    bar.style.background = f > 0.55 ? '#6aa84f' : f > 0.25 ? '#f5b301' : '#d6262b';
    const mood = f > 0.55 ? 0 : f > 0.25 ? 1 : 2;
    if (mood !== c.mood) {
      c.mood = mood; const pe = c.el.querySelector('.person');
      pe.innerHTML = personSVG(c, mood); pe.classList.toggle('angry', mood === 2);
      if (mood === 2) Sound.huff();
    }
    if (c.patience <= 0) { G.lost++; Sound.leave(); flash(`${c.name} left`, '#ffb3b3', true); leave(i, false); renderHud(); }
  });
  // coins collect themselves after a while
  G.piles.forEach((p, i) => { if (p && (p.t += dt) > 7) collect(i); });
  // end of the night
  if (!G.ending && G.next >= G.list.length && G.spots.every((s) => !s)) {
    G.ending = true;
    const g = G;
    setTimeout(() => { if (G !== g) return; g.piles.forEach((p, i) => p && collect(i)); setTimeout(() => G === g && finishLevel(), 600); }, 700);
  }
}

// ---------- boot ----------
$('backdrop').innerHTML = streetSVG();
$('binBtn').innerHTML = `${BIN_SVG}<span class="lbl">Bin</span>`;
showMenu();
requestAnimationFrame(loop);
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
}
