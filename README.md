# Pluribus Particle Text

**[Live Demo](https://pluribus-text-gen.vercel.app)**

A recreation of the Pluribus (Apple TV+) opening title sequence using HTML5 Canvas. Text is rendered as particles in a fingerprint-like pattern with animated wave effects.

## Inspiration

This project was completely redone after I found [lazygunner/pluribus_title](https://github.com/lazygunner/pluribus_title) — their implementation is much better and captures the effect more accurately. I highly recommend checking out their work! 

Official Version<br>
![Pluribus Particle Text Demo](demo.gif)

## Features

- **Fingerprint-style text** — particles arranged in concentric elliptical patterns centered on the first letter
- **Wave aggregation** — particles are pulled toward wave crests, creating compression bands
- **Elliptical exclusion zones** — background particles avoid letter areas for clean text edges
- **Interactive input** — type any text to see it rendered in the Pluribus style
- **Screenshot export** — download the live canvas as a 1200x630 PNG, letterboxed onto black, ready for social sharing
- **PWA support** — installable as a standalone app, with separate `any` and `maskable` icons so Android adaptive icons are not clipped
- **Responsive** — font size, particle density and wave width retune for small screens, with mobile keyboard-aware viewport handling
- **Unit-tested simulation math** — wave force, wave particle budget and text scan bounds live in a pure module covered by Vitest

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (required by Vite 7)

### Installation

```bash
git clone https://github.com/Technical-1/Pluribus-Text-Gen.git
cd Pluribus-Text-Gen
npm install
npm run dev
```

Open your browser to `http://localhost:5173`.

## How It Works

1. **Text Scanning** — Text is drawn to the canvas once, and only its bounding box is read back with `getImageData` and sampled for opaque pixels
2. **Fingerprint Pattern** — Particles only appear where `distance % spacing < thickness`, creating curved concentric lines
3. **Exclusion Zones** — Elliptical zones around each letter keep background particles out
4. **Wave Physics** — A circular wave is emitted from the first letter every 140 frames, pulling background particles within the band toward the crest
5. **High Friction** — Background particles snap back to their original positions after waves pass

## Tech Stack

- **HTML5 Canvas** — 2D particle rendering
- **Vanilla JavaScript** — No frameworks
- **[Vite](https://vitejs.dev/) 7** — Build tool and dev server
- **[Vitest](https://vitest.dev/) 4** — Unit tests for the simulation math
- **[sharp](https://sharp.pixelplumbing.com/)** — Generates the PWA icon PNGs from SVG sources
- **[Montserrat](https://fonts.google.com/specimen/Montserrat)** — Google Font (Black 900)

## Credits

- Inspired by [lazygunner/pluribus_title](https://github.com/lazygunner/pluribus_title)
- Based on the [Pluribus](https://tv.apple.com/us/show/pluribus/umc.cmc.37axgovs2yozlyh3c2cmwzlza) opening title sequence (Apple TV+)

## Project Structure

```
Pluribus-Text-Gen/
├── public/                     # Static assets
│   ├── favicon.svg             # SVG favicon
│   ├── icon-192.svg            # Source for the standard app icons
│   ├── icon-maskable.svg       # Source for the maskable app icons
│   ├── icon-180.png            # Apple touch icon
│   ├── icon-192.png            # PWA icon, purpose "any"
│   ├── icon-512.png            # PWA icon, purpose "any"
│   ├── icon-maskable-192.png   # PWA icon, purpose "maskable"
│   ├── icon-maskable-512.png   # PWA icon, purpose "maskable"
│   ├── jk-logo.svg             # Attribution logo
│   ├── manifest.webmanifest    # PWA manifest
│   ├── og-image.png            # Open Graph preview image
│   └── og-previews/og-home.html # HTML template for the OG image
├── scripts/
│   └── generate-icons.js       # Renders both icon sets with sharp
├── src/
│   ├── main.js                 # Canvas setup, particle and wave classes, render loop, UI wiring
│   ├── simulation.js           # Pure wave-force and scan-bounds math (no DOM)
│   └── simulation.test.js      # Vitest suite for simulation.js
├── index.html                  # Entry point with inline styles, UI and meta tags
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run generate-icons` | Regenerate PWA icons from the SVG sources |

## License

MIT

## Author

Jacob Kanfer - [GitHub](https://github.com/Technical-1)
