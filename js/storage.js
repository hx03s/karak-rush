// Saved records and settings, kept in this browser only (localStorage).
const Store = (() => {
  const KEY = 'karakRush.v1';
  const defaults = { bestDay: 0, bestCash: 0, served: 0, runs: 0, sound: true, vibe: true, seenHow: false };
  let data = { ...defaults };
  try { const raw = localStorage.getItem(KEY); if (raw) data = { ...defaults, ...JSON.parse(raw) }; } catch (e) {}
  return {
    get data() { return data; },
    save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} },
  };
})();
