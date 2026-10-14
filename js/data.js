// Menu items, prices (in fils: 1 BD = 1000 fils), icons and customer names.
const SVG = (inner) => `<svg viewBox="0 0 32 32" aria-hidden="true">${inner}</svg>`;

const ITEMS = {
  karak: { en: 'Karak', ar: 'كرك', price: 100, day: 1, kind: 'drink',
    icon: SVG('<path d="M8 9h16l-2 17a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z" fill="#fff" stroke="#8a5420" stroke-width="1.5"/><path d="M9 13h14l-1.5 13a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z" fill="#c8813a"/><path d="M13 3c-1 2 1 3 0 5M18 3c-1 2 1 3 0 5" stroke="#b8a48c" stroke-width="1.5" fill="none" stroke-linecap="round"/>') },
  sugar: { en: 'Sugar', ar: 'سكر', price: 0, day: 1, kind: 'add',
    icon: SVG('<rect x="5" y="14" width="10" height="10" rx="2" fill="#fff" stroke="#bfb3a1" stroke-width="1.5"/><rect x="16" y="14" width="10" height="10" rx="2" fill="#fff" stroke="#bfb3a1" stroke-width="1.5"/><rect x="10.5" y="5" width="10" height="10" rx="2" fill="#fff" stroke="#bfb3a1" stroke-width="1.5"/>') },
  hail: { en: 'Cardamom', ar: 'هيل', price: 50, day: 2, kind: 'add',
    icon: SVG('<ellipse cx="12" cy="17" rx="5" ry="9" transform="rotate(-20 12 17)" fill="#6aa84f" stroke="#3f6e2c" stroke-width="1.5"/><ellipse cx="21" cy="15" rx="4.5" ry="8.5" transform="rotate(18 21 15)" fill="#8cc06f" stroke="#3f6e2c" stroke-width="1.5"/>') },
  milk: { en: 'Extra milk', ar: 'حليب', price: 50, day: 3, kind: 'add',
    icon: SVG('<rect x="9" y="6" width="14" height="22" rx="3" fill="#fff" stroke="#9fb4c8" stroke-width="1.5"/><rect x="9" y="12" width="14" height="9" fill="#2a6bff"/><ellipse cx="16" cy="6.5" rx="7" ry="2" fill="#dfe6ee" stroke="#9fb4c8" stroke-width="1.2"/>') },
  zafran: { en: 'Saffron', ar: 'زعفران', price: 50, day: 3, kind: 'add',
    icon: SVG('<path d="M8 26c3-6 4-12 3-19M14 27c1-7 2-13 5-19M20 27c0-6 2-11 6-15M12 27c2-5 6-9 11-10" stroke="#d6262b" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M10 7l2-2M18 8l3-2M25 11l2-1" stroke="#f5b301" stroke-width="2.4" stroke-linecap="round"/>') },
  ginger: { en: 'Ginger', ar: 'زنجبيل', price: 50, day: 4, kind: 'add',
    icon: SVG('<path d="M6 19c0-4 4-5 6-4 1-4 5-6 8-3 3-2 7 0 6 4 2 2 1 6-2 6H9c-2 0-3-1-3-3z" fill="#e3b46a" stroke="#9a6a2a" stroke-width="1.5"/><path d="M12 15c1 2 1 4 0 6M19 13c0 3 1 5 3 7" stroke="#9a6a2a" stroke-width="1.2" fill="none"/>') },
  chips: { en: 'Chips roll', ar: 'رول شيبس', price: 250, day: 1, kind: 'side',
    icon: SVG('<rect x="4" y="10" width="24" height="13" rx="6.5" fill="#f3dfb4" stroke="#b58b45" stroke-width="1.5"/><path d="M8 13l3 3-3 3M14 13l3 3-3 3M20 13l3 3-3 3" stroke="#f08a1c" stroke-width="2.4" fill="none" stroke-linejoin="round"/>') },
  paratha: { en: 'Paratha', ar: 'براتا', price: 200, day: 3, kind: 'side',
    icon: SVG('<circle cx="16" cy="16" r="12" fill="#f0c56a" stroke="#b58b45" stroke-width="1.5"/><path d="M16 7a9 9 0 1 0 9 9M16 11a5 5 0 1 0 5 5" stroke="#d29a3a" stroke-width="1.6" fill="none"/>') },
  samosa: { en: 'Samosa', ar: 'سمبوسة', price: 150, day: 5, kind: 'side',
    icon: SVG('<path d="M16 5L28 26H4z" fill="#e8b25a" stroke="#a8742a" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 5l-3 21M16 5l5 21" stroke="#a8742a" stroke-width="1.1"/>') },
};
const KEY_ORDER = ['karak', 'sugar', 'hail', 'milk', 'zafran', 'ginger', 'chips', 'paratha', 'samosa'];

const NAMES = ['Abu Ali', 'Fatima', 'Yousif', 'Maryam', 'Hamad', 'Noora', 'Khalid', 'Sara', 'Abdulla', 'Zainab',
  'Ahmed', 'Hessa', 'Salman', 'Latifa', 'Faisal', 'Aysha', 'Jassim', 'Reem', 'Ebrahim', 'Dana'];
const CAR_COLORS = ['#e9ecef', '#1d1d1f', '#c0392b', '#2a6bff', '#f5b301', '#7d8b96', '#2e8b57', '#ffffff', '#8e44ad'];

const UPGRADES = {
  chairs: { name: 'Plastic chairs', desc: 'Customers wait 3 seconds longer.', costs: [600, 1100, 1800] },
  neon: { name: 'Neon sign', desc: 'Tips are 25% bigger.', costs: [900, 1600, 2500] },
  thermos: { name: 'Big thermos', desc: 'Every new cup starts with karak already poured.', costs: [1500] },
};

const fils = (n) => `BD ${(n / 1000).toFixed(3)}`;

function carSVG(color) {
  const dark = color === '#1d1d1f' ? '#3a3a3c' : 'rgba(0,0,0,.25)';
  return `<svg viewBox="0 0 120 56" aria-hidden="true">
    <ellipse cx="60" cy="52" rx="54" ry="4" fill="rgba(0,0,0,.35)"/>
    <path d="M8 40c0-8 4-12 12-13l14-2 14-12c3-2 6-3 10-3h20c5 0 9 2 12 6l8 10 12 2c5 1 7 5 7 10v6H8z" fill="${color}" stroke="${dark}" stroke-width="1.5"/>
    <path d="M38 25l12-10c2-2 5-2 8-2h7v12zM70 13h9c3 0 6 1 8 4l6 8H70z" fill="#9fd2e6" stroke="rgba(0,0,0,.25)"/>
    <rect x="104" y="32" width="8" height="4" rx="2" fill="#ffe28a"/><rect x="8" y="33" width="6" height="4" rx="2" fill="#e74c3c"/>
    <circle cx="32" cy="46" r="9" fill="#1d1d1f"/><circle cx="32" cy="46" r="4" fill="#9aa3a8"/>
    <circle cx="92" cy="46" r="9" fill="#1d1d1f"/><circle cx="92" cy="46" r="4" fill="#9aa3a8"/>
  </svg>`;
}

function cupSVG(tray) {
  const has = (k) => (tray[k] || 0) > 0;
  const tea = has('karak') ? (has('milk') ? '#d9a26a' : has('zafran') ? '#d98a2a' : '#c8813a') : 'transparent';
  const sugar = tray.sugar || 0;
  let extras = '';
  if (has('hail')) extras += '<ellipse cx="22" cy="30" rx="2" ry="3.5" fill="#6aa84f" transform="rotate(-25 22 30)"/>';
  if (has('zafran')) extras += '<path d="M28 27l3 6M33 28l-1 6" stroke="#d6262b" stroke-width="1.6" stroke-linecap="round"/>';
  if (has('ginger')) extras += '<circle cx="38" cy="31" r="2.6" fill="#e3b46a" stroke="#9a6a2a"/>';
  for (let i = 0; i < Math.min(sugar, 3); i++) extras += `<rect x="${18 + i * 9}" y="58" width="6" height="6" rx="1" fill="#fff" opacity=".9"/>`;
  return `<svg viewBox="0 0 60 80" aria-hidden="true">
    ${has('karak') ? '<path d="M24 10c-2 3 2 4 0 7M34 8c-2 3 2 4 0 7" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none" stroke-linecap="round"/>' : ''}
    <path d="M10 22h40l-5 48a6 6 0 0 1-6 5H21a6 6 0 0 1-6-5z" fill="rgba(255,255,255,.12)" stroke="#f6efe3" stroke-width="2.5"/>
    <path d="M12.5 26h35l-4.5 43a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="${tea}"/>
    ${extras}
  </svg>`;
}
