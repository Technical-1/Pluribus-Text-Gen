# Pluribus Particle Text

**[Live Demo](https://pluribus-text-gen.vercel.app)**

A recreation of the Pluribus (Apple TV+) opening title sequence using HTML5 Canvas. Text is rendered as particles in a fingerprint-like pattern with animated wave effects.

## Inspiration

This project was completely redone after I found [lazygunner/pluribus_title](https://github.com/lazygunner/pluribus_title) — their implementation is much better and captures the effect more accurately. I highly recommend checking out their work! 

Official Version<br>
![Pluribus Particle Text Demo](Pluribus%20Opening%20Titles%20%E2%A7%B8%20Main%20Titles.gif)

## Features

- **Fingerprint-style text** — particles arranged in concentric elliptical patterns centered on the first letter
- **Wave aggregation** — particles are pulled toward wave crests, creating compression bands
- **Elliptical exclusion zones** — background particles avoid letter areas for clean text edges
- **Interactive input** — type any text to see it rendered in the Pluribus style
- **Screenshot export** — capture the canvas as a 1200x630 OG image for social sharing
- **PWA support** — installable as a standalone app on mobile and desktop
- **Responsive** — adapts to any screen size with mobile keyboard-aware viewport handling

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation

```bash
git clone https://github.com/Technical-1/Pluribus-Text-Gen.git
cd Pluribus-Text-Gen
npm install
npm run dev
```

Open your browser to `http://localhost:5173`.

## How It Works

1. **Text Scanning** — Text is rendered to a hidden canvas and scanned pixel-by-pixel
2. **Fingerprint Pattern** — Particles only appear where `distance % spacing < thickness`, creating curved concentric lines
3. **Exclusion Zones** — Elliptical zones around each letter keep background particles out
4. **Wave Physics** — Circular waves emit from the first letter, pulling nearby particles toward the wave crest
5. **High Friction** — Background particles snap back to their original positions after waves pass

## Tech Stack

- **HTML5 Canvas** — 2D particle rendering
- **Vanilla JavaScript** — No frameworks
- **[Vite](https://vitejs.dev/)** — Build tool and dev server
- **[Montserrat](https://fonts.google.com/specimen/Montserrat)** — Google Font (Black 900)

## Credits

- Inspired by [lazygunner/pluribus_title](https://github.com/lazygunner/pluribus_title)
- Based on the [Pluribus](https://tv.apple.com/us/show/pluribus/umc.cmc.37axgovs2yozlyh3c2cmwzlza) opening title sequence (Apple TV+)

## Project Structure

```
Pluribus-Text-Gen/
├── public/                # Static assets
│   ├── favicon.svg        # SVG favicon
│   ├── icon-180.png       # Apple touch icon
│   ├── icon-192.png       # PWA icon (192x192)
│   ├── icon-512.png       # PWA icon (512x512)
│   ├── jk-logo.svg        # Attribution logo
│   ├── manifest.webmanifest # PWA manifest
│   └── og-image.png       # Open Graph preview image
├── scripts/
│   └── generate-icons.js  # PWA icon generator (uses sharp)
├── src/
│   └── main.js            # Complete particle system (~427 lines)
├── index.html             # Entry point with UI and meta tags
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run generate-icons` | Regenerate PWA icons from SVG source |

## License

MIT

## Author

Jacob Kanfer - [GitHub](https://github.com/Technical-1)
