// Karak Rush: game flow, screens and the main loop.
const $ = (id) => document.getElementById(id);
const S = Store.data;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];

const DAY_SECONDS = 75;
const MAX_STRIKES = 3;
const SLOTS = 3;

const ov = $('ov'), card = $('card'), app = $('app');
let run = null;          // the current run (several days)
let playing = false;     // the stall is open right now
let paused = false;
let slots = new Array(SLOTS).fill(null);
let selected = -1;
let tray = {};
let spawnIn = 0;
let nextId = 1;

// ---------- run & day setup ----------
function newRun() {
  run = { day: 1, cash: 0, served: 0, upgrades: { chairs: 0, neon: 0, thermos: 0 }, totalTips: 0 };
  S.runs++; Store.save();
  showDayIntro();
}
const goalFor = (day) => 1500 + (day - 1) * 700;
const unlocked = (k) => ITEMS[k].day <= run.day;

function startDay() {
  Object.assign(run, { earned: 0, tips: 0, dayServed: 0, strikes: 0, time: DAY_SECONDS, combo: 0, goal: goalFor(run.day) });
  slots.forEach((c) => c && c.el.remove());
  slots = new Array(SLOTS).fill(null); selected = -1;
  resetTray(); renderKeys(); renderRoad(); renderHud();
  spawnIn = 0.6;
  playing = true; paused = false; ov.hidden = true;
  Sound.bell();
}

function resetTray() {
  tray = run && run.upgrades.thermos ? { karak: 1 } : {};
  renderTray();
}

// ---------- customers ----------
function makeOrder() {
  const d = run.day, order = { karak: 1 };
  const sugar = rand(d === 1 ? 2 : 3);
  if (sugar) order.sugar = sugar;
  const adds = ['hail', 'milk', 'zafran', 'ginger'].filter(unlocked);
  if (adds.length && Math.random() < 0.65) {
    const n = d >= 5 && Math.random() < 0.4 ? 2 : 1;
    const pool = [...adds];
    for (let i = 0; i < n && pool.length; i++) order[pool.splice(rand(pool.length), 1)[0]] = 1;
  }
  const sides = ['chips', 'paratha', 'samosa'].filter(unlocked);
  if (Math.random() < Math.min(0.55, 0.32 + d * 0.04)) order[pick(sides)] = 1;
  return order;
}
const priceOf = (order) => Object.entries(order).reduce((s, [k, n]) => s + ITEMS[k].price * n, 0);
const itemCount = (order) => Object.values(order).reduce((a, b) => a + b, 0);

function spawnCustomer() {
  const free = slots.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  if (!free.length) return;
  const i = free[0], order = makeOrder();
  const max = Math.max(13, 25 - run.day * 1.5) + run.upgrades.chairs * 3 + Math.max(0, itemCount(order) - 2) * 2;
  const c = { id: nextId++, name: pick(NAMES), color: pick(CAR_COLORS), order, price: priceOf(order), patience: max, max, honked: false, el: null };
  slots[i] = c;
  if (selected < 0) selected = i;
  renderRoad();
}

function oldestIndex() {
  let best = -1;
  slots.forEach((c, i) => { if (c && !c.leaving && (best < 0 || c.id < slots[best].id)) best = i; });
  return best;
}

function customerLeaves(i, mood) {
  const c = slots[i]; if (!c) return;
  c.leaving = true;
  if (c.el) { c.el.classList.add('leaving'); if (mood === 'angry') c.el.classList.add('angry'); }
  setTimeout(() => { if (slots[i] === c) { slots[i] = null; renderRoad(); } }, 480);
  if (selected === i) selected = -1;
  setTimeout(() => { if (selected < 0 || !slots[selected] || slots[selected].leaving) { selected = oldestIndex(); renderSelection(); } }, 0);
}

function strike(reason) {
  run.strikes++; run.combo = 0;
  flash(reason, '#ff8a8a');
  renderHud();
  if (run.strikes >= MAX_STRIKES) setTimeout(() => endDay('strikes'), 500);
}

// ---------- serving ----------
function addItem(k) {
  if (!playing || paused || !unlocked(k)) return;
  const max = k === 'sugar' ? 3 : 1;
  if ((tray[k] || 0) >= max) { Sound.tap(); flash(k === 'sugar' ? 'Max 3 sugar' : 'Already added', '#f6efe3', 'small'); return; }
  tray[k] = (tray[k] || 0) + 1;
  k === 'karak' ? Sound.pour() : Sound.tap();
  renderTray();
}

function binTray() {
  if (!playing || paused) return;
  Sound.bin(); resetTray();
}

function sameOrder(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if ((a[k] || 0) !== (b[k] || 0)) return false;
  return true;
}

function serve() {
  if (!playing || paused) return;
  if (selected < 0 || !slots[selected] || slots[selected].leaving) { flash('Tap a car first', '#f6efe3', 'small'); return; }
  if (!itemCount(tray)) { flash('The cup is empty', '#f6efe3', 'small'); return; }
  const c = slots[selected];
  if (sameOrder(tray, c.order)) {
    const speed = c.patience / c.max;
    const tip = Math.round((speed * 60 * (1 + run.upgrades.neon * 0.25) * (1 + Math.min(run.combo, 5) * 0.1)) / 5) * 5;
    run.combo++;
    run.earned += c.price + tip; run.cash += c.price + tip; run.tips += tip; run.totalTips += tip;
    run.dayServed++; run.served++; S.served++; Store.save();
    Sound.clink(); setTimeout(Sound.cash, 90);
    flash(`+${fils(c.price + tip)}`, '#ffd76b');
    if (run.combo >= 3) setTimeout(() => flash(`${run.combo} in a row!`, '#a8e08a', 'small'), 350);
    customerLeaves(selected, 'happy');
  } else {
    Sound.wrong();
    customerLeaves(selected, 'angry');
    strike('Wrong order!');
  }
  resetTray(); renderHud();
}

// ---------- rendering ----------
function orderList(order) {
  return KEY_ORDER.filter((k) => order[k]).map((k) =>
    `<li>${ITEMS[k].icon}${esc(ITEMS[k].en)}${order[k] > 1 ? ` ×${order[k]}` : ''}</li>`).join('');
}

function renderRoad() {
  const road = $('road');
  slots.forEach((c, i) => {
    const slot = road.children[i];
    if (!c) { if (!slot.querySelector('.empty')) slot.innerHTML = '<div class="empty">·</div>'; return; }
    if (c.el && slot.contains(c.el)) return;
    slot.innerHTML = '';
    const el = document.createElement('button');
    el.className = 'car'; el.type = 'button';
    el.setAttribute('aria-label', `${c.name}'s order`);
    el.innerHTML = `<div class="ticket"><div class="who">${esc(c.name)}<em>${fils(c.price)}</em></div>
      <ul>${orderList(c.order)}</ul><div class="patience"><i></i></div></div>${carSVG(c.color)}`;
    el.onclick = () => { if (c.leaving) return; selected = i; Sound.click(); renderSelection(); };
    c.el = el; slot.appendChild(el);
  });
  renderSelection();
}

function renderSelection() {
  slots.forEach((c, i) => c && c.el && c.el.classList.toggle('sel', i === selected));
}

function renderKeys() {
  const keys = $('keys');
  keys.innerHTML = KEY_ORDER.map((k) => {
    const it = ITEMS[k], lock = run && !unlocked(k);
    return `<button class="key${lock ? ' locked' : ''}" data-k="${k}" type="button" ${lock ? 'aria-disabled="true"' : ''}>
      ${it.icon}<b>${esc(it.en)}</b><small>${lock ? `Day ${it.day}` : it.ar}</small></button>`;
  }).join('');
  keys.querySelectorAll('.key').forEach((b) => (b.onclick = () => addItem(b.dataset.k)));
}

function renderTray() {
  $('cup').innerHTML = cupSVG(tray);
  const keys = KEY_ORDER.filter((k) => tray[k]);
  $('trayList').innerHTML = keys.length ? orderList(tray) : '<li class="hint" style="background:none">Tap ingredients to build the order</li>';
}

function renderHud() {
  if (!run) return;
  $('day').textContent = run.day;
  $('earned').textContent = fils(run.earned || 0);
  $('goalTxt').textContent = fils(run.goal || goalFor(run.day));
  $('goalBar').style.width = `${Math.min(100, ((run.earned || 0) / (run.goal || 1)) * 100)}%`;
  $('strikes').innerHTML = Array.from({ length: MAX_STRIKES }, (_, i) => `<i class="${i < (run.strikes || 0) ? 'on' : ''}"></i>`).join('');
  $('clock').textContent = clockText();
}
function clockText() {
  // The stall opens at 9 pm; each real second is ~4 minutes of night.
  const mins = 21 * 60 + Math.floor(((DAY_SECONDS - Math.max(0, run.time)) / DAY_SECONDS) * 300);
  const h = Math.floor(mins / 60) % 24, m = mins % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}${h >= 12 && h < 24 ? 'pm' : 'am'}`;
}

function flash(text, color, size) {
  const el = document.createElement('div');
  el.className = 'flash'; el.textContent = text; el.style.color = color;
  if (size === 'small') el.style.fontSize = '22px';
  app.appendChild(el); setTimeout(() => el.remove(), 1000);
}

// ---------- screens ----------
function setScreen(html) { card.innerHTML = html; ov.hidden = false; }
function bind(id, fn) { const el = $(id); if (el) el.onclick = () => { Sound.click(); fn(); }; }

function showMenu() {
  playing = false; run = null;
  slots.forEach((c) => c && c.el && c.el.remove()); slots = new Array(SLOTS).fill(null);
  setScreen(`
    <div class="logo">Karak<span>Rush</span></div>
    <div class="logo-ar">كرك رَش</div>
    <p>Cars pull up to your stall and honk. Make every karak right, and fast.</p>
    <div class="stack">
      <button id="play">Open the stall</button>
      <div class="row2"><button class="alt" id="how">How to play</button><button class="alt" id="menuBtn">Menu &amp; prices</button></div>
      <div class="row2">
        <button class="ghost" id="snd">Sound: ${S.sound ? 'On' : 'Off'}</button>
        <button class="ghost" id="vib">Vibration: ${S.vibe ? 'On' : 'Off'}</button>
      </div>
    </div>
    <div class="stats">
      <div><b>${S.bestDay || '–'}</b><span>Best day</span></div>
      <div><b>${S.bestCash ? (S.bestCash / 1000).toFixed(3) : '–'}</b><span>Best BD</span></div>
      <div><b>${S.served}</b><span>Cups served</span></div>
    </div>`);
  bind('play', () => (S.seenHow ? newRun() : showHow(true)));
  bind('how', () => showHow(false));
  bind('menuBtn', showPrices);
  $('snd').onclick = () => { S.sound = !S.sound; Store.save(); Sound.click(); showMenu(); };
  $('vib').onclick = () => { S.vibe = !S.vibe; Store.save(); Sound.buzz(40); showMenu(); };
}

function showHow(thenPlay) {
  setScreen(`
    <h1>How to play</h1>
    <ol class="rules">
      <li>A car pulls up with an order on its ticket. The yellow outline shows which car you're serving. Tap another car to switch.</li>
      <li>Tap the ingredients to build the order. The order you tap them in doesn't matter.</li>
      <li>Tap <b>Serve</b>. Right order: you get paid, plus a tip for speed. Serve several in a row for bigger tips.</li>
      <li>Wrong order or a car that gives up waiting is a strike. Three strikes and the stall closes.</li>
      <li>Hit the day's target before closing time to open the next day, with new items on the menu.</li>
    </ol>
    <p class="muted">Made a mistake? Tap <b>Bin</b> to start the cup again.</p>
    <div class="stack"><button id="go">${thenPlay ? "Let's go" : 'Got it'}</button></div>`);
  bind('go', () => { S.seenHow = true; Store.save(); thenPlay ? newRun() : showMenu(); });
}

function showPrices() {
  setScreen(`
    <h1>Menu</h1>
    <p class="muted">Prices in Bahraini dinar. Sugar is free.</p>
    <div class="menuitems">${KEY_ORDER.map((k) => `<div>${ITEMS[k].icon}${esc(ITEMS[k].en)}<span>${ITEMS[k].ar}</span><span>${ITEMS[k].price ? (ITEMS[k].kind === 'add' ? '+' : '') + ITEMS[k].price + ' fils' : 'Free'}</span></div>`).join('')}</div>
    <p class="muted">New items join the menu as the days go on.</p>
    <div class="stack"><button id="back">Back</button></div>`);
  bind('back', showMenu);
}

function showDayIntro() {
  playing = false;
  const fresh = KEY_ORDER.filter((k) => ITEMS[k].day === run.day);
  setScreen(`
    <h1>Day ${run.day}</h1>
    <p>Target before closing: <b>${fils(goalFor(run.day))}</b></p>
    ${fresh.length ? `<p class="muted">${run.day === 1 ? 'On the menu' : 'New on the menu'}:</p>
      <div class="menuitems">${fresh.map((k) => `<div>${ITEMS[k].icon}${esc(ITEMS[k].en)}<span>${ITEMS[k].ar}</span></div>`).join('')}</div>` : ''}
    ${run.day > 1 ? `<p class="muted">Cash in the drawer: ${fils(run.cash)}</p>` : ''}
    <div class="stack"><button id="open">Open the stall</button></div>`);
  bind('open', startDay);
  renderKeys(); renderHud();
}

function endDay(reason) {
  if (!playing) return;
  playing = false;
  slots.forEach((c, i) => c && !c.leaving && customerLeaves(i, 'happy'));
  const passed = reason !== 'strikes' && run.earned >= run.goal;
  if (!passed) return gameOver(reason);
  Sound.bell();
  run.day++;
  showShop(true);
}

function showShop(fromDayEnd) {
  const ups = Object.entries(UPGRADES).map(([id, u]) => {
    const lvl = run.upgrades[id], cost = u.costs[lvl], maxed = cost == null;
    return `<div class="up"><div><b>${esc(u.name)}</b><span class="pips">${u.costs.map((_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</span>
      <p>${esc(u.desc)}</p></div>
      <button class="${maxed ? 'ghost' : 'alt'}" data-up="${id}" ${maxed || run.cash < cost ? 'disabled' : ''}>${maxed ? 'Maxed' : fils(cost)}</button></div>`;
  }).join('');
  setScreen(`
    <h1>${fromDayEnd ? `Day ${run.day - 1} done!` : 'Upgrades'}</h1>
    <ul class="lines">
      <li><span>Orders served</span><b>${run.dayServed}</b></li>
      <li><span>Tips</span><b>${fils(run.tips)}</b></li>
      <li><span>Earned today</span><b>${fils(run.earned)}</b></li>
      <li><span>Cash in the drawer</span><b>${fils(run.cash)}</b></li>
    </ul>
    <div class="shop">${ups}</div>
    <div class="stack"><button id="next">Start day ${run.day}</button></div>`);
  card.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => {
    const id = b.dataset.up, cost = UPGRADES[id].costs[run.upgrades[id]];
    if (cost == null || run.cash < cost) return;
    run.cash -= cost; run.upgrades[id]++; Sound.cash(); showShop(fromDayEnd);
  }));
  bind('next', showDayIntro);
}

function gameOver(reason) {
  Sound.leave();
  const dayReached = run.day;
  const newBest = dayReached > S.bestDay || (dayReached === S.bestDay && run.cash > S.bestCash);
  if (dayReached > S.bestDay) S.bestDay = dayReached;
  if (run.cash > S.bestCash) S.bestCash = run.cash;
  Store.save();
  setScreen(`
    <h1>Stall closed</h1>
    <p>${reason === 'strikes' ? 'Three unhappy customers. The neighbours are talking.' : `You made ${fils(run.earned)} of the ${fils(run.goal)} target.`}</p>
    <div class="big">Day ${dayReached}</div>
    <ul class="lines">
      <li><span>Cups served</span><b>${run.served}</b></li>
      <li><span>Tips collected</span><b>${fils(run.totalTips)}</b></li>
      <li><span>Cash in the drawer</span><b>${fils(run.cash)}</b></li>
    </ul>
    ${newBest ? '<p><b>New record!</b></p>' : `<p class="muted">Best: day ${S.bestDay}</p>`}
    <div class="stack"><button id="again">Try again</button><button class="ghost" id="menu">Main menu</button></div>`);
  bind('again', newRun);
  bind('menu', showMenu);
}

function pause() {
  if (!playing || paused) return;
  paused = true;
  setScreen(`<h1>Break time</h1><p>The cars will wait. For now.</p>
    <div class="stack"><button id="resume">Back to work</button><button class="ghost" id="quit">Close the stall</button></div>`);
  bind('resume', () => { paused = false; ov.hidden = true; });
  bind('quit', showMenu);
}

// ---------- input ----------
$('serve').onclick = serve;
$('bin').onclick = binTray;
$('clockBtn').onclick = pause;
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });
addEventListener('keydown', (e) => {
  if (!playing || paused) { if (e.key === 'Escape' && paused) $('resume')?.click(); return; }
  const k = e.key.toLowerCase();
  const map = { 1: 'karak', 2: 'sugar', 3: 'hail', 4: 'milk', 5: 'zafran', 6: 'ginger', 7: 'chips', 8: 'paratha', 9: 'samosa' };
  if (map[k]) addItem(map[k]);
  else if (k === 'enter' || k === ' ') { e.preventDefault(); serve(); }
  else if (k === 'backspace') binTray();
  else if (k === 'escape') pause();
  else if (k === 'arrowleft' || k === 'arrowright') {
    const live = slots.map((c, i) => (c && !c.leaving ? i : -1)).filter((i) => i >= 0);
    if (live.length) { const at = live.indexOf(selected); selected = live[(at + (k === 'arrowleft' ? -1 : 1) + live.length) % live.length]; renderSelection(); }
  }
});

// ---------- main loop ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (playing && !paused) {
    run.time -= dt;
    spawnIn -= dt;
    if (spawnIn <= 0 && run.time > 4) { spawnCustomer(); spawnIn = Math.max(2.2, 5.6 - run.day * 0.5) * (0.8 + Math.random() * 0.4); }
    slots.forEach((c, i) => {
      if (!c || c.leaving) return;
      c.patience -= dt;
      const f = Math.max(0, c.patience / c.max);
      const bar = c.el && c.el.querySelector('.patience i');
      if (bar) { bar.style.width = `${f * 100}%`; bar.style.background = f > 0.5 ? '#6aa84f' : f > 0.25 ? '#f5b301' : '#d6262b'; }
      if (f < 0.3 && !c.honked) {
        c.honked = true; Sound.honk();
        if (c.el) { const h = document.createElement('div'); h.className = 'honk'; h.textContent = 'BEEP!'; c.el.appendChild(h); }
      }
      if (c.patience <= 0) { Sound.leave(); customerLeaves(i, 'angry'); strike('Too slow!'); }
    });
    if (selected < 0) { selected = oldestIndex(); renderSelection(); }
    $('clock').textContent = clockText();
    if (run.time <= 0) endDay('time');
  }
  requestAnimationFrame(loop);
}

// ---------- boot ----------
renderTray();
showMenu();
requestAnimationFrame(loop);
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
}
