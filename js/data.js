// Menu, prices (fils: 1 BD = 1000 fils), unlock levels and upgrades. Drawings live in art.js.
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
