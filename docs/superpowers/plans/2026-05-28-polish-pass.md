# Pluribus Polish Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the 5 open Project Hub tasks (512–516) for Pluribus-Text-Gen as four self-contained, independently committable buckets.

**Architecture:** Each bucket touches one clear area and ends in one commit. Bucket A is a behavior-preserving canvas optimization with new unit tests; Bucket B is markup/accessibility; Bucket C is PWA icon assets + manifest; Bucket D is asset hygiene (delete dead file + compress the README demo GIF). Buckets are independent and may be executed in any order; the recommended order is D → B → C → A (lowest risk first, the algorithm change last).

**Tech Stack:** Vite 7, vanilla ES modules, HTML5 Canvas, vitest, sharp (icon generation), gifsicle (GIF compression).

**Pre-flight (run once before starting):**
- Confirm `git config user.email` returns `51518860+Technical-1@users.noreply.github.com` or `jacobrk2001@gmail.com`. If not, `git config user.email 51518860+Technical-1@users.noreply.github.com`.
- Create a working branch: `git checkout -b chore/polish-pass`.
- Baseline must be green: `npm test` (10 passing) and `npm run build` (clean).

**Commit message footer (append to every commit in this plan):**
```
Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>
```

**Hub task closeout:** After all buckets are committed, resolve tasks 512–516 in Project Hub (project 161) with their commit hashes.

---

## Bucket D — Asset hygiene (Hub tasks #514, #516)

**Files:**
- Delete: `public/vite.svg`
- Modify (in place, compressed): `Pluribus Opening Titles ⧸ Main Titles.gif` → renamed to `demo.gif`
- Modify: `README.md` (line 12, the demo image path)

**Context:** `public/vite.svg` is the leftover Vite template logo, referenced nowhere (verified via grep). The 4MB GIF at repo root is the README's animated demo (`README.md:12`), so it is NOT dead — it will be compressed and kept. `public/og-previews/og-home.html` is intentionally KEPT (it is the OG-image regeneration template). NOTE: `git rm` does not shrink existing git history; compressing reduces the working-tree/checkout size and future bloat only. Purging the old blob from history requires a destructive `git filter-repo`/BFG rewrite — explicitly OUT OF SCOPE here.

- [ ] **Step 1: Delete the dead Vite logo**

```bash
git rm public/vite.svg
```

- [ ] **Step 2: Verify gifsicle is available**

Run: `which gifsicle || brew install gifsicle`
Expected: a path like `/opt/homebrew/bin/gifsicle` (installs if missing).

- [ ] **Step 3: Compress the demo GIF into a new file**

```bash
gifsicle -O3 --lossy=80 --colors 128 --scale 0.6 \
  "Pluribus Opening Titles ⧸ Main Titles.gif" -o demo.gif
```

- [ ] **Step 4: Confirm the compressed file is meaningfully smaller**

Run: `du -h "Pluribus Opening Titles ⧸ Main Titles.gif" demo.gif`
Expected: `demo.gif` is roughly 0.5–1.5MB (down from ~4.0MB). If it is still >2MB, lower quality: re-run Step 3 with `--lossy=120 --colors 96 --scale 0.5`.

- [ ] **Step 5: Untrack the original GIF**

```bash
git rm "Pluribus Opening Titles ⧸ Main Titles.gif"
```

- [ ] **Step 6: Point the README at the compressed demo**

In `README.md`, replace line 12:

Old:
```markdown
![Pluribus Particle Text Demo](Pluribus%20Opening%20Titles%20%E2%A7%B8%20Main%20Titles.gif)
```
New:
```markdown
![Pluribus Particle Text Demo](demo.gif)
```

- [ ] **Step 7: Verify no broken references and build is clean**

Run (scoped to source/markup, excludes this plan doc): `grep -rn "vite.svg\|Main Titles" README.md index.html src public | grep -v node_modules || echo "no stale references"`
Expected: `no stale references`
Run: `npm run build`
Expected: build succeeds (5 modules), no errors.

- [ ] **Step 8: Commit**

The deletions from Steps 1 and 5 are already staged; this stages the README edit and the new `demo.gif`.

```bash
git add README.md demo.gif
git commit -m "chore: drop dead vite.svg and compress README demo GIF (4MB -> ~1MB)"
```

---

## Bucket B — Accessibility & markup (Hub task #513)

**Files:**
- Modify: `index.html` (the screenshot button, the input label)
- Modify: `src/main.js` (mark the decorative canvas `aria-hidden`)

**Context:** The "ENTER TEXT" prompt is a `<div>`, so the input has no programmatic label. The screenshot button conveys its purpose only via `title` (emoji content reads as "camera" to screen readers). The canvas is purely decorative and should be hidden from assistive tech. No unit test applies — verification is a Lighthouse accessibility audit plus a manual screen-reader check.

- [ ] **Step 1: Give the screenshot button an accessible name**

In `index.html`, replace:

Old:
```html
    <button id="screenshotBtn" title="Download OG image">📷</button>
```
New:
```html
    <button id="screenshotBtn" title="Download OG image" aria-label="Download OG image"><span aria-hidden="true">📷</span></button>
```

- [ ] **Step 2: Turn the text prompt into a real label**

In `index.html`, replace:

Old:
```html
      <div class="label">ENTER TEXT</div>
```
New:
```html
      <label class="label" for="textInput">ENTER TEXT</label>
```

(The `.label` CSS rule is a class selector, so it still applies to the `<label>`.)

- [ ] **Step 3: Hide the decorative canvas from assistive tech**

In `src/main.js`, replace:

Old:
```js
const canvas = document.createElement('canvas');
canvas.id = 'canvas1';
document.body.appendChild(canvas);
```
New:
```js
const canvas = document.createElement('canvas');
canvas.id = 'canvas1';
canvas.setAttribute('aria-hidden', 'true');
document.body.appendChild(canvas);
```

- [ ] **Step 4: Verify build and existing tests still pass**

Run: `npm run build && npm test`
Expected: build clean (5 modules), 10 tests pass (no behavior change).

- [ ] **Step 5: Accessibility verification (manual / tooling — no unit test)**

Run: `npm run dev`, then in Chrome DevTools run a Lighthouse **Accessibility** audit on `http://localhost:5173` (or use the `web-perf` skill).
Expected: no "Form elements do not have associated labels" and no "Buttons do not have an accessible name" violations.
Manual: Tab to the input and confirm a screen reader (VoiceOver: Cmd+F5) announces "Enter text, edit text"; confirm the canvas is not announced.

- [ ] **Step 6: Commit**

```bash
git add index.html src/main.js
git commit -m "a11y: label the text input, name the screenshot button, hide decorative canvas"
```

---

## Bucket C — PWA icons & manifest (Hub task #515)

**Files:**
- Create: `public/icon-maskable.svg`
- Modify: `scripts/generate-icons.js`
- Create (generated): `public/icon-maskable-192.png`, `public/icon-maskable-512.png`
- Modify: `public/manifest.webmanifest`

**Context:** Both manifest icons currently use `"purpose": "any maskable"`. A single icon serving both gets cropped inside the Android maskable safe zone (central 80% circle), because the existing art runs to the corners. Fix: ship a dedicated maskable icon whose art is scaled to ~75% around the center (so it fits the safe zone over the full-bleed black background), and split the manifest so the plain icons are `"any"` and the new ones are `"maskable"`. No unit test applies — verification is the Chrome DevTools maskable preview.

- [ ] **Step 1: Create the padded maskable source SVG**

Create `public/icon-maskable.svg` with this exact content (same art as `icon-192.svg`, wrapped in a 0.75 scale transform around center; full-bleed black background stays unscaled):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#000"/>
  <!-- Art scaled to 75% around center (96,96) so it fits the maskable safe zone -->
  <g fill="#fff" transform="translate(96 96) scale(0.75) translate(-96 -96)">
    <circle cx="96" cy="50" r="4" opacity="0.9"/>
    <circle cx="130" cy="60" r="3.5" opacity="0.85"/>
    <circle cx="145" cy="85" r="4" opacity="0.9"/>
    <circle cx="145" cy="110" r="3.5" opacity="0.8"/>
    <circle cx="130" cy="135" r="4" opacity="0.85"/>
    <circle cx="96" cy="145" r="3.5" opacity="0.9"/>
    <circle cx="62" cy="135" r="4" opacity="0.85"/>
    <circle cx="47" cy="110" r="3.5" opacity="0.8"/>
    <circle cx="47" cy="85" r="4" opacity="0.9"/>
    <circle cx="62" cy="60" r="3.5" opacity="0.85"/>
    <circle cx="96" cy="65" r="3.5" opacity="0.95"/>
    <circle cx="118" cy="72" r="3" opacity="0.9"/>
    <circle cx="130" cy="96" r="3.5" opacity="0.95"/>
    <circle cx="118" cy="120" r="3" opacity="0.9"/>
    <circle cx="96" cy="127" r="3.5" opacity="0.95"/>
    <circle cx="74" cy="120" r="3" opacity="0.9"/>
    <circle cx="62" cy="96" r="3.5" opacity="0.95"/>
    <circle cx="74" cy="72" r="3" opacity="0.9"/>
    <circle cx="96" cy="80" r="3" opacity="1"/>
    <circle cx="110" cy="88" r="2.5" opacity="0.95"/>
    <circle cx="112" cy="104" r="3" opacity="1"/>
    <circle cx="96" cy="112" r="2.5" opacity="0.95"/>
    <circle cx="80" cy="104" r="3" opacity="1"/>
    <circle cx="80" cy="88" r="2.5" opacity="0.95"/>
    <circle cx="96" cy="96" r="5" opacity="1"/>
    <circle cx="25" cy="30" r="2" opacity="0.4"/>
    <circle cx="165" cy="25" r="2.5" opacity="0.45"/>
    <circle cx="170" cy="165" r="2" opacity="0.4"/>
    <circle cx="25" cy="160" r="2.5" opacity="0.45"/>
    <circle cx="30" cy="96" r="1.5" opacity="0.35"/>
    <circle cx="162" cy="96" r="1.5" opacity="0.35"/>
    <circle cx="96" cy="25" r="1.5" opacity="0.35"/>
    <circle cx="96" cy="167" r="1.5" opacity="0.35"/>
  </g>
</svg>
```

- [ ] **Step 2: Teach the icon generator about both sources**

In `scripts/generate-icons.js`, replace the body from the `svgPath`/`svg` declaration through the end of `generateIcons` with:

Old:
```js
const svgPath = join(publicDir, 'icon-192.svg');
const svg = readFileSync(svgPath);

const sizes = [180, 192, 512];

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = join(publicDir, `icon-${size}.png`);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}.png`);
  }
  console.log('Done! Update your manifest and HTML to use PNG icons.');
}
```
New:
```js
const sources = [
  { svg: 'icon-192.svg', prefix: 'icon', sizes: [180, 192, 512] },
  { svg: 'icon-maskable.svg', prefix: 'icon-maskable', sizes: [192, 512] },
];

async function generateIcons() {
  for (const { svg, prefix, sizes } of sources) {
    const svgBuf = readFileSync(join(publicDir, svg));
    for (const size of sizes) {
      const outputPath = join(publicDir, `${prefix}-${size}.png`);
      await sharp(svgBuf)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated: ${prefix}-${size}.png`);
    }
  }
  console.log('Done! Update your manifest and HTML to use PNG icons.');
}
```

- [ ] **Step 3: Generate the PNGs**

Run: `npm run generate-icons`
Expected output includes: `Generated: icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`.
Run: `ls public/icon-maskable-*.png`
Expected: both files exist.

- [ ] **Step 4: Split the manifest icon purposes**

In `public/manifest.webmanifest`, replace the `"icons"` array:

Old:
```json
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
```
New:
```json
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
```

- [ ] **Step 5: Verify the manifest is valid JSON and the build is clean**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/manifest.webmanifest','utf8')); console.log('manifest OK')"`
Expected: `manifest OK`
Run: `npm run build`
Expected: build succeeds (the new PNGs are copied from `public/`).

- [ ] **Step 6: Maskable verification (manual / tooling — no unit test)**

Run: `npm run dev`, open Chrome DevTools → Application → Manifest. Under the Icons section, toggle "Show only the minimum safe area for maskable icons" and confirm the fingerprint art sits fully inside the circle. (Alternative: upload `public/icon-maskable-512.png` to https://maskable.app/editor.)
Expected: no art clipped by the safe-zone circle.

- [ ] **Step 7: Commit**

```bash
git add public/icon-maskable.svg public/icon-maskable-192.png public/icon-maskable-512.png scripts/generate-icons.js public/manifest.webmanifest
git commit -m "feat: add dedicated maskable PWA icon and split manifest icon purposes"
```

---

## Bucket A — Bounded text scan (Hub task #512)

**Files:**
- Modify: `src/simulation.js` (add `textScanBounds`)
- Test: `src/simulation.test.js` (add `describe('textScanBounds')`)
- Modify: `src/main.js` (use the bounds in `scanText`/`createTextParticles`)

**Context:** `init()` currently calls `ctx.getImageData(0, 0, canvas.width, canvas.height)` and loops every pixel of the whole canvas to find text pixels. The text is drawn centered (`textAlign 'center'` at `canvas.width/2`, `textBaseline 'middle'` around `config.pCenterY`), so we only need the box around it. We add a pure `textScanBounds()` (unit-tested), then scan only that region and offset particle coordinates by the region origin. Behavior must be identical — same particles produced.

- [ ] **Step 1: Write the failing tests for `textScanBounds`**

Append to `src/simulation.test.js`:

```js
import { textScanBounds } from './simulation.js';

describe('textScanBounds', () => {
  it('returns a region centered horizontally within the canvas', () => {
    const b = textScanBounds(1000, 800, 400, 200, 400);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.w).toBeLessThanOrEqual(1000);
    // text width 400 centered in 1000 -> left edge near 300, minus a little padding
    expect(b.x).toBeGreaterThan(250);
    expect(b.x).toBeLessThan(300);
  });

  it('brackets centerY vertically', () => {
    const b = textScanBounds(1000, 800, 400, 200, 400);
    expect(b.y).toBeLessThan(400);
    expect(b.y + b.h).toBeGreaterThan(400);
  });

  it('clamps width to the canvas when text is wider than the canvas', () => {
    const b = textScanBounds(300, 800, 5000, 200, 400);
    expect(b.x).toBe(0);
    expect(b.w).toBeLessThanOrEqual(300);
  });

  it('clamps the vertical region to the canvas top edge', () => {
    const b = textScanBounds(1000, 100, 400, 400, 10);
    expect(b.y).toBe(0);
    expect(b.y + b.h).toBeLessThanOrEqual(100);
  });

  it('never returns zero or negative dimensions', () => {
    const b = textScanBounds(1000, 800, 0, 0, 400);
    expect(b.w).toBeGreaterThanOrEqual(1);
    expect(b.h).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npm test`
Expected: FAIL — `textScanBounds is not a function` (or import error) in the new describe block; the existing 10 tests still pass.

- [ ] **Step 3: Implement `textScanBounds`**

Append to `src/simulation.js`:

```js
/**
 * The pixel region to scan for text particles. The text is drawn centered
 * horizontally (textAlign 'center' at canvasWidth/2) and vertically around
 * centerY (textBaseline 'middle'), so only the box around it needs to be read
 * instead of the whole canvas. All values are integers clamped to the canvas,
 * with generous vertical padding to cover Montserrat 900 ascent/descent.
 *
 * @returns {{x:number, y:number, w:number, h:number}}
 */
export function textScanBounds(canvasWidth, canvasHeight, textWidth, fontSize, centerY) {
  const padX = fontSize * 0.15;
  const halfH = fontSize * 0.7;

  const left = canvasWidth / 2 - textWidth / 2 - padX;
  const top = centerY - halfH;

  const x = Math.max(0, Math.floor(left));
  const y = Math.max(0, Math.floor(top));
  const w = Math.min(canvasWidth - x, Math.ceil(textWidth + padX * 2));
  const h = Math.min(canvasHeight - y, Math.ceil(halfH * 2));

  return { x, y, w: Math.max(1, w), h: Math.max(1, h) };
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npm test`
Expected: PASS — all 15 tests green (10 existing + 5 new).

- [ ] **Step 5: Use the bounds in `main.js` — import**

In `src/main.js`, replace:

Old:
```js
import { waveForce, waveVisualParticleCount } from './simulation.js';
```
New:
```js
import { waveForce, waveVisualParticleCount, textScanBounds } from './simulation.js';
```

- [ ] **Step 6: Use the bounds in `main.js` — scan only the region**

In `src/main.js`, replace this block:

Old:
```js
  // Scan full text to create text particles with fingerprint pattern
  function scanText(text, x, y) {
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return data;
  }

  // Render full text centered
  ctx.textAlign = 'center';
  let textData = scanText(fullText, canvas.width / 2, config.pCenterY);

  function createTextParticles(imageData) {
    const step = config.sampleStep;
    for (let y = 0; y < imageData.height; y += step) {
      for (let x = 0; x < imageData.width; x += step) {
        let isTextPixel = imageData.data[(y * 4 * imageData.width) + (x * 4) + 3] > 128;
        if (isTextPixel) {
          let dx = x - config.pCenterX;
          let dy = y - config.pCenterY;
          let organic = Math.sin(dy * 0.05) * 2;
          let effectiveDist = Math.sqrt(dx * dx + Math.pow(dy * 2.0, 2)) + organic;
          let onWaveLine = (effectiveDist) % config.textureSpacing < config.textureThickness;
          if (onWaveLine) {
            particles.push(new Particle(x, y, 'TEXT'));
          }
        }
      }
    }
  }

  createTextParticles(textData);
```
New:
```js
  // Scan only the text's bounding box (not the whole canvas) for text pixels.
  const scanRegion = textScanBounds(canvas.width, canvas.height, totalWidth, fontSize, config.pCenterY);

  function scanText(text, x, y, region) {
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
    let data = ctx.getImageData(region.x, region.y, region.w, region.h);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return data;
  }

  // Render full text centered
  ctx.textAlign = 'center';
  let textData = scanText(fullText, canvas.width / 2, config.pCenterY, scanRegion);

  function createTextParticles(imageData, originX, originY) {
    const step = config.sampleStep;
    for (let row = 0; row < imageData.height; row += step) {
      for (let col = 0; col < imageData.width; col += step) {
        let isTextPixel = imageData.data[(row * imageData.width + col) * 4 + 3] > 128;
        if (isTextPixel) {
          // Translate region-local pixel coords back to absolute canvas coords.
          let px = originX + col;
          let py = originY + row;
          let dx = px - config.pCenterX;
          let dy = py - config.pCenterY;
          let organic = Math.sin(dy * 0.05) * 2;
          let effectiveDist = Math.sqrt(dx * dx + Math.pow(dy * 2.0, 2)) + organic;
          let onWaveLine = (effectiveDist) % config.textureSpacing < config.textureThickness;
          if (onWaveLine) {
            particles.push(new Particle(px, py, 'TEXT'));
          }
        }
      }
    }
  }

  createTextParticles(textData, scanRegion.x, scanRegion.y);
```

- [ ] **Step 7: Run tests and build**

Run: `npm test && npm run build`
Expected: 15 tests pass; build clean (5 modules).

- [ ] **Step 8: Visual regression check (manual)**

Run: `npm run dev`, open `http://localhost:5173`. Type each of: `PLUR1BUS` (default), a long word like `MORE`, and a single character `A`. Confirm the particle text renders the full word with no clipped/missing glyphs and looks identical to before. Resize the window and confirm the text re-renders correctly (no cut-off letters at the region edges).
Expected: text fully rendered in all cases; if any glyph is clipped at the top/bottom, increase `halfH` in `textScanBounds` from `fontSize * 0.7` to `fontSize * 0.8` and re-verify.

- [ ] **Step 9: Commit**

```bash
git add src/simulation.js src/simulation.test.js src/main.js
git commit -m "perf: scan only the text bounding box instead of the whole canvas"
```

---

## Wrap-up (after all four buckets)

- [ ] **Final verification on the branch**

Run: `npm test && npm run build && npm audit`
Expected: 15 tests pass; build clean; 0 vulnerabilities.

- [ ] **Merge and push**

```bash
git checkout main
git merge --no-ff chore/polish-pass -m "Merge branch 'chore/polish-pass'"
git push origin main
git branch -d chore/polish-pass
git push origin --delete chore/polish-pass  # if the branch was pushed
```

- [ ] **Close out Project Hub (project 161)**

Resolve each task with the commit that fixed it:
- #514, #516 → Bucket D commit
- #513 → Bucket B commit
- #515 → Bucket C commit
- #512 → Bucket A commit

---

## Optional follow-up (NOT in scope)

- **Purge the old 4MB GIF blob from git history.** `git rm` only stops tracking it going forward; the blob remains in past commits, so fresh clones still download it. Truly removing it requires `git filter-repo` (or BFG) + a force-push — destructive and history-rewriting. Only do this deliberately on this single-owner repo, with a backup, as its own task.
