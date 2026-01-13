# Pluribus Particle Text

**[Live Demo](https://pluribus-text-gen.vercel.app)**

A recreation of the Pluribus (Apple TV+) opening title sequence using HTML5 Canvas. Text is rendered as particles in a fingerprint-like pattern with animated wave effects.

## Inspiration

This project was heavily inspired by [lazygunner/pluribus_title](https://github.com/lazygunner/pluribus_title) — their implementation is much better and captures the effect more accurately. I highly recommend checking out their work!

<br>My Version<br>
![ezgif-844af7ee88aba919](https://github.com/user-attachments/assets/c2e34b39-3cc5-4f9c-9938-6d37a5069be1)

Official Version<br>
![Pluribus Particle Text Demo](Pluribus%20Opening%20Titles%20%E2%A7%B8%20Main%20Titles.gif)

## Features

- **Fingerprint-style text** — particles arranged in concentric elliptical patterns centered on the first letter
- **Wave aggregation** — particles are pulled toward wave crests, creating compression bands
- **Elliptical exclusion zones** — background particles avoid letter areas for clean text edges
- **Interactive input** — type any text to see it rendered in the Pluribus style
- **Responsive** — adapts to any screen size

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

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
