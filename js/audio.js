// Sound effects synthesised with Web Audio (no audio files) + phone vibration.
const Sound = (() => {
  let ac = null;
  function audio() {
    if (!Store.data.sound) return null;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { return null; }
    return ac;
  }
  function tone(freq, dur, type = 'sine', vol = 0.1, when = 0, slideTo) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = 0.08, freq = 1200, when = 0) {
    const a = audio(); if (!a) return;
    const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
    src.buffer = buf; src.connect(f).connect(g).connect(a.destination); src.start(a.currentTime + when);
  }
  const buzz = (p) => { if (Store.data.vibe && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } };
  return {
    unlock: () => audio(),
    buzz,
    pour: () => noise(0.22, 0.06, 700),
    tap: () => tone(700, 0.05, 'triangle', 0.06),
    clink: () => { tone(2400, 0.08, 'sine', 0.05); tone(3100, 0.1, 'sine', 0.03, 0.03); },
    cash: () => { tone(1568, 0.07, 'square', 0.05); tone(2093, 0.25, 'square', 0.05, 0.07); noise(0.1, 0.05, 3000, 0.02); buzz(25); },
    honk: () => { tone(415, 0.18, 'square', 0.05); tone(392, 0.18, 'square', 0.04); },
    wrong: () => { tone(220, 0.3, 'sawtooth', 0.08, 0, 140); buzz([60, 40, 60]); },
    leave: () => { noise(0.4, 0.05, 300); tone(160, 0.3, 'sawtooth', 0.04, 0, 90); buzz(80); },
    bin: () => noise(0.18, 0.08, 400),
    bell: () => [880, 1109, 1319].forEach((f, i) => tone(f, 0.35, 'triangle', 0.07, i * 0.12)),
    click: () => tone(660, 0.05, 'square', 0.03),
  };
})();
