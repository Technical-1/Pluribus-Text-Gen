# Pluribus Particle Text

**[Live Demo](https://pluribus-text-gen.vercel.app)**

I loved the TV show and wanted to try and build something to re-create the intro. While it isnt perfect by any means it was the best I could do for a small random day project. It was built with Three.js, the text is rendered as thousands of animated particles with wave ripples and organic movement.

![Pluribus Particle Text Demo](Pluribus%20Opening%20Titles%20%E2%A7%B8%20Main%20Titles.gif)

## Features

- **30,000 particles** forming text in real-time
- **Wave ripples** emanating from the first letter
- **Organic motion** using simplex noise
- **Interactive input** — type any text up to 12 characters
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

1. **Text Texture** — Your text is drawn to an offscreen canvas and converted to a texture
2. **Particle Grid** — A 200×150 grid of particles samples the texture
3. **Vertex Shader** — Applies noise-based displacement, wave effects, and fingerprint curves
4. **Fragment Shader** — Renders particles with additive blending and dynamic opacity based on wave position

## Tech Stack

- [Three.js](https://threejs.org/) — 3D graphics library
- [Vite](https://vitejs.dev/) — Fast build tool and dev server
- Custom GLSL shaders for all effects

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

