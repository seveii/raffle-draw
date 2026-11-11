# Tech Raffle Draw

A raffle draw machine that runs in the browser. Balls tumble inside a glass globe, a hand reaches in and picks one, and the winning control number is revealed.

## How to use

- Click **TAP TO DRAW**, click the machine, or press Space / Enter.
- The winning ball pops out with its control number. The number also shows on the big display and on the machine's number window.
- The gear icon in the top-right corner opens the settings and the winners list.

## Settings

- **Highest control no.** – the draw picks from 1 up to this number (default 1386).
- **Prize label** – optional text shown with the winner.
- **Never draw the same number twice** – a number that already won is left out of later draws.
- **Sound effects** – on or off.

Winners and settings are saved in the browser, so they survive a refresh.

## Run it

It is a static site with no build step. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Deploy

Any static host works. On Vercel, import the repository, choose the "Other" framework preset and leave the build command empty.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page markup |
| `css/styles.css` | Page layout, number display, draw button |
| `css/settings.css` | Settings and winners panel |
| `js/core.js` | Shared helpers, saved settings, sounds, scene sizes |
| `js/background.js` | Full-page tiled wall and checkered floor |
| `js/machine.js` | The machine artwork, number window, lever, light ring |
| `js/balls.js` | The balls in the globe and how they move |
| `js/ui.js` | Number display, settings panel, winners list |
| `js/draw.js` | The draw: hand, pick, reveal, confetti |
| `js/main.js` | Canvas sizing and the animation loop |
