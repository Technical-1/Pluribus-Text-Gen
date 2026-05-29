// Pure simulation math, extracted from main.js so it can be unit-tested
// without a DOM or canvas. Everything here must stay free of side effects,
// globals, and rendering calls — inputs in, numbers out.

/**
 * The push a single wave exerts on a particle this frame.
 *
 * Returns {x: 0, y: 0} when:
 *   - the particle sits exactly on the wave origin (dist === 0). Dividing by
 *     dist below would yield NaN, which would propagate into the particle's
 *     position and permanently corrupt it (NaN * 0 is still NaN, so even
 *     TEXT particles, whose strength is 0, are affected).
 *   - the particle is outside the wave's active band.
 *
 * @param {number} particleX
 * @param {number} particleY
 * @param {'TEXT'|'BG'} particleType  TEXT particles get zero wave force.
 * @param {{x:number, y:number, radius:number}} wave
 * @param {{waveBandWidth:number, waveStrength:number}} config
 * @returns {{x:number, y:number}}
 */
export function waveForce(particleX, particleY, particleType, wave, config) {
  const dx = particleX - wave.x;
  const dy = particleY - wave.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // On the origin the direction is undefined; bail before any divide by dist.
  if (dist === 0) return { x: 0, y: 0 };

  const distDiff = Math.abs(dist - wave.radius);
  if (distDiff >= config.waveBandWidth) return { x: 0, y: 0 };

  let forceFactor = 1 - distDiff / config.waveBandWidth;
  forceFactor = forceFactor * forceFactor;

  const targetX = wave.x + (dx / dist) * wave.radius;
  const targetY = wave.y + (dy / dist) * wave.radius;
  const pullX = targetX - particleX;
  const pullY = targetY - particleY;

  const strength = particleType === 'TEXT' ? 0 : config.waveStrength;

  return {
    x: pullX * strength * forceFactor,
    y: pullY * strength * forceFactor,
  };
}

/**
 * How many decorative particles a wave draws this frame. Grows with radius but
 * is capped so large or overlapping waves don't grow unbounded and tank the
 * frame rate on low-end devices.
 *
 * @param {number} radius
 * @param {{waveVisualDensity:number, maxWaveVisualParticles:number}} config
 * @returns {number}
 */
export function waveVisualParticleCount(radius, config) {
  return Math.min(
    5 + Math.floor(radius * config.waveVisualDensity),
    config.maxWaveVisualParticles
  );
}

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
