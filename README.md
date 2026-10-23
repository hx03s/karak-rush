<div align="center">

<img src="docs/gameplay.jpg" alt="Karak Rush" width="32%">
<img src="docs/menu.jpg" alt="Karak Rush" width="32%">

# Karak Rush · كرك رش

**A time-management cooking game at a karak stall in Bahrain. Brew, pour, fry and serve before your customers walk away.**

<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript"> <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"> <img src="https://img.shields.io/badge/Web%20Audio-555555?style=for-the-badge" alt="Web Audio"> <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA">

[**▶ Play now**](https://karak-rush.vercel.app)

</div>


Customers line up at your window with order bubbles. You brew karak, pour cups, add sugar and spices, cook paratha and samosa before they burn, and collect your fils. It plays on a phone, a tablet or a desktop, and installs to your home screen.

## How to play
- **Karak:** tap the pot to brew, tap again to pour a cup. Sugar and spices go into the highlighted cup. Tap a finished cup to hand it over.
- **Paratha & samosa:** tap the supply to put it on the griddle or in the fryer. Tap it when it glows to serve it. Leave it too long and it burns.
- **Chips roll** is ready straight away. Extra food waits in the **warmer**.
- Serve everything in a bubble to get paid. Faster service means bigger tips, and customers who wait too long walk away.
- Tap the coins on the counter to collect them. Earn enough for 1–3 stars to unlock the next level.

## Art
Soft-3D characters, food, kitchen equipment and backgrounds were generated with AI (Higgsfield, Z Image model), then cut out and optimised to WebP (about 0.5 MB in total) in `img/`.

## Features
- **12 levels** with a level map, 1–3 stars each, and the same customers every time you replay a level.
- **Five Bahraini customers:** a man in ghutra, a woman in hijab, a boy, a teen girl and a grandpa. Their faces change from happy to impatient, and angry customers shake.
- **Clear glass building:** the glass sits big on a brass tray, sugar cubes and spices visibly drop in, and an order card ticks off what's done and says what's missing.
- **Menu grows level by level:** karak, sugar, chips roll → cardamom → paratha → milk → saffron → samosa → ginger.
- **Real prices in Bahraini dinar and fils.**
- **Upgrades bought with saved coins:** bigger pot, gas stove, heavy griddle, plastic chairs.
- Progress is saved on the device. Sound effects are made with Web Audio (no audio files), plus vibration, pause, and you can install it on your home screen.

## Project structure
```
index.html            page shell: HUD, street & counter, kitchen stations
css/style.css         all styling
js/data.js            menu, prices, levels, upgrades and art file names
img/                  characters, food, equipment and backgrounds (WebP)
js/storage.js         saved progress (localStorage)
js/audio.js           synthesised sound effects + vibration
js/main.js            level generation, customers, kitchen logic, screens, main loop
sw.js                 offline cache
manifest.webmanifest  home-screen install
icons/                app icons
```

## Deploy
Static site with no build step. Import the repo on [vercel.com/new](https://vercel.com/new) with the default settings, or open `index.html` through any static server.

---

<div align="center">

Built by **Hasan Abdulla** · [github.com/hx03s](https://github.com/hx03s) · Bahrain 🇧🇭

</div>
