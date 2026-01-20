// Pluribus Title Scene - Adapted from lazygunner/pluribus_title
// Original: https://github.com/lazygunner/pluribus_title
// Their implementation is much better - check it out!

let currentText = "PLUR1BUS";

const canvas = document.createElement('canvas');
canvas.id = 'canvas1';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Store full viewport dimensions (not affected by mobile keyboard)
let fullWidth = window.innerWidth;
let fullHeight = window.innerHeight;

function setCanvasSize() {
  canvas.width = fullWidth;
  canvas.height = fullHeight;
}
setCanvasSize();

let particles = [];
let waves = [];
let frameCount = 0;
let hasInitialized = false;

const config = {
  waveSpeed: 6,
  waveFrequency: 140,
  waveStrength: 2.0,
  waveBandWidth: 50,
  bgGridGap: 26,

  textureSpacing: 11,
  textureThickness: 1.4,
  textBaseJitter: 0.6,
  sampleStep: 2,
  bgAlpha: 0.9,

  gapScaleX: 1.1,
  gapScaleY: 1.3,

  pCenterX: 0,
  pCenterY: 0
};

// Responsive tuning for small screens
function applyResponsiveTuning() {
  const shortSide = Math.min(canvas.width, canvas.height);
  const compact = shortSide <= 520;

  config.textureSpacing = compact ? 7 : 11;
  config.textureThickness = compact ? 2.4 : 1.4;
  config.textBaseJitter = compact ? 0.25 : 0.6;
  config.bgGridGap = compact ? 22 : 26;
  config.waveBandWidth = compact ? 36 : 50;
  config.sampleStep = compact ? 1 : 2;
}

// Dynamic font sizing
function getResponsiveFontSize() {
  const base = Math.min(canvas.width / 6, 200);
  const text = currentText || "PLUR1BUS";
  let size = base;

  const maxWidth = canvas.width * 0.86;
  const maxHeight = canvas.height * 0.55;

  ctx.font = '900 ' + size + 'px "Montserrat", sans-serif';
  let width = ctx.measureText(text).width;

  if (width > maxWidth) {
    size = size * (maxWidth / width);
  }
  if (size > maxHeight) size = maxHeight;

  const minSize = Math.min(40, maxHeight);
  if (size < minSize) size = minSize;

  return size;
}

// Particle class
class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.type = type;

    if (this.type === 'TEXT') {
      this.size = Math.random() * 1.3 + 0.7;
      this.baseAlpha = 0.95;
      this.friction = 0.15;
    } else {
      this.size = Math.random() * 1.2 + 0.3;
      this.baseAlpha = config.bgAlpha;
      this.friction = 0.90;
    }
    this.currentAlpha = this.baseAlpha;
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.currentAlpha})`;
    if (this.type === 'BG') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawText() {
    if (this.type === 'TEXT') {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.currentAlpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  update() {
    this.currentAlpha = this.baseAlpha;
    let totalPushX = 0;
    let totalPushY = 0;

    if (this.type === 'TEXT') {
      totalPushX += (Math.random() - 0.5) * config.textBaseJitter;
      totalPushY += (Math.random() - 0.5) * config.textBaseJitter;
    }

    for (let wave of waves) {
      let dx = this.x - wave.x;
      let dy = this.y - wave.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      let distDiff = Math.abs(dist - wave.radius);

      if (distDiff < config.waveBandWidth) {
        let forceFactor = 1 - (distDiff / config.waveBandWidth);
        forceFactor = Math.pow(forceFactor, 2);

        let targetX = wave.x + (dx / dist) * wave.radius;
        let targetY = wave.y + (dy / dist) * wave.radius;
        let pullX = targetX - this.x;
        let pullY = targetY - this.y;

        let strength = this.type === 'TEXT' ? 0 : config.waveStrength;

        totalPushX += pullX * strength * forceFactor;
        totalPushY += pullY * strength * forceFactor;
      }
    }

    this.x += totalPushX;
    this.y += totalPushY;

    let dxBase = this.x - this.baseX;
    let dyBase = this.y - this.baseY;
    this.x -= dxBase * this.friction;
    this.y -= dyBase * this.friction;
  }
}

// Wave class
class Wave {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = Math.max(canvas.width, canvas.height) * 1.2;
  }

  update() {
    this.radius += config.waveSpeed;
  }

  drawVisuals() {
    const lifePercent = this.radius / this.maxRadius;
    if (lifePercent > 1) return;

    const alpha = config.bgAlpha * (1 - lifePercent * 0.5);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

    const densityFactor = 0.25;
    const particleCount = 5 + Math.floor(this.radius * densityFactor);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      let scatter = (Math.random() - 0.5 + Math.random() - 0.5) * 18;
      let finalRadius = this.radius + scatter;
      let px = this.x + Math.cos(angle) * finalRadius;
      let py = this.y + Math.sin(angle) * finalRadius;

      let size = Math.random() * 1.2 + 0.3;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function init() {
  setCanvasSize();
  hasInitialized = true;

  applyResponsiveTuning();

  particles = [];
  waves = [];

  let fontSize = getResponsiveFontSize();
  ctx.font = '900 ' + fontSize + 'px "Montserrat", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const fullText = (currentText || "PLUR1BUS").toUpperCase();
  const totalWidth = ctx.measureText(fullText).width;
  let currentX = (canvas.width - totalWidth) / 2;
  const centerY = canvas.height / 2;

  let letterEllipses = [];
  ctx.textAlign = 'left';

  // Calculate elliptical exclusion zones for each letter
  for (let i = 0; i < fullText.length; i++) {
    let char = fullText[i];
    let charWidth = ctx.measureText(char).width;
    let cx = currentX + charWidth / 2;
    let cy = centerY;
    let rx = (charWidth / 2) * config.gapScaleX;
    let ry = (fontSize / 2) * config.gapScaleY;

    letterEllipses.push({
      cx: cx,
      cy: cy,
      invRxSq: 1 / (rx * rx),
      invRySq: 1 / (ry * ry)
    });
    currentX += charWidth;
  }
  ctx.textAlign = 'center';

  // Find first letter center for wave origin
  let firstChar = fullText.length > 0 ? fullText[0] : "P";
  let firstCharWidth = ctx.measureText(firstChar).width;
  let startX = (canvas.width - totalWidth) / 2;
  config.pCenterX = startX + firstCharWidth / 2;
  config.pCenterY = centerY;

  // Create background particles (excluding letter zones)
  for (let y = 0; y < canvas.height; y += config.bgGridGap) {
    for (let x = 0; x < canvas.width; x += config.bgGridGap) {
      let insideAnyEllipse = false;
      for (let i = 0; i < letterEllipses.length; i++) {
        let e = letterEllipses[i];
        let dx = x - e.cx;
        let dy = y - e.cy;
        if ((dx * dx) * e.invRxSq + (dy * dy) * e.invRySq <= 1.0) {
          insideAnyEllipse = true;
          break;
        }
      }
      if (!insideAnyEllipse) {
        let offsetX = (Math.random() - 0.5) * 15;
        let offsetY = (Math.random() - 0.5) * 15;
        particles.push(new Particle(x + offsetX, y + offsetY, 'BG'));
      }
    }
  }

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
}

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (hasInitialized) {
    frameCount++;
    if (frameCount % config.waveFrequency === 0) {
      waves.push(new Wave(config.pCenterX, config.pCenterY));
    }
  }

  // Update all particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
  }

  // Draw background particles first
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }

  // Draw wave visuals
  for (let i = waves.length - 1; i >= 0; i--) {
    let w = waves[i];
    w.update();
    w.drawVisuals();
    if (w.radius > w.maxRadius) waves.splice(i, 1);
  }

  // Draw text particles on top
  for (let i = 0; i < particles.length; i++) {
    particles[i].drawText();
  }

  requestAnimationFrame(animate);
}

// Handle resize - only update full dimensions when input isn't focused (keyboard not up)
window.addEventListener('resize', () => {
  const input = document.getElementById('textInput');
  const inputFocused = input && document.activeElement === input;

  // Only update stored dimensions if keyboard isn't affecting viewport
  if (!inputFocused) {
    fullWidth = window.innerWidth;
    fullHeight = window.innerHeight;
  }
  init();
});

// Use visualViewport API for better mobile keyboard handling
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const input = document.getElementById('textInput');
    const inputFocused = input && document.activeElement === input;

    // Only update if keyboard isn't affecting viewport
    if (!inputFocused) {
      fullWidth = window.visualViewport.width;
      fullHeight = window.visualViewport.height;
      init();
    }
  });
}

// Wait for font to load then initialize
document.fonts.ready.then(() => {
  init();
});

// Fallback initialization
setTimeout(() => {
  if (!hasInitialized) {
    init();
  }
}, 1800);

// Start animation loop
animate();

// Handle text input - allow users to type custom text
const input = document.getElementById('textInput');
if (input) {
  input.value = currentText;
  input.addEventListener('input', (e) => {
    const newText = e.target.value.trim() || "PLUR1BUS";
    if (newText !== currentText) {
      currentText = newText;
      init();
    }
  });

  // Reinit with full dimensions when keyboard closes (mobile fix)
  input.addEventListener('blur', () => {
    // Small delay to let viewport restore after keyboard closes
    setTimeout(() => {
      fullWidth = window.innerWidth;
      fullHeight = window.innerHeight;
      init();
    }, 100);
  });
}

// Screenshot button for OG image
document.getElementById('screenshotBtn')?.addEventListener('click', () => {
  const w = 1200, h = 630;
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const c = off.getContext('2d');
  c.fillStyle = '#000';
  c.fillRect(0, 0, w, h);
  const scale = Math.min(w / canvas.width, h / canvas.height);
  const dw = canvas.width * scale;
  const dh = canvas.height * scale;
  c.drawImage(canvas, (w - dw) / 2, (h - dh) / 2, dw, dh);
  const a = document.createElement('a');
  a.download = 'og-image.png';
  a.href = off.toDataURL('image/png');
  a.click();
});
