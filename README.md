# Pluribus Particle Text

**[Live Demo](https://pluribus-text-gen.vercel.app)**

I loved the TV show and wanted to try and build something to re-create the intro. While it isn't perfect by any means, it was a fun project to work on.

## Inspiration

This project was heavily inspired by [lazygunner/pluribus_title](https://github.com/lazygunner/pluribus_title) — their implementation is much better and captures the effect more accurately. I highly recommend checking out their work!

<br>My Version<br>
![ezgif-844af7ee88aba919](https://github.com/user-attachments/assets/c2e34b39-3cc5-4f9c-9938-6d37a5069be1)

Official Version<br>
![Pluribus Particle Text Demo](Pluribus%20Opening%20Titles%20%E2%A7%B8%20Main%20Titles.gif)

## Features

- **Fingerprint-style text** — particles arranged in concentric elliptical patterns
- **Wave aggregation** — particles are pulled toward wave crests, not pushed away
- **Elliptical exclusion zones** — background particles avoid letter areas for clean text edges
- **Interactive input** — type any text to see it rendered in the Pluribus style
- **Responsive** — adapts to any screen size

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/Technical-1/Pluribus-Text-Gen.git
cd pluribus-text-gen

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser to the URL shown in the terminal (usually `http://localhost:5173`).

## Usage

Simply type in the text input at the bottom of the screen. The particle effect will update in real-time to display your text.

## How It Works

1. **Text Scanning** — Text is rendered to a canvas and scanned pixel-by-pixel
2. **Fingerprint Pattern** — Particles only appear where `distance % spacing < thickness`, creating curved lines
3. **Exclusion Zones** — Elliptical zones around each letter keep background particles out
4. **Wave Physics** — Circular waves emit from the first letter, pulling particles toward the crest
5. **High Friction** — Background particles (friction 0.90) snap back after waves pass

## Tech Stack

- HTML5 Canvas — 2D rendering
- [Vite](https://vitejs.dev/) — Fast build tool and dev server
- Vanilla JavaScript — No frameworks, just particles

## Credits

- Inspired by [lazygunner/pluribus_title](https://github.com/lazygunner/pluribus_title) — the original and better implementation
- Based on the [Pluribus](https://tv.apple.com/us/show/pluribus/umc.cmc.37axgovs2yozlyh3c2cmwzlza) opening title sequence (Apple TV+)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
