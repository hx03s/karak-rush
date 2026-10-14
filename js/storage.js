// Saved progress and settings, kept in this browser only (localStorage).
const Store = (() => {
  const KEY = 'karakRush.v2';
  const defaults = {
    wallet: 0, unlocked: 1, stars: {}, best: {},
    upgrades: { pot: 0, stove: 0, griddle: 0, chairs: 0 },
    served: 0, sound: true, vibe: true, seenHow: false,
  };
  let data = JSON.parse(JSON.stringify(defaults));
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); data = { ...data, ...d, upgrades: { ...defaults.upgrades, ...(d.upgrades || {}) } }; }
  } catch (e) {}
  return {
    get data() { return data; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} },
  };
})();
