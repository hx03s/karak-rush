// Menu, prices (fils: 1 BD = 1000 fils), levels, upgrades and all the drawings.
const SVG = (inner, vb = '0 0 32 32') => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;

const ICON = {
  karak: SVG('<path d="M8 9h16l-2 17a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z" fill="#fff" stroke="#8a5420" stroke-width="1.5"/><path d="M9 13h14l-1.5 13a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z" fill="#c8813a"/>'),
  sugar: SVG('<rect x="5" y="14" width="10" height="10" rx="2" fill="#fff" stroke="#bfb3a1" stroke-width="1.5"/><rect x="16" y="14" width="10" height="10" rx="2" fill="#fff" stroke="#bfb3a1" stroke-width="1.5"/><rect x="10.5" y="5" width="10" height="10" rx="2" fill="#fff" stroke="#bfb3a1" stroke-width="1.5"/>'),
  hail: SVG('<ellipse cx="12" cy="17" rx="5" ry="9" transform="rotate(-20 12 17)" fill="#6aa84f" stroke="#3f6e2c" stroke-width="1.5"/><ellipse cx="21" cy="15" rx="4.5" ry="8.5" transform="rotate(18 21 15)" fill="#8cc06f" stroke="#3f6e2c" stroke-width="1.5"/>'),
  milk: SVG('<rect x="9" y="6" width="14" height="22" rx="3" fill="#fff" stroke="#9fb4c8" stroke-width="1.5"/><rect x="9" y="12" width="14" height="9" fill="#2a6bff"/><ellipse cx="16" cy="6.5" rx="7" ry="2" fill="#dfe6ee" stroke="#9fb4c8" stroke-width="1.2"/>'),
  zafran: SVG('<path d="M8 26c3-6 4-12 3-19M14 27c1-7 2-13 5-19M20 27c0-6 2-11 6-15M12 27c2-5 6-9 11-10" stroke="#d6262b" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M10 7l2-2M18 8l3-2M25 11l2-1" stroke="#f5b301" stroke-width="2.4" stroke-linecap="round"/>'),
  ginger: SVG('<path d="M6 19c0-4 4-5 6-4 1-4 5-6 8-3 3-2 7 0 6 4 2 2 1 6-2 6H9c-2 0-3-1-3-3z" fill="#e3b46a" stroke="#9a6a2a" stroke-width="1.5"/><path d="M12 15c1 2 1 4 0 6M19 13c0 3 1 5 3 7" stroke="#9a6a2a" stroke-width="1.2" fill="none"/>'),
  chips: SVG('<rect x="4" y="10" width="24" height="13" rx="6.5" fill="#f3dfb4" stroke="#b58b45" stroke-width="1.5"/><path d="M8 13l3 3-3 3M14 13l3 3-3 3M20 13l3 3-3 3" stroke="#f08a1c" stroke-width="2.4" fill="none" stroke-linejoin="round"/>'),
  paratha: SVG('<circle cx="16" cy="16" r="12" fill="#e0a84a" stroke="#a8742a" stroke-width="1.5"/><path d="M16 7a9 9 0 1 0 9 9M16 11a5 5 0 1 0 5 5" stroke="#b98030" stroke-width="1.6" fill="none"/>'),
  samosa: SVG('<path d="M16 5L28 26H4z" fill="#d99a3c" stroke="#9a6420" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 5l-3 21M16 5l5 21" stroke="#9a6420" stroke-width="1.1"/>'),
  dough: SVG('<circle cx="16" cy="17" r="10" fill="#f6ead0" stroke="#cdb88d" stroke-width="1.5"/><circle cx="12" cy="14" r="1.2" fill="#e2d1aa"/><circle cx="19" cy="19" r="1.2" fill="#e2d1aa"/>'),
  rawSamosa: SVG('<path d="M16 6L27 25H5z" fill="#f3e2b8" stroke="#cdb88d" stroke-width="1.6" stroke-linejoin="round"/>'),
};

const ADDS = ['sugar', 'hail', 'milk', 'zafran', 'ginger'];
const NAME = { karak: 'Karak', sugar: 'Sugar', hail: 'Cardamom', milk: 'Milk', zafran: 'Saffron', ginger: 'Ginger', chips: 'Chips roll', paratha: 'Paratha', samosa: 'Samosa' };
const AR = { karak: 'كرك', sugar: 'سكر', hail: 'هيل', milk: 'حليب', zafran: 'زعفران', ginger: 'زنجبيل', chips: 'رول شيبس', paratha: 'براتا', samosa: 'سمبوسة' };
const PRICE = { karak: 100, add: 50, chips: 250, paratha: 200, samosa: 150 };
// Level at which each thing joins the menu.
const UNLOCK = { karak: 1, sugar: 1, chips: 1, hail: 2, paratha: 3, milk: 4, zafran: 5, samosa: 6, ginger: 8 };
const LEVELS = 12;

const UPGRADES = {
  pot: { name: 'Bigger pot', desc: 'More cups per brew', costs: [800, 1600, 3000] },
  stove: { name: 'Gas stove', desc: 'Karak brews faster', costs: [700, 1500, 2800] },
  griddle: { name: 'Heavy griddle', desc: 'Paratha and samosa cook faster', costs: [900, 1800, 3200] },
  chairs: { name: 'Plastic chairs', desc: 'Customers wait longer', costs: [600, 1400, 2600] },
};

const fils = (n) => `${(n / 1000).toFixed(3)}`;

// ---------- drawings ----------
function cupSVG(spec, empty) {
  const s = spec || {};
  const tea = empty ? 'transparent' : s.milk ? '#d9a26a' : s.zafran ? '#d98a2a' : '#c8813a';
  let extras = '';
  if (s.hail) extras += '<ellipse cx="22" cy="31" rx="2.2" ry="3.6" fill="#6aa84f" transform="rotate(-25 22 31)"/>';
  if (s.zafran) extras += '<path d="M28 28l3 6M33 29l-1 6" stroke="#d6262b" stroke-width="1.8" stroke-linecap="round"/>';
  if (s.ginger) extras += '<circle cx="38" cy="32" r="2.8" fill="#e3b46a" stroke="#9a6a2a"/>';
  for (let i = 0; i < Math.min(s.sugar || 0, 3); i++) extras += `<rect x="${19 + i * 8}" y="58" width="6" height="6" rx="1" fill="#fff" opacity=".95"/>`;
  return `<svg viewBox="0 0 60 80" aria-hidden="true">
    ${empty ? '' : '<path d="M24 10c-2 3 2 4 0 7M34 8c-2 3 2 4 0 7" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none" stroke-linecap="round"/>'}
    <path d="M10 22h40l-5 48a6 6 0 0 1-6 5H21a6 6 0 0 1-6-5z" fill="rgba(255,255,255,.18)" stroke="#f6efe3" stroke-width="2.5"/>
    <path d="M12.5 26h35l-4.5 43a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="${tea}"/>${extras}</svg>`;
}

function potSVG(state, servings, cap) {
  const fill = state === 'empty' ? '#3a2a20' : '#c8813a';
  const level = state === 'ready' ? 30 + (1 - servings / cap) * 22 : state === 'brewing' ? 34 : 60;
  const steam = state !== 'empty' ? '<path d="M38 10c-3 4 3 6 0 10M50 8c-3 4 3 6 0 10M62 10c-3 4 3 6 0 10" stroke="rgba(255,255,255,.6)" stroke-width="2.5" fill="none" stroke-linecap="round"/>' : '';
  return `<svg viewBox="0 0 100 90" aria-hidden="true">${steam}
    <rect x="14" y="74" width="72" height="10" rx="3" fill="#2b3639"/>
    <path d="M30 84l-4 5M50 84v5M70 84l4 5" stroke="#2b3639" stroke-width="4"/>
    ${state === 'brewing' ? '<path d="M34 74c2-6 6-6 6 0M48 74c2-7 6-7 6 0M62 74c2-6 6-6 6 0" fill="#ff8a1c"/>' : ''}
    <path d="M20 26h60v38a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill="#b9c2c6" stroke="#6d797e" stroke-width="2.5"/>
    <clipPath id="pc"><path d="M23 28h54v36a8 8 0 0 1-8 8H31a8 8 0 0 1-8-8z"/></clipPath>
    <rect x="20" y="${level}" width="60" height="60" fill="${fill}" clip-path="url(#pc)"/>
    <rect x="14" y="22" width="72" height="7" rx="3" fill="#8f9a9e"/>
    <path d="M14 34h-8M86 34h8" stroke="#6d797e" stroke-width="5" stroke-linecap="round"/></svg>`;
}

const SKIN = ['#f1c9a5', '#e0ac82', '#c68d5f', '#9c6640', '#7a4c2c'];
const HIJAB = ['#1d1d1f', '#5b2a6e', '#24557a', '#7a2a35', '#2e6b4f', '#b88a4a'];
const SHIRT = ['#e74c3c', '#2a6bff', '#2e8b57', '#f5b301', '#8e44ad'];
const PEOPLE = {
  man: ['Abu Ali', 'Yousif', 'Hamad', 'Khalid', 'Salman', 'Faisal', 'Jassim', 'Ebrahim', 'Abdulla', 'Ahmed'],
  woman: ['Fatima', 'Maryam', 'Noora', 'Sara', 'Zainab', 'Hessa', 'Latifa', 'Aysha', 'Reem', 'Dana'],
  kid: ['Hamood', 'Sulaiman', 'Ali', 'Mona', 'Lulwa', 'Jana'],
};

// Original characters: ghutra & agal, hijab, or a kid with a cap. mood: 0 happy … 2 angry
function personSVG(p, mood) {
  const eyes = mood >= 2
    ? '<path d="M31 41l6 2M49 43l6-2" stroke="#1d1410" stroke-width="2.4" stroke-linecap="round"/><circle cx="35" cy="46" r="2.4" fill="#1d1410"/><circle cx="51" cy="46" r="2.4" fill="#1d1410"/>'
    : '<circle cx="35" cy="45" r="2.6" fill="#1d1410"/><circle cx="51" cy="45" r="2.6" fill="#1d1410"/>';
  const mouth = mood === 0 ? '<path d="M36 55q7 7 14 0" stroke="#1d1410" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    : mood === 1 ? '<path d="M37 57h12" stroke="#1d1410" stroke-width="2.4" stroke-linecap="round"/>'
    : '<path d="M36 59q7-6 14 0" stroke="#1d1410" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  const face = `<ellipse cx="43" cy="47" rx="16" ry="18" fill="${p.skin}"/>${eyes}${mouth}`;
  let body = '', head = '', extra = '';
  if (p.kind === 'man') {
    body = '<path d="M10 100c0-20 14-30 33-30s33 10 33 30z" fill="#fbfbf8" stroke="#dcd8cf"/><path d="M43 72v20" stroke="#dcd8cf" stroke-width="2"/>';
    head = `<path d="M24 46c-2-20 8-30 19-30s21 10 19 30l6 26c-6-4-10-14-10-24H34c0 10-4 20-10 24z" fill="#ffffff" stroke="#dcd8cf" stroke-width="1.5"/>
`;
    extra = `<ellipse cx="43" cy="24" rx="19" ry="5" fill="none" stroke="#1d1d1f" stroke-width="4.5"/>${p.beard ? '<path d="M29 54q14 14 28 0q-2 12-14 12t-14-12z" fill="#3a2a20"/>' : ''}`;
  } else if (p.kind === 'woman') {
    body = `<path d="M10 100c0-20 14-30 33-30s33 10 33 30z" fill="${p.cloth}"/>`;
    head = `<path d="M22 50c-2-22 9-34 21-34s23 12 21 34c4 14 6 22 6 28H16c0-6 2-14 6-28z" fill="${p.cloth}"/>`;
  } else {
    body = `<path d="M14 100c0-18 12-28 29-28s29 10 29 28z" fill="${p.cloth}"/>`;
    head = `<path d="M26 36c0-12 8-18 17-18s17 6 17 18z" fill="${p.cloth}"/><path d="M56 34h12" stroke="${p.cloth}" stroke-width="5" stroke-linecap="round"/>`;
  }
  const layers = p.kind === 'kid' ? `${body}${face}${head}` : `${body}${head}${face}${extra}`;
  return `<svg viewBox="0 0 86 100" aria-hidden="true">${layers}</svg>`;
}
