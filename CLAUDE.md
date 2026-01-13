# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pluribus Particle Text recreates the Pluribus TV show (Apple TV+) opening title sequence. Text is rendered as particles in a fingerprint-like pattern with animated wave effects. Inspired by [lazygunner/pluribus_title](https://github.com/lazygunner/pluribus_title).

## Commands

```bash
npm install    # Install dependencies
npm run dev    # Start development server (http://localhost:5173)
npm run build  # Build for production
npm run preview # Preview production build
```

## Architecture

This is a single-page Vite application using HTML5 Canvas (not Three.js):

- **src/main.js** - Complete particle system implementation:
  - `Particle` class - individual particles with position, velocity, friction, type (TEXT/BG)
  - `Wave` class - expanding circular waves that pull particles toward crests
  - `init()` - sets up particles by scanning rendered text pixels
  - `animate()` - main render loop at 60fps
  - Fingerprint pattern: particles only placed where `distance % spacing < thickness`
  - Elliptical exclusion zones around each letter for clean text edges
  - Wave aggregation pulls background particles toward wave crests (friction 0.90)
  - Text particles have subtle jitter but are unaffected by wave forces

- **index.html** - Contains the text input UI and loads Montserrat font

Key config parameters in `main.js`:
- `textureSpacing` / `textureThickness` - control fingerprint line density
- `waveSpeed` / `waveFrequency` - wave animation timing
- `waveStrength` / `waveBandWidth` - how much waves pull particles
- `bgGridGap` - background particle density
