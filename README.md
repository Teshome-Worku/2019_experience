# A New Year Thing

A small, private, mobile-first interactive site — not a template, a one-off experience.

## Before you send it

Open `script.js` and edit the `CONFIG` block at the very top:

```js
const CONFIG = {
  herName: "",         // her name, e.g. "Selam" — leave blank to keep the opening line generic ("I made something small for you.")
  myName: "",           // for your own reference only, not shown anywhere
  herPhoto: "./assets/her-photo.jpg",
  myPhoto: "./assets/my-photo.jpg",
  musicPath: "",         // e.g. "./assets/song.mp3" — leave blank and the sound toggle stays hidden
  newYearLineAmharic: "እንኳን ለ2019 ዓ.ም አደረሰሽ ❤️"
};
```

Photos are already in `assets/` — `her-photo.jpg` and `my-photo.jpg`. Swap them out for different files if you'd rather use a different shot; just keep the filenames the same, or update the paths in `CONFIG`.

Every other line of writing lives directly in `index.html`, inside each `<section class="scene">` — search for the text you want to change and edit it there. Nothing is generated at runtime, so what you see in the file is exactly what she'll see.

## Running it locally

This is a fully static site — no build step, no server code. Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed local URL on your phone (same wifi network) to test the real mobile feel, not just a resized browser window.

## Deploying

**Netlify / Vercel (easiest):** drag the whole project folder onto their dashboard, or connect a GitHub repo — no config needed, it's static.

**GitHub Pages:** push this folder to a repo, enable Pages on the `main` branch, root directory.

Either way you'll get a private-feeling link you can send her directly — no login, no ads, nothing public-facing pointing back at you unless you want it to.

## The journey, scene by scene

1. **Open** — "2019 / Before the new year begins…" + Enter button (English + Amharic)
2. **Discover** — a quiet scroll prompt
3. **The object** — a faceted crystal she can drag to tilt; tapping "See what's inside" triggers the transition
4. **Her portrait** — one anchor image arrives as a quiet physical frame
5. **Hidden discovery** — tapping a small glowing orb reveals her second photo from blur and depth
6. **Your portrait** — one anchor image grounds the personal message
7. **Four short message beats** — appreciation, closeness, honesty, and space to choose — each with an Amharic line underneath
8. **Memory frame** — her third photo materializes from blur when the frame is touched
9. **The future / dream scene** — a constellation of particles slowly connecting, two points drawing toward each other
10. **Final photo** — a calm reveal of the second personal photo, followed by the delayed contact action
11. **Finale** — "Happy New Year 2019", the Amharic greeting, a closing wish, and a real 3D firework burst

## The music

There's a small note icon in the top-right after she taps Enter. Tapping it plays an original, generative ambient score — soft pad chords with a slow arpeggio, built entirely in the browser with Tone.js, so there's no copyrighted track to worry about and no file to host. It stays off until she chooses to turn it on (mobile browsers block autoplay anyway, and unexpected audio can be jarring), and it fades cleanly on/off.

If you'd rather use a real song you have the rights to, set `musicPath` in the `CONFIG` block to point at an mp3 in `assets/` — that will automatically replace the generative score, same toggle button either way.

## About the Amharic

Every major line now has an Amharic translation underneath the English, since she reads both. I wrote these myself and did my best to keep the tone warm and natural — but I'm not a native speaker, so **please read through them before sending** and adjust any phrasing that doesn't sound like how you'd actually say it to her. The `.am` lines are easy to spot in `index.html` — each one sits right inside the paragraph it translates, e.g.:

```html
<p class="message-line">I don't say this often...<span class="am">ይህን ብዙ ጊዜ አልናገርም...</span></p>
```

## Notes on performance

Particle count, firework density, and antialiasing all scale down automatically on small screens or devices reporting low memory, so it should stay smooth on a mid-range Android phone. The two anchor photos preload early; the three discovery photos are deferred. `prefers-reduced-motion` is respected throughout, and the story uses tap-driven scene transitions rather than page scrolling.

## New in this pass

- All 5 photos now have distinct story roles: two anchor portraits, one hidden orb discovery, one touch-to-focus memory frame, and one delayed final/contact reveal
- Bilingual English/Amharic text throughout, not just the finale
- A continuous, scroll-linked camera drift through the whole page for a more three-dimensional feel, plus optional gyroscope tilt on phones that support it (asked for permission on iOS, applied automatically elsewhere)
- A real expanding particle firework system at the finale, not just a fade
- Small haptic taps on the main buttons, where the device supports it
- An original generative ambient score (Tone.js), off by default, optional via the note icon

## Tech

Vanilla HTML/CSS/JS, Three.js (background scene + crystal) and GSAP + ScrollTrigger (scroll-driven story), loaded from cdnjs. No frameworks, no backend, nothing to install.
