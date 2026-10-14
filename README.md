# Karak Rush · كرك رش

A time-management cooking game set at a karak stall in Bahrain. Customers line up at your window with order bubbles. You brew karak, pour cups, add sugar and spices, cook paratha and samosa before they burn, and collect your coins before the next customer walks up.

## How to play
- **Karak:** tap the pot to brew, tap again to pour a cup. Sugar and spices go into the highlighted cup. Tap a finished cup to hand it over.
- **Paratha & samosa:** tap the supply to put it on the griddle or in the fryer. Tap it when it glows to serve it. Leave it too long and it burns.
- **Chips roll** is ready straight away. Extra food waits in the **warmer**.
- Serve everything in a bubble to get paid. Faster service means bigger tips, and customers who wait too long walk away.
- Tap the coins on the counter to collect them. Earn enough for 1–3 stars to unlock the next level.

## Features
- **12 levels** with a level map, 1–3 stars each, and the same customers every time you replay a level.
- **Original Bahraini characters:** men in ghutra and agal, women in hijab, kids. Their faces change as they lose patience.
- **Menu grows level by level:** karak, sugar, chips roll → cardamom → paratha → milk → saffron → samosa → ginger.
- **Real prices in Bahraini dinar and fils.**
- **Upgrades bought with saved coins:** bigger pot, gas stove, heavy griddle, plastic chairs.
- Progress is saved on the device. Sound effects are made with Web Audio (no audio files), plus vibration, pause, and you can install it on your home screen.

## Project structure
```
index.html            page shell: HUD, street & counter, kitchen stations
css/style.css         all styling
js/data.js            menu, prices, levels, upgrades and all the SVG drawings
js/storage.js         saved progress (localStorage)
js/audio.js           synthesised sound effects + vibration
js/main.js            level generation, customers, kitchen logic, screens, main loop
sw.js                 offline cache
manifest.webmanifest  home-screen install
icons/                app icons
```

## Deploy
Static site with no build step. Import the repo on [vercel.com/new](https://vercel.com/new) with the default settings, or open `index.html` through any static server.
