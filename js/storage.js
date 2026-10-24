// Saved progress and settings, kept in this browser only (localStorage).
const Store = (() => {
  const KEY = 'karakRush.v2';
  const defaults = {
    wallet: 0, unlocked: 1, stars: {}, best: {},
    upgrades: { pot: 0, stove: 0, griddle: 0, chairs: 0 },
    served: 0, sound: true, vibe: true, seenHow: false,
    decor: {}, ach: {}, totalEarned: 0, vipServed: 0,
    daily: { last: '', streak: 0 }, endless: { best: 0, bestServed: 0 }, events: {},
  };
  let data = JSON.parse(JSON.stringify(defaults));
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      data = { ...data, ...d, upgrades: { ...defaults.upgrades, ...(d.upgrades || {}) },
        daily: { ...defaults.daily, ...(d.daily || {}) }, endless: { ...defaults.endless, ...(d.endless || {}) } };
    }
  } catch (e) {}
  return {
    get data() { return data; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} },
  };
})();
