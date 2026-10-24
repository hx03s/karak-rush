// Menu, prices (fils: 1 BD = 1000 fils), places, customers, shop items and the art file names.
const ADDS = ['sugar', 'hail', 'milk', 'zafran', 'ginger', 'ice'];
const NAME = {
  karak: 'Karak', sugar: 'Sugar', hail: 'Cardamom', milk: 'Milk', zafran: 'Saffron', ginger: 'Ginger', ice: 'Ice',
  chips: 'Chips roll', paratha: 'Paratha', samosa: 'Samosa', chicken: 'Chicken roll', balaleet: 'Balaleet',
};
const AR = {
  karak: 'كرك', sugar: 'سكر', hail: 'هيل', milk: 'حليب', zafran: 'زعفران', ginger: 'زنجبيل', ice: 'ثلج',
  chips: 'رول شيبس', paratha: 'براتا', samosa: 'سمبوسة', chicken: 'رول دجاج', balaleet: 'بلاليط',
};
const PRICE = { karak: 100, add: 50, chips: 250, paratha: 200, samosa: 150, chicken: 350, balaleet: 300 };
// Level at which each thing joins the menu.
const UNLOCK = { karak: 1, sugar: 1, chips: 1, hail: 2, paratha: 3, milk: 4, zafran: 5, samosa: 6, ginger: 8, chicken: 13, ice: 17, balaleet: 25 };
const FOODS = ['chips', 'paratha', 'samosa', 'chicken', 'balaleet'];
const PER_PLACE = 12;

// Four places, 12 levels each.
const PLACES = [
  { id: 'souq', name: 'Manama Souq', ar: 'سوق المنامة', tag: 'Sunset at the souq', bg: 'bg-street', color: '#e8553e' },
  { id: 'muharraq', name: 'Muharraq', ar: 'المحرق', tag: 'Old town lanterns', bg: 'bg-muharraq', color: '#0f7c80' },
  { id: 'corniche', name: 'The Corniche', ar: 'الكورنيش', tag: 'Sea breeze & dhows', bg: 'bg-corniche', color: '#2f8fd8' },
  { id: 'sakhir', name: 'Sakhir Camp', ar: 'مخيم الصخير', tag: 'Winter nights in the desert', bg: 'bg-sakhir', color: '#4a2e6e' },
];
const LEVELS = PLACES.length * PER_PLACE;
const placeOf = (l) => PLACES[Math.min(PLACES.length - 1, Math.floor((l - 1) / PER_PLACE))];
const placeIndex = (l) => Math.min(PLACES.length - 1, Math.floor((l - 1) / PER_PLACE));

// Customer types. patience and tip are multipliers; from = first level they show up.
const KINDS = {
  man: { from: 1, patience: 1, tip: 1 },
  woman: { from: 1, patience: 1, tip: 1 },
  kid: { from: 1, patience: 1, tip: 1 },
  teen: { from: 1, patience: 1, tip: 1 },
  grandpa: { from: 1, patience: 1, tip: 1 },
  worker: { from: 13, patience: 1, tip: 0.9, food: 0.75, name: 'Worker', label: 'Hungry after a long shift' },
  rider: { from: 13, patience: 0.7, tip: 1.3, name: 'Delivery rider', label: 'In a hurry, tips well' },
  tourist: { from: 25, patience: 1.15, tip: 1.8, name: 'Tourist', label: 'Tries everything, tips big' },
  granny: { from: 25, patience: 1.5, tip: 1.1, name: 'Grandma', label: 'Very patient' },
  vip: { from: 37, patience: 0.65, tip: 3, name: 'VIP', label: 'Tips 3×, hates waiting' },
};
const PEOPLE = {
  man: ['Abu Ali', 'Yousif', 'Hamad', 'Khalid', 'Salman', 'Faisal', 'Jassim', 'Ebrahim'],
  woman: ['Fatima', 'Maryam', 'Noora', 'Zainab', 'Hessa', 'Latifa', 'Aysha', 'Reem'],
  kid: ['Hamood', 'Sulaiman', 'Ali', 'Abdulla'],
  teen: ['Sara', 'Shaikha', 'Lulwa', 'Jana', 'Dana'],
  grandpa: ['Abu Jassim', 'Hajji Ali', 'Abu Khalil', 'Bu Salem'],
  worker: ['Raju', 'Anil', 'Suresh', 'Imran', 'Ravi'],
  rider: ['Zaid', 'Omar', 'Bilal', 'Hasan'],
  tourist: ['Tom', 'Hans', 'Pierre', 'Mike', 'Lars'],
  granny: ['Umm Ali', 'Yumma Hessa', 'Umm Jassim', 'Umm Salman'],
  vip: ['Bu Rashid', 'Bu Fahad', 'Abu Majid', 'Bu Khalifa'],
};

const UPGRADES = {
  pot: { name: 'Bigger pot', desc: 'More glasses per brew', costs: [800, 1600, 3000] },
  stove: { name: 'Gas stove', desc: 'Karak brews faster', costs: [700, 1500, 2800] },
  griddle: { name: 'Heavy tawa', desc: 'Paratha, chicken and samosa cook faster', costs: [900, 1800, 3200] },
  chairs: { name: 'Plastic chairs', desc: 'Customers wait longer', costs: [600, 1400, 2600] },
};

// Decorations: shown on the stall, each with a small bonus.
const DECOR = {
  lights: { name: 'Party lights', desc: '+8% tips', cost: 1200, tip: 0.08 },
  plant: { name: 'Palm plant', desc: 'Customers wait 6% longer', cost: 1000, patience: 0.06 },
  radio: { name: 'Old radio', desc: 'Music! Customers wait 6% longer', cost: 1500, patience: 0.06 },
  menu: { name: 'Menu board', desc: 'Every order pays 5% more', cost: 2000, pay: 0.05 },
  fan: { name: 'Standing fan', desc: 'Customers wait 8% longer', cost: 2200, patience: 0.08 },
  rug: { name: 'Persian rug', desc: '+8% tips', cost: 2500, tip: 0.08 },
  lantern: { name: 'Ramadan lantern', desc: '+5% pay. Glows on Ramadan nights', cost: 1800, pay: 0.05 },
  flags: { name: 'Red & white flags', desc: '+5% pay. Shines on National Day', cost: 1800, pay: 0.05 },
};

// One-level boosts bought on the level screen.
const BOOSTS = {
  turbo: { name: 'Turbo stove', desc: 'Karak brews twice as fast', cost: 300, icon: 'stove' },
  calm: { name: 'Free water', desc: 'Everyone waits 30% longer', cost: 300, icon: 'glass-empty' },
  tips: { name: 'Big smiles', desc: 'Double tips', cost: 400, icon: 'eq-coins' },
};

// One-line tips for things that join the menu.
const ITEM_TIP = { karak: 'Brew in the pot, pour a glass', sugar: 'Up to 3 cubes', chips: 'Ready straight away', hail: 'A spice for the glass', paratha: 'Cooks on the tawa',
  milk: 'Makes milk karak', zafran: 'Saffron karak', samosa: 'Fries in the fryer', ginger: 'A spice for the glass', chicken: 'Cooks on the tawa',
  ice: 'Iced karak', balaleet: 'Ready straight away' };
const UP_ICON = { pot: 'stove', stove: 'stove', griddle: 'food-paratha-pan', chairs: 'grandpa-happy' };

const DAILY = [200, 300, 400, 500, 700, 900, 1500];

// Special nights. live() says when the real calendar matches; then coins are doubled.
const EVENTS = {
  ramadan: {
    name: 'Ramadan Night', ar: 'ليلة رمضان', desc: 'Ghabga crowd after taraweeh: big food orders and lots of customers.',
    bg: 'bg-street', night: true, count: 26, food: 0.85, pay: 1.2, decor: ['lantern', 'lights'],
    live: (d) => [[2027, 1, 7, 2, 8], [2028, 0, 27, 1, 26], [2029, 0, 15, 1, 14]].some(([y, m1, d1, m2, d2]) => d >= new Date(y, m1, d1) && d <= new Date(y, m2, d2, 23, 59)),
  },
  national: {
    name: 'National Day', ar: 'العيد الوطني', desc: 'Everyone is out celebrating in red and white. Orders pay 50% more!',
    bg: 'bg-corniche', night: false, count: 28, food: 0.55, pay: 1.5, decor: ['flags', 'lights'],
    live: (d) => d.getMonth() === 11 && d.getDate() >= 12 && d.getDate() <= 20,
  },
};

const ACHIEVEMENTS = [
  { id: 'first', name: 'First glass', desc: 'Serve your first customer', reward: 100 },
  { id: 's100', name: 'Regulars', desc: 'Serve 100 customers', reward: 500 },
  { id: 's500', name: 'Famous stall', desc: 'Serve 500 customers', reward: 1500 },
  { id: 'perfect', name: 'Perfect night', desc: 'Get 3 stars on a level', reward: 300 },
  { id: 'clean', name: 'Nobody left', desc: 'Finish a 20+ customer level without losing anyone', reward: 800 },
  { id: 'muharraq', name: 'To Muharraq', desc: 'Open your stall in Muharraq', reward: 600 },
  { id: 'corniche', name: 'Sea view', desc: 'Open your stall on the Corniche', reward: 900 },
  { id: 'sakhir', name: 'Desert nights', desc: 'Open your stall at Sakhir Camp', reward: 1200 },
  { id: 'champion', name: 'Karak champion', desc: 'Finish level 48', reward: 5000 },
  { id: 'souq3', name: 'Souq star', desc: '3 stars on every Manama Souq level', reward: 2000 },
  { id: 'vip', name: 'VIP service', desc: 'Serve a VIP', reward: 500 },
  { id: 'rich', name: 'Ten dinars', desc: 'Earn 10 BD in total', reward: 500 },
  { id: 'rich2', name: 'Big business', desc: 'Earn 100 BD in total', reward: 3000 },
  { id: 'decor1', name: 'Looking good', desc: 'Buy your first decoration', reward: 200 },
  { id: 'decorall', name: 'Best stall in Bahrain', desc: 'Own every decoration', reward: 3000 },
  { id: 'maxup', name: 'Pro kit', desc: 'Max out an upgrade', reward: 500 },
  { id: 'e20', name: 'Rush hour', desc: 'Serve 20 customers in Endless Rush', reward: 400 },
  { id: 'e50', name: 'Unstoppable', desc: 'Serve 50 customers in Endless Rush', reward: 1500 },
  { id: 'streak', name: 'Every day', desc: 'Collect the daily gift 7 days in a row', reward: 1000 },
  { id: 'ramadan', name: 'Ramadan Kareem', desc: '3 stars on Ramadan Night', reward: 1000 },
  { id: 'national', name: 'Proud of Bahrain', desc: '3 stars on National Day', reward: 1000 },
];

const IMG = (n) => `img/${n}.webp`;
const ING = { sugar: 'ing-sugar', hail: 'ing-hail', milk: 'ing-milk', zafran: 'ing-zafran', ginger: 'ing-ginger', ice: 'ing-ice' };
const FOOD = { chips: 'food-chips', paratha: 'food-paratha-pan', samosa: 'food-samosa', chicken: 'food-chicken-roll', balaleet: 'food-balaleet' };
// Which add-in the glass picture already shows (so the order bubble doesn't repeat it).
const glassKey = (spec) => (spec.ice ? 'ice' : spec.zafran ? 'zafran' : spec.milk ? 'milk' : null);
const glassFile = (spec) => ({ ice: 'glass-ice', zafran: 'glass-saffron', milk: 'glass-milk' }[glassKey(spec)] || 'glass-karak');

const fils = (n) => `${(n / 1000).toFixed(3)}`;
