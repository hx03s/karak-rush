// All the illustrations, drawn as SVG. Shared gradients live once in index.html (#defs).

// ---------- small icons (order bubbles, flying items) ----------
const ICON = {
  karak: `<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="35" rx="13" ry="3" fill="#d9cdb8"/>
    <path d="M10 10h20l-2.5 22a3 3 0 0 1-3 2.6h-9a3 3 0 0 1-3-2.6z" fill="url(#gGlass)" stroke="#c9a34a" stroke-width="1.2"/>
    <path d="M11.3 15h17.4l-2 16.8a2 2 0 0 1-2 1.8h-9.4a2 2 0 0 1-2-1.8z" fill="url(#gKarak)"/>
    <ellipse cx="20" cy="15" rx="8.7" ry="1.6" fill="#e9c08c"/><rect x="10" y="9" width="20" height="2" rx="1" fill="#e2b84f"/>
    <path d="M13 17v12" stroke="rgba(255,255,255,.45)" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  sugar: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="7" y="18" width="12" height="12" rx="2" fill="#fff" stroke="#c9bfae"/><rect x="21" y="18" width="12" height="12" rx="2" fill="#f7f4ee" stroke="#c9bfae"/><rect x="14" y="7" width="12" height="12" rx="2" fill="#fff" stroke="#c9bfae"/><path d="M9 20h5M16 9h5" stroke="#fff" stroke-width="1.5"/></svg>`,
  hail: `<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="15" cy="21" rx="6" ry="11" transform="rotate(-20 15 21)" fill="url(#gPod)"/><ellipse cx="26" cy="19" rx="5.5" ry="10.5" transform="rotate(18 26 19)" fill="url(#gPod)"/><path d="M13 13q2 8 0 16M26 11q-1 8 0 16" stroke="#3f6e2c" stroke-width="1" fill="none"/></svg>`,
  milk: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="10" y="7" width="20" height="27" rx="3" fill="url(#gMetal)"/><rect x="10" y="13" width="20" height="14" fill="#2a6bff"/><path d="M15 20q5-5 10 0q-5 5-10 0z" fill="#fff"/><ellipse cx="20" cy="7.5" rx="10" ry="2.5" fill="#dfe6ee" stroke="#8f9a9e"/></svg>`,
  zafran: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M10 33c4-8 5-15 4-24M17 34c1-8 3-16 6-24M24 34c0-7 3-13 8-18M14 34c3-6 8-11 14-12" stroke="#d6262b" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M13 9l3-3M22 10l3-3M31 15l3-1" stroke="#f5b301" stroke-width="2.8" stroke-linecap="round"/></svg>`,
  ginger: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 24c0-5 5-6 7-5 1-5 7-7 10-3 4-2 9 0 8 5 3 2 1 8-3 8H10c-3 0-4-2-4-5z" fill="url(#gGinger)" stroke="#9a6a2a" stroke-width="1.4"/><path d="M15 19c1 3 1 5 0 8M23 17c0 4 1 6 3 9" stroke="#9a6a2a" stroke-width="1.2" fill="none"/></svg>`,
  chips: `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="12" width="32" height="17" rx="8.5" fill="url(#gBread)" stroke="#b58b45" stroke-width="1.4"/><path d="M9 16l4 4.5-4 4.5M17 16l4 4.5-4 4.5M25 16l4 4.5-4 4.5" stroke="#f08a1c" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="M8 14h24" stroke="rgba(255,255,255,.5)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  paratha: `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="url(#gParatha)" stroke="#a8742a" stroke-width="1.4"/><path d="M20 8a12 12 0 1 0 12 12M20 13a7 7 0 1 0 7 7" stroke="#b98030" stroke-width="1.6" fill="none"/><circle cx="14" cy="15" r="1.6" fill="#8a5420"/><circle cx="26" cy="25" r="1.8" fill="#8a5420"/></svg>`,
  samosa: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6l15 27H5z" fill="url(#gSamosa)" stroke="#9a6420" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 6l-4 27M20 6l6 27" stroke="#9a6420" stroke-width="1.1"/><circle cx="13" cy="27" r="1" fill="#7a4a15"/><circle cx="27" cy="26" r="1" fill="#7a4a15"/></svg>`,
};

const COIN = `<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="24" rx="14" ry="7" fill="#a87a00"/><ellipse cx="20" cy="21" rx="14" ry="7" fill="url(#gGold)" stroke="#a87a00" stroke-width="1.2"/><ellipse cx="20" cy="21" rx="9" ry="4.2" fill="none" stroke="#c99400" stroke-width="1.2"/><path d="M12 18q4-3 10-3" stroke="#fff6c2" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;
const COIN_PILE = `<svg viewBox="0 0 60 40" aria-hidden="true">
  <ellipse cx="30" cy="35" rx="26" ry="4" fill="rgba(0,0,0,.35)"/>
  <ellipse cx="20" cy="30" rx="12" ry="5" fill="#a87a00"/><ellipse cx="20" cy="28" rx="12" ry="5" fill="url(#gGold)" stroke="#a87a00"/>
  <ellipse cx="38" cy="30" rx="12" ry="5" fill="#a87a00"/><ellipse cx="38" cy="28" rx="12" ry="5" fill="url(#gGold)" stroke="#a87a00"/>
  <ellipse cx="29" cy="22" rx="12" ry="5" fill="#a87a00"/><ellipse cx="29" cy="20" rx="12" ry="5" fill="url(#gGold)" stroke="#a87a00"/>
  <ellipse cx="29" cy="14" rx="12" ry="5" fill="#a87a00"/><ellipse cx="29" cy="12" rx="12" ry="5" fill="url(#gGold)" stroke="#a87a00"/>
  <path d="M21 10q5-3 12-2" stroke="#fff6c2" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

// ---------- street backdrop ----------
function streetSVG() {
  const bulbs = Array.from({ length: 13 }, (_, i) => {
    const x = 10 + i * 31.5, y = 34 + Math.sin((i / 12) * Math.PI) * 14;
    const c = ['#ffd76b', '#ff8a5c', '#9be3ff', '#ffd76b', '#b6f08a'][i % 5];
    return `<circle cx="${x}" cy="${y + 4}" r="7" fill="${c}" opacity=".25" filter="url(#fBlur)"/><circle cx="${x}" cy="${y + 4}" r="3" fill="${c}"/>`;
  }).join('');
  const win = (x, y, w, h, n, m) => {
    let s = '';
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++)
      if ((i * 7 + j * 3 + x) % 4) s += `<rect x="${x + 3 + i * (w - 6) / n}" y="${y + 4 + j * 9}" width="3" height="4" fill="#ffd76b" opacity="${0.35 + ((i + j) % 3) * 0.2}"/>`;
    return s;
  };
  let scallops = '';
  for (let i = 0; i < 16; i++) {
    const x = i * 26, col = i % 2 ? '#f6efe3' : '#d6262b';
    scallops += `<rect x="${x}" y="0" width="26" height="22" fill="${col}"/><path d="M${x} 22a13 9 0 0 0 26 0z" fill="${col}"/>`;
  }
  return `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <rect width="400" height="240" fill="url(#gSky)"/>
    <circle cx="340" cy="62" r="14" fill="#fff6d8"/><circle cx="346" cy="58" r="13" fill="#163557"/>
    <g fill="#fff" opacity=".6"><circle cx="40" cy="70" r="1"/><circle cx="120" cy="58" r="1.2"/><circle cx="260" cy="66" r="1"/><circle cx="300" cy="90" r=".9"/><circle cx="80" cy="96" r=".9"/></g>
    <g fill="#14304d">
      <rect x="18" y="118" width="34" height="90"/><rect x="58" y="96" width="26" height="112"/><rect x="66" y="84" width="10" height="14"/>
      <rect x="250" y="104" width="30" height="104"/><rect x="286" y="80" width="22" height="128"/><path d="M286 80l11-18 11 18z"/>
      <rect x="318" y="120" width="40" height="88"/><rect x="362" y="100" width="30" height="108"/>
    </g>
    ${win(18, 118, 34, 90, 4, 9)}${win(58, 96, 26, 112, 3, 11)}${win(250, 104, 30, 104, 3, 10)}${win(286, 80, 22, 128, 2, 13)}${win(318, 120, 40, 88, 4, 8)}${win(362, 100, 30, 108, 3, 10)}
    <g fill="#10263f">
      <path d="M150 208v-62a32 32 0 0 1 64 0v62z"/><rect x="224" y="92" width="10" height="116"/><path d="M222 92h14l-7-16z"/><circle cx="229" cy="72" r="2.5" fill="#ffd76b"/>
      <path d="M182 108l3-8 3 8z" fill="#ffd76b"/>
    </g>
    <g fill="#0c1f33">
      <path d="M104 208c2-30 4-50 2-70" stroke="#0c1f33" stroke-width="5" fill="none"/>
      <path d="M106 140c-14-6-26-2-32 6 10-6 22-6 32-2-12 0-22 8-24 16 8-10 18-12 24-12-6 6-8 14-6 22 2-10 6-16 8-20 4 6 4 14 2 20 4-6 6-14 4-22 8 2 14 8 16 16 0-10-8-18-16-20 8-2 20 2 26 10-4-10-16-14-26-12 6-6 16-8 24-4-8-6-20-4-26 2z"/>
      <path d="M380 208c-2-26-6-44-2-64" stroke="#0c1f33" stroke-width="5" fill="none"/>
      <path d="M378 146c-12-8-24-6-30 2 10-4 20-4 30 0-10 2-18 8-20 16 8-8 16-10 22-10-4 6-6 14-4 20 2-8 4-14 6-18 4 4 6 12 4 18 4-6 6-12 4-20 8 2 12 8 14 14 0-10-6-16-14-18 8 0 16 4 20 10-2-8-12-12-20-12z"/>
    </g>
    <rect y="200" width="400" height="40" fill="#1f2a30"/><rect y="200" width="400" height="5" fill="#2e3c43"/>
    <path d="M0 26q200 40 400 0" stroke="#2b2b2b" stroke-width="1.5" fill="none"/>
    ${bulbs}
    <rect x="0" y="0" width="12" height="240" fill="url(#gWoodV)"/><rect x="388" y="0" width="12" height="240" fill="url(#gWoodV)"/>
    <g>${scallops}</g><rect y="0" width="400" height="22" fill="url(#gAwningShade)"/>
    <g transform="translate(306 32)"><rect width="56" height="26" rx="8" fill="#0b1a26" stroke="#ff5aa5" stroke-width="2" filter="url(#fGlow)"/>
      <text x="28" y="19" text-anchor="middle" font-family="Lalezar, Impact, sans-serif" font-size="18" fill="#ffd1e6" filter="url(#fGlow)">كرك</text></g>
  </svg>`;
}

// ---------- customers ----------
const SKIN = ['#f3cfae', '#e6b48c', '#cf9a6c', '#a86e45', '#7f4f2e'];
const HIJAB = ['#1d1d1f', '#5b2a6e', '#24557a', '#7a2a35', '#2e6b4f', '#b88a4a', '#c24f74'];
const SHIRT = ['#e74c3c', '#2a6bff', '#2e8b57', '#f5b301', '#8e44ad', '#ff7f3f'];
const PEOPLE = {
  man: ['Abu Ali', 'Yousif', 'Hamad', 'Khalid', 'Salman', 'Faisal', 'Jassim', 'Ebrahim', 'Abdulla', 'Ahmed'],
  woman: ['Fatima', 'Maryam', 'Noora', 'Sara', 'Zainab', 'Hessa', 'Latifa', 'Aysha', 'Reem', 'Dana'],
  kid: ['Hamood', 'Sulaiman', 'Ali', 'Mona', 'Lulwa', 'Jana'],
};

// mood: 0 happy, 1 waiting, 2 angry
function personSVG(p, mood) {
  const brow = mood === 0 ? 'M44 51q5-4 10 0M66 51q5-4 10 0' : mood === 1 ? 'M44 51h10M66 51h10' : 'M44 49l10 4M76 49l-10 4';
  const eye = (x) => `<ellipse cx="${x}" cy="60" rx="4.6" ry="${mood === 0 ? 4 : 5}" fill="#fff"/><circle cx="${x + 0.5}" cy="60.5" r="2.8" fill="#2a1a10"/><circle cx="${x + 1.5}" cy="59" r="1" fill="#fff"/>`;
  const mouth = mood === 0
    ? '<path d="M50 76q10 10 20 0z" fill="#7a2230"/><path d="M52 76.5h16v2.5q-8 2-16 0z" fill="#fff"/>'
    : mood === 1 ? '<path d="M53 78h14" stroke="#5a2a20" stroke-width="2.6" stroke-linecap="round"/>'
    : '<path d="M51 81q9-8 18 0" stroke="#5a2a20" stroke-width="2.8" fill="none" stroke-linecap="round"/>';
  const face = `
    <ellipse cx="60" cy="64" rx="22" ry="25" fill="${p.skin}"/>
    <path d="M38 66a22 25 0 0 0 44 0q-4 18-22 23q-18-5-22-23z" fill="rgba(0,0,0,.08)"/>
    ${eye(49)}${eye(71)}
    <path d="${brow}" stroke="#2a1a10" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M60 62q-3 7 0 9q2 0 3-1" stroke="rgba(0,0,0,.25)" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${mood < 2 ? '<ellipse cx="42" cy="72" rx="4.5" ry="2.6" fill="#ff7b7b" opacity=".35"/><ellipse cx="78" cy="72" rx="4.5" ry="2.6" fill="#ff7b7b" opacity=".35"/>' : '<ellipse cx="60" cy="68" rx="20" ry="20" fill="#ff2a2a" opacity=".14"/>'}
    ${mouth}`;
  const anger = mood === 2 ? '<g transform="translate(86 34)" stroke="#e5243b" stroke-width="3" stroke-linecap="round"><path d="M0 4q4 0 4-4M8 0q0 4 4 4M12 8q-4 0-4 4M4 12q0-4-4-4"/></g>' : '';
  if (p.kind === 'man') {
    return `<svg viewBox="0 0 120 130" aria-hidden="true">
      <path d="M8 130c0-26 20-38 52-38s52 12 52 38z" fill="url(#gThobe)"/>
      <path d="M60 94v36" stroke="#d8d4cb" stroke-width="2"/><circle cx="60" cy="104" r="1.6" fill="#c9c4b8"/><circle cx="60" cy="112" r="1.6" fill="#c9c4b8"/>
      <path d="M32 56c-4-26 10-40 28-40s32 14 28 40l10 44c-10-6-18-20-18-34-4 14-8 24-20 28-12-4-16-14-20-28 0 14-8 28-18 34z" fill="url(#gGhutra)"/>
      <path d="M36 64q-6 24-14 36M84 64q6 24 14 36M44 30q16-8 32 0" stroke="#d6d2c8" stroke-width="2" fill="none"/>
      ${face}
      ${p.beard ? '<path d="M44 74q16 22 32 0q-2 16-16 18q-14-2-16-18z" fill="#2c1d14"/><path d="M50 74q10-4 20 0q-10 3-20 0z" fill="#2c1d14"/>' : '<path d="M51 73q9-4 18 0q-9 2-18 0z" fill="#2c1d14"/>'}
      ${mood === 0 && p.beard ? '<path d="M52 77q8 6 16 0" stroke="#fff" stroke-width="2" fill="none"/>' : ''}
      <ellipse cx="60" cy="31" rx="27" ry="7" fill="none" stroke="#1d1d1f" stroke-width="4.5"/><ellipse cx="60" cy="27" rx="25" ry="6" fill="none" stroke="#2f2f31" stroke-width="3.5"/>
      ${anger}</svg>`;
  }
  if (p.kind === 'woman') {
    return `<svg viewBox="0 0 120 130" aria-hidden="true">
      <path d="M8 130c0-26 20-38 52-38s52 12 52 38z" fill="${p.cloth}"/><path d="M8 130c0-26 20-38 52-38s52 12 52 38z" fill="url(#gShade)"/>
      <path d="M30 70c-4-34 12-52 30-52s34 18 30 52c6 18 8 30 8 40H22c0-10 2-22 8-40z" fill="${p.cloth}"/>
      <path d="M30 70c-4-34 12-52 30-52s34 18 30 52c6 18 8 30 8 40H22c0-10 2-22 8-40z" fill="url(#gShade)"/>
      <path d="M40 30q20-14 40 0" stroke="rgba(255,255,255,.25)" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${face}
      <path d="M38 62c0-20 10-30 22-30s22 10 22 30q-4-16-22-18q-18 2-22 18z" fill="${p.cloth}"/>
      <circle cx="80" cy="88" r="2" fill="#ffd76b"/>${anger}</svg>`;
  }
  return `<svg viewBox="0 0 120 130" aria-hidden="true">
    <path d="M16 130c0-22 18-34 44-34s44 12 44 34z" fill="${p.cloth}"/><path d="M16 130c0-22 18-34 44-34s44 12 44 34z" fill="url(#gShade)"/>
    <path d="M24 116h72" stroke="rgba(255,255,255,.55)" stroke-width="5"/>
    <circle cx="37" cy="66" r="5" fill="${p.skin}"/><circle cx="83" cy="66" r="5" fill="${p.skin}"/>
    ${face}
    <path d="M38 52c0-18 10-26 22-26s22 8 22 26z" fill="${p.cloth}"/><path d="M38 52c0-18 10-26 22-26s22 8 22 26z" fill="url(#gShade)"/>
    <path d="M70 50h26a4 4 0 0 1 0 8H72z" fill="${p.cloth}"/><circle cx="60" cy="27" r="3" fill="#fff" opacity=".7"/>${anger}</svg>`;
}

// ---------- kitchen ----------
function potSVG(state, servings, cap) {
  const fill = state === 'empty' ? 'transparent' : 'url(#gKarak)';
  const lvl = state === 'ready' ? 38 + (1 - servings / cap) * 22 : 38;
  const flames = state === 'brewing'
    ? `<g class="flames"><path d="M36 84c-2-6 2-10 4-14 1 5 5 7 3 14z" fill="#ffb02e"/><path d="M48 84c-2-7 2-12 5-16 1 6 6 8 3 16z" fill="#ff7a1a"/><path d="M60 84c-2-6 2-11 5-15 1 6 6 8 3 15z" fill="#ffb02e"/><path d="M72 84c-2-6 2-10 4-14 1 5 5 7 3 14z" fill="#ff7a1a"/></g>`
    : '<path d="M38 84h44" stroke="#4fb3ff" stroke-width="2" stroke-dasharray="3 4" opacity=".6"/>';
  const steam = state !== 'empty'
    ? `<g fill="none" stroke="rgba(255,255,255,.65)" stroke-width="3" stroke-linecap="round">
        <path d="M46 26c-4 5 4 8 0 13"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="1.8s" repeatCount="indefinite"/></path>
        <path d="M60 22c-4 5 4 8 0 13"><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin=".6s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="1.8s" begin=".6s" repeatCount="indefinite"/></path>
        <path d="M74 26c-4 5 4 8 0 13"><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1.2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="1.8s" begin="1.2s" repeatCount="indefinite"/></path></g>` : '';
  return `<svg viewBox="0 0 120 112" aria-hidden="true">
    <ellipse cx="60" cy="104" rx="50" ry="6" fill="rgba(0,0,0,.35)"/>
    <rect x="16" y="84" width="88" height="16" rx="5" fill="url(#gSteelDark)"/><rect x="16" y="84" width="88" height="3" rx="1.5" fill="#9aa5aa"/>
    <circle cx="28" cy="93" r="3.5" fill="#1d1d1f"/><circle cx="92" cy="93" r="3.5" fill="#1d1d1f"/>
    ${flames}
    <path d="M26 42h68v32a12 12 0 0 1-12 12H38a12 12 0 0 1-12-12z" fill="url(#gMetal)" stroke="#5f6b70" stroke-width="2"/>
    <clipPath id="potClip"><path d="M28 44h64v30a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10z"/></clipPath>
    <rect x="26" y="${lvl}" width="68" height="60" fill="${fill}" clip-path="url(#potClip)"/>
    ${state !== 'empty' ? `<ellipse cx="60" cy="${Math.max(44, lvl)}" rx="32" ry="4" fill="#e9b47a" opacity=".9" clip-path="url(#potClip)"/>` : ''}
    <ellipse cx="60" cy="42" rx="36" ry="6" fill="none" stroke="#7d898e" stroke-width="3"/>
    <path d="M34 50v26" stroke="rgba(255,255,255,.6)" stroke-width="4" stroke-linecap="round"/>
    <path d="M24 52h-9a4 4 0 0 0 0 8h9M96 52h9a4 4 0 0 1 0 8h-9" fill="none" stroke="#4a5458" stroke-width="4"/>
    ${steam}</svg>`;
}

function cupSVG(spec) {
  const s = spec || {};
  const tea = s.milk ? 'url(#gKarakMilk)' : s.zafran ? 'url(#gKarakSaffron)' : 'url(#gKarak)';
  let top = '';
  if (s.hail) top += '<ellipse cx="40" cy="31" rx="2.6" ry="4.4" fill="url(#gPod)" transform="rotate(-30 40 31)"/>';
  if (s.zafran) top += '<path d="M48 29l4 5M53 30l-1 5M45 33l5 1" stroke="#d6262b" stroke-width="1.8" stroke-linecap="round"/>';
  if (s.ginger) top += '<circle cx="58" cy="31" r="3.2" fill="url(#gGinger)" stroke="#9a6a2a"/>';
  let cubes = '';
  for (let i = 0; i < Math.min(s.sugar || 0, 3); i++) cubes += `<rect x="${12 + i * 9}" y="${84 - (i === 1 ? 4 : 0)}" width="8" height="8" rx="1.5" fill="#fff" stroke="#cfc6b6"/>`;
  return `<svg viewBox="0 0 96 100" aria-hidden="true">
    <ellipse cx="48" cy="92" rx="42" ry="7" fill="rgba(0,0,0,.3)"/>
    <ellipse cx="48" cy="89" rx="40" ry="8" fill="url(#gSaucer)" stroke="#b9ac95"/><ellipse cx="48" cy="88" rx="26" ry="4.5" fill="#e5dccb"/>
    <path d="M22 22h52l-6 58a8 8 0 0 1-8 7H36a8 8 0 0 1-8-7z" fill="url(#gGlass)" stroke="#c9a34a" stroke-width="1.5"/>
    <path d="M25 31h46l-5 49a6 6 0 0 1-6 5H36a6 6 0 0 1-6-5z" fill="${tea}"/>
    <ellipse cx="48" cy="31" rx="23" ry="3.6" fill="${s.milk ? '#f0d3a6' : '#e6b27a'}"/>
    ${top}
    <rect x="21" y="19" width="54" height="4" rx="2" fill="url(#gGold)"/>
    <path d="M30 36v38" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linecap="round"/>
    ${cubes}</svg>`;
}

function parathaSVG(stage) {
  if (stage === 'raw') return `<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="42" rx="30" ry="24" fill="#f6ead0" stroke="#d9c79e" stroke-width="2"/><g fill="#fffaf0"><circle cx="30" cy="38" r="2"/><circle cx="48" cy="46" r="2.4"/><circle cx="42" cy="32" r="1.6"/></g></svg>`;
  const burnt = stage === 'burnt';
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="42" rx="31" ry="25" fill="${burnt ? '#3a2416' : 'url(#gParatha)'}" stroke="${burnt ? '#1d120a' : '#a8742a'}" stroke-width="2"/>
    <path d="M40 24a20 16 0 1 0 20 18M40 31a12 10 0 1 0 12 11" stroke="${burnt ? '#1d120a' : '#b98030'}" stroke-width="2" fill="none"/>
    <g fill="${burnt ? '#120a05' : '#8a5420'}"><circle cx="28" cy="36" r="2.4"/><circle cx="52" cy="50" r="2.8"/><circle cx="46" cy="30" r="1.8"/><circle cx="30" cy="52" r="2"/></g>
    ${burnt ? '<g fill="rgba(90,90,90,.6)"><circle cx="34" cy="16" r="6"><animate attributeName="cy" values="20;4" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite"/></circle><circle cx="48" cy="18" r="5"><animate attributeName="cy" values="22;6" dur="1.4s" begin=".5s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.4s" begin=".5s" repeatCount="indefinite"/></circle></g>' : '<path d="M20 36q4-10 16-12" stroke="rgba(255,255,255,.4)" stroke-width="3" fill="none" stroke-linecap="round"/>'}</svg>`;
}
function samosaSVG(stage) {
  const fill = stage === 'raw' ? '#f3e2b8' : stage === 'burnt' ? '#3a2416' : 'url(#gSamosa)';
  const line = stage === 'raw' ? '#d9c79e' : stage === 'burnt' ? '#1d120a' : '#9a6420';
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 12l28 50H12z" fill="${fill}" stroke="${line}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M40 12l-7 50M40 12l10 50" stroke="${line}" stroke-width="1.6"/>
    ${stage === 'ready' ? '<path d="M30 30l-6 14" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linecap="round"/><g fill="#7a4a15"><circle cx="26" cy="54" r="1.3"/><circle cx="52" cy="52" r="1.3"/><circle cx="42" cy="44" r="1.2"/></g>' : ''}
    ${stage === 'burnt' ? '<circle cx="40" cy="8" r="6" fill="rgba(90,90,90,.6)"><animate attributeName="cy" values="10;-4" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite"/></circle>' : ''}</svg>`;
}

function crateSVG(kind) {
  const items = kind === 'dough'
    ? '<ellipse cx="24" cy="24" rx="14" ry="9" fill="#f6ead0" stroke="#d9c79e"/><ellipse cx="50" cy="22" rx="14" ry="9" fill="#fbf1dc" stroke="#d9c79e"/><ellipse cx="38" cy="14" rx="14" ry="9" fill="#f6ead0" stroke="#d9c79e"/><ellipse cx="64" cy="26" rx="10" ry="7" fill="#f1e2c2" stroke="#d9c79e"/>'
    : kind === 'samosa'
      ? '<path d="M22 8l12 22H10z" fill="#f3e2b8" stroke="#d9c79e" stroke-width="1.5"/><path d="M42 4l13 24H29z" fill="#f6e8c6" stroke="#d9c79e" stroke-width="1.5"/><path d="M60 10l12 20H48z" fill="#f3e2b8" stroke="#d9c79e" stroke-width="1.5"/>'
      : '<g transform="rotate(-8 40 20)"><rect x="8" y="10" width="40" height="16" rx="8" fill="url(#gBread)" stroke="#b58b45"/><path d="M14 14l4 4-4 4M24 14l4 4-4 4M34 14l4 4-4 4" stroke="#f08a1c" stroke-width="2.6" fill="none"/></g><g transform="rotate(6 50 22)"><rect x="34" y="14" width="40" height="16" rx="8" fill="url(#gBread)" stroke="#b58b45"/><path d="M40 18l4 4-4 4M50 18l4 4-4 4M60 18l4 4-4 4" stroke="#f08a1c" stroke-width="2.6" fill="none"/></g>';
  return `<svg viewBox="0 0 80 70" aria-hidden="true">
    <ellipse cx="40" cy="66" rx="36" ry="4" fill="rgba(0,0,0,.3)"/>
    ${items}
    <rect x="4" y="28" width="72" height="36" rx="4" fill="url(#gWood)" stroke="#5a3214" stroke-width="2"/>
    <path d="M4 40h72M4 52h72" stroke="#6b3d17" stroke-width="2"/><path d="M10 30v32M70 30v32" stroke="#7a4a20" stroke-width="3"/>
    <rect x="4" y="28" width="72" height="4" fill="rgba(255,255,255,.18)"/></svg>`;
}

function jarSVG(k) {
  const glass = (inner, lid) => `<svg viewBox="0 0 64 64" aria-hidden="true">
    <ellipse cx="32" cy="60" rx="22" ry="3.5" fill="rgba(0,0,0,.3)"/>
    <rect x="12" y="16" width="40" height="42" rx="9" fill="rgba(230,245,250,.25)" stroke="rgba(255,255,255,.7)" stroke-width="2"/>
    ${inner}<rect x="10" y="8" width="44" height="10" rx="4" fill="${lid}"/><rect x="10" y="8" width="44" height="3" rx="1.5" fill="rgba(255,255,255,.35)"/>
    <path d="M18 22v28" stroke="rgba(255,255,255,.7)" stroke-width="3" stroke-linecap="round"/></svg>`;
  if (k === 'sugar') return `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="60" rx="24" ry="3.5" fill="rgba(0,0,0,.3)"/>
    <rect x="16" y="14" width="12" height="12" rx="2" fill="#fff" stroke="#cfc6b6"/><rect x="30" y="12" width="12" height="12" rx="2" fill="#fbf8f2" stroke="#cfc6b6"/><rect x="24" y="4" width="12" height="12" rx="2" fill="#fff" stroke="#cfc6b6"/>
    <path d="M6 26h52l-6 26a8 8 0 0 1-8 6H20a8 8 0 0 1-8-6z" fill="url(#gBowl)" stroke="#1f5f8b" stroke-width="2"/><path d="M14 34q18 6 36 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/></svg>`;
  if (k === 'hail') return glass('<g><ellipse cx="24" cy="44" rx="4" ry="7" fill="url(#gPod)" transform="rotate(-20 24 44)"/><ellipse cx="34" cy="46" rx="4" ry="7" fill="url(#gPod)" transform="rotate(25 34 46)"/><ellipse cx="42" cy="42" rx="4" ry="7" fill="url(#gPod)"/><ellipse cx="29" cy="34" rx="4" ry="7" fill="url(#gPod)" transform="rotate(60 29 34)"/><ellipse cx="40" cy="32" rx="4" ry="7" fill="url(#gPod)" transform="rotate(-40 40 32)"/></g>', '#3f6e2c');
  if (k === 'milk') return `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="60" rx="20" ry="3.5" fill="rgba(0,0,0,.3)"/>
    <rect x="14" y="8" width="36" height="50" rx="5" fill="url(#gMetal)"/><rect x="14" y="20" width="36" height="24" fill="#2a6bff"/>
    <path d="M22 32q10-9 20 0q-10 9-20 0z" fill="#fff"/><ellipse cx="32" cy="9" rx="18" ry="4" fill="#dfe6ee" stroke="#8f9a9e"/>
    <path d="M19 12v42" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round"/></svg>`;
  if (k === 'zafran') return `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="60" rx="20" ry="3.5" fill="rgba(0,0,0,.3)"/>
    <path d="M18 10c6 12 4 22 6 30M28 6c2 14 4 24 2 34M38 8c-2 12 0 22 4 32M46 12c-6 10-6 20-4 28" stroke="#d6262b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <rect x="12" y="34" width="40" height="24" rx="6" fill="url(#gGold)" stroke="#a87a00" stroke-width="2"/><rect x="12" y="34" width="40" height="6" rx="3" fill="#c99400"/>
    <path d="M22 48h20" stroke="#a87a00" stroke-width="2"/><text x="32" y="55" text-anchor="middle" font-size="7" font-weight="700" fill="#7a4a15" font-family="Rubik,sans-serif">زعفران</text></svg>`;
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="58" rx="26" ry="4" fill="url(#gSaucer)" stroke="#b9ac95"/>
    <path d="M10 46c0-7 7-9 10-7 2-7 10-10 14-4 6-3 13 0 12 7 4 3 2 12-4 12H16c-4 0-6-3-6-8z" fill="url(#gGinger)" stroke="#9a6a2a" stroke-width="1.8"/>
    <path d="M22 40c2 4 2 8 0 12M34 36c0 6 2 9 4 13" stroke="#9a6a2a" stroke-width="1.6" fill="none"/></svg>`;
}

const BIN_SVG = `<svg viewBox="0 0 60 64" aria-hidden="true"><ellipse cx="30" cy="60" rx="20" ry="3.5" fill="rgba(0,0,0,.3)"/>
  <path d="M12 18h36l-4 40H16z" fill="url(#gSteelDark)" stroke="#2b3639" stroke-width="2"/><path d="M22 24v28M30 24v28M38 24v28" stroke="#2b3639" stroke-width="2"/>
  <rect x="8" y="10" width="44" height="9" rx="3" fill="url(#gMetal)" stroke="#4a5458"/><rect x="24" y="5" width="12" height="6" rx="2" fill="#7d898e"/></svg>`;

// Menu illustration: a karak glass in the spotlight with paratha and a chips roll.
function heroSVG() {
  const rays = Array.from({ length: 12 }, (_, i) => `<path d="M160 70L${160 + Math.cos(i / 12 * Math.PI * 2) * 200} ${70 + Math.sin(i / 12 * Math.PI * 2) * 200}L${160 + Math.cos((i + 0.5) / 12 * Math.PI * 2) * 200} ${70 + Math.sin((i + 0.5) / 12 * Math.PI * 2) * 200}z" fill="#f7c823" opacity=".14"/>`).join('');
  return `<svg viewBox="0 0 320 120" aria-hidden="true">
    <g>${rays}<animateTransform attributeName="transform" type="rotate" from="0 160 70" to="30 160 70" dur="12s" repeatCount="indefinite"/></g>
    <g transform="translate(46 52) scale(.95)">${parathaSVG('ready').replace('<svg viewBox="0 0 80 80" aria-hidden="true">', '<g>').replace(/<\/svg>$/, '</g>')}</g>
    <g transform="translate(206 66) scale(1.6)">${ICON.chips.replace('<svg viewBox="0 0 40 40" aria-hidden="true">', '<g>').replace(/<\/svg>$/, '</g>')}</g>
    <g transform="translate(112 4) scale(1.0)">${cupSVG({ sugar: 2, hail: 1 }).replace('<svg viewBox="0 0 96 100" aria-hidden="true">', '<g>').replace(/<\/svg>$/, '</g>')}</g>
    <g fill="#fff"><path d="M60 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M262 30l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5z"/><path d="M230 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/></g>
  </svg>`;
}
