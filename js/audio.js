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
    coin: () => { tone(1976, 0.06, 'square', 0.04); tone(2637, 0.18, 'square', 0.04, 0.06); },
    plop: () => tone(520, 0.08, 'sine', 0.09, 0, 900),
    nope: () => tone(200, 0.15, 'square', 0.05),
    sizzle: () => noise(0.5, 0.05, 4000),
    ding: () => tone(1318, 0.25, 'triangle', 0.08),
    burn: () => { noise(0.3, 0.06, 2500); tone(300, 0.3, 'sawtooth', 0.04, 0, 150); buzz(50); },
    huff: () => tone(330, 0.2, 'triangle', 0.05, 0, 220),
    audio,
  };
})();

// Customer voices: a synthesised angry "Arrr!" growl, and a spoken "Cancel! Cancel!" when they walk off.
const Voice = (() => {
  // pitch of each character's voice (Hz for the growl, 0-2 for speech)
  const VOICE = {
    man: { hz: 120, pitch: 0.75, rate: 1.15 },
    grandpa: { hz: 95, pitch: 0.5, rate: 0.9 },
    woman: { hz: 210, pitch: 1.25, rate: 1.2 },
    teen: { hz: 260, pitch: 1.5, rate: 1.3 },
    kid: { hz: 300, pitch: 1.8, rate: 1.35 },
  };
  const v = (kind) => VOICE[kind] || VOICE.man;
  const synth = typeof window !== 'undefined' && window.speechSynthesis;
  let voices = [];
  const loadVoices = () => { try { voices = synth.getVoices(); } catch (e) {} };
  if (synth) { loadVoices(); try { synth.onvoiceschanged = loadVoices; } catch (e) {} }

  // "Arrr!": a buzzy voice pushed through two vowel-like filters, wobbling and sliding down.
  function growl(kind) {
    const a = Sound.audio(); if (!a) return;
    const { hz } = v(kind), t = a.currentTime, dur = 0.75;
    const o = a.createOscillator(), wob = a.createOscillator(), wobGain = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(hz * 1.15, t);
    o.frequency.linearRampToValueAtTime(hz * 1.3, t + 0.12);
    o.frequency.exponentialRampToValueAtTime(hz * 0.8, t + dur);
    wob.frequency.value = 28; wobGain.gain.value = hz * 0.09; // rolled "rrr"
    wob.connect(wobGain).connect(o.frequency);
    const f1 = a.createBiquadFilter(), f2 = a.createBiquadFilter(), g = a.createGain(), mix = a.createGain();
    f1.type = 'bandpass'; f1.frequency.value = 750; f1.Q.value = 6;   // "a"
    f2.type = 'bandpass'; f2.frequency.value = 1250; f2.Q.value = 7;
    f1.frequency.linearRampToValueAtTime(560, t + dur);                 // → "r"
    f2.frequency.linearRampToValueAtTime(1400, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.05);
    g.gain.setValueAtTime(0.5, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    mix.gain.value = 0.9;
    o.connect(f1).connect(g); o.connect(f2).connect(g); g.connect(mix).connect(a.destination);
    o.start(t); wob.start(t); o.stop(t + dur + 0.05); wob.stop(t + dur + 0.05);
    Sound.buzz([40, 30, 40]);
  }

  function say(text, kind, rateBoost = 1) {
    if (!Store.data.sound || !synth) return false;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const en = voices.filter((x) => /^en/i.test(x.lang));
      const pick = en.find((x) => /male|daniel|fred|alex|google uk english male/i.test(x.name) && ['man', 'grandpa'].includes(kind))
        || en.find((x) => /female|samantha|karen|google us english/i.test(x.name) && !['man', 'grandpa'].includes(kind)) || en[0];
      if (pick) u.voice = pick;
      u.lang = pick ? pick.lang : 'en-US';
      u.pitch = v(kind).pitch; u.rate = v(kind).rate * rateBoost; u.volume = 1;
      synth.speak(u);
      return true;
    } catch (e) { return false; }
  }

  return {
    // Mobile browsers only allow speech after a tap, so prime it on the first touch.
    unlock() { if (synth) { try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } catch (e) {} } },
    angry(kind) { growl(kind); },
    cancel(kind) {
      if (!say('Cancel! Cancel!', kind, 1.15)) { growl(kind); setTimeout(() => growl(kind), 450); }
    },
  };
})();
