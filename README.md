# Karak Rush · كرك رش

Run a roadside karak stall in Bahrain. Cars pull up and honk, the orders pile up, and every cup has to be right. Serve fast, earn tips, hit the night's target and keep the stall open another day.

## How to play
1. A car pulls up with its order on a ticket. The highlighted car is the one you're serving. Tap another car to switch.
2. Tap ingredients to build the order (any order you like), then tap **Serve**.
3. A correct order gets paid plus a speed tip, and several in a row make the tips bigger. A wrong order, or a car that gives up waiting, is a strike. Three strikes and the stall closes.
4. Reach the day's target before 2 am to unlock the next day.

## Features
- **Days that get harder:** more cars, less patience, and new menu items along the way (cardamom, extra milk, saffron, ginger, paratha, samosa).
- **Real prices in Bahraini dinar and fils:** a karak is 100 fils.
- **Upgrade shop between days:** plastic chairs (more patience), a neon sign (bigger tips), a big thermos (every cup starts poured).
- **Patience bars and honking:** cars honk when they're running out of patience.
- **Records:** best day, best cash, total cups served.
- Sound effects made with Web Audio (no audio files), vibration, and a pause button.
- **Installable:** add it to your home screen and it works offline.

Keyboard: 1–9 add ingredients, Enter serves, Backspace bins the cup, ← → switch cars, Esc pauses.

## Project structure
```
index.html            page shell: header, road, counter, keypad
css/style.css         all styling
js/data.js            menu items, prices, icons, car and cup drawings
js/storage.js         records and settings (localStorage)
js/audio.js           synthesised sound effects + vibration
js/main.js            game loop, customers, serving, screens, shop
sw.js                 offline cache
manifest.webmanifest  home-screen install
icons/                app icons
```

## Deploy
Static site with no build step. Import the repo on [vercel.com/new](https://vercel.com/new) with the default settings, or open `index.html` through any static server.
